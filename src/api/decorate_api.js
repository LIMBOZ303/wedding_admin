import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/cate_decorate';

// Lấy danh sách tất cả danh mục trang trí
export const fetchDecorate = async () => {
    try {
        const response = await axios.get(`${API_URL}/all`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục trang trí:", error.response?.data || error.message);
        throw error;
    }
};

// Thêm danh mục trang trí
export const addDecorate = async (decorateData) => {
    try {
        const response = await axios.post(`${API_URL}/add`, decorateData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm danh mục trang trí:", error.response?.data || error.message);
        throw error;
    }
};

// Cập nhật danh mục trang trí
export const updateDecorate = async (id, decorateData) => {
    try {
        const response = await axios.put(`${API_URL}/update/${id}`, decorateData);
        if (response.data.status) {
            console.log("Cập nhật thành công:", response.data);
            return response.data;
        } else {
            throw new Error(response.data.message || "Cập nhật thất bại!");
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật danh mục trang trí:", error.response?.data || error.message);
        throw error;
    }
};

// Xóa danh mục trang trí
export const deleteDecorate = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa danh mục trang trí:", error.response?.data || error.message);
        throw error;
    }
};
