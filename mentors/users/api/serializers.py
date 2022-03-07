from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator

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

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "name", "profile_picture", "is_mentor"]
        read_only_fields = ["id", "username", "profile_picture", "is_mentor"]

    def get_profile_picture(self, obj):
        return MentorProfilePictureSerializer(obj.mentor, context=self.context).data["profile_picture"]

    def get_is_mentor(self, obj):
        return obj.mentor.approved


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, validators=[validate_password])
    re_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 're_password', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['re_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )

        user.set_password(validated_data['password'])
        user.save()

        Mentor.objects.create(user=user)

        return user
