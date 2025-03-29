import axios from 'axios';

const API_URL = 'https://apidatn.onrender.com/lobby';

// Lấy danh sách tất cả phòng
export const fetchLobbies = async () => {
    try {
        const response = await axios.get(`${API_URL}/all`);
        console.log("API Response (fetchLobbies):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách phòng:", error.response?.data || error.message);
        throw error;
    }
};

// Lấy thông tin phòng theo ID
export const fetchLobbyById = async (id) => {
    try {
        console.log(`Fetching lobby with ID: ${id}`);
        const response = await axios.get(`${API_URL}/${id}`);
        console.log("API Response (fetchLobbyById):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin phòng:", error.response?.data || error.message);
        throw error;
    }
};

// Thêm phòng mới
export const addLobby = async (lobbyData) => {
    try {
        console.log("Adding lobby with data:", JSON.stringify(lobbyData, null, 2));
        
        // Ensure price is a number
        if (lobbyData.price !== undefined) {
            lobbyData.price = Number(lobbyData.price);
        }
        
        // Ensure SoLuongKhach is a number
        if (lobbyData.SoLuongKhach !== undefined) {
            lobbyData.SoLuongKhach = Number(lobbyData.SoLuongKhach);
        }
        
        console.log("Formatted data for API:", JSON.stringify(lobbyData, null, 2));
        const response = await axios.post(`${API_URL}/add`, lobbyData);
        console.log("API Response (addLobby):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm phòng:", error.response?.data || error.message);
        console.error("Full error details:", error);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
};

// Cập nhật phòng
export const updateLobby = async (id, lobbyData) => {
    try {
        console.log(`Updating lobby with ID: ${id}`, lobbyData);
        
        // Ensure price is a number
        if (lobbyData.price !== undefined) {
            lobbyData.price = Number(lobbyData.price);
        }
        
        // Ensure SoLuongKhach is a number
        if (lobbyData.SoLuongKhach !== undefined) {
            lobbyData.SoLuongKhach = Number(lobbyData.SoLuongKhach);
        }
        
        const response = await axios.put(`${API_URL}/update/${id}`, lobbyData);
        console.log("API Response (updateLobby):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật phòng:", error.response?.data || error.message);
        throw error;
    }
};

// Xóa phòng
export const deleteLobby = async (id) => {
    try {
        console.log(`Deleting lobby with ID: ${id}`);
        const response = await axios.delete(`${API_URL}/delete/${id}`);
        console.log("API Response (deleteLobby):", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa phòng:", error.response?.data || error.message);
        throw error;
    }
}; 