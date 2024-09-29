import { useEffect, useState } from 'react';
import { Calendar, FileText, Send } from 'lucide-react';
import { useSelector } from 'react-redux';
import { backendUrl } from '../utils/const';
import createAxiosInstance from '../utils/api/axiosInstance';
import axios from 'axios';

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

  useEffect(() => {
    const axiosInstance = createAxiosInstance(token);
    const fetchLeaveApplications = async () => {
      try {
        const response = await axiosInstance.get(`${backendUrl}/applications/`);
        setLeaveApplications(response.data);
      } catch (error) {
        console.error('Error fetching leave applications:', error);
      }
    };

    const fetchManagers = async () => {
      try {
        const response = await axios.get(`${backendUrl}/users/`);
        setManagers(response.data);
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    fetchLeaveApplications();
    fetchManagers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const axiosInstance = createAxiosInstance(token);
    try {
      const response = await axiosInstance.post(`${backendUrl}/applications/`, formData);
      const newApplication = response.data;
      setLeaveApplications(prevApplications => [...prevApplications, newApplication]);
      setFormData({ start_date: '', end_date: '', leave_type: '', reason: '', manager: '' });
    } catch (error) {
      console.error('Error submitting leave application:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-800 to-cyan-600">
      <div className="flex-grow p-8">
        <h1 className="text-4xl font-bold mb-6 text-center text-white">Employee Leave Management</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-cyan-800">Apply for Leave</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">From</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">To</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="leave_type" className="block text-sm font-medium text-gray-700">Leave Type</label>
              <select
                id="leave_type"
                name="leave_type"
                value={formData.leave_type}
                onChange={handleInputChange}
                required
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              >
                <option value="">Select leave type</option>
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Personal">Personal Leave</option>
              </select>
            </div>
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                rows="3"
              />
            </div>
            <div>
              <label htmlFor="manager" className="block text-sm font-medium text-gray-700">Manager</label>
              <select
                id="manager"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
                required
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              >
                <option value="">Select manager</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>{manager.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-cyan-700 transition duration-300 ease-in-out transform hover:-translate-y-1 flex items-center justify-center"
            >
              <Send className="mr-2 h-5 w-5" />
              Submit Application
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
                <li key={application.id} className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-cyan-800">{application.leave_type} Leave</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      application.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                      application.status === 'Approved' ? 'bg-green-200 text-green-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    {application.start_date} to {application.end_date}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <FileText className="inline w-4 h-4 mr-1" />
                    {application.reason}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePage;