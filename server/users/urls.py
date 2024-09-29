from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.UserList.as_view()),
    path('users/<int:pk>/', views.UserDetail.as_view()),
    path('signin/', views.SignIn.as_view()),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('applications/', views.ApplicationList.as_view()),
    path('applications/<int:pk>/', views.ApplicationDetail.as_view()),
    path('subordinate-applications/', views.SubordinateApplicationsList.as_view()),
    path('total-leaves-report/', views.TotalLeaveReport.as_view()),
]
 