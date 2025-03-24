import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/';
// Lấy danh sách món ăn
export const fetchAccounts = async () => {
    const response = await axios.get(`${API_URL}/catering/all`);
    return response.data;
};
