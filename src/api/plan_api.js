import axios from 'axios';

const PLAN_API_URL = 'https://apidatn.onrender.com/plan';

// Lấy danh sách tất cả các kế hoạch với dữ liệu đã populate
export const fetchAllPlans = async () => {
    try {
        const response = await axios.get(`${PLAN_API_URL}/all`);
        if (response.data.status) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Error fetching plans');
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách kế hoạch:', error);
        throw error;
    }
};

// Lấy thông tin chi tiết kế hoạch theo ID
export const fetchPlanById = async (planId) => {
    try {
        const response = await axios.get(`${PLAN_API_URL}/${planId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy kế hoạch có ID ${planId}:`, error);
        throw error;
    }
};

// Tạo kế hoạch mới
export const createPlan = async (planData) => {
    try {
        const response = await axios.post(`${PLAN_API_URL}/create`, planData);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tạo kế hoạch:', error);
        throw error;
    }
};

// Cập nhật kế hoạch
export const updatePlan = async (planId, updatedData) => {
    try {
        const response = await axios.put(`${PLAN_API_URL}/update/${planId}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật kế hoạch có ID ${planId}:`, error);
        throw error;
    }
};

// Xóa kế hoạch
export const deletePlan = async (planId) => {
    try {
        const response = await axios.delete(`${PLAN_API_URL}/delete/${planId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa kế hoạch có ID ${planId}:`, error);
        throw error;
    }
};
