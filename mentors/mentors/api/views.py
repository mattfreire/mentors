import datetime

import stripe
from django.conf import settings
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
    queryset = Mentor.objects.all()
    lookup_field = "user__username"


class MentorSessionViewSet(RetrieveModelMixin, ListModelMixin, UpdateModelMixin, CreateModelMixin, GenericViewSet):
    serializer_class = MentorSessionSerializer
    queryset = MentorSession.objects.none()
    lookup_field = "id"

    def get_queryset(self):
        return MentorSession.objects.filter(mentor=self.request.user.mentor)

    def perform_create(self, serializer):
        mentor_session = serializer.save(client=self.request.user)
        MentorSessionEvent.objects.create(
            mentor_session=mentor_session
        )

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
