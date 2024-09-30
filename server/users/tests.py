from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Application
from django.utils import timezone
import json

class UserModelTests(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            name='Test User'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.name, 'Test User')
        self.assertTrue(user.check_password('testpass123'))

class ApplicationModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            name='Test User'
        )
        self.manager = User.objects.create_user(
            username='manager',
            email='manager@example.com',
            password='managerpass123',
            name='Manager User'
        )

    def test_create_application(self):
        application = Application.objects.create(
            user=self.user,
            leave_type='Vacation',
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timezone.timedelta(days=1),
            reason='Test reason',
            status='Pending',
            manager=self.manager
        )
        self.assertEqual(application.user, self.user)
        self.assertEqual(application.leave_type, 'Vacation')
        self.assertEqual(application.status, 'Pending')
        self.assertEqual(application.manager, self.manager)

class APIViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            name='Test User'
        )
        self.manager = User.objects.create_user(
            username='manager',
            email='manager@example.com',
            password='managerpass123',
            name='Manager User'
        )

    def test_user_signin(self):
        url = reverse('signin')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('refresh', response.data)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)

    def test_create_application(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('application-list')
        data = {
            'leave_type': 'Vacation',
            'start_date': '2024-01-01',
            'end_date': '2024-01-05',
            'reason': 'Test vacation',
            'manager': self.manager.id,
            'status': 'Pending'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Application.objects.count(), 1)
        self.assertEqual(Application.objects.get().leave_type, 'Vacation')

    def test_get_subordinate_applications(self):
        self.client.force_authenticate(user=self.manager)
        Application.objects.create(
            user=self.user,
            leave_type='Vacation',
            start_date='2024-01-01',
            end_date='2024-01-05',
            reason='Test vacation',
            status='Pending',
            manager=self.manager
        )
        url = reverse('subordinate-applications-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['leave_type'], 'Vacation')

    def test_total_leave_report(self):
        self.client.force_authenticate(user=self.manager)
        Application.objects.create(
            user=self.user,
            leave_type='Vacation',
            start_date='2024-01-01',
            end_date='2024-01-05',
            reason='Test vacation',
            status='Approved',
            manager=self.manager
        )
        url = reverse('total-leaves-report')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['employee_name'], 'Test User')
        self.assertEqual(response.data[0]['leave_type'], 'Vacation')
        self.assertEqual(response.data[0]['total_days'], 5)
        self.assertEqual(response.data[0]['approved_days'], 5)