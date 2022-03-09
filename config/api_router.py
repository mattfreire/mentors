from django.conf import settings
from django.urls import path
from rest_framework.routers import DefaultRouter, SimpleRouter

from mentors.mentors.api.views import (
    MentorViewSet,
    StripeAccountLinkView,
    MentorSessionViewSet,
    CreateStripeCheckoutView,
    StripeCustomerPortalLinkView,
    stripe_webhook,
    StripeAccountBalance,
    StripeAccountPayouts,
    ReviewViewSet
)
from mentors.users.api.views import UserViewSet

if settings.DEBUG:
    router = DefaultRouter()
else:
    router = SimpleRouter()

router.register("users", UserViewSet)
router.register("mentors", MentorViewSet)
router.register("sessions", MentorSessionViewSet)
router.register("reviews", ReviewViewSet)


app_name = "api"
urlpatterns = router.urls
urlpatterns += [
    path("stripe-connect/", StripeAccountLinkView.as_view()),
    path("stripe-checkout/", CreateStripeCheckoutView.as_view()),
    path("stripe-customer-portal/", StripeCustomerPortalLinkView.as_view()),
    path("stripe-account-balance/", StripeAccountBalance.as_view()),
    path("stripe-account-payouts/", StripeAccountPayouts.as_view()),
    path("stripe-webhook/", stripe_webhook)
]
