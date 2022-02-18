from django.contrib import admin
from .models import Mentor, MentorSession, MentorSessionEvent


admin.site.register(Mentor)


class MentorSessionEventInLineAdmin(admin.TabularInline):
    model = MentorSessionEvent
    extra = 0


class MentorSessionAdmin(admin.ModelAdmin):
    inlines = [MentorSessionEventInLineAdmin]


admin.site.register(MentorSession, MentorSessionAdmin)
admin.site.register(MentorSessionEvent)
