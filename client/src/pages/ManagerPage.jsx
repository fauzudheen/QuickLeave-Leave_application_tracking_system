import React, { useEffect, useState } from 'react';
import { Calendar, FileText, Check, X, AlertCircle, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { backendUrl } from '../utils/const';
import createAxiosInstance from '../utils/api/axiosInstance';
import { useSelector } from 'react-redux';

const ManagerPage = () => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [totalLeavesReport, setTotalLeavesReport] = useState([]);
  const [openSections, setOpenSections] = useState({
    applications: false,
    report: false
  });
  const token = useSelector(state => state.auth.accessToken);

  useEffect(() => {
    const fetchData = async () => {
      const axiosInstance = createAxiosInstance(token);
      try {
        const [applicationsResponse, reportResponse] = await Promise.all([
          axiosInstance.get(`${backendUrl}/subordinate-applications/`),
          axiosInstance.get(`${backendUrl}/total-leaves-report/`)
        ]);
        setLeaveApplications(applicationsResponse.data);
        setTotalLeavesReport(reportResponse.data);
        console.log('Leave applications:', applicationsResponse.data);
        console.log('Total leaves report:', reportResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const axiosInstance = createAxiosInstance(token);
      const response = await axiosInstance.patch(`${backendUrl}/applications/${id}/`, { status: newStatus });
      console.log('Leave application status updated:', response.data);
      setLeaveApplications(prevApplications =>
        prevApplications.map(app =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Error updating leave application status:', error);
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionToggle = ({ title, section }) => (
    <div 
      className={`flex justify-between items-center p-4 cursor-pointer ${
        openSections[section] ? 'bg-cyan-700 text-white' : 'bg-white text-cyan-800'
      }`}
      onClick={() => toggleSection(section)}
    >
      <h2 className="text-2xl font-semibold">{title}</h2>
      {openSections[section] ? <ChevronUp /> : <ChevronDown />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-800 to-cyan-600 p-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-white">Manager Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <SectionToggle title="Leave Applications" section="applications" />
        {openSections.applications && (
          <div className="p-6">
            {leaveApplications.length === 0 ? (
              <p className="text-gray-600">No leave applications to review.</p>
            ) : (
              <ul className="space-y-6">
                {leaveApplications.map((application) => (
                  <li key={application.id} className="border border-gray-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-cyan-800">{application.user.name}</span>
                      <div className="flex items-center">
                        <Mail className="mr-1 w-4 h-4 text-cyan-800" />
                        <span className="text-cyan-800">{application.user.email}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        application.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                        application.status === 'Approved' ? 'bg-green-200 text-green-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{application.leave_type} Leave</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      {application.start_date} to {application.end_date}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <FileText className="inline w-4 h-4 mr-1" />
                      {application.reason}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(application.id, 'Approved')}
                        disabled={application.status === 'Approved'}
                        className={`flex items-center px-3 py-1 rounded ${
                          application.status === 'Approved'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        } transition duration-300 ease-in-out`}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(application.id, 'Rejected')}
                        disabled={application.status === 'Rejected'}
                        className={`flex items-center px-3 py-1 rounded ${
                          application.status === 'Rejected'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        } transition duration-300 ease-in-out`}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusChange(application.id, 'Pending')}
                        disabled={application.status === 'Pending'}
                        className={`flex items-center px-3 py-1 rounded ${
                          application.status === 'Pending'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        } transition duration-300 ease-in-out`}
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Pending
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <SectionToggle title="Total Leaves Report" section="report" />
        {openSections.report && (
          <div className="p-6">
            {totalLeavesReport.length === 0 ? (
              <p className="text-gray-600">No leave data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-cyan-100">
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Employee</th>
                      <th className="py-2 px-4 border-b text-left">Leave Type</th>
                      <th className="py-2 px-4 border-b text-left">Total Days</th>
                      <th className="py-2 px-4 border-b text-left">Pending</th>
                      <th className="py-2 px-4 border-b text-left">Approved</th>
                      <th className="py-2 px-4 border-b text-left">Rejected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalLeavesReport.map((report, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-4 border-b">{report.employee_name}</td>
                        <td className="py-2 px-4 border-b">{report.leave_type}</td>
                        <td className="py-2 px-4 border-b">{report.total_days}</td>
                        <td className="py-2 px-4 border-b">{report.pending_days}</td>
                        <td className="py-2 px-4 border-b">{report.approved_days}</td>
                        <td className="py-2 px-4 border-b">{report.rejected_days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerPage;