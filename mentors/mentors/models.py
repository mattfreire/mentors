from django.contrib.auth import get_user_model
from django.db import models


User = get_user_model()


class Mentor(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username
