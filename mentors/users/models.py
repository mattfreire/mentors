from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db.models import CharField
from django.db.models.signals import post_save
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


class User(AbstractUser):
    """
    Default custom user model for mentors.
    If adding fields that need to be filled at user signup,
    check forms.SignupForm and forms.SocialSignupForms accordingly.
    """

    #: First and last name do not cover name patterns around the globe
    name = CharField(_("Name of User"), blank=True, max_length=255)
    first_name = None  # type: ignore
    last_name = None  # type: ignore
    stripe_account_id = CharField(max_length=100)

    def get_absolute_url(self):
        """Get url for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"username": self.username})


def post_save_user_receiver(sender, instance, created, **kwargs):
    if created:
        account = stripe.Account.create(
            type='express',
        )
        instance.stripe_account_id = account["id"]
        instance.save()


post_save.connect(post_save_user_receiver, sender=User)
