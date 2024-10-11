from . import serializers, models, permissions
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import F, Sum, Case, When, IntegerField

class UserList(generics.ListCreateAPIView):
    serializer_class = serializers.UserSerializer 

    def get_queryset(self):
        return models.User.objects.exclude(id=self.request.user.id)

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = [IsAuthenticated]

class SignIn(APIView):
    def post(self, request):
        serializer = serializers.UserSignInSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            user = authenticate(username=username, password=password)

            if user:
                refresh = RefreshToken.for_user(user)
                user_data = serializers.UserSerializer(user).data
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': user_data
                })

            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = serializers.CustomTokenRefreshSerializer

class ApplicationList(generics.ListCreateAPIView):
    serializer_class = serializers.ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return models.Application.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ApplicationDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Application.objects.all()
    serializer_class = serializers.ApplicationSerializer
    permission_classes = [permissions.IsManagerOrDeleteOnly]

class SubordinateApplicationsList(generics.ListAPIView):
    serializer_class = serializers.ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return models.Application.objects.filter(manager=self.request.user)
    

class TotalLeaveReport(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        applications  = models.Application.objects.filter(
            manager=request.user, 
            start_date__year=timezone.now().year,
            )
        
        users = applications.values('user__id', 'user__name').order_by('user__id').distinct('user__id')

        result = []

        for user in users:
            user_leaves = applications.filter(user__id=user['user__id'])
            
            # Get unique leave types for this user
            leave_types = user_leaves.values_list('leave_type', flat=True).distinct()
            
            leave_type_data = []
            for leave_type in leave_types:
                type_applications = user_leaves.filter(leave_type=leave_type)
                
                leave_type_data.append({
                    'leave_type': leave_type,
                    'total_days': sum((app.end_date - app.start_date).days + 1 for app in type_applications),
                    'pending_days': sum((app.end_date - app.start_date).days + 1 for app in type_applications if app.status == 'Pending'),
                    'approved_days': sum((app.end_date - app.start_date).days + 1 for app in type_applications if app.status == 'Approved'),
                    'rejected_days': sum((app.end_date - app.start_date).days + 1 for app in type_applications if app.status == 'Rejected')
                })
            
            result.append({
                'employee_name': user['user__name'],
                'leave_types': leave_type_data
            })

        serializer = serializers.TotalLeaveReportSerializer(result, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)