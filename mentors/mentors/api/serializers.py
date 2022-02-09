from rest_framework import serializers

from mentors.mentors.models import Mentor


class MentorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mentor
        fields = (
            "user",
            "is_active"
        )
