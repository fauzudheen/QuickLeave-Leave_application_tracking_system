from . import models
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True) 
    class Meta:
        model = models.User
        fields = ['id', 'username', 'name', 'email', 'password', 'manager'] 

    def create(self, validated_data):
        user = models.User.objects.create_user(**validated_data)
        return user

class UserSignInSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True) 

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = RefreshToken(attrs['refresh'])
        user = User.objects.get(id=refresh['user_id'])  
        data['user'] = {
            'id': user.id,
            'name': user.name, 
            'username': user.username,
            'email': user.email,
        }

        return data
    
class ApplicationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) 
    class Meta:
        model = models.Application
        fields = '__all__'
 
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = 'Pending'
        return super().create(validated_data)
    
class TotalLeaveReportSerializer(serializers.Serializer):
    employee_name = serializers.CharField()
    leave_type = serializers.CharField()
    total_days = serializers.IntegerField()
    pending_days = serializers.IntegerField()
    approved_days = serializers.IntegerField()
    rejected_days = serializers.IntegerField()