import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('roles');
      
      // Only redirect if NOT on the login page or login request
      if (!window.location.pathname.includes('/login') && !error.config.url.includes('/auth/login')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH MODULE APIs
// ============================================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: (username) => api.get(`/profile/${username}`),
  updateProfile: (username, data) => api.put(`/profile/${username}`, data),
  uploadPhoto: (username, formData) => api.post(`/profile/${username}/photo`, formData),
  changePassword: (username, data) => api.put(`/profile/${username}/password`, data),
  googleLogin: (data) => api.post('/auth/google', data),
};

// ============================================
// ADMIN MODULE APIs
// ============================================
export const adminAPI = {
  getPendingUsers: () => api.get('/admin/pending-users'),
  approveUser: (id) => api.put(`/admin/approve/${id}`),
  rejectUser: (id) => api.put(`/admin/suspend-user/${id}`),
  deleteUser: (id) => api.delete(`/admin/delete/${id}`),
  getAllUsers: () => api.get('/admin/all-users'),
  createAdmin: (data) => api.post('/admin/create-admin', data),
  changeRole: (id, newRole) => api.put(`/admin/change-role/${id}?newRole=${newRole}`),
  updateUser: (id, data) => api.put(`/admin/update-user/${id}`, data),
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
};

// ============================================
// PLANTATION MODULE APIs
// ============================================
export const landAPI = {
  getAll: (farmerId, params = {}) => {
    const query = new URLSearchParams({ ...params, farmerId }).toString();
    return api.get(`/lands?${query}`);
  },
  getById: (id, farmerId) => api.get(`/lands/${id}?farmerId=${farmerId}`),
  create: (farmerId, data) => api.post(`/lands?farmerId=${farmerId}`, { ...data, farmerId }),
  update: (id, farmerId, data) => api.put(`/lands/${id}?farmerId=${farmerId}`, { ...data, farmerId }),
  delete: (id, farmerId) => api.delete(`/lands/${id}?farmerId=${farmerId}`),
  getAllAdmin: (district) => api.get(`/lands/admin${district ? `?district=${district}` : ''}`),
  getAllOfficer: (officerId) => api.get(`/lands/officer?officerId=${officerId}`),
};

export const fertilizerAPI = {
  getSchedules: (landId, farmerId) => api.get(`/lands/${landId}/schedules?farmerId=${farmerId}`),
  createSchedule: (landId, farmerId, data) => api.post(`/lands/${landId}/schedules?farmerId=${farmerId}`, { ...data, farmerId }),
  updateSchedule: (scheduleId, farmerId, data) => api.put(`/schedules/${scheduleId}?farmerId=${farmerId}`, { ...data, farmerId }),
  deleteSchedule: (scheduleId, farmerId) => api.delete(`/schedules/${scheduleId}?farmerId=${farmerId}`),
  getApplications: (scheduleId, farmerId) => api.get(`/schedules/${scheduleId}/applications?farmerId=${farmerId}`),
  logApplication: (scheduleId, farmerId, data) => api.post(`/schedules/${scheduleId}/applications?farmerId=${farmerId}`, { ...data, farmerId }),
  getTimeline: (landId, farmerId) => api.get(`/lands/${landId}/fertilizing/timeline?farmerId=${farmerId}`),
  getActiveCount: (farmerId) => api.get(`/schedules/count?farmerId=${farmerId}`),
};

export const harvestAPI = {
  getByLand: (landId, farmerId, params = {}) => {
    const query = new URLSearchParams({ ...params, farmerId }).toString();
    return api.get(`/lands/${landId}/harvests?${query}`);
  },
  create: (landId, farmerId, data) => api.post(`/lands/${landId}/harvests?farmerId=${farmerId}`, { ...data, farmerId }),
  update: (harvestId, farmerId, data) => api.put(`/harvests/${harvestId}?farmerId=${farmerId}`, { ...data, farmerId }),
  delete: (harvestId, farmerId) => api.delete(`/harvests/${harvestId}?farmerId=${farmerId}`),
  getAnalytics: (landId, farmerId) => api.get(`/lands/${landId}/analytics/harvest?farmerId=${farmerId}`),
};

// ============================================
// FINANCIAL MODULE APIs
// ============================================
export const financialAPI = {
  getRecords: (userId) => api.get(`/financial/records?userId=${userId}`),
  getRecord: (id, userId) => api.get(`/financial/records/${id}?userId=${userId}`),
  createRecord: (userId, data) => api.post(`/financial/records?userId=${userId}`, { ...data, userId }),
  updateRecord: (id, userId, data) => api.put(`/financial/records/${id}?userId=${userId}`, { ...data, userId }),
  deleteRecord: (id, userId) => api.delete(`/financial/records/${id}?userId=${userId}`),
  getDashboard: (userId) => api.get(`/financial/dashboard?userId=${userId}`),
  getMonthlyComparison: (userId, months = 6) => api.get(`/financial/monthly-comparison?userId=${userId}&months=${months}`),
  getCategoryBreakdown: (userId) => api.get(`/financial/category-breakdown?userId=${userId}`),
};

// ============================================
// INVENTORY MODULE APIs
// ============================================
export const inventoryAPI = {
  getAll: (userId, params = {}) => {
    const query = new URLSearchParams({ ...params, userId }).toString();
    return api.get(`/inventory?${query}`);
  },
  getById: (id, userId) => api.get(`/inventory/${id}?userId=${userId}`),
  create: (userId, data) => api.post(`/inventory?userId=${userId}`, { ...data, userId }),
  update: (id, userId, data) => api.put(`/inventory/${id}?userId=${userId}`, { ...data, userId }),
  delete: (id, userId) => api.delete(`/inventory/${id}?userId=${userId}`),
  getLowStock: (userId) => api.get(`/inventory/low-stock?userId=${userId}`),
};

export const supplierAPI = {
  getAll: (userId) => api.get(`/suppliers?userId=${userId}`),
  getById: (id, userId) => api.get(`/suppliers/${id}?userId=${userId}`),
  create: (userId, data) => api.post(`/suppliers?userId=${userId}`, { ...data, userId }),
  update: (id, userId, data) => api.put(`/suppliers/${id}?userId=${userId}`, { ...data, userId }),
  delete: (id, userId) => api.delete(`/suppliers/${id}?userId=${userId}`),
};

export const purchaseAPI = {
  getAll: (userId) => api.get(`/purchases?userId=${userId}`),
  getByItem: (itemId, userId) => api.get(`/purchases/item/${itemId}?userId=${userId}`),
  create: (userId, data) => api.post(`/purchases?userId=${userId}`, { ...data, userId }),
};

export const usageAPI = {
  getAll: (userId, farmSection = '') => {
    const params = new URLSearchParams({ userId });
    if (farmSection) params.append('farmSection', farmSection);
    return api.get(`/usage?${params.toString()}`);
  },
  getByItem: (itemId, userId) => api.get(`/usage/item/${itemId}?userId=${userId}`),
  create: (userId, data) => api.post(`/usage?userId=${userId}`, { ...data, userId }),
};

// ============================================
// LABOR MODULE APIs
// ============================================
export const workerAPI = {
  getAll: (userId) => api.get(`/workers?userId=${userId}`),
  getById: (id, userId) => api.get(`/workers/${id}?userId=${userId}`),
  create: (userId, data) => api.post(`/workers?userId=${userId}`, { ...data, userId }),
  update: (id, userId, data) => api.put(`/workers/${id}?userId=${userId}`, { ...data, userId }),
  delete: (id, userId) => api.delete(`/workers/${id}?userId=${userId}`),
  getByStatus: (userId, status) => api.get(`/workers/status/${status}?userId=${userId}`),
  getAvailable: (userId) => api.get(`/workers/available?userId=${userId}`),
  searchBySkill: (userId, skill) => api.get(`/workers/search?skill=${skill}&userId=${userId}`),
  changeStatus: (id, userId, status) => api.put(`/workers/${id}/status?status=${status}&userId=${userId}`),
  getCountByStatus: (userId, status) => api.get(`/workers/count/${status}?userId=${userId}`),
};

export const taskAPI = {
  getAll: (userId) => api.get(`/tasks?userId=${userId}`),
  getById: (id, userId) => api.get(`/tasks/${id}?userId=${userId}`),
  create: (userId, data) => api.post(`/tasks?userId=${userId}`, { ...data, userId }),
  update: (id, userId, data) => api.put(`/tasks/${id}?userId=${userId}`, { ...data, userId }),
  delete: (id, userId) => api.delete(`/tasks/${id}?userId=${userId}`),
  getByWorker: (workerId, userId) => api.get(`/tasks/worker/${workerId}?userId=${userId}`),
  getByStatus: (userId, status) => api.get(`/tasks/status/${status}?userId=${userId}`),
  getByPriority: (userId, priority) => api.get(`/tasks/priority/${priority}?userId=${userId}`),
  getOverdue: (userId) => api.get(`/tasks/overdue?userId=${userId}`),
  getActiveOrdered: (userId) => api.get(`/tasks/active-ordered?userId=${userId}`),
  assignToWorker: (taskId, workerId, userId) => api.put(`/tasks/${taskId}/assign/${workerId}?userId=${userId}`),
  updateStatus: (id, userId, status) => api.put(`/tasks/${id}/status?status=${status}&userId=${userId}`),
  getCountByStatus: (userId, status) => api.get(`/tasks/count/${status}?userId=${userId}`),
};

export const workLogAPI = {
  getAll: (userId) => api.get(`/work-logs?userId=${userId}`),
  getById: (id, userId) => api.get(`/work-logs/${id}?userId=${userId}`),
  create: (userId, data) => api.post(`/work-logs?userId=${userId}`, { ...data, userId }),
  update: (id, userId, data) => api.put(`/work-logs/${id}?userId=${userId}`, { ...data, userId }),
  delete: (id, userId) => api.delete(`/work-logs/${id}?userId=${userId}`),
  getByWorker: (workerId, userId) => api.get(`/work-logs/worker/${workerId}?userId=${userId}`),
  getByTask: (taskId, userId) => api.get(`/work-logs/task/${taskId}?userId=${userId}`),
  getByDateRange: (userId, startDate, endDate) =>
    api.get(`/work-logs/date-range?startDate=${startDate}&endDate=${endDate}&userId=${userId}`),
  getByWorkerAndDateRange: (workerId, userId, startDate, endDate) =>
    api.get(`/work-logs/worker/${workerId}/date-range?startDate=${startDate}&endDate=${endDate}&userId=${userId}`),
  getByDate: (userId, date) => api.get(`/work-logs/date/${date}?userId=${userId}`),
  getTotalHoursByWorker: (workerId, userId, startDate, endDate) =>
    api.get(`/work-logs/worker/${workerId}/total-hours?startDate=${startDate}&endDate=${endDate}&userId=${userId}`),
  getTotalHoursByTask: (taskId, userId) => api.get(`/work-logs/task/${taskId}/total-hours?userId=${userId}`),
};

export const taskCategoryAPI = {
  getAll: (userId) => api.get(`/task-categories?userId=${userId}`),
  getById: (id, userId) => api.get(`/task-categories/${id}?userId=${userId}`),
  create: (userId, data) => api.post(`/task-categories?userId=${userId}`, { ...data, userId }),
  update: (id, userId, data) => api.put(`/task-categories/${id}?userId=${userId}`, { ...data, userId }),
  delete: (id, userId) => api.delete(`/task-categories/${id}?userId=${userId}`),
  searchByName: (userId, name) => api.get(`/task-categories/search?name=${name}&userId=${userId}`),
};

export const laborAnalyticsAPI = {
  getDashboard: (userId) => api.get(`/analytics/dashboard?userId=${userId}`),
  getWorkerProductivity: (workerId, userId, startDate, endDate) =>
    api.get(`/analytics/worker-productivity/${workerId}?startDate=${startDate}&endDate=${endDate}&userId=${userId}`),
  getTaskCompletionRate: (userId, startDate, endDate) =>
    api.get(`/analytics/task-completion-rate?startDate=${startDate}&endDate=${endDate}&userId=${userId}`),
  getLaborCostAnalysis: (userId, startDate, endDate) =>
    api.get(`/analytics/labor-cost-analysis?startDate=${startDate}&endDate=${endDate}&userId=${userId}`),
  getWorkDistribution: (userId) => api.get(`/analytics/work-distribution?userId=${userId}`),
};

// ============================================
// COMMUNITY MODULE APIs
// ============================================
export const articleAPI = {
  getAll: (page = 0, size = 10) => api.get(`/articles?page=${page}&size=${size}`),
  getCommunityPosts: () => api.get('/articles/community'),
  getById: (id) => api.get(`/articles/${id}`),
  create: (data) => api.post('/articles', data),
  update: (id, data, isAdmin = false) => api.put(`/articles/${id}${isAdmin ? '?isAdmin=true' : ''}`, data),
  delete: (id, userId) => api.delete(`/articles/${id}?userId=${userId}`),
  // Moderation
  getPending: (page = 0, size = 10) => api.get(`/articles?page=${page}&size=${size}&status=PENDING`),
  updateStatus: (id, status) => api.patch(`/articles/${id}/status?status=${status}`),
  adminDelete: (id, userId) => api.delete(`/articles/${id}?userId=${userId}&isAdmin=true`),
  likeArticle: (id, userId) => api.post(`/articles/${id}/like?userId=${userId}`),
};

export const communityCategoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const commentAPI = {
  getByArticle: (articleId) => api.get(`/comments/article/${articleId}`),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id, userId, isAdmin = false) => api.delete(`/comments/${id}?userId=${userId}${isAdmin ? '&isAdmin=true' : ''}`),
};

export const communityDashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const newsAPI = {
  getNews: () => api.get('/news'),
};

export const weatherAPI = {
  getCurrent: (city = 'Colombo') => api.get(`/weather?city=${city}`),
  getForecast: (city = 'Colombo') => api.get(`/weather/forecast?city=${city}`),
  getAdvice: (city = 'Colombo') => api.get(`/weather/coconut-advice?city=${city}`),
};


export const gpsAPI = {
  getLocations: () => api.get('/gps/locations'),
  saveLocation: (data) => api.post('/gps/location', data),
  deleteLocation: (id) => api.delete(`/gps/location/${id}`),
};

// ============================================
// FIELD VISIT MODULE APIs
// ============================================
export const visitAPI = {
  createRequest: (farmerId, data) => api.post(`/visits/request?farmerId=${farmerId}`, data),
  getFarmerRequests: (farmerId) => api.get(`/visits/farmer/${farmerId}`),
  getPendingByDistrict: (district) => api.get(`/visits/district/${district}`),
  getOfficerVisits: (officerId) => api.get(`/visits/officer/${officerId}`),
  acceptVisit: (id, officerId, data) => api.put(`/visits/${id}/accept?officerId=${officerId}`, data),
  rejectVisit: (id, officerId, data) => api.put(`/visits/${id}/reject?officerId=${officerId}`, data),
  completeVisit: (id, officerId, data) => api.put(`/visits/${id}/complete?officerId=${officerId}`, data),
  hideVisit: (id, officerId) => api.delete(`/visits/${id}/officer-hide?officerId=${officerId}`),
  hideVisitFarmer: (id, farmerId) => api.delete(`/visits/${id}/farmer-hide?farmerId=${farmerId}`),
};

export default api;
