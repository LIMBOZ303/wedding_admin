import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/catering';
const CATEGORY_URL = 'https://apidatn.onrender.com/cate_catering';

/**
 * Catering Category APIs
 */

// Lấy danh sách loại dịch vụ catering
export const fetchCateringCategories = async () => {
    try {
        const response = await axios.get(`${CATEGORY_URL}/all`);
        console.log("API Response (fetchCateringCategories):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách loại dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};

// Thêm loại dịch vụ catering mới
export const addCateringCategory = async (categoryData) => {
    try {
        console.log("Adding catering category with data:", JSON.stringify(categoryData, null, 2));
        const response = await axios.post(`${CATEGORY_URL}/add`, categoryData);
        console.log("API Response (addCateringCategory):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm loại dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};

// Cập nhật loại dịch vụ catering
export const updateCateringCategory = async (id, categoryData) => {
    try {
        console.log(`Updating catering category with ID: ${id}`, categoryData);
        const response = await axios.put(`${CATEGORY_URL}/update/${id}`, categoryData);
        console.log("API Response (updateCateringCategory):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật loại dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};

// Xóa loại dịch vụ catering
export const deleteCateringCategory = async (id) => {
    try {
        console.log(`Deleting catering category with ID: ${id}`);
        const response = await axios.delete(`${CATEGORY_URL}/delete/${id}`);
        console.log("API Response (deleteCateringCategory):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa loại dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Catering Product APIs
 */

// Lấy danh sách tất cả dịch vụ catering
export const fetchCatering = async () => {
    try {
        const response = await axios.get(`${API_URL}/all`);
        console.log("API Response (fetchCatering):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};

// Lấy dịch vụ catering theo ID (sử dụng endpoint '/getbyid/:id')
export const fetchCateringById = async (id) => {
    try {
        console.log(`Fetching catering with ID: ${id}`);
        const response = await axios.get(`${API_URL}/getbyid/${id}`);
        console.log("API Response (fetchCateringById):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};

// Lấy chi tiết dịch vụ catering theo ID (sử dụng endpoint '/:Id')
export const fetchCateringDetail = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        console.log("API Response (fetchCateringDetail):", response.data);
        
        // Xử lý kết quả từ API, API trả về một mảng (list) thay vì một object
        if (response.data.status && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            // Transform the response to match the structure expected by the component
            const transformedResponse = {
                status: response.data.status,
                message: response.data.message,
                data: response.data.data[0] // Lấy phần tử đầu tiên của mảng
            };
            return transformedResponse;
        }
        
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};

// Lấy danh sách dịch vụ catering theo loại
export const fetchCateringByCategory = async (categoryId) => {
    try {
        console.log(`Fetching caterings with category ID: ${categoryId}`);
        const response = await axios.get(`${API_URL}/caterings/${categoryId}`);
        console.log("API Response (fetchCateringByCategory):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ catering theo loại:", error.response?.data || error.message);
        throw error;
    }
};

// Thêm dịch vụ catering mới
export const addCatering = async (cateringData) => {
    try {
        console.log("Adding catering with data:", JSON.stringify(cateringData, null, 2));
        
        // Ensure price is a number
        if (cateringData.price !== undefined) {
            cateringData.price = Number(cateringData.price);
        }
        
        // Ensure cate_cateringId is a valid ObjectId format or omit it
        if (cateringData.cate_cateringId && !/^[0-9a-fA-F]{24}$/.test(cateringData.cate_cateringId)) {
            console.warn("Invalid cate_cateringId format, omitting field");
            delete cateringData.cate_cateringId;
        }
        
        console.log("Formatted data for API:", JSON.stringify(cateringData, null, 2));
        const response = await axios.post(`${API_URL}/add`, cateringData);
        console.log("API Response (addCatering):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm dịch vụ catering:", error.response?.data || error.message);
        console.error("Full error details:", error);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
};

// Cập nhật dịch vụ catering
export const updateCatering = async (id, cateringData) => {
    try {
        console.log(`Updating catering with ID: ${id}`, cateringData);
        
        // Ensure price is a number
        if (cateringData.price !== undefined) {
            cateringData.price = Number(cateringData.price);
        }
        
        // Ensure cate_cateringId is a valid ObjectId format
        if (cateringData.cate_cateringId && !/^[0-9a-fA-F]{24}$/.test(cateringData.cate_cateringId)) {
            console.warn("Invalid cate_cateringId format, this may cause API errors");
        }
        
        const response = await axios.put(`${API_URL}/update/${id}`, cateringData);
        console.log("API Response (updateCatering):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};

// Xóa dịch vụ catering
export const deleteCatering = async (id) => {
    try {
        console.log(`Deleting catering with ID: ${id}`);
        const response = await axios.delete(`${API_URL}/delete/${id}`);
        console.log("API Response (deleteCatering):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa dịch vụ catering:", error.response?.data || error.message);
        throw error;
    }
};
