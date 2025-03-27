import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/transaction';
const USER_API_URL = 'https://apidatn.onrender.com/users';
export const fetchTransaction = async (userId, userRole) => {
  const response = await axios.get(`${USER_API_URL}/get/transactions`, {
    headers: {
      'user-id': userId,
      'user-role': userRole,
    },
  });
  return response.data;
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
