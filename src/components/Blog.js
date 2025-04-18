import React, { useState, useEffect, useCallback } from "react";
import {
  fetchAdminBlogs,
  addBlog,
  updateBlog,
  fetchPublicBlogs,
} from "../api/blog_api";
import "../public/styles/Blog.css";
import Editor from "./Editor";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from './LoadingSpinner';

// Admin user id (ensure this exists and has admin role in your database)
const adminUserId = "67debaa7772f617ebcb70d2f";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [currentBlog, setCurrentBlog] = useState({
    _id: "",
    title: "",
    content: "",
    summary: "",
    category: "",
    coverImage: "",
    tags: [],
    isPublished: false,
  });
  const [editorContent, setEditorContent] = useState("");
  const [updateEditorContent, setUpdateEditorContent] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  // Fetch blog data
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchAdminBlogs(adminUserId);
      if (response.status) {
        setBlogs(response.data);
      } else {
        setError(response.message || "Failed to fetch blogs");
        showNotification(response.message || "Failed to fetch blogs", true);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Network error, please try again later");
      showNotification("Network error, please try again later", true);
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
    const content = editorContent;
    const summary = form.summary.value;
    const category = form.category.value;
    const tags = form.tags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    // Kiểm tra dữ liệu trước khi gửi
    if (!title.trim()) {
      showNotification("Tiêu đề không được để trống", true);
      return;
    }

    if (!content.trim()) {
      showNotification("Nội dung không được để trống", true);
      return;
    }

    if (!category) {
      showNotification("Danh mục không được để trống", true);
      return;
    }

    // Xử lý file ảnh
    const coverImageFile = form.coverImage.files[0];
    if (!coverImageFile) {
      showNotification("Ảnh bìa không được để trống", true);
      return;
    }

    // Kiểm tra kích thước nội dung (nếu quá lớn có thể gây lỗi)
    if (content.length > 500000) { // ~500KB
      showNotification("Nội dung quá lớn. Vui lòng giảm kích thước hình ảnh hoặc số lượng hình ảnh.", true);
      return;
    }

    // Chuyển đổi file thành base64
    const reader = new FileReader();
    reader.readAsDataURL(coverImageFile);
    
    reader.onload = async () => {
      const coverImageBase64 = reader.result;

      // Kiểm tra kích thước ảnh (ví dụ: giới hạn 1MB)
      if (coverImageBase64.length > 1048576) {
        showNotification("Ảnh bìa quá lớn. Vui lòng chọn ảnh nhỏ hơn 1MB.", true);
        return;
      }

      try {
        showNotification("Đang xử lý...", false);

        // Chuẩn bị dữ liệu đầy đủ cho API
        const blogData = {
          title,
          content,
          summary,
          category,
          coverImage: coverImageBase64,
          tags: tags.length > 0 ? tags : ["wedding"], // Đảm bảo có ít nhất 1 tag
          author: adminUserId, 
          userId: adminUserId,
          authorName: "Admin", // Thêm tên tác giả
          id_user: adminUserId, // Một số API sử dụng id_user thay vì userId
          user_id: adminUserId, // Một số API sử dụng user_id
          authorId: adminUserId, // Một số API sử dụng authorId
          isPublished: true,
          status: "published", // Một số API sử dụng status thay vì isPublished
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        console.log("Sending blog data:", {...blogData, contentLength: content.length});
        
        const response = await addBlog(
          blogData,
          adminUserId
        );
        
        if (response.status) {
          showNotification("Thêm bài viết thành công");
          form.reset();
          setEditorContent("");
          fetchBlogs();
        } else {
          // Log lỗi cụ thể từ response để debug
          console.error("API Error:", response);
          showNotification(response.message || "Lỗi khi thêm bài viết", true);
        }
      } catch (err) {
        console.error("Error adding blog:", err);
        showNotification("Lỗi kết nối mạng, vui lòng thử lại sau", true);
      }
    };

    reader.onerror = () => {
      showNotification("Lỗi khi đọc file ảnh", true);
    };
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
      isPublished: blog.isPublished,
    });
    setUpdateEditorContent(blog.content);
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
    const title = form["update-title"].value;
    const content = updateEditorContent;
    const summary = form["update-summary"].value;
    const category = form["update-category"].value;
    const tags = form["update-tags"].value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    const isPublished = form["update-isPublished"].value === "true";

    // Kiểm tra dữ liệu trước khi gửi
    if (!title.trim()) {
      showNotification("Tiêu đề không được để trống", true);
      return;
    }

    if (!content.trim()) {
      showNotification("Nội dung không được để trống", true);
      return;
    }

    if (!category) {
      showNotification("Danh mục không được để trống", true);
      return;
    }

    // Kiểm tra kích thước nội dung (nếu quá lớn có thể gây lỗi)
    if (content.length > 500000) { // ~500KB
      showNotification("Nội dung quá lớn. Vui lòng giảm kích thước hình ảnh hoặc số lượng hình ảnh.", true);
      return;
    }

    // Xử lý file ảnh nếu có
    let coverImageBase64 = currentBlog.coverImage; // Giữ nguyên ảnh cũ nếu không upload ảnh mới
    const coverImageFile = form["update-coverImage"].files[0];

    // Hàm helper để xử lý logic cập nhật
    const updateBlogLogic = async (coverImageToUse) => {
      try {
        showNotification("Đang cập nhật...", false);

        // Chuẩn bị dữ liệu đầy đủ cho API
        const blogData = {
          _id: blogId, // Đảm bảo ID được gửi trong body
          title,
          content,
          summary,
          category,
          coverImage: coverImageToUse,
          tags: tags.length > 0 ? tags : ["wedding"], // Đảm bảo có ít nhất 1 tag
          author: adminUserId,
          userId: adminUserId,
          authorName: "Admin", // Thêm tên tác giả
          id_user: adminUserId, // Một số API sử dụng id_user thay vì userId
          user_id: adminUserId, // Một số API sử dụng user_id
          authorId: adminUserId, // Một số API sử dụng authorId
          isPublished,
          status: isPublished ? "published" : "draft", // Một số API sử dụng status thay vì isPublished
          publishedAt: isPublished ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        };

        console.log("Updating blog data:", {...blogData, id: blogId, contentLength: content.length});
        
        const response = await updateBlog(
          blogId,
          blogData,
          adminUserId
        );

        if (response.status) {
          showNotification("Cập nhật bài viết thành công");
          closeUpdateForm();
          fetchBlogs();
        } else {
          // Log lỗi cụ thể từ response để debug
          console.error("API Error:", response);
          showNotification(
            response.message || "Lỗi khi cập nhật bài viết",
            true
          );
        }
      } catch (err) {
        console.error("Error updating blog:", err);
        showNotification("Lỗi kết nối mạng, vui lòng thử lại sau", true);
      }
    };

    if (coverImageFile) {
      // Chuyển đổi file thành base64
      const reader = new FileReader();
      reader.readAsDataURL(coverImageFile);
      
      reader.onload = async () => {
        const newCoverImageBase64 = reader.result;

        // Kiểm tra kích thước ảnh (ví dụ: giới hạn 1MB)
        if (newCoverImageBase64.length > 1048576) {
          showNotification("Ảnh bìa quá lớn. Vui lòng chọn ảnh nhỏ hơn 1MB.", true);
          return;
        }

        await updateBlogLogic(newCoverImageBase64);
      };

      reader.onerror = () => {
        showNotification("Lỗi khi đọc file ảnh", true);
      };
    } else {
      // Không có ảnh mới, dùng ảnh cũ
      await updateBlogLogic(coverImageBase64);
    }
  };

  // Get category name from value
  const getCategoryName = (categoryValue) => {
    const categories = {
      "wedding-dress": "Váy cưới",
      "wedding-rings": "Nhẫn cưới",
      "wedding-trends": "Xu hướng",
      "wedding-venues": "Địa điểm tổ chức",
      "wedding-decoration": "Trang trí",
      other: "Khác",
    };
    return categories[categoryValue] || categoryValue;
  };

  // Escape quotes for HTML attributes
  const escapeQuotes = (str) => {
    if (!str) return "";
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
  };

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Load blogs on component mount
  useEffect(() => {
    fetchBlogs();

    // Add Font Awesome and Google Fonts
    const fontAwesomeLink = document.createElement("link");
    fontAwesomeLink.rel = "stylesheet";
    fontAwesomeLink.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    document.head.appendChild(fontAwesomeLink);

    const googleFontsLink = document.createElement("link");
    googleFontsLink.rel = "stylesheet";
    googleFontsLink.href =
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap";
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
        <div
          className={`notification ${
            notification.isError ? "notification-error" : "notification-success"
          }`}
        >
          <div className="notification-content">
            <i
              className={`fas ${
                notification.isError
                  ? "fa-circle-exclamation"
                  : "fa-circle-check"
              }`}
            ></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <h1>
        <i className="fas fa-heart"></i> Admin - Quản lý Blog Tiệc Cưới
      </h1>

      {/* Add Blog Form */}
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="fas fa-pen-to-square"></i> Thêm bài viết mới
          </h2>
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
            <label htmlFor="summary">Tóm tắt:</label>
            <textarea
              id="summary"
              name="summary"
              rows="3"
              placeholder="Nhập tóm tắt nội dung bài viết"
              title="Tóm tắt ngắn gọn nội dung bài viết"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="content">Nội dung:</label>
            <Editor value={editorContent} onChange={setEditorContent} />
          </div>

          <div className="form-group">
            <label htmlFor="category">Danh mục:</label>
            <select
              id="category"
              name="category"
              required
              title="Chọn danh mục bài viết"
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
            <label htmlFor="coverImage">Ảnh bìa (URL):</label>
            <input
              type="file"
              id="coverImage"
              name="coverImage"
              required
              accept="image/*"
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
          <h2>
            <i className="fas fa-list"></i> Danh sách bài viết
          </h2>
          <div className="view-toggle">
            <button 
              className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`} 
              onClick={() => setViewMode('list')}
              title="Xem dạng danh sách"
            >
              <i className="fas fa-list"></i>
            </button>
            <button 
              className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`} 
              onClick={() => setViewMode('grid')}
              title="Xem dạng lưới"
            >
              <i className="fas fa-th"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="large" text="Đang tải dữ liệu..." />
        ) : error ? (
          <div className="error-container">
            <i className="fas fa-triangle-exclamation"></i> {error}
          </div>
        ) : blogs.length === 0 ? (
          <div className="empty-container">
            <i className="fas fa-info-circle"></i> Chưa có bài viết nào
          </div>
        ) : viewMode === 'list' ? (
          <div className="table-responsive">
            <table id="blog-table">
              <thead>
                <tr>
                  <th className="th-thumbnail">Ảnh bìa</th>
                  <th className="th-title">Tiêu đề</th>
                  <th className="th-category">Danh mục</th>
                  <th className="th-status">Trạng thái</th>
                  <th className="th-date">Cập nhật lần cuối</th>
                  <th className="th-actions">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id}>
                    <td className="thumbnail-cell">
                      <div className="blog-thumbnail">
                        <img 
                          src={blog.coverImage || "https://via.placeholder.com/100x60?text=No+Image"} 
                          alt={blog.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/100x60?text=Error";
                          }}
                        />
                      </div>
                    </td>
                    <td className="title-cell truncate" title={blog.title}>
                      {blog.title}
                    </td>
                    <td className="category-cell">
                      <span className="category-badge">
                        {getCategoryName(blog.category)}
                      </span>
                    </td>
                    <td className="status-cell">
                      <span
                        className={`status-badge ${
                          blog.isPublished ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {blog.isPublished ? (
                          <>
                            <i className="fas fa-check-circle"></i> Công khai
                          </>
                        ) : (
                          <>
                            <i className="fas fa-clock"></i> Chưa công khai
                          </>
                        )}
                      </span>
                    </td>
                    <td className="date-cell">
                      <span className="date-info">
                        <i className="fas fa-calendar-alt"></i> {formatDate(blog.updatedAt)}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button
                        className="btn-secondary"
                        title="Sửa bài viết"
                        onClick={() => openUpdateForm(blog)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="blog-grid">
            {blogs.map((blog) => (
              <div className="blog-card" key={blog._id}>
                <div className="blog-card-image">
                  <img 
                    src={blog.coverImage || "https://via.placeholder.com/300x180?text=No+Image"} 
                    alt={blog.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x180?text=Error";
                    }}
                  />
                </div>
                <div className="blog-card-content">
                  <h3 className="truncate" title={blog.title}>{blog.title}</h3>
                  <div className="blog-card-meta">
                    <span className="category-badge">
                      {getCategoryName(blog.category)}
                    </span>
                    <span
                      className={`status-badge ${
                        blog.isPublished ? "badge-success" : "badge-warning"
                      }`}
                    >
                      {blog.isPublished ? (
                        <>
                          <i className="fas fa-check-circle"></i> Công khai
                        </>
                      ) : (
                        <>
                          <i className="fas fa-clock"></i> Chưa công khai
                        </>
                      )}
                    </span>
                  </div>
                  <p className="blog-card-summary truncate-2">{blog.summary}</p>
                  <div className="blog-card-footer">
                    <span className="date-info">
                      <i className="fas fa-calendar-alt"></i> {formatDate(blog.updatedAt)}
                    </span>
                    <button
                      className="btn-secondary"
                      title="Sửa bài viết"
                      onClick={() => openUpdateForm(blog)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Form Modal */}
      {showUpdateForm && (
        <div
          id="update-form-container"
          style={{ display: "block" }}
          onClick={(e) => {
            if (e.target.id === "update-form-container") {
              closeUpdateForm();
            }
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                <i className="fas fa-edit"></i> Cập nhật bài viết
              </h2>
              <button
                type="button"
                className="btn-outlined"
                onClick={closeUpdateForm}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form id="update-blog-form" onSubmit={handleUpdateBlog}>
              <input
                type="hidden"
                id="update-blog-id"
                value={currentBlog._id}
              />

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
                <label htmlFor="update-summary">Tóm tắt:</label>
                <textarea
                  id="update-summary"
                  name="update-summary"
                  rows="3"
                  placeholder="Nhập tóm tắt nội dung bài viết"
                  title="Tóm tắt ngắn gọn nội dung bài viết"
                  defaultValue={currentBlog.summary}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="update-content">Nội dung:</label>
                <Editor 
                  value={currentBlog.content} 
                  onChange={setUpdateEditorContent} 
                />
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
                <label htmlFor="update-coverImage">Ảnh bìa:</label>
                <div className="current-image-preview">
                  <img 
                    src={currentBlog.coverImage || "https://via.placeholder.com/300x180?text=No+Image"} 
                    alt="Preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x180?text=Error";
                    }}
                  />
                  <p>Ảnh hiện tại</p>
                </div>
                <input
                  type="file"
                  id="update-coverImage"
                  name="update-coverImage"
                  accept="image/*"
                />
                <p className="help-text">Để trống nếu muốn giữ ảnh hiện tại</p>
              </div>

              <div className="form-group">
                <label htmlFor="update-tags">
                  Tags (phân cách bằng dấu phẩy):
                </label>
                <input
                  type="text"
                  id="update-tags"
                  name="update-tags"
                  defaultValue={currentBlog.tags.join(", ")}
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
                <button
                  type="button"
                  className="btn-outlined"
                  onClick={closeUpdateForm}
                >
                  Hủy
                </button>
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
