import datetime
from math import ceil

import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db.models import Q
from django.http import HttpResponse
from django.utils.timezone import make_aware
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import action
from rest_framework import permissions, status
from rest_framework.generics import get_object_or_404
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin, CreateModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from stripe.error import SignatureVerificationError

from mentors.mentors.models import Mentor, MentorSession, MentorSessionEvent, Review
from .paginaters import SmallResultsSetPagination
from .permissions import IsSessionClientOrReadOnly, OnlyClientCanReview
from .serializers import MentorSerializer, MentorSessionSerializer, ReviewSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY
User = get_user_model()


class MentorViewSet(RetrieveModelMixin, ListModelMixin, UpdateModelMixin, GenericViewSet):
    serializer_class = MentorSerializer
    pagination_class = SmallResultsSetPagination
    queryset = Mentor.objects.filter(is_active=True, approved=True)
    lookup_field = "user__username"

    def get_queryset(self):
        page = self.request.query_params.get('page')
        queryset = self.queryset
        if not page:
            # Randomize order of list views
            queryset = self.queryset.order_by("?")
        return queryset

    def get_serializer_context(self):
        return {"request": self.request}

    def update(self, request, *args, **kwargs):
        self.queryset = Mentor.objects.filter(user=request.user)
        return super(MentorViewSet, self).update(request, *args, **kwargs)

    @action(detail=False)
    def me(self, request):
        serializer = self.serializer_class(request.user.mentor, context={"request": request})
        return Response(status=status.HTTP_200_OK, data=serializer.data)


class ReviewViewSet(RetrieveModelMixin, ListModelMixin, CreateModelMixin, GenericViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, IsSessionClientOrReadOnly, OnlyClientCanReview]
    queryset = Review.objects.all().order_by("-timestamp")

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        review = serializer.save()
        send_mail(
            subject="You received a review!",
            message=f"Your review from {review.session.client.user.name} was {review.rating}/5 stars and they had this to "
                    f"say about you: {review.description}",
            from_email="you@local.test",
            recipient_list=[review.session.mentor.user.email]
        )

    def get_queryset(self):
        queryset = self.queryset
        mentor = self.request.query_params.get('mentor')
        client = self.request.query_params.get('client')
        if mentor is not None:
            queryset = queryset.filter(session__mentor=mentor)
        if client is not None:
            queryset = queryset.filter(session__client=client)
        return queryset


class MentorSessionViewSet(RetrieveModelMixin, ListModelMixin, UpdateModelMixin, CreateModelMixin, GenericViewSet):
    serializer_class = MentorSessionSerializer
    queryset = MentorSession.objects.none()
    lookup_field = "id"

    def get_queryset(self):
        return MentorSession.objects.filter(
            Q(mentor=self.request.user.mentor) | Q(client=self.request.user)
        )

    def perform_create(self, serializer):
        serializer.save(mentor=self.request.user.mentor)

    @action(detail=False, methods=["get"])
    def client_session_history(self, request):
        mentor_sessions = MentorSession.objects.filter(client=self.request.user, completed=True)
        serializer = self.serializer_class(mentor_sessions, many=True, context={"request": request})
        return Response(status=status.HTTP_200_OK, data=serializer.data)

    @action(detail=False, methods=["get"])
    def mentor_session_history(self, request):
        mentor_sessions = MentorSession.objects.filter(mentor=self.request.user.mentor, completed=True)
        serializer = self.serializer_class(mentor_sessions, many=True, context={"request": request})
        return Response(status=status.HTTP_200_OK, data=serializer.data)

    @action(detail=True, methods=["post"])
    def pause(self, request, id):
        mentor_session: MentorSession = get_object_or_404(MentorSession, id=id)

        if mentor_session.completed:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": "This session is finished. Please create a new session."})

        events = mentor_session.events.all().order_by("-start_time")
        if not events.exists():
            # Starting a session
            # Only clients should be able to start a session - otherwise mentors abuse
            if request.user != mentor_session.client:
                return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": "The client must start the session"})

            MentorSessionEvent.objects.create(mentor_session=mentor_session)
            serializer = self.serializer_class(mentor_session, context={"request": request})
            return Response(status=status.HTTP_200_OK, data=serializer.data)

        event = events[0]

        if event.end_time:
            # Resuming
            MentorSessionEvent.objects.create(mentor_session=mentor_session)
        else:
            # Pausing
            end_time = make_aware(datetime.datetime.now())
            event.end_time = end_time
            session_length_time = end_time - event.start_time
            event.session_length = session_length_time.seconds
            event.save()
        serializer = self.serializer_class(mentor_session, context={"request": request})
        return Response(status=status.HTTP_200_OK, data=serializer.data)

    @action(detail=True, methods=["post"])
    def end(self, request, id):
        mentor_session: MentorSession = get_object_or_404(MentorSession, id=id)

        if mentor_session.completed:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": "This session is finished. Please create a new session."})

        event = mentor_session.events.all().order_by("-start_time")[0]
        end_time = make_aware(datetime.datetime.now())

        if not event.end_time:
            # Pause the last event and end the session
            event.end_time = end_time
            session_length_time = end_time - event.start_time
            event.session_length = session_length_time.seconds
            event.save()

        # End the session
        mentor_session.completed = True
        mentor_session.end_time = end_time
        mentor_session.session_length = mentor_session.calculate_session_length(id)
        mentor_session.save()

        serializer = self.serializer_class(mentor_session, context={"request": request})
        return Response(status=status.HTTP_200_OK, data=serializer.data)


class StripeAccountLinkView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        domain = "https://domain.com"
        if settings.DEBUG:
            domain = "http://localhost:3000"
        account_links = stripe.AccountLink.create(
            account=self.request.user.stripe_account_id,
            refresh_url=domain + '/stripe-connect',
            return_url=domain + '/dashboard',
            type='account_onboarding',
        )
        return Response({"url": account_links["url"]})


class CreateStripeCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        mentor_session = MentorSession.objects.get(id=self.request.data["mentorSessionId"])
        minutes = mentor_session.session_length / 60  # seconds
        segments = ceil(minutes / 15)
        price = segments * mentor_session.mentor.rate

        domain = "https://domain.com"
        if settings.DEBUG:
            domain = "http://localhost:3000"
        session = stripe.checkout.Session.create(
            customer=request.user.stripe_customer_id,
            line_items=[{
                'price_data': {
                    'currency': "usd",
                    'product_data': {
                        'name': mentor_session.mentor.user.name,
                        'description': f"Sessions with {mentor_session.mentor.user.name}"
                    },
                    'unit_amount_decimal': price
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=domain + '/sessions/' + str(mentor_session.id),
            cancel_url=domain + '/sessions/' + str(mentor_session.id),
            payment_intent_data={
                'application_fee_amount': 0,
                'transfer_data': {
                    'destination': mentor_session.mentor.user.stripe_account_id,
                },
            },
            metadata={
                "session_id": mentor_session.id
            }
        )
        return Response({"url": session["url"]})


class StripeCustomerPortalLinkView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        domain = "https://domain.com"
        if settings.DEBUG:
            domain = "http://localhost:3000"

        session = stripe.billing_portal.Session.create(
            customer=self.request.user.stripe_customer_id,
            return_url=domain + '/profile/u/billing',
        )

        return Response({"url": session["url"]})


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    CHECKOUT_SESSION_COMPLETED = "checkout.session.completed"

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        send_mail(
            subject="Unsuccessful Stripe webhook.",
            message=f"An Invalid payload occurred: {e}",
            from_email="you@local.test",
            recipient_list=["admin@domain.com"]
        )
        return HttpResponse(status=400)

    except SignatureVerificationError as e:
        send_mail(
            subject="Unsuccessful Stripe webhook.",
            message=f"An Invalid signature occurred: {e}",
            from_email="you@local.test",
            recipient_list=["admin@domain.com"]
        )
        return HttpResponse(status=400)

    event_type = event['type']

    if event_type == CHECKOUT_SESSION_COMPLETED:
        session_id = event["data"]["object"]["metadata"]["session_id"]
        customer_id = event["data"]["object"]["customer"]

        client = User.objects.get(stripe_customer_id=customer_id)
        session = MentorSession.objects.get(id=session_id)
        session.paid = True
        session.save()

        send_mail(
            subject="Your payment was successful",
            message=f"Your session with {session.mentor.user.name} has now been paid for.",
            from_email="you@local.test",
            recipient_list=[client.email]
        )

        send_mail(
            subject="You have received a payment!",
            message=f"Your session with {session.mentor.user.name} has now been paid for.",
            from_email="you@local.test",
            recipient_list=[session.mentor.user.email]
        )

    return HttpResponse(status=200)


class StripeAccountBalance(APIView):
    def get(self, request, *args, **kwargs):
        stripe_account = request.user.stripe_account_id
        balance = stripe.Balance.retrieve(stripe_account=stripe_account)
        return Response(balance)


class StripeAccountPayouts(APIView):
    def get(self, request, *args, **kwargs):
        stripe_account = request.user.stripe_account_id
        payouts = stripe.Payout.list(stripe_account=stripe_account)
        return Response(payouts)










