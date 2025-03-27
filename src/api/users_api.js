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
