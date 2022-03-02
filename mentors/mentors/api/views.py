import datetime
from math import ceil

import stripe
from django.conf import settings
from django.db.models import Q
from django.utils.timezone import make_aware
from rest_framework.decorators import action
from rest_framework import permissions, status
from rest_framework.generics import get_object_or_404
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin, CreateModelMixin
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from mentors.mentors.models import Mentor, MentorSession, MentorSessionEvent
from .serializers import MentorSerializer, MentorSessionSerializer


stripe.api_key = settings.STRIPE_SECRET_KEY


class MentorViewSet(RetrieveModelMixin, ListModelMixin, UpdateModelMixin, GenericViewSet):
    serializer_class = MentorSerializer
    queryset = Mentor.objects.filter(is_active=True)
    lookup_field = "user__username"

    def update(self, request, *args, **kwargs):
        self.queryset = Mentor.objects.filter(user=request.user)
        return super(MentorViewSet, self).update(request, *args, **kwargs)

    @action(detail=False)
    def me(self, request):
        serializer = self.serializer_class(request.user.mentor, context={"request": request})
        return Response(status=status.HTTP_200_OK, data=serializer.data)


class MentorSessionViewSet(RetrieveModelMixin, ListModelMixin, UpdateModelMixin, CreateModelMixin, GenericViewSet):
    serializer_class = MentorSessionSerializer
    queryset = MentorSession.objects.none()
    lookup_field = "id"

    def get_queryset(self):
        return MentorSession.objects.filter(
            Q(mentor=self.request.user.mentor) | Q(client=self.request.user)
        )

    def perform_create(self, serializer):
        mentor_session = serializer.save(client=self.request.user)
        MentorSessionEvent.objects.create(
            mentor_session=mentor_session
        )

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
        event = mentor_session.events.all().order_by("-start_time")[0]
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
            cancel_url=domain + '/payment/' + str(mentor_session.id),
            payment_intent_data={
                'application_fee_amount': 123,
                'transfer_data': {
                    'destination': mentor_session.mentor.user.stripe_account_id,
                },
            },
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
