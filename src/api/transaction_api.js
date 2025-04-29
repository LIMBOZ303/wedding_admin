import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/transaction';
const USER_API_URL = 'https://apidatn.onrender.com/users';

export const fetchTransaction = async (userId, role) => {
  try {
    const response = await axios.get(`${USER_API_URL}/get/transactions`, {
      headers: {
        'user-id': userId,
        'user-role': role,
      },
    });
    
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Dữ liệu API không hợp lệ');
    }

    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy giao dịch:', error.message);
    throw error;
  }
};

// Thống kê tổng quan
export const fetchTransactionStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/transaction-stats`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thống kê giao dịch:', error);
    throw error;
  }
};

// Thống kê theo trạng thái
export const fetchTransactionStatsByStatus = async (status) => {
  try {
    const response = await axios.get(`${API_URL}/transaction-stats/by-status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thống kê theo trạng thái ${status}:`, error);
    throw error;
  }
};

// Thống kê theo người dùng
export const fetchTransactionStatsByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/transaction-stats/by-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thống kê theo người dùng ${userId}:`, error);
    throw error;
  }
};

// Thống kê doanh thu tổng quan
export const fetchRevenueStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/revenue-stats`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thống kê doanh thu:', error);
    throw error;
  }
};

// Thống kê doanh thu theo năm
export const fetchRevenueByYear = async (year) => {
  try {
    const response = await axios.get(`${API_URL}/revenue-stats/by-year/${year}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy doanh thu năm ${year}:`, error);
    throw error;
  }
};

// Thống kê doanh thu theo quý
export const fetchRevenueByQuarter = async (year, quarter) => {
  try {
    const response = await axios.get(`${API_URL}/revenue-stats/by-quarter/${year}/${quarter}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy doanh thu quý ${quarter} năm ${year}:`, error);
    throw error;
  }
};

// Thống kê doanh thu theo tháng
export const fetchRevenueByMonth = async (year, month) => {
  try {
    const response = await axios.get(`${API_URL}/revenue-stats/by-month/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy doanh thu tháng ${month} năm ${year}:`, error);
    throw error;
  }
};

// Thống kê doanh thu theo tuần
export const fetchRevenueByWeek = async (year, week) => {
  try {
    const response = await axios.get(`${API_URL}/revenue-stats/by-week/${year}/${week}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy doanh thu tuần ${week} năm ${year}:`, error);
    throw error;
  }
};
