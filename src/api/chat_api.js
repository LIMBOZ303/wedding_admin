import axios from 'axios';

// Sử dụng API server thực tế
const API_URL = 'https://apidatn.onrender.com/chat';

// Lấy lịch sử chat giữa admin và một user cụ thể
export const fetchChatHistory = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/history/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
    }
};

// Lấy danh sách tất cả các user đã chat với admin
export const fetchAllChatUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chat users:', error);
        throw error;
    }
};

// Gửi tin nhắn mới
export const sendMessage = async (messageData) => {
    try {
        const response = await axios.post(`${API_URL}/message`, messageData);
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}; 