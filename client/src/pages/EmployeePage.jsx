import { useEffect, useState } from 'react';
import { Calendar, FileText, Send, Check, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { backendUrl } from '../utils/const';
import createAxiosInstance from '../utils/api/axiosInstance';
import { createPortal } from 'react-dom';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return createPortal(
    <div className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
      type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'
    } border-l-4 p-4 rounded shadow-lg`}>
      <div className="flex">
        <div className="py-1">
          {type === 'error' ? (
            <X className="h-6 w-6 text-red-500" />
          ) : (
            <Check className="h-6 w-6 text-green-500" />
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            className="-mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const EmployeePage = () => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [managers, setManagers] = useState([]);
  const token = useSelector((state) => state.auth.accessToken);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    leave_type: '',
    reason: '',
    manager: '',
    status: 'Pending',
  });
  const [errors, setErrors] = useState({
    start_date: '',
    end_date: '',
    leave_type: '',
    reason: '',
    manager: '',
    dateRange: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    const axiosInstance = createAxiosInstance(token);
    const fetchLeaveApplications = async () => {
      try {
        const response = await axiosInstance.get(`${backendUrl}/applications/`);
        setLeaveApplications(response.data);
      } catch (error) {
        console.error('Error fetching leave applications:', error);
        showToast('Failed to fetch leave applications.', 'error');
      }
    };

    const fetchManagers = async () => {
      try {
        const response = await axiosInstance.get(`${backendUrl}/users/`);
        setManagers(response.data);
      } catch (error) {
        console.error('Error fetching managers:', error);
        showToast('Failed to fetch managers.', 'error');
      }
    };

    fetchLeaveApplications();
    fetchManagers();
  }, [token]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  const validateForm = () => {
    const newErrors = {
      start_date: '',
      end_date: '',
      leave_type: '',
      reason: '',
      manager: '',
      dateRange: '',
    };
    let isValid = true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
      isValid = false;
    } else {
      const startDate = new Date(formData.start_date);
      if (startDate < today) {
        newErrors.start_date = 'Start date cannot be in the past';
        isValid = false;
      }
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
      isValid = false;
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        newErrors.dateRange = 'End date must be on or after start date';
        isValid = false;
      }

      const hasOverlap = leaveApplications.some(application => {
        const existingStart = new Date(application.start_date);
        const existingEnd = new Date(application.end_date);
        return (
          (startDate >= existingStart && startDate <= existingEnd) ||
          (endDate >= existingStart && endDate <= existingEnd) ||
          (startDate <= existingStart && endDate >= existingEnd)
        );
      });

      if (hasOverlap) {
        newErrors.dateRange = 'This date range overlaps with an existing leave application';
        isValid = false;
      }

      const maxLeaveDays = 14;
      const dayDifference = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      if (dayDifference > maxLeaveDays) {
        newErrors.dateRange = `Leave duration cannot exceed ${maxLeaveDays} days`;
        isValid = false;
      }
    }

    if (!formData.leave_type) {
      newErrors.leave_type = 'Leave type is required';
      isValid = false;
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
      isValid = false;
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters long';
      isValid = false;
    } else if (formData.reason.trim().length > 500) {
      newErrors.reason = 'Reason cannot exceed 500 characters';
      isValid = false;
    }

    if (!formData.manager) {
      newErrors.manager = 'Manager selection is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
    
    if (name === 'start_date' || name === 'end_date') {
      setErrors(prevErrors => ({ ...prevErrors, dateRange: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    const axiosInstance = createAxiosInstance(token);
    
    try {
      const response = await axiosInstance.post(`${backendUrl}/applications/`, formData);
      const newApplication = response.data;
      setLeaveApplications(prevApplications => [...prevApplications, newApplication]);
      setFormData({
        start_date: '',
        end_date: '',
        leave_type: '',
        reason: '',
        manager: '',
        status: 'Pending',
      });
      showToast('Leave application submitted successfully!', 'success');
    } catch (error) {
      console.error('Error submitting leave application:', error);
      showToast('Failed to submit leave application. Please try again.', 'error');
      if (error.response?.data) {
        const serverErrors = error.response.data;
        const newErrors = { ...errors };
        Object.keys(serverErrors).forEach(key => {
          if (newErrors.hasOwnProperty(key)) {
            newErrors[key] = serverErrors[key];
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteApplication = async (applicationId) => {
    const axiosInstance = createAxiosInstance(token);
    try {
      await axiosInstance.delete(`${backendUrl}/applications/${applicationId}/`);
      setLeaveApplications(prevApplications => prevApplications.filter(app => app.id !== applicationId));
      showToast('Leave application deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting leave application:', error);
      showToast('Failed to delete leave application. Please try again.', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-800 to-cyan-600">
      <div className="flex-grow p-8">
        <h1 className="text-4xl font-bold mb-6 text-center text-white">Employee Leave Management</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-cyan-800">Apply for Leave</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="flex-1 mb-4 md:mb-0">
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">From</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={`mt-1 p-2 block w-full rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 ${
                    errors.start_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
              </div>
              <div className="flex-1">
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">To</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={`mt-1 p-2 block w-full rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 ${
                    errors.end_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
              </div>
            </div>
            {errors.dateRange && (
              <p className="text-sm text-red-600 mt-1">{errors.dateRange}</p>
            )}
            <div>
              <label htmlFor="leave_type" className="block text-sm font-medium text-gray-700">Leave Type</label>
              <select
                id="leave_type"
                name="leave_type"
                value={formData.leave_type}
                onChange={handleInputChange}
                className={`mt-1 p-2 block w-full rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 ${
                  errors.leave_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select leave type</option>
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Personal">Personal Leave</option>
              </select>
              {errors.leave_type && <p className="mt-1 text-sm text-red-600">{errors.leave_type}</p>}
            </div>
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className={`mt-1 p-2 block w-full rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                rows="3"
              />
              {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
            </div>
            <div>
              <label htmlFor="manager" className="block text-sm font-medium text-gray-700">Manager</label>
              <select
                id="manager"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
                className={`mt-1 p-2 block w-full rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 ${
                  errors.manager ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select manager</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>{manager.name}</option>
                ))}
              </select>
              {errors.manager && <p className="mt-1 text-sm text-red-600">{errors.manager}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 flex items-center justify-center ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-700'
              }`}
            >
              <Send className="mr-2 h-5 w-5" />
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-cyan-800">My Leave Applications</h2>
          {leaveApplications.length === 0 ? (
            <p className="text-gray-600">No leave applications yet.</p>
          ) : (
            <ul className="space-y-4">
              {leaveApplications.map((application) => (
                <li key={application.id} className="bg-gray-100 rounded-lg p-4 shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-medium text-cyan-800">{application.leave_type} Leave</p>
                      <p className="text-sm text-gray-600">{new Date(application.start_date).toLocaleDateString()} to {new Date(application.end_date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Status: {application.status}</p>
                    </div>
                    <button
                      onClick={() => deleteApplication(application.id)}
                      className="bg-red-600 text-white p-2 rounded-lg shadow hover:bg-red-700 transition duration-300"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-2 text-gray-700">{application.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {toast.show && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default EmployeePage;
