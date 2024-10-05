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

class UserList(generics.ListCreateAPIView):
    serializer_class = serializers.UserSerializer 
    permission_classes = [IsAuthenticated]

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
        manager = request.user

        manager_applications = models.Application.objects.filter(manager=manager)

        current_year = timezone.now().year

        leave_data = []
        subordinates = set(manager_applications.values_list('user', flat=True))

        for subordinate_id in subordinates:
            subordinate = models.User.objects.get(id=subordinate_id)
            applications = manager_applications.filter(
                user=subordinate,
                start_date__year=current_year
            )

            leave_types = applications.values('leave_type').distinct()

            for leave_type in leave_types:
                leave_type_applications = applications.filter(leave_type=leave_type['leave_type'])
                
                total_days = sum((app.end_date - app.start_date).days + 1 for app in leave_type_applications)
                pending_days = sum((app.end_date - app.start_date).days + 1 for app in leave_type_applications.filter(status='Pending'))
                approved_days = sum((app.end_date - app.start_date).days + 1 for app in leave_type_applications.filter(status='Approved'))
                rejected_days = sum((app.end_date - app.start_date).days + 1 for app in leave_type_applications.filter(status='Rejected'))

                leave_data.append({
                    'employee_name': subordinate.name,
                    'leave_type': leave_type['leave_type'],
                    'total_days': total_days,
                    'pending_days': pending_days,
                    'approved_days': approved_days,
                    'rejected_days': rejected_days
                })

        serializer = serializers.TotalLeaveReportSerializer(leave_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)