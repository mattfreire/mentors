import stripe
from django.conf import settings
from rest_framework import permissions
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin, CreateModelMixin
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from mentors.mentors.models import Mentor, MentorSession
from .serializers import MentorSerializer, MentorSessionSerializer


stripe.api_key = settings.STRIPE_SECRET_KEY


class MentorViewSet(RetrieveModelMixin, ListModelMixin, UpdateModelMixin, GenericViewSet):
    serializer_class = MentorSerializer
    queryset = Mentor.objects.all()
    lookup_field = "user__username"


class MentorSessionViewSet(RetrieveModelMixin, ListModelMixin, UpdateModelMixin, CreateModelMixin, GenericViewSet):
    serializer_class = MentorSessionSerializer
    queryset = MentorSession.objects.none()

    def get_queryset(self):
        return MentorSession.objects.filter(mentor=self.request.user.mentor)

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


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
