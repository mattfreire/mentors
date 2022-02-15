from django.conf import settings
from django.urls import path
from rest_framework.routers import DefaultRouter, SimpleRouter

from mentors.mentors.api.views import MentorViewSet, StripeAccountLinkView
from mentors.users.api.views import UserViewSet, LoadUserView

if settings.DEBUG:
    router = DefaultRouter()
else:
    router = SimpleRouter()

router.register("users", UserViewSet)
router.register("mentors", MentorViewSet)


app_name = "api"
urlpatterns = router.urls
urlpatterns += [
    path("users/me/", LoadUserView.as_view()),
    path("stripe-connect/", StripeAccountLinkView.as_view())
]
