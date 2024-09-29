# QuickLeave: Leave Management System

QuickLeave is a comprehensive leave tracking and approval system designed to streamline the process of managing employee time off. It provides an intuitive interface for employees to submit leave requests and for managers to review and approve them efficiently.

## System Requirements

### Backend
- Python 3.8+
- Django 3.2+
- Django Rest Framework 3.12+
- PostgreSQL 12+

### Frontend
- Node.js 14+
- React 17+
- Redux 4+

## Installation

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/quickleave.git
   cd quickleave/server
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```
   python manage.py migrate
   ```

5. Start the development server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd ../client
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## User Guide

### For Employees

1. **Login**: Use your credentials to log into the system.
2. **View Dashboard**: On the main page, you can see your name and option to choose your designation for the session.
3. **Apply for Leave**: 
   - Click on "Employee" button.
   - Fill in the required details (start date, end date, leave type, reason).
   - Select your manager from the dropdown.
   - Submit the application.
4. **Track Applications**: View the status of your leave applications on the same page at the bottom.

### For Managers

1. **Login**: Use your credentials to log into the system.
2. **View Dashboard**: On the main page, you can see your name and option to choose your designation for the session.
3. **Approve/Reject Requests**: 
   - Click on "Manager" button.
   - Review the details of each request.
   - Click "Approve" or "Reject" based on your decision.

## Troubleshooting

1. **Backend server not starting**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check if the database is properly configured in `settings.py`
   - Verify that PostgreSQL service is running

2. **Frontend not connecting to backend**
   - Check if the backend URL is correctly set in the frontend configuration
   - Ensure CORS settings in the backend allow requests from the frontend origin

3. **Leave application not submitting**
   - Check browser console for any JavaScript errors
   - Verify that all required fields are filled in the form
   - Ensure you're logged in and your session hasn't expired

4. **Manager not seeing leave requests**
   - Confirm that the manager's account has the correct permissions
   - Verify that employees are selecting the correct manager when submitting requests

5. **Email notifications not working**
   - Check email configuration in the backend settings
   - Ensure the email service (e.g., SMTP server) is running and accessible

For any other issues, please check the application logs or create an issue in the GitHub repository.
