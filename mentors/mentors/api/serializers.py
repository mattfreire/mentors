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
            "is_active"
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


class MentorSessionSerializer(serializers.ModelSerializer):
    events = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

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
            "price"
        )
        read_only_fields = (
            "id",
            "client",
            "session_length",
            "events",
            "price"
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
