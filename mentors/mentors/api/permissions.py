from rest_framework import permissions


class IsSessionClientOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.session.client == request.user


class OnlyClientCanReview(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method == "POST":
            # Checks that the client is the person reviewing
            return obj.session.client == request.user
        return True
