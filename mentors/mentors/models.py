import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Sum

User = get_user_model()


class Mentor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=False)
    rate = models.IntegerField(default=1000)  # cents
    title = models.CharField(max_length=50)
    bio = models.TextField()
    profile_picture = models.ImageField(blank=True, null=True)
    approved = models.BooleanField(default=False)

    def __str__(self):
        return self.user.name


class MentorSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mentor = models.ForeignKey(Mentor, related_name="client_sessions", on_delete=models.CASCADE)
    client = models.ForeignKey(User, related_name="mentor_sessions", on_delete=models.CASCADE)

    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    session_length = models.IntegerField(blank=True, null=True)  # seconds
    completed = models.BooleanField(default=False)
    paid = models.BooleanField(default=False)

    def __str__(self):
        return self.mentor.user.username

    @classmethod
    def calculate_session_length(cls, id):
        mentor_session = MentorSession.objects.get(id=id)
        event_sum = mentor_session.events\
            .all()\
            .aggregate(session_length_sum=Sum("session_length"))
        return event_sum["session_length_sum"]


class MentorSessionEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mentor_session = models.ForeignKey(MentorSession, related_name="events", on_delete=models.CASCADE)

    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    session_length = models.IntegerField(blank=True, null=True)  # seconds

    def __str__(self):
        return str(self.id)


class Review(models.Model):
    session = models.OneToOneField(MentorSession, on_delete=models.CASCADE)
    description = models.TextField()
    rating = models.IntegerField(default=5)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.session)
