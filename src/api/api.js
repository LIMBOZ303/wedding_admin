import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/users';

export const fetchAccounts = async () => {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
};

export const deleteAccount = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};   
