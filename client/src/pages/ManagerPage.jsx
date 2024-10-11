import { useEffect, useState } from 'react';
import { Calendar, FileText, Check, X, Mail, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { backendUrl } from '../utils/const';
import createAxiosInstance from '../utils/api/axiosInstance';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';

const ConfirmationModal = ({ isOpen, onClose, title, description, onConfirm, application }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{description}</p>
                  {application && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-gray-900">{application.user.name}</p>
                      <p className="text-sm text-gray-600">{application.leave_type} Leave</p>
                      <p className="text-sm text-gray-600">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        {application.start_date} to {application.end_date}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirm}
            >
              Confirm
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return createPortal(
    <div className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'} border-l-4 p-4 rounded shadow-lg`}>
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

const ManagerPage = () => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [totalLeavesReport, setTotalLeavesReport] = useState([]);
  const [openSections, setOpenSections] = useState({
    applications: false,
    report: false
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    application: null,
    action: null
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  const token = useSelector(state => state.auth.accessToken);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    const axiosInstance = createAxiosInstance(token);
    try {
      const [applicationsResponse, reportResponse] = await Promise.all([
        axiosInstance.get(`${backendUrl}/subordinate-applications/`),
        axiosInstance.get(`${backendUrl}/total-leaves-report/`)
      ]);
      setLeaveApplications(applicationsResponse.data);
      setTotalLeavesReport(reportResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to fetch data. Please try again later.', 'error');
    }
  };

  const handleStatusChange = async (application, newStatus) => {
    try {
      const axiosInstance = createAxiosInstance(token);
      await axiosInstance.patch(`${backendUrl}/applications/${application.id}/`, { status: newStatus });
      
      setLeaveApplications(prevApplications =>
        prevApplications.map(app =>
          app.id === application.id ? { ...app, status: newStatus } : app
        )
      );

      const daysCount = calculateDays(application.start_date, application.end_date);
      setTotalLeavesReport(prevReport =>
        prevReport.map(report => {
          if (report.employee_name === application.user.name && report.leave_type === application.leave_type) {
            return {
              ...report,
              pending_days: report.pending_days - daysCount,
              [`${newStatus.toLowerCase()}_days`]: report[`${newStatus.toLowerCase()}_days`] + daysCount
            };
          }
          return report;
        })
      );

      showToast(`Leave application ${newStatus.toLowerCase()} successfully.`, 'success');
    } catch (error) {
      console.error('Error updating leave application status:', error);
      showToast(`Failed to ${newStatus.toLowerCase()} leave application.`, 'error');
    }
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  const openConfirmDialog = (application, action) => {
    setConfirmDialog({
      isOpen: true,
      application,
      action
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      application: null,
      action: null
    });
  };

  const handleConfirm = () => {
    const { application, action } = confirmDialog;
    handleStatusChange(application, action);
    closeConfirmDialog();
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
                    {application.status === 'Pending' && (
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => openConfirmDialog(application, 'Approved')}
                          className="flex items-center px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition duration-300 ease-in-out"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => openConfirmDialog(application, 'Rejected')}
                          className="flex items-center px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition duration-300 ease-in-out"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
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
                    <th className="py-2 px-4 border-b text-left">Sl No.</th>
                    <th className="py-2 px-4 border-b text-left">Employee</th>
                    <th className="py-2 px-4 border-b text-left">Leave Type</th>
                    <th className="py-2 px-4 border-b text-left">Total Days</th>
                    <th className="py-2 px-4 border-b text-left">Pending</th>
                    <th className="py-2 px-4 border-b text-left">Approved</th>
                    <th className="py-2 px-4 border-b text-left">Rejected</th>
                  </tr>
                </thead>
                <tbody>
                  {totalLeavesReport.map((employee, employeeIndex) => (
                    employee.leave_types.map((leaveType, leaveIndex) => (
                      <tr 
                        key={`${employee.employee_name}-${leaveType.leave_type}`}
                        className={leaveIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                      >
                        {leaveIndex === 0 ? (
                          <>
                          <td className="py-2 px-4 border-b bg-white font-bold" 
                            rowSpan={employee.leave_types.length}
                          >
                            {employeeIndex + 1}.
                          </td>
                          <td 
                            className="py-2 px-4 border bg-white font-bold"
                            rowSpan={employee.leave_types.length}
                          >
                            {employee.employee_name}
                          </td>
                          </>
                        ) : null}
                        <td className="py-2 px-4 border-b">{leaveType.leave_type}</td>
                        <td className="py-2 px-4 border-b">{leaveType.total_days}</td>
                        <td className="py-2 px-4 border-b">{leaveType.pending_days}</td>
                        <td className="py-2 px-4 border-b">{leaveType.approved_days}</td>
                        <td className="py-2 px-4 border-b">{leaveType.rejected_days}</td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>

      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        title={`Confirm ${confirmDialog.action}`}
        description={`Are you sure you want to ${confirmDialog.action} this leave application?`}
        onConfirm={handleConfirm}
        application={confirmDialog.application}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default ManagerPage;
