from django.contrib import admin
from .models import Mentor, MentorSession, MentorSessionEvent


class MentorAdmin(admin.ModelAdmin):
    list_display = ["user", "is_active", "approved", "rate"]


class MentorSessionEventInLineAdmin(admin.TabularInline):
    model = MentorSessionEvent
    extra = 0


class MentorSessionAdmin(admin.ModelAdmin):
    inlines = [MentorSessionEventInLineAdmin]


admin.site.register(Mentor, MentorAdmin)
admin.site.register(MentorSession, MentorSessionAdmin)
admin.site.register(MentorSessionEvent)
