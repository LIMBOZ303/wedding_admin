import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/users';

export const fetchAccounts = async () => {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
};
//login api
export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
};

export const deleteAccount = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};

// Lấy thông tin người dùng theo ID
export const getUserById = async (userId) => {
    try {
        console.log(`🔍 Đang gọi API lấy thông tin cho user ID: ${userId}`);
        const response = await axios.get(`${API_URL}/${userId}`);
        console.log('📦 Dữ liệu API trả về:', JSON.stringify(response.data, null, 2));
        
        // Phân tích cấu trúc dữ liệu
        console.log('Kiểm tra cấu trúc dữ liệu nhận được:');
        console.log('- Có trường success:', response.data?.success ? 'Có' : 'Không');
        console.log('- Có trường data:', response.data?.data ? 'Có' : 'Không');
        console.log('- Các trường khác:', Object.keys(response.data || {}).join(', '));
        
        // Thêm kiểm tra cấu trúc dữ liệu
        if (response.data && response.data.success) {
            console.log('✅ Trả về dữ liệu theo cấu trúc success/data');
            return response.data;
        } else if (response.data && response.data.data) {
            // Trường hợp API trả về dữ liệu nhưng không có trường success
            console.log('✅ Trả về dữ liệu theo cấu trúc data');
            return {
                success: true,
                data: response.data.data
            };
        } else if (response.data) {
            // Trường hợp API trả về dữ liệu người dùng trực tiếp
            console.log('✅ Trả về dữ liệu trực tiếp:', response.data);
            return {
                success: true,
                data: response.data
            };
        }
        
        console.log('❌ Không tìm thấy định dạng dữ liệu phù hợp');
        return null;
    } catch (error) {
        console.error('❌ Lỗi khi lấy thông tin người dùng:', error);
        return null;
    }
};   

// Lấy thông tin trạng thái hoạt động của người dùng
export const getUserStatus = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/status/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy trạng thái người dùng:', error);
        throw error;
    }
};

// Đánh dấu người dùng là online
export const setUserOnline = async (userId) => {
    try {
        const response = await axios.patch(`${API_URL}/status/online/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi đánh dấu người dùng là online:', error);
        throw error;
    }
};

// Đánh dấu người dùng là offline
export const setUserOffline = async (userId) => {
    try {
        const response = await axios.patch(`${API_URL}/status/offline/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi đánh dấu người dùng là offline:', error);
        throw error;
    }
};

// Cập nhật thời gian hoạt động của người dùng
export const updateUserActivity = async (userId) => {
    try {
        const response = await axios.patch(`${API_URL}/status/active/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật thời gian hoạt động:', error);
        throw error;
    }
};

// Lấy danh sách người dùng đang online
export const getOnlineUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/online/all`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng online:', error);
        throw error;
    }
};   
