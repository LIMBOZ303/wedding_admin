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

    // Nếu có dữ liệu giao dịch, lấy thêm thông tin kế hoạch
    if (response.data.status && Array.isArray(response.data.data)) {
      const transactions = response.data.data;
      
      // Lấy danh sách planId duy nhất
      const uniquePlanIds = [...new Set(transactions.map(tx => tx.planId).filter(Boolean))];
      
      // Lấy thông tin kế hoạch cho từng planId
      const planDetails = await Promise.all(
        uniquePlanIds.map(async (planId) => {
          try {
            const planResponse = await axios.get(`https://apidatn.onrender.com/plan/${planId}`);
            return {
              planId,
              name: planResponse.data?.data?.name || 'Không có tên kế hoạch'
            };
          } catch (error) {
            console.error(`Lỗi khi lấy thông tin kế hoạch ${planId}:`, error);
            return {
              planId,
              name: 'Không có tên kế hoạch'
            };
          }
        })
      );

      // Tạo map từ planId sang tên kế hoạch
      const planNameMap = Object.fromEntries(
        planDetails.map(plan => [plan.planId, plan.name])
      );

      // Thêm tên kế hoạch vào mỗi giao dịch
      const transactionsWithPlanNames = transactions.map(tx => ({
        ...tx,
        planName: tx.planId ? planNameMap[tx.planId] : 'Không có tên kế hoạch'
      }));

      return {
        ...response.data,
        data: transactionsWithPlanNames
      };
    }

    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy giao dịch:', error.message);
    throw error;
  }
};

// thống kê 
const fetchTransactionStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/transaction-stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw error;
  }
};

const fetchTransactionStatsByStatus = async (status) => {
  try {
    const response = await axios.get(`${API_URL}/transaction-stats/by-status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stats for status ${status}:`, error);
    throw error;
  }
};

const fetchTransactionStatsByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/transaction-stats/by-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stats for user ${userId}:`, error);
    throw error;
  }
};

const fetchRevenueStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/revenue-stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    throw error;
  }
};

const fetchRevenueByYear = async (year) => {
  try {
    const response = await axios.get(`${API_URL}/revenue-stats/by-year/${year}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching revenue for year ${year}:`, error);
    throw error;
  }
};

const fetchRevenueByQuarter = async (year, quarter) => {
  try {
    const response = await axios.get(`${API_URL}/revenue-stats/by-quarter/${year}/${quarter}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching revenue for year ${year}, quarter ${quarter}:`, error);
    throw error;
  }
};

const fetchRevenueByMonth = async (year, month) => {
  try {
    const response = await axios.get(`${API_URL}/revenue-stats/by-month/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching revenue for year ${year}, month ${month}:`, error);
    throw error;
  }
};

const fetchRevenueByWeek = async (year, week) => {
  try {
    const response = await axios.get(`${API_URL}/revenue-stats/by-week/${year}/${week}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching revenue for year ${year}, week ${week}:`, error);
    throw error;
  }
};

export {
  fetchTransactionStats,
  fetchTransactionStatsByStatus,
  fetchTransactionStatsByUser,
  fetchRevenueStats,
  fetchRevenueByYear,
  fetchRevenueByQuarter,
  fetchRevenueByMonth,
  fetchRevenueByWeek
};
