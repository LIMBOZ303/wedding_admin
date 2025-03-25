import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/present'; // Adjust the URL to your present API endpoint
const CATEGORY_URL = 'https://apidatn.onrender.com/cate_present'; // URL for gift categories

/**
 * Gift Category APIs
 */

// Fetch all gift categories
export const fetchGiftCategories = async () => {
  try {
    const response = await axios.get(`${CATEGORY_URL}/all`);
    console.log("API Response (fetchGiftCategories):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại quà tặng:", error.response?.data || error.message);
    throw error;
  }
};

// Fetch gift category by ID
export const fetchGiftCategoryById = async (id) => {
  try {
    const response = await axios.get(`${CATEGORY_URL}/${id}`);
    console.log("API Response (fetchGiftCategoryById):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin loại quà tặng:", error.response?.data || error.message);
    throw error;
  }
};

// Add new gift category
export const addGiftCategory = async (categoryData) => {
  try {
    console.log("Adding gift category with data:", JSON.stringify(categoryData, null, 2));
    const response = await axios.post(`${CATEGORY_URL}/add`, categoryData);
    console.log("API Response (addGiftCategory):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm loại quà tặng:", error.response?.data || error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

// Update gift category
export const updateGiftCategory = async (id, categoryData) => {
  try {
    console.log(`Updating gift category with ID: ${id}`, categoryData);
    const response = await axios.put(`${CATEGORY_URL}/update/${id}`, categoryData);
    console.log("API Response (updateGiftCategory):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật loại quà tặng:", error.response?.data || error.message);
    throw error;
  }
};

// Delete gift category
export const deleteGiftCategory = async (id) => {
  try {
    console.log(`Deleting gift category with ID: ${id}`);
    const response = await axios.delete(`${CATEGORY_URL}/delete/${id}`);
    console.log("API Response (deleteGiftCategory):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa loại quà tặng:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gift Product APIs
 */

// Lấy danh sách tất cả quà tặng
export const fetchGifts = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    console.log("API Response (fetchGifts):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách quà tặng:", error.response?.data || error.message);
    throw error;
  }
};

// Lấy thông tin quà tặng theo id
export const fetchGiftById = async (id) => {
  try {
    console.log(`Fetching gift with ID: ${id}`);
    const response = await axios.get(`${API_URL}/${id}`);
    console.log("API Response (fetchGiftById):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin quà tặng:", error.response?.data || error.message);
    console.error("Full error:", error);
    throw error;
  }
};

// Lấy chi tiết quà tặng theo id (endpoint "/:Id")
export const fetchGiftDetail = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    console.log("API Response (fetchGiftDetail):", response.data);
    
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
    console.error("Lỗi khi lấy chi tiết quà tặng:", error.response?.data || error.message);
    throw error;
  }
};

// Fetch gifts by category ID
export const fetchGiftsByCategory = async (categoryId) => {
  try {
    console.log(`Fetching gifts with category ID: ${categoryId}`);
    const response = await axios.get(`${API_URL}/category/${categoryId}`);
    console.log("API Response (fetchGiftsByCategory):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách quà tặng theo loại:", error.response?.data || error.message);
    throw error;
  }
};

// Thêm quà tặng mới
export const addGift = async (giftData) => {
  try {
    console.log("Adding gift with data:", JSON.stringify(giftData, null, 2));
    
    // Ensure price is a number
    if (giftData.price !== undefined) {
      giftData.price = Number(giftData.price);
    }
    
    // Ensure Cate_presentId is a valid ObjectId format or omit it
    if (giftData.Cate_presentId && !/^[0-9a-fA-F]{24}$/.test(giftData.Cate_presentId)) {
      console.warn("Invalid Cate_presentId format:", giftData.Cate_presentId);
      delete giftData.Cate_presentId; // Remove invalid ObjectId
    }
    
    console.log("Formatted data for API:", JSON.stringify(giftData, null, 2));
    const response = await axios.post(`${API_URL}/add`, giftData);
    console.log("API Response (addGift):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm quà tặng:", error.response?.data || error.message);
    console.error("Full error details:", error);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

// Cập nhật quà tặng
export const updateGift = async (id, giftData) => {
  try {
    console.log(`Updating gift with ID: ${id}`, giftData);
    
    // Ensure price is a number
    if (giftData.price !== undefined) {
      giftData.price = Number(giftData.price);
    }
    
    // Ensure Cate_presentId is a valid ObjectId format
    if (giftData.Cate_presentId && !/^[0-9a-fA-F]{24}$/.test(giftData.Cate_presentId)) {
      console.warn("Invalid Cate_presentId format, this may cause API errors:", giftData.Cate_presentId);
    }
    
    const response = await axios.put(`${API_URL}/update/${id}`, giftData);
    console.log("API Response (updateGift):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật quà tặng:", error.response?.data || error.message);
    throw error;
  }
};

// Xóa quà tặng
export const deleteGift = async (id) => {
  try {
    console.log(`Deleting gift with ID: ${id}`);
    const response = await axios.delete(`${API_URL}/delete/${id}`);
    console.log("API Response (deleteGift):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa quà tặng:", error.response?.data || error.message);
    throw error;
  }
};
