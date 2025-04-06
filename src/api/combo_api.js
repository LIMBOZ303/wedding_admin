import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/plan';

// Tạo combo mới
export const createCombo = async (comboData) => {
    try {
        // Validate required fields
        if (!comboData.name || !comboData.SanhId) {
            throw new Error('Tên combo và Sảnh là bắt buộc');
        }

        // Convert empty strings to null for optional fields
        const processedData = {
            ...comboData,
            planprice: comboData.planprice || null,
            plansoluongkhach: comboData.plansoluongkhach || null,
            plandateevent: comboData.plandateevent || null,
            cateringId: comboData.cateringId || [],
            decorateId: comboData.decorateId || [],
            presentId: comboData.presentId || []
        };

        console.log('Sending combo data:', processedData);
        const response = await axios.post(`${API_URL}/add`, processedData);
        console.log('Server response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating combo:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể thêm combo');
    }
};

// Lấy tất cả combo
export const getAllCombos = async () => {
    try {
        const response = await axios.get(`${API_URL}/all`);
        return response.data;
    } catch (error) {
        console.error('Error fetching combos:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách combo');
    }
};

// Lấy combo theo ID
export const getComboById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching combo:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể lấy thông tin combo');
    }
};

// Cập nhật combo
export const updateCombo = async (id, comboData) => {
    try {
        const response = await axios.put(`${API_URL}/update/${id}`, comboData);
        return response.data;
    } catch (error) {
        console.error('Error updating combo:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật combo');
    }
};

// Xóa combo
export const deleteCombo = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting combo:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể xóa combo');
    }
};

// Xóa dịch vụ trong combo
export const deleteServiceFromCombo = async (planId, serviceType, serviceId) => {
    try {
        const response = await axios.delete(`${API_URL}/${planId}?serviceType=${serviceType}&serviceId=${serviceId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting service from combo:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể xóa dịch vụ khỏi combo');
    }
};

// Lấy danh sách combo theo UserId
export const getCombosByUserId = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user combos:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách combo của người dùng');
    }
};

// Tìm kiếm combo theo ngân sách và số lượng khách
export const searchCombos = async (budget, guests) => {
    try {
        const response = await axios.post(`${API_URL}/search`, { budget, guests });
        return response.data;
    } catch (error) {
        console.error('Error searching combos:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tìm kiếm combo');
    }
};

// Khảo sát combo theo ngân sách, số lượng khách và ngày tổ chức
export const surveyCombos = async (planprice, plansoluongkhach, plandateevent) => {
    try {
        const response = await axios.post(`${API_URL}/khaosat`, {
            planprice,
            plansoluongkhach,
            plandateevent
        });
        return response.data;
    } catch (error) {
        console.error('Error surveying combos:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể khảo sát combo');
    }
};