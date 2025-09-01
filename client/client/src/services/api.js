import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const readStoredUser = () => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
        localStorage.removeItem('user');
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch (error) {
        localStorage.removeItem('user');
        return null;
    }
};

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const user = readStoredUser();

    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    } else if (user?.id) {
        config.headers['x-user-id'] = user.id;
    }

    return config;
});

export const fetchTasks = async () => {
    const { data } = await api.get('/tasks');
    return data;
};

export const createTask = async (payload) => {
    const { data } = await api.post('/tasks', payload);
    return data;
};

export const updateTask = async (taskId, payload) => {
    const { data } = await api.put(`/tasks/${taskId}`, payload);
    return data;
};

export const deleteTask = async (taskId) => {
    const { data } = await api.delete(`/tasks/${taskId}`);
    return data;
};

export const planDay = async () => {
    const { data } = await api.post('/ai/plan-day');
    return data;
};

export const fetchWeeklyReport = async () => {
    const { data } = await api.get('/ai/weekly-report');
    return data;
};

export default api;
