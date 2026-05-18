import api from "./axios";

export const authApi = {
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  forgotPassword: (data: { email: string }) => api.post("/auth/forget-password", data),
  verifyResetOtp: (data: { email: string; otp: string }) => api.post("/auth/verify-reset-otp", data),
  resetPassword: (data: object) => api.post("/auth/reset-password", data),
  logout: () => api.post("/auth/logout"),
};

export const userApi = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data: FormData) => api.put("/user/profile", data, { headers: { "Content-Type": "multipart/form-data" } }),
};

export const partnerApi = {
  getDashboard: () => api.get("/partners/dashboard"),
  getPerformance: (id: string) => api.get(`/partners/${id}/performance`),
};

export const customersApi = {
  getAll: (params?: object) => api.get("/customers", { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: object) => api.post("/customers", data),
  update: (id: string, data: object) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

export const leadsApi = {
  getAll: (params?: object) => api.get("/leads", { params }),
  getById: (id: string) => api.get(`/leads/${id}`),
  create: (data: object) => api.post("/leads", data),
  update: (id: string, data: object) => api.put(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
  changeStatus: (id: string, data: { status: string }) => api.patch(`/leads/${id}/status`, data),
  generate: (data: object) => api.post("/leads/generate", data),
  convertToCustomer: (id: string) => api.post(`/leads/${id}/convert`),
};

export const earningsApi = {
  getDashboard: () => api.get("/earnings/dashboard"),
  getAll: (params?: object) => api.get("/earnings", { params }),
  getPayouts: (params?: object) => api.get("/earnings/payouts", { params }),
  requestWithdrawal: (data: object) => api.post("/earnings/withdraw", data),
  exportReport: () => api.get("/earnings/export"),
};

export const supportApi = {
  getAll: (params?: object) => api.get("/support", { params }),
  getById: (id: string) => api.get(`/support/${id}`),
  create: (data: object) => api.post("/support", data),
  reply: (id: string, data: { message: string; isInternal?: boolean }) =>
    api.post(`/support/${id}/reply`, data),
  close: (id: string) => api.patch(`/support/${id}/close`),
};

export const calendarApi = {
  getEvents: (params?: object) => api.get("/calendar", { params }),
  getInsights: () => api.get("/calendar/insights"),
  sync: () => api.post("/calendar/sync"),
  createEvent: (data: object) => api.post("/calendar", data),
  updateEvent: (id: string, data: object) => api.put(`/calendar/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/calendar/${id}`),
};

export const inboxApi = {
  getChats: (params?: object) => api.get("/inbox", { params }),
  getChatById: (chatId: string) => api.get(`/inbox/${chatId}`),
  search: (q: string) => api.get("/inbox/search", { params: { q } }),
  createGroup: (data: object) => api.post("/inbox/group", data),
  markRead: (chatId: string) => api.patch(`/inbox/${chatId}/read`),
  sendMessage: (data: { recipientId: string; content: string }) => api.post("/inbox", data),
  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete(`/inbox/${conversationId}/messages/${messageId}`),
};

export const koraAssistantApi = {
  sendMessage: (data: { message: string }) => api.post("/kora-assistant", data),
  getHistory: () => api.get("/kora-assistant"),
};

export const notificationsApi = {
  getAll: (params?: object) => api.get("/notification", { params }),
  getUnreadCount: () => api.get("/notification/unread-count"),
  markRead: (id: string) => api.put(`/notification/${id}/read`),
  markAllRead: () => api.put("/notification/read-all"),
};
