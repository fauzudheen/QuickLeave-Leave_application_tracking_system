from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenVerifyView

urlpatterns = [
    path('users/', views.UserList.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetail.as_view(), name='user-detail'),
    path('signin/', views.SignIn.as_view(), name='signin'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('applications/', views.ApplicationList.as_view(), name='application-list'),
    path('applications/<int:pk>/', views.ApplicationDetail.as_view(), name='application-detail'),
    path('subordinate-applications/', views.SubordinateApplicationsList.as_view(), name='subordinate-applications-list'),
    path('total-leaves-report/', views.TotalLeaveReport.as_view(), name='total-leaves-report'),
]
