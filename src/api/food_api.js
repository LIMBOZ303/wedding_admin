import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/catering';

// Lấy danh sách món ăn
export const fetchFood = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    console.log("API Response (fetchFood):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách món ăn:", error.response?.data || error.message);
    throw error;
  }
};

// Lấy thông tin món ăn theo id (sử dụng endpoint /getbyid/:id)
export const fetchFoodById = async (id) => {
  try {
    console.log(`Fetching food with ID: ${id}`);
    const response = await axios.get(`${API_URL}/getbyid/${id}`);
    console.log("API Response (fetchFoodById):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin món ăn:", error.response?.data || error.message);
    console.error("Full error:", error);
    throw error;
  }
};

// Lấy chi tiết món ăn theo id (sử dụng endpoint "/:Id")
export const fetchFoodDetail = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    console.log("API Response (fetchFoodDetail):", response.data);
    
    // Xử lý kết quả từ API, lưu ý API trả về một mảng (list) thay vì một object
    if (response.data.status && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      // Transform the response to match the structure expected by the component
      // Take the first item from the array and use it as the data
      const transformedResponse = {
        status: response.data.status,
        message: response.data.message,
        data: response.data.data[0] // Lấy phần tử đầu tiên của mảng
      };
      return transformedResponse;
    }
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết món ăn:", error.response?.data || error.message);
    throw error;
  }
};

// Thêm món ăn mới (thực tế là gọi API thêm dịch vụ catering)
export const addFood = async (foodData) => {
  try {
    console.log("Adding food with data:", JSON.stringify(foodData, null, 2));
    // Ensure price is a number
    if (foodData.price !== undefined) {
      foodData.price = Number(foodData.price);
    }
    
    // Ensure cate_cateringId is a valid ObjectId format or null
    if (foodData.cate_cateringId && !/^[0-9a-fA-F]{24}$/.test(foodData.cate_cateringId)) {
      delete foodData.cate_cateringId; // Remove invalid ObjectId
    }
    
    console.log("Formatted data for API:", JSON.stringify(foodData, null, 2));
    const response = await axios.post(`${API_URL}/add`, foodData);
    console.log("API Response (addFood):", response.data);
    
    // Customize success message to refer to food instead of catering
    if (response.data.status && response.data.message && response.data.message.includes("catering")) {
      const customResponse = {
        ...response.data,
        message: response.data.message.replace("dịch vụ catering", "món ăn")
      };
      return customResponse;
    }
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm món ăn:", error.response?.data || error.message);
    console.error("Full error details:", error);
    
    // Customize error message to refer to food instead of catering
    if (error.response && error.response.data && error.response.data.message) {
      if (error.response.data.message.includes("catering")) {
        error.response.data.message = error.response.data.message.replace("dịch vụ catering", "món ăn");
      }
    }
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Modified Data:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

// Cập nhật món ăn
export const updateFood = async (id, foodData) => {
  try {
    console.log(`Updating food with ID: ${id}`, foodData);
    const response = await axios.put(`${API_URL}/update/${id}`, foodData);
    console.log("API Response (updateFood):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật món ăn:", error.response?.data || error.message);
    throw error;
  }
};

// Xóa món ăn
export const deleteFood = async (id) => {
  try {
    console.log(`Deleting food with ID: ${id}`);
    const response = await axios.delete(`${API_URL}/delete/${id}`);
    console.log("API Response (deleteFood):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa món ăn:", error.response?.data || error.message);
    throw error;
  }
};
