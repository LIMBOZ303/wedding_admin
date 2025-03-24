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
