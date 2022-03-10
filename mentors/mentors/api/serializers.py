import datetime
from math import ceil

from django.conf import settings
from django.db.models import Avg
from django.utils.timezone import make_aware
from rest_framework import serializers

from mentors.mentors.models import Mentor, MentorSession, MentorSessionEvent, Review
from mentors.users.api.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            'id',
            'session',
            'description',
            'rating',
            'user'
        )
        read_only_fields = (
            'id',
            'user'
        )

    def get_user(self, obj):
        return UserSerializer(obj.session.client, context=self.context).data


class MentorSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    session_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Mentor
        fields = (
            "id",
            "user",
            "is_active",
            "title",
            "bio",
            "profile_picture",
            "rate",
            "session_count",
            "average_rating"
        )
        read_only_fields = (
            "id",
            "user",
            "session_count",
            "average_rating"
        )

    def get_user(self, obj):
        return UserSerializer(obj.user, context=self.context).data

    def get_session_count(self, obj):
        return MentorSession.objects.filter(mentor=obj, completed=True).count()

    def get_average_rating(self, obj):
        return Review.objects.filter(session__mentor=obj).aggregate(rating_avg=Avg("rating"))["rating_avg"]


class MentorSessionEventSerializer(serializers.ModelSerializer):
    current_session_length = serializers.SerializerMethodField()

    class Meta:
        model = MentorSessionEvent
        fields = (
            "id",
            "start_time",
            "end_time",
            "session_length",
            "current_session_length"
        )
        read_only_fields = (
            "id",
            "session_length",
            "current_session_length"
        )

    def get_current_session_length(self, obj):
        end_time = make_aware(datetime.datetime.now())
        if obj.end_time:
            end_time = obj.end_time

        session_length_time = end_time - obj.start_time
        return session_length_time.seconds


class MentorSessionSerializer(serializers.ModelSerializer):
    events = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    mentor_profile = serializers.SerializerMethodField()
    client_profile = serializers.SerializerMethodField()
    session_url = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()
    current_session_length = serializers.SerializerMethodField()
    reviewed = serializers.SerializerMethodField()

    class Meta:
        model = MentorSession
        fields = (
            "id",
            "mentor",
            "client",
            "start_time",
            "end_time",
            "session_length",
            "completed",
            "events",
            "price",
            "mentor_profile",
            "client_profile",
            "session_url",
            "other_user",
            "current_session_length",
            "paid",
            "reviewed"
        )
        read_only_fields = (
            "id",
            "mentor",
            "session_length",
            "events",
            "price",
            "mentor_profile",
            "client_profile",
            "session_url",
            "other_user",
            "current_session_length",
            "paid",
            "reviewed"
        )

    def get_current_session_length(self, obj):
        current_length = 0
        for event in obj.events.all():
            if event.end_time:
                current_length += event.session_length
            else:
                # calculate time between now and session start time
                end_time = make_aware(datetime.datetime.now())
                start_time = event.start_time
                session_length_time = end_time - start_time
                current_length += session_length_time.seconds
        return current_length

    def get_other_user(self, obj):
        me = self.context["request"].user
        if me.id == obj.client.id:
            # Then I am the client so the other user is the mentor
            other = obj.mentor.user
        else:
            other = obj.client
        return UserSerializer(other, context=self.context).data

    def get_events(self, obj):
        events = obj.events.order_by("start_time")
        data = MentorSessionEventSerializer(events, many=True).data
        return data

    def get_price(self, obj):
        if not obj.session_length:
            return None
        minutes = obj.session_length / 60  # seconds
        segments = ceil(minutes / 15)
        price = segments * obj.mentor.rate
        return price

    def get_mentor_profile(self, obj):
        return {
            "profile_picture": "",
            "username": obj.mentor.user.username,
            "full_name": obj.mentor.user.get_full_name()
        }

    def get_client_profile(self, obj):
        return {
            "profile_picture": "",
            "username": obj.client.username,
            "full_name": obj.client.get_full_name()
        }

    def get_session_url(self, obj):
        # Returns the URL for the call on the frontend
        domain = "https://domain.com"
        if settings.DEBUG:
            domain = "http://localhost:3000"
        return domain + "/sessions/" + str(obj.id)

    def get_reviewed(self, obj):
        try:
            Review.objects.get(session=obj)
            return True
        except Review.DoesNotExist:
            return False
