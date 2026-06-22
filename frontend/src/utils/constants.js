export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://invoice-flow-backend-lake.vercel.app/api'
    : 'http://localhost:5000/api');

export const INVOICE_STATUS = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  PENDING: "Pending",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

export const INVOICE_STATUS_LABELS = {
  Draft: "Draft",
  Sent: "Sent",
  Viewed: "Viewed",
  Pending: "Pending",
  Paid: "Paid",
  Overdue: "Overdue",
  Cancelled: "Cancelled",
};

export const INVOICE_STATUS_COLORS = {
  draft: "bg-gray-200 text-gray-800",
  pending: "bg-yellow-200 text-yellow-800",
  paid: "bg-green-200 text-green-800",
  overdue: "bg-red-200 text-red-800",
  cancelled: "bg-gray-300 text-gray-600",
};

export const USER_ROLES = {
  ADMIN: "ADMIN",
  ACCOUNTANT: "ACCOUNTANT",
};

export const PAYMENT_TERMS = [
  { value: 7, label: "Net 7" },
  { value: 14, label: "Net 14" },
  { value: 30, label: "Net 30" },
  { value: 60, label: "Net 60" },
  { value: 90, label: "Net 90" },
];

export const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
};

export const ROUTES = {
  SELECT_ROLE: "/select-role",
  ADMIN_LOGIN: "/admin/login",
  ACCOUNTANT_LOGIN: "/accountant/login",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ACCOUNTANT_DASHBOARD: "/accountant/dashboard",
  DASHBOARD: "/dashboard",
  INVOICES: "/invoices",
  CREATE_INVOICE: "/invoices/create",
  EDIT_INVOICE: "/invoices/edit/:id",
  INVOICE_DETAILS: "/invoices/:id",
  CLIENTS: "/clients",
  SETTINGS: "/settings",
  USERS: "/users",
};
