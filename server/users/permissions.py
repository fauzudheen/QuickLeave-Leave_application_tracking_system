from rest_framework import permissions

class IsManagerOrDeleteOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):

        if request.method in ['GET', 'DELETE']:
            return obj.user == request.user
        
        if request.method in ['PUT', 'PATCH']:
            return obj.manager == request.user

        return False