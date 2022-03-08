from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db.models import CharField
from django.db.models.signals import post_save
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.template.loader import render_to_string

from django_rest_passwordreset.signals import reset_password_token_created

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
    stripe_account_id = CharField(max_length=100)
    stripe_customer_id = CharField(max_length=100)

    def get_absolute_url(self):
        """Get url for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"username": self.username})


def post_save_user_receiver(sender, instance, created, **kwargs):
    if created:
        instance.name = f"{instance.first_name} {instance.last_name}"
        account = stripe.Account.create(
            type='express',
        )
        instance.stripe_account_id = account["id"]
        customer = stripe.Customer.create(
            email=instance.email,
            name=instance.name
        )
        instance.stripe_customer_id = customer["id"]
        instance.save()

        # Avoid circular import
        from mentors.mentors.models import Mentor
        Mentor.objects.create(user=instance)


post_save.connect(post_save_user_receiver, sender=User)


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    """
    Handles password reset tokens
    When a token is created, an e-mail needs to be sent to the user
    :param sender: View Class that sent the signal
    :param instance: View Instance that sent the signal
    :param reset_password_token: Token Model Object
    :param args:
    :param kwargs:
    :return:
    """
    # send an e-mail to the user

    domain = "https://domain.com"
    if settings.DEBUG:
        domain = "http://localhost:3000"
    reset_password_url = domain + '/accounts/reset-password/confirm/' + reset_password_token.key

    context = {
        'current_user': reset_password_token.user,
        'username': reset_password_token.user.username,
        'email': reset_password_token.user.email,
        'reset_password_url': reset_password_url,
        'domain': domain
    }

    # render email text
    email_html_message = render_to_string('email/user_reset_password.html', context)
    email_plaintext_message = render_to_string('email/user_reset_password.txt', context)

    msg = EmailMultiAlternatives(
        # title:
        "Password Reset for {title}".format(title="Mentors"),
        # message:
        email_plaintext_message,
        # from:
        "noreply@somehost.local",
        # to:
        [reset_password_token.user.email]
    )
    msg.attach_alternative(email_html_message, "text/html")
    msg.send()
