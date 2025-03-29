import axios from 'axios';

const BASE_API_URL = 'https://apidatn.onrender.com/blog';

// Cấu hình axios với timeout dài hơn cho các yêu cầu có dữ liệu lớn
const blogAxios = axios.create({
  baseURL: BASE_API_URL,
  timeout: 30000, // 30 giây
  headers: {
    'Content-Type': 'application/json'
  }
});

// Xử lý lỗi chung
const handleApiError = (error, operation) => {
  let errorMessage = '';

  if (error.response) {
    // Server trả về lỗi với status code khác 2xx
    console.error(`${operation} error - Server response:`, error.response.data);
    console.error(`Status code: ${error.response.status}`);
    
    // Xử lý các trường hợp lỗi cụ thể
    if (error.response.status === 400) {
      if (error.response.data && error.response.data.message) {
        if (typeof error.response.data.message === 'string' && error.response.data.message.includes('required')) {
          errorMessage = `Thiếu thông tin bắt buộc: ${error.response.data.message}`;
        } else if (Array.isArray(error.response.data.message)) {
          // Xử lý lỗi validation từ class-validator (nếu API sử dụng)
          errorMessage = `Lỗi dữ liệu: ${error.response.data.message.join(', ')}`;
        } else {
          errorMessage = `Lỗi: ${error.response.data.message}`;
        }
      } else if (error.response.data && error.response.data.error) {
        errorMessage = `Lỗi: ${error.response.data.error}`;
      } else {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các thông tin';
      }
    } else if (error.response.status === 401) {
      errorMessage = 'Không có quyền truy cập. Vui lòng đăng nhập lại';
    } else if (error.response.status === 404) {
      errorMessage = 'Không tìm thấy dữ liệu yêu cầu';
    } else if (error.response.status === 500) {
      errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
    } else {
      errorMessage = `Lỗi server: ${error.response.data.message || error.response.statusText || 'Lỗi không xác định'}`;
    }
    
    return { 
      status: false, 
      message: errorMessage,
      code: error.response.status,
      details: error.response.data
    };
  } else if (error.request) {
    // Request được gửi nhưng không nhận được response
    console.error(`${operation} error - No response:`, error.request);
    return { 
      status: false, 
      message: 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.',
      code: 'NETWORK_ERROR'
    };
  } else {
    // Lỗi trong quá trình thiết lập request
    console.error(`${operation} error:`, error.message);
    return { 
      status: false, 
      message: `Lỗi: ${error.message}`,
      code: 'REQUEST_ERROR'
    };
  }
};

// Fetch all blogs for admin view
export const fetchAdminBlogs = async (adminUserId, page = 1, limit = 100) => {
    try {
        const response = await blogAxios.get(`/admin/all?page=${page}&limit=${limit}`, {
            headers: { userid: adminUserId }
        });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetchAdminBlogs');
    }
};

// Add a new blog post
export const addBlog = async (blogData, adminUserId) => {
    try {
        // Kiểm tra dữ liệu trước khi gửi
        if (!blogData.title || !blogData.content) {
            return { status: false, message: 'Tiêu đề và nội dung không được để trống' };
        }

        if (!adminUserId) {
            return { status: false, message: 'Thiếu thông tin người dùng (adminUserId)' };
        }
        
        // Đảm bảo có summary
        if (!blogData.summary) {
            console.log('Tóm tắt đang trống, sẽ tạo tóm tắt tự động từ nội dung');
            // Tạo tóm tắt tự động từ nội dung
            let summary = blogData.content
                .replace(/<[^>]*>/g, ' ') // Xóa tất cả thẻ HTML
                .replace(/\s+/g, ' ')     // Chuẩn hóa khoảng trắng
                .trim()
                .substring(0, 200);        // Lấy 200 ký tự đầu tiên
                
            if (summary.length >= 200) {
                summary += '...';          // Thêm dấu ... nếu nội dung dài
            }
            
            blogData.summary = summary;
        }
        
        // Thêm các trường bắt buộc nếu chưa có
        const completeData = {
            ...blogData,
            userId: blogData.userId || adminUserId,
            id_user: blogData.id_user || adminUserId,
            user_id: blogData.user_id || adminUserId,
            author: blogData.author || adminUserId,
            authorId: blogData.authorId || adminUserId,
            authorName: blogData.authorName || "Admin",
            createdAt: blogData.createdAt || new Date().toISOString(),
            updatedAt: blogData.updatedAt || new Date().toISOString(),
            isPublished: typeof blogData.isPublished === 'boolean' ? blogData.isPublished : true,
            status: blogData.status || "published"
        };
        
        console.log('Sending blog data to API:', { 
            title: completeData.title, 
            summaryLength: completeData.summary?.length || 0,
            contentLength: completeData.content.length,
            hasImages: completeData.content.includes('data:image'),
            userId: completeData.userId,
            id_user: completeData.id_user,
            author: completeData.author,
            fields: Object.keys(completeData)
        });
        
        // Sử dụng URLSearchParams để gửi dữ liệu dưới dạng form-data nếu cần
        const config = {
            headers: { 
                userid: adminUserId,
                'Content-Type': 'application/json'
            }
        };
        
        const response = await blogAxios.post(`/add`, completeData, config);
        
        return response.data;
    } catch (error) {
        console.error('Complete error object:', error);
        return handleApiError(error, 'addBlog');
    }
};

// Update an existing blog post
export const updateBlog = async (blogId, blogData, adminUserId) => {
    try {
        // Kiểm tra dữ liệu trước khi gửi
        if (!blogId) {
            return { status: false, message: 'ID bài viết không được để trống' };
        }

        if (!adminUserId) {
            return { status: false, message: 'Thiếu thông tin người dùng (adminUserId)' };
        }
        
        // Đảm bảo có summary
        if (!blogData.summary) {
            console.log('Tóm tắt đang trống, sẽ tạo tóm tắt tự động từ nội dung');
            // Tạo tóm tắt tự động từ nội dung
            let summary = blogData.content
                .replace(/<[^>]*>/g, ' ') // Xóa tất cả thẻ HTML
                .replace(/\s+/g, ' ')     // Chuẩn hóa khoảng trắng
                .trim()
                .substring(0, 200);        // Lấy 200 ký tự đầu tiên
                
            if (summary.length >= 200) {
                summary += '...';          // Thêm dấu ... nếu nội dung dài
            }
            
            blogData.summary = summary;
        }
        
        // Thêm các trường bắt buộc nếu chưa có
        const completeData = {
            ...blogData,
            _id: blogId, // Đảm bảo ID được gửi trong body
            userId: blogData.userId || adminUserId,
            id_user: blogData.id_user || adminUserId,
            user_id: blogData.user_id || adminUserId,
            author: blogData.author || adminUserId,
            authorId: blogData.authorId || adminUserId,
            authorName: blogData.authorName || "Admin",
            updatedAt: blogData.updatedAt || new Date().toISOString(),
            status: blogData.status || (blogData.isPublished ? "published" : "draft")
        };
        
        console.log('Updating blog data for API:', { 
            id: blogId,
            title: completeData.title, 
            summaryLength: completeData.summary?.length || 0,
            contentLength: completeData.content ? completeData.content.length : 'unchanged',
            hasImages: completeData.content ? completeData.content.includes('data:image') : false,
            userId: completeData.userId,
            id_user: completeData.id_user,
            author: completeData.author,
            fields: Object.keys(completeData)
        });
        
        // Sử dụng URLSearchParams để gửi dữ liệu dưới dạng form-data nếu cần
        const config = {
            headers: { 
                userid: adminUserId,
                'Content-Type': 'application/json'
            }
        };
        
        const response = await blogAxios.put(`/update/${blogId}`, completeData, config);
        
        return response.data;
    } catch (error) {
        console.error('Complete error object:', error);
        return handleApiError(error, 'updateBlog');
    }
};

// Delete a blog post
export const deleteBlog = async (blogId, adminUserId) => {
    try {
        if (!blogId) {
            return { status: false, message: 'ID bài viết không được để trống' };
        }
        
        const response = await blogAxios.delete(`/delete/${blogId}`, {
            headers: { userid: adminUserId }
        });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'deleteBlog');
    }
};

// Fetch public blogs (for the front-end display)
export const fetchPublicBlogs = async (page = 1, limit = 10) => {
    try {
        const response = await blogAxios.get(`/all?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetchPublicBlogs');
    }
};

// Get a single blog by ID
export const getBlogById = async (blogId) => {
    try {
        if (!blogId) {
            return { status: false, message: 'ID bài viết không được để trống' };
        }
        
        const response = await blogAxios.get(`/${blogId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'getBlogById');
    }
};
