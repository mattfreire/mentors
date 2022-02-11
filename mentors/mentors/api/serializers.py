from rest_framework import serializers

from mentors.mentors.models import Mentor
from mentors.users.serializers import UserSerializer


class MentorSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Mentor
        fields = (
            "user",
            "is_active"
        )

    def get_user(self, obj):
        return UserSerializer(obj.user).data
