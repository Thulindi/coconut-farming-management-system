import axios from 'axios';

const API_URL = '/api/notifications';

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const notificationAPI = {
    getUserNotifications: (username, role) => 
        axios.get(`${API_URL}/${username}/${role}`, getAuthHeaders()),
    
    markAsRead: (id, username) => 
        axios.put(`${API_URL}/${id}/read?username=${username}`, {}, getAuthHeaders()),
        
    markAllAsRead: (username, role) => 
        axios.put(`${API_URL}/read-all/${username}/${role}`, {}, getAuthHeaders()),

    broadcastMessage: (message, type = 'INFO') => 
        axios.post(`${API_URL}/broadcast`, { message, type }, getAuthHeaders()),

    deleteNotification: (id) => 
        axios.delete(`${API_URL}/${id}`, getAuthHeaders()),

    deleteAllNotifications: (username, role) => 
        axios.delete(`${API_URL}/all/${username}/${role}`, getAuthHeaders())
};
