from django.contrib.auth import get_user_model
from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers

from mentors.mentors.models import Mentor

User = get_user_model()


class MentorProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mentor
        fields = (
            "profile_picture",
        )
        read_only_fields = ["profile_picture"]


class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    is_mentor = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "name", "profile_picture", "is_mentor"]
        read_only_fields = ["id", "username", "profile_picture", "is_mentor"]

    def get_profile_picture(self, obj):
        return MentorProfilePictureSerializer(obj.mentor, context=self.context).data["profile_picture"]

    def get_is_mentor(self, obj):
        return obj.mentor.approved

    def get_name(self, obj):
        return obj.get_full_name()


class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(
        max_length=50,
        min_length=2,
        required=True
    )
    last_name = serializers.CharField(
        max_length=50,
        min_length=2,
        required=True
    )

    def get_cleaned_data(self):
        return {
            'username': self.validated_data.get('username', ''),
            'password1': self.validated_data.get('password1', ''),
            'email': self.validated_data.get('email', ''),
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', ''),
        }
