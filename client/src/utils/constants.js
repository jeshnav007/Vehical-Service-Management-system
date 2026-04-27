export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const USERS_URL = '/api/users';
export const VEHICLES_URL = '/api/vehicles';
export const APPOINTMENTS_URL = '/api/appointments';
export const SERVICES_URL = '/api/servicerecords';
export const INVOICES_URL = '/api/invoices';
export const NOTIFICATIONS_URL = '/api/notifications';

export const STATUS = {
  PENDING: "Pending Approval",
  APPROVED: "Approved",
  ASSIGNED: "Technician Assigned",
  IN_PROGRESS: "Repair In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled"
};
