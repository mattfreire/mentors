from rest_framework import serializers

from mentors.mentors.models import Mentor, MentorSession
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


class MentorSessionSerializer(serializers.ModelSerializer):
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
        )
        read_only_fields = (
            "id",
            "client",
            "session_length",
        )
