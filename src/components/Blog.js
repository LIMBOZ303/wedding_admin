import React, { useState, useEffect, useCallback } from 'react';
import { fetchAdminBlogs, addBlog, updateBlog, deleteBlog, fetchPublicBlogs } from '../api/blog_api';
import '../public/styles/Blog.css';

// Admin user id (ensure this exists and has admin role in your database)
const adminUserId = '67debaa7772f617ebcb70d2f';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [currentBlog, setCurrentBlog] = useState({
        _id: '',
        title: '',
        content: '',
        summary: '',
        category: '',
        coverImage: '',
        tags: [],
        isPublished: false
    });

    // Fetch blog data
    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchAdminBlogs(adminUserId);
            if (response.status) {
                setBlogs(response.data);
            } else {
                setError(response.message || 'Failed to fetch blogs');
                showNotification(response.message || 'Failed to fetch blogs', true);
            }
        } catch (err) {
            console.error('Error fetching blogs:', err);
            setError('Network error, please try again later');
            showNotification('Network error, please try again later', true);
        } finally {
            setLoading(false);
        }
    }, []);

    // Show notification
    const showNotification = (message, isError = false) => {
        setNotification({ message, isError });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    // Handle form submission for adding a new blog
    const handleAddBlog = async (event) => {
        event.preventDefault();
        
        const form = event.target;
        const title = form.title.value;
        const content = form.content.value;
        const summary = form.summary.value;
        const category = form.category.value;
        const coverImage = form.coverImage.value;
        const tags = form.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag);

        try {
            const response = await addBlog({ title, content, summary, category, coverImage, tags }, adminUserId);
            if (response.status) {
                showNotification('Blog post added successfully');
                form.reset();
                fetchBlogs();
            } else {
                showNotification(response.message || 'Failed to add blog post', true);
            }
        } catch (err) {
            console.error('Error adding blog:', err);
            showNotification('Network error, please try again later', true);
        }
    };

    // Open update form modal
    const openUpdateForm = (blog) => {
        setCurrentBlog({
            _id: blog._id,
            title: blog.title,
            content: blog.content,
            summary: blog.summary,
            category: blog.category,
            coverImage: blog.coverImage,
            tags: blog.tags || [],
            isPublished: blog.isPublished
        });
        setShowUpdateForm(true);
    };

    // Close update form modal
    const closeUpdateForm = () => {
        setShowUpdateForm(false);
    };

    // Handle form submission for updating a blog
    const handleUpdateBlog = async (event) => {
        event.preventDefault();
        
        const form = event.target;
        const blogId = currentBlog._id;
        const title = form['update-title'].value;
        const content = form['update-content'].value;
        const summary = form['update-summary'].value;
        const category = form['update-category'].value;
        const coverImage = form['update-coverImage'].value;
        const tags = form['update-tags'].value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const isPublished = form['update-isPublished'].value === 'true';

        try {
            const response = await updateBlog(
                blogId, 
                { title, content, summary, category, coverImage, tags, isPublished }, 
                adminUserId
            );
            
            if (response.status) {
                showNotification('Blog post updated successfully');
                closeUpdateForm();
                fetchBlogs();
            } else {
                showNotification(response.message || 'Failed to update blog post', true);
            }
        } catch (err) {
            console.error('Error updating blog:', err);
            showNotification('Network error, please try again later', true);
        }
    };

    // Handle blog deletion
    const handleDeleteBlog = async (blogId) => {
        if (window.confirm('Are you sure you want to delete this blog post?')) {
            try {
                const response = await deleteBlog(blogId, adminUserId);
                if (response.status) {
                    showNotification('Blog post deleted successfully');
                    fetchBlogs();
                } else {
                    showNotification(response.message || 'Failed to delete blog post', true);
                }
            } catch (err) {
                console.error('Error deleting blog:', err);
                showNotification('Network error, please try again later', true);
            }
        }
    };

    // Get category name from value
    const getCategoryName = (categoryValue) => {
        const categories = {
            'wedding-dress': 'Váy cưới',
            'wedding-rings': 'Nhẫn cưới',
            'wedding-trends': 'Xu hướng',
            'wedding-venues': 'Địa điểm tổ chức',
            'wedding-decoration': 'Trang trí',
            'other': 'Khác'
        };
        return categories[categoryValue] || categoryValue;
    };

    // Escape quotes for HTML attributes
    const escapeQuotes = (str) => {
        if (!str) return '';
        return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
    };

    // Load blogs on component mount
    useEffect(() => {
        fetchBlogs();
        
        // Add Font Awesome and Google Fonts
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);
        
        const googleFontsLink = document.createElement('link');
        googleFontsLink.rel = 'stylesheet';
        googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap';
        document.head.appendChild(googleFontsLink);
        
        return () => {
            document.head.removeChild(fontAwesomeLink);
            document.head.removeChild(googleFontsLink);
        };
    }, [fetchBlogs]);

    return (
        <div className="blog-container">
            {/* Notification */}
            {notification && (
                <div className={`notification ${notification.isError ? 'notification-error' : 'notification-success'}`}>
                    <div className="notification-content">
                        <i className={`fas ${notification.isError ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}
            
            {/* Admin Header */}
            <h1><i className="fas fa-heart"></i> Admin - Quản lý Blog Tiệc Cưới</h1>
            
            {/* Add Blog Form */}
            <div className="card">
                <div className="card-header">
                    <h2><i className="fas fa-pen-to-square"></i> Thêm bài viết mới</h2>
                </div>
                <form id="add-blog-form" onSubmit={handleAddBlog}>
                    <div className="form-group">
                        <label htmlFor="title">Tiêu đề:</label>
                        <input 
                            type="text" 
                            id="title" 
                            name="title"
                            required 
                            title="Nhập tiêu đề bài viết" 
                            placeholder="Nhập tiêu đề bài viết" 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Nội dung (HTML):</label>
                        <textarea 
                            id="content" 
                            name="content"
                            rows="5" 
                            required 
                            title="Nhập nội dung bài viết" 
                            placeholder="Nhập nội dung bài viết"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="summary">Tóm tắt:</label>
                        <textarea 
                            id="summary" 
                            name="summary"
                            rows="3" 
                            required 
                            title="Nhập tóm tắt bài viết" 
                            placeholder="Nhập tóm tắt bài viết"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Danh mục:</label>
                        <select id="category" name="category" required title="Chọn danh mục bài viết">
                            <option value="">Chọn danh mục</option>
                            <option value="wedding-dress">Váy cưới</option>
                            <option value="wedding-rings">Nhẫn cưới</option>
                            <option value="wedding-trends">Xu hướng</option>
                            <option value="wedding-venues">Địa điểm tổ chức</option>
                            <option value="wedding-decoration">Trang trí</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="coverImage">Ảnh bìa (URL):</label>
                        <input 
                            type="text" 
                            id="coverImage" 
                            name="coverImage"
                            required 
                            placeholder="http://..." 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tags">Tags (phân cách bằng dấu phẩy):</label>
                        <input 
                            type="text" 
                            id="tags" 
                            name="tags"
                            title="Nhập tags, phân cách bằng dấu phẩy" 
                            placeholder="Ví dụ: cưới, váy, nhẫn" 
                        />
                    </div>

                    <button type="submit" className="btn-primary">
                        <i className="fas fa-plus btn-icon"></i>Thêm bài viết
                    </button>
                </form>
            </div>
            
            {/* Blog List */}
            <div className="card">
                <div className="card-header">
                    <h2><i className="fas fa-list"></i> Danh sách bài viết</h2>
                </div>
                <div className="table-responsive">
                    <table id="blog-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tiêu đề</th>
                                <th>Tóm tắt</th>
                                <th>Danh mục</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                        <i className="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "var(--danger-color)" }}>
                                        <i className="fas fa-triangle-exclamation"></i> {error}
                                    </td>
                                </tr>
                            ) : blogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                        <i className="fas fa-info-circle"></i> Chưa có bài viết nào
                                    </td>
                                </tr>
                            ) : (
                                blogs.map(blog => (
                                    <tr key={blog._id}>
                                        <td title={blog._id}>{blog._id.substring(0, 6)}...</td>
                                        <td className="truncate" title={blog.title}>{blog.title}</td>
                                        <td className="truncate" title={blog.summary}>{blog.summary}</td>
                                        <td>
                                            <span className="category-badge">{getCategoryName(blog.category)}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${blog.isPublished ? 'badge-success' : 'badge-warning'}`}>
                                                {blog.isPublished ? (
                                                    <><i className="fas fa-check-circle"></i> Công khai</>
                                                ) : (
                                                    <><i className="fas fa-clock"></i> Chưa công khai</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="action-buttons">
                                            <button 
                                                className="btn-secondary" 
                                                title="Sửa bài viết"
                                                onClick={() => openUpdateForm(blog)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                className="btn-danger" 
                                                title="Xóa bài viết"
                                                onClick={() => handleDeleteBlog(blog._id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Update Form Modal */}
            {showUpdateForm && (
                <div 
                    id="update-form-container" 
                    style={{ display: 'block' }}
                    onClick={(e) => {
                        if (e.target.id === 'update-form-container') {
                            closeUpdateForm();
                        }
                    }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2><i className="fas fa-edit"></i> Cập nhật bài viết</h2>
                            <button type="button" className="btn-outlined" onClick={closeUpdateForm}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="update-blog-form" onSubmit={handleUpdateBlog}>
                            <input type="hidden" id="update-blog-id" value={currentBlog._id} />
                            
                            <div className="form-group">
                                <label htmlFor="update-title">Tiêu đề:</label>
                                <input 
                                    type="text" 
                                    id="update-title" 
                                    name="update-title"
                                    required 
                                    defaultValue={currentBlog.title}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="update-content">Nội dung (HTML):</label>
                                <textarea 
                                    id="update-content" 
                                    name="update-content"
                                    rows="5" 
                                    required
                                    defaultValue={currentBlog.content}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label htmlFor="update-summary">Tóm tắt:</label>
                                <textarea 
                                    id="update-summary" 
                                    name="update-summary"
                                    rows="3" 
                                    required
                                    defaultValue={currentBlog.summary}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label htmlFor="update-category">Danh mục:</label>
                                <select 
                                    id="update-category" 
                                    name="update-category"
                                    required
                                    defaultValue={currentBlog.category}
                                >
                                    <option value="">Chọn danh mục</option>
                                    <option value="wedding-dress">Váy cưới</option>
                                    <option value="wedding-rings">Nhẫn cưới</option>
                                    <option value="wedding-trends">Xu hướng</option>
                                    <option value="wedding-venues">Địa điểm tổ chức</option>
                                    <option value="wedding-decoration">Trang trí</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="update-coverImage">Ảnh bìa (URL):</label>
                                <input 
                                    type="text" 
                                    id="update-coverImage" 
                                    name="update-coverImage"
                                    required 
                                    placeholder="http://..." 
                                    defaultValue={currentBlog.coverImage}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="update-tags">Tags (phân cách bằng dấu phẩy):</label>
                                <input 
                                    type="text" 
                                    id="update-tags" 
                                    name="update-tags"
                                    defaultValue={currentBlog.tags.join(', ')}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="update-isPublished">Đăng công khai:</label>
                                <select 
                                    id="update-isPublished" 
                                    name="update-isPublished"
                                    defaultValue={currentBlog.isPublished.toString()}
                                >
                                    <option value="false">Không</option>
                                    <option value="true">Có</option>
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-outlined" onClick={closeUpdateForm}>Hủy</button>
                                <button type="submit" className="btn-primary">
                                    <i className="fas fa-save btn-icon"></i>Cập nhật bài viết
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Blog;