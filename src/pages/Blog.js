import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { notification } from 'antd';
import { addBlog, updateBlog, getBlogById } from '../api/blog_api';
import { AppContext } from '../AppContext';
import Editor from '../components/Editor';

const Blog = () => {
    const [loading, setLoading] = useState(false);
    const [editorState, setEditorState] = useState({
        title: '',
        content: '',
        summary: '',
        category: '',
        coverImage: '',
        tags: []
    });
    const { blogId } = useParams();
    const [currentBlog, setCurrentBlog] = useState(null);
    const navigate = useNavigate();
    const { user } = useContext(AppContext);

    useEffect(() => {
        if (blogId) {
            fetchBlogDetails();
        }
    }, [blogId]);

    const fetchBlogDetails = async () => {
        if (!blogId) return;
        
        setLoading(true);
        try {
            const response = await getBlogById(blogId);
            if (response.status === false) {
                notification.error({
                    message: 'Failed to fetch blog',
                    description: response.message || 'An error occurred'
                });
                return;
            }
            
            const blog = response.data;
            setCurrentBlog(blog);
            setEditorState({
                title: blog.title || '',
                content: blog.content || '',
                summary: blog.summary || '',
                category: blog.category || '',
                coverImage: blog.coverImage || '',
                tags: blog.tags || []
            });
        } catch (error) {
            console.error('Error fetching blog:', error);
            notification.error({
                message: 'Failed to fetch blog',
                description: 'An error occurred while fetching blog details'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditorChange = (value) => {
        setEditorState(prev => ({
            ...prev,
            content: value
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditorState(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTagsChange = (e) => {
        const tagsValue = e.target.value;
        const tagsArray = tagsValue.split(',').map(tag => tag.trim()).filter(Boolean);
        setEditorState(prev => ({
            ...prev,
            tags: tagsArray
        }));
    };

    const resetEditor = () => {
        setEditorState({
            title: '',
            content: '',
            summary: '',
            category: '',
            coverImage: '',
            tags: []
        });
    };

    const handleAddBlog = async () => {
        if (!editorState.title) {
            notification.warning({
                message: 'Please enter blog title!',
            });
            return;
        }

        if (!editorState.category) {
            notification.warning({
                message: 'Please select a blog category!',
            });
            return;
        }

        const content = editorState.content;
        const coverImage = editorState.coverImage || '';
        const tags = editorState.tags && editorState.tags.length > 0 ? editorState.tags : ['General'];

        // Đảm bảo có adminId từ thông tin đăng nhập
        const adminUserId = user?._id || localStorage.getItem('userId');
        console.log('User context:', user);
        console.log('User ID from localStorage:', localStorage.getItem('userId'));
        
        if (!adminUserId) {
            notification.error({
                message: 'User authentication issue',
                description: 'Please log in again to continue',
            });
            return;
        }

        const blogData = {
            title: editorState.title,
            content: content,
            summary: editorState.summary || '',
            coverImage: coverImage,
            category: editorState.category,
            tags: tags,
            authorName: user?.name || 'Admin',
            id_user: adminUserId,
            user_id: adminUserId,
            authorId: adminUserId,
            status: 'published',
            isPublished: true,
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setLoading(true);
        try {
            const response = await addBlog(blogData, adminUserId);
            
            console.log('API Response:', response);
            
            if (response.status === false) {
                notification.error({
                    message: 'Failed to add blog',
                    description: response.message || 'An error occurred',
                });
                return;
            }
            
            notification.success({
                message: 'Blog added successfully!',
            });
            resetEditor();
            navigate('/admin/blogs');
        } catch (error) {
            console.error('Error adding blog:', error);
            const errorMessage = error?.response?.data?.message || error.message || 'An error occurred';
            notification.error({
                message: 'Failed to add blog',
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBlog = async () => {
        if (!editorState.title) {
            notification.warning({
                message: 'Please enter blog title!',
            });
            return;
        }

        if (!editorState.category) {
            notification.warning({
                message: 'Please select a blog category!',
            });
            return;
        }

        // Đảm bảo có adminId từ thông tin đăng nhập
        const adminUserId = user?._id || localStorage.getItem('userId');
        console.log('User context (update):', user);
        console.log('User ID from localStorage (update):', localStorage.getItem('userId'));
        
        if (!adminUserId) {
            notification.error({
                message: 'User authentication issue',
                description: 'Please log in again to continue',
            });
            return;
        }

        const content = editorState.content;
        const coverImage = editorState.coverImage || '';
        const tags = editorState.tags && editorState.tags.length > 0 ? editorState.tags : ['General'];

        const blogData = {
            _id: blogId,
            title: editorState.title,
            content: content,
            summary: editorState.summary || currentBlog?.summary || '',
            coverImage: coverImage,
            category: editorState.category,
            tags: tags,
            authorName: user?.name || currentBlog.authorName || 'Admin',
            id_user: adminUserId,
            user_id: adminUserId,
            authorId: adminUserId,
            status: 'published',
            isPublished: true,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setLoading(true);
        try {
            const response = await updateBlog(blogId, blogData, adminUserId);
            
            console.log('API Update Response:', response);
            
            if (response.status === false) {
                notification.error({
                    message: 'Failed to update blog',
                    description: response.message || 'An error occurred',
                });
                return;
            }
            
            notification.success({
                message: 'Blog updated successfully!',
            });
            navigate('/admin/blogs');
        } catch (error) {
            console.error('Error updating blog:', error);
            const errorMessage = error?.response?.data?.message || error.message || 'An error occurred';
            notification.error({
                message: 'Failed to update blog',
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="blog-admin-container">
            <div className="header">
                <h1>{blogId ? 'Cập nhật bài viết' : 'Thêm bài viết mới'}</h1>
            </div>
            
            <div className="blog-form-card">
                <form onSubmit={blogId ? handleUpdateBlog : handleAddBlog}>
                    <div className="form-group">
                        <label htmlFor="title">Tiêu đề:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={editorState.title}
                            onChange={handleInputChange}
                            placeholder="Nhập tiêu đề bài viết"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="summary">Tóm tắt:</label>
                        <textarea
                            id="summary"
                            name="summary"
                            rows="3"
                            value={editorState.summary}
                            onChange={handleInputChange}
                            placeholder="Nhập tóm tắt nội dung (hiển thị ở trang danh sách)"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="category">Danh mục:</label>
                        <select 
                            id="category" 
                            name="category"
                            value={editorState.category}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">-- Chọn danh mục --</option>
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
                            value={editorState.coverImage}
                            onChange={handleInputChange}
                            placeholder="Nhập URL ảnh bìa"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="tags">Tags (phân cách bằng dấu phẩy):</label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={editorState.tags.join(', ')}
                            onChange={handleTagsChange}
                            placeholder="wedding, decor, ..."
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="content">Nội dung:</label>
                        <Editor 
                            value={editorState.content} 
                            onChange={handleEditorChange}
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="btn-cancel"
                            onClick={() => navigate('/admin/blogs')}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : blogId ? 'Cập nhật' : 'Thêm bài viết'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Blog; 