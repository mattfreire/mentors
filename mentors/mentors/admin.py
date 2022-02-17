from django.contrib import admin
from .models import Mentor, MentorSession, MentorSessionEvent


admin.site.register(Mentor)
admin.site.register(MentorSession)
admin.site.register(MentorSessionEvent)
