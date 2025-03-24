import axios from 'axios';

const BASE_API_URL = 'https://apidatn.onrender.com/blog';

// Fetch all blogs for admin view
export const fetchAdminBlogs = async (adminUserId, page = 1, limit = 100) => {
    try {
        const response = await axios.get(`${BASE_API_URL}/admin/all?page=${page}&limit=${limit}`, {
            headers: { userid: adminUserId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching admin blogs:', error);
        throw error;
    }
};

// Add a new blog post
export const addBlog = async (blogData, adminUserId) => {
    try {
        const response = await axios.post(`${BASE_API_URL}/add`, blogData, {
            headers: {
                'Content-Type': 'application/json',
                userid: adminUserId
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding blog:', error);
        throw error;
    }
};

// Update an existing blog post
export const updateBlog = async (blogId, blogData, adminUserId) => {
    try {
        const response = await axios.put(`${BASE_API_URL}/update/${blogId}`, blogData, {
            headers: {
                'Content-Type': 'application/json',
                userid: adminUserId
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating blog:', error);
        throw error;
    }
};

// Delete a blog post
export const deleteBlog = async (blogId, adminUserId) => {
    try {
        const response = await axios.delete(`${BASE_API_URL}/delete/${blogId}`, {
            headers: { userid: adminUserId }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting blog:', error);
        throw error;
    }
};

// Fetch public blogs (for the front-end display)
export const fetchPublicBlogs = async (page = 1, limit = 10) => {
    try {
        const response = await axios.get(`${BASE_API_URL}/all?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching public blogs:', error);
        throw error;
    }
};

// Get a single blog by ID
export const getBlogById = async (blogId) => {
    try {
        const response = await axios.get(`${BASE_API_URL}/${blogId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching blog by ID:', error);
        throw error;
    }
};
