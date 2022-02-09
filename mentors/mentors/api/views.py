from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet

from mentors.mentors.models import Mentor
from .serializers import MentorSerializer


class MentorViewSet(RetrieveModelMixin, ListModelMixin, UpdateModelMixin, GenericViewSet):
    serializer_class = MentorSerializer
    queryset = Mentor.objects.all()
