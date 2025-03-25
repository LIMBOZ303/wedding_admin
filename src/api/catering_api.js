import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/cate_catering';

// Lấy danh sách tất cả dịch vụ catering
export const fetchCatering = async () => {
    try {
        const response = await axios.get(`${API_URL}/all`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};

// Lấy dịch vụ catering theo ID
export const getCateringById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/getbyid/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy dịch vụ catering theo ID:", error.response?.data || error.message);
        throw error;
    }
};

// Cập nhật dịch vụ catering
export const updateCatering = async (id, cateringData) => {
    try {
        const response = await axios.put(`${API_URL}/update/${id}`, cateringData);
        if (response.data.status) {
            console.log("Cập nhật thành công:", response.data);
            return response.data;
        } else {
            throw new Error(response.data.message || "Cập nhật thất bại!");
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};

// Xóa dịch vụ catering
export const deleteCatering = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};

// Thêm dịch vụ catering
export const addCatering = async (cateringData) => {
    try {
        const response = await axios.post(`${API_URL}/add`, cateringData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};

// Lấy danh sách dịch vụ catering theo danh mục
export const getCateringsByCategory = async (cateringId) => {
    try {
        const response = await axios.get(`${API_URL}/caterings/${cateringId}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ catering theo danh mục:", error.response?.data || error.message);
        throw error;
    }
};
