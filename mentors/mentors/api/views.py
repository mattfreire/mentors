import stripe
from django.conf import settings
from rest_framework import permissions
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from mentors.mentors.models import Mentor
from .serializers import MentorSerializer


stripe.api_key = settings.STRIPE_SECRET_KEY


class MentorViewSet(RetrieveModelMixin, ListModelMixin, UpdateModelMixin, GenericViewSet):
    serializer_class = MentorSerializer
    queryset = Mentor.objects.all()
    lookup_field = "user__username"


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
