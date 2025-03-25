import axios from 'axios';

// API URLs
const CATEGORY_API_URL = 'https://apidatn.onrender.com/cate_decorate'; // Category API
const PRODUCT_API_URL = 'https://apidatn.onrender.com/decorate'; // Product API for decoration items

// ===== CATEGORY ENDPOINTS =====

// Lấy danh sách tất cả danh mục trang trí
export const fetchDecorateCategories = async () => {
    try {
        const response = await axios.get(`${CATEGORY_API_URL}/all`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục trang trí:", error.response?.data || error.message);
        throw error;
    }
};

// Thêm danh mục trang trí
export const addDecorateCategory = async (categoryData) => {
    try {
        const response = await axios.post(`${CATEGORY_API_URL}/add`, categoryData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm danh mục trang trí:", error.response?.data || error.message);
        throw error;
    }
};

// Cập nhật danh mục trang trí
export const updateDecorateCategory = async (id, categoryData) => {
    try {
        const response = await axios.put(`${CATEGORY_API_URL}/update/${id}`, categoryData);
        if (response.data.status) {
            console.log("Cập nhật danh mục thành công:", response.data);
            return response.data;
        } else {
            throw new Error(response.data.message || "Cập nhật danh mục thất bại!");
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật danh mục trang trí:", error.response?.data || error.message);
        throw error;
    }
};

// Xóa danh mục trang trí
export const deleteDecorateCategory = async (id) => {
    try {
        const response = await axios.delete(`${CATEGORY_API_URL}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa danh mục trang trí:", error.response?.data || error.message);
        throw error;
    }
};

// ===== PRODUCT ENDPOINTS =====

// Lấy danh sách tất cả sản phẩm trang trí
export const fetchDecorate = async () => {
    try {
        const response = await axios.get(`${PRODUCT_API_URL}/all`);
        console.log("API Response (fetchDecorate):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm trang trí:", error.response?.data || error.message);
        throw error;
    }
};

// Lấy thông tin sản phẩm trang trí theo id
export const fetchDecorateById = async (id) => {
    try {
        console.log(`Fetching decoration with ID: ${id}`);
        const response = await axios.get(`${PRODUCT_API_URL}/${id}`);
        console.log("API Response (fetchDecorateById):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm trang trí:", error.response?.data || error.message);
        console.error("Full error:", error);
        throw error;
    }
};

// Lấy chi tiết sản phẩm trang trí theo id
export const fetchDecorateDetail = async (id) => {
    try {
        const response = await axios.get(`${PRODUCT_API_URL}/${id}`);
        console.log("API Response (fetchDecorateDetail):", response.data);
        
        // Xử lý kết quả từ API, nếu trả về một mảng thì lấy phần tử đầu tiên
        if (response.data.status && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            const transformedResponse = {
                status: response.data.status,
                message: response.data.message,
                data: response.data.data[0]
            };
            return transformedResponse;
        }
        
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm trang trí:", error.response?.data || error.message);
        throw error;
    }
};

// Lấy danh sách sản phẩm trang trí theo danh mục
export const fetchDecoratesByCategory = async (categoryId) => {
    try {
        const response = await axios.get(`${PRODUCT_API_URL}/decorates/${categoryId}`);
        console.log(`API Response (fetchDecoratesByCategory - ${categoryId}):`, response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm trang trí theo danh mục:", error.response?.data || error.message);
        throw error;
    }
};

// Thêm sản phẩm trang trí mới
export const addDecorate = async (decorateData) => {
    try {
        console.log("Adding decoration with data:", JSON.stringify(decorateData, null, 2));
        
        // Ensure price is a number
        if (decorateData.price !== undefined) {
            decorateData.price = Number(decorateData.price);
        }
        
        // Ensure Cate_decorateId is a valid ObjectId format or omit it
        if (decorateData.Cate_decorateId && !/^[0-9a-fA-F]{24}$/.test(decorateData.Cate_decorateId)) {
            console.warn("Invalid Cate_decorateId format, omitting field");
            delete decorateData.Cate_decorateId;
        }
        
        console.log("Formatted data for API:", JSON.stringify(decorateData, null, 2));
        const response = await axios.post(`${PRODUCT_API_URL}/add`, decorateData);
        console.log("API Response (addDecorate):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm trang trí:", error.response?.data || error.message);
        console.error("Full error details:", error);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
};

// Cập nhật sản phẩm trang trí
export const updateDecorate = async (id, decorateData) => {
    try {
        console.log(`Updating decoration with ID: ${id}`, decorateData);
        
        // Ensure price is a number
        if (decorateData.price !== undefined) {
            decorateData.price = Number(decorateData.price);
        }
        
        // Ensure Cate_decorateId is a valid ObjectId format
        if (decorateData.Cate_decorateId && !/^[0-9a-fA-F]{24}$/.test(decorateData.Cate_decorateId)) {
            console.warn("Invalid Cate_decorateId format, this may cause issues");
        }
        
        const response = await axios.put(`${PRODUCT_API_URL}/update/${id}`, decorateData);
        console.log("API Response (updateDecorate):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm trang trí:", error.response?.data || error.message);
        throw error;
    }
};

// Xóa sản phẩm trang trí
export const deleteDecorate = async (id) => {
    try {
        console.log(`Deleting decoration with ID: ${id}`);
        const response = await axios.delete(`${PRODUCT_API_URL}/delete/${id}`);
        console.log("API Response (deleteDecorate):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm trang trí:", error.response?.data || error.message);
        throw error;
    }
};
