// transaction_api.js
import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/users';
// Lấy danh sách giao dịch với header xác thực
export const fetchTransaction = async (userId, userRole) => {
  const response = await axios.get(`${API_URL}/get/transactions`, {
    headers: {
      'user-id': userId,
      'user-role': userRole,
    },
  });
  return response.data;
};
