from math import ceil

from rest_framework import serializers

from mentors.mentors.models import Mentor, MentorSession, MentorSessionEvent
from mentors.users.serializers import UserSerializer


class MentorSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Mentor
        fields = (
            "id",
            "user",
            "is_active",
            "title",
            "bio",
            "profile_picture"
        )
        read_only_fields = (
            "id",
            "user"
        )

    def get_user(self, obj):
        return UserSerializer(obj.user).data


class MentorSessionEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorSessionEvent
        fields = (
            "id",
            "start_time",
            "end_time",
            "session_length",
        )
        read_only_fields = (
            "id",
            "session_length",
        )


class MentorSessionSerializer(serializers.ModelSerializer):
    events = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    mentor_profile = serializers.SerializerMethodField()
    client_profile = serializers.SerializerMethodField()

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
            "client_profile"
        )
        read_only_fields = (
            "id",
            "client",
            "session_length",
            "events",
            "price",
            "mentor_profile",
            "client_profile"
        )

    def get_events(self, obj):
        events = obj.events.all()
        data = MentorSessionEventSerializer(events, many=True).data
        return data

    def get_price(self, obj):
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
