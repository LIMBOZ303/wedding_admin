import React, { useState, useEffect } from 'react';
import {
  fetchCatering,
  updateCatering,
  deleteCatering,
  getCateringsByCategory
} from '../api/catering_api';
import { useNavigate } from 'react-router-dom';
import '../public/styles/ProductManagement.css';

const ProductManagement = () => {
  const [cateringList, setCateringList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getCateringData();
  }, []);

  const getCateringData = async () => {
    setLoading(true);
    try {
      const data = await fetchCatering();
      setCateringList(data.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách catering:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm cập nhật dịch vụ catering (dữ liệu mẫu)
  const handleUpdate = async (id) => {
    // Dữ liệu cập nhật có thể thay đổi theo yêu cầu của bạn (đang sử dụng dữ liệu mẫu)
    const updatedData = {
      name: "Tên cập nhật",
      price: 100,
      cate_cateringId: "cate123",
      Description: "Mô tả cập nhật",
      imageUrl: "http://example.com/image.jpg"
    };

    setLoading(true);
    try {
      const response = await updateCatering(id, updatedData);
      // Cập nhật lại danh sách sau khi cập nhật thành công
      setCateringList(prevList =>
        prevList.map(item => (item._id === id ? response.data.data : item))
      );
      console.log("Cập nhật dịch vụ thành công:", response.data.data);
    } catch (error) {
      console.error("Lỗi khi cập nhật dịch vụ catering:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await deleteCatering(id);
      console.log("Xóa dịch vụ thành công:", response.data);
      // Cập nhật lại danh sách sau khi xóa
      setCateringList(prevList => prevList.filter(item => item._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa dịch vụ catering:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lọc dịch vụ theo danh mục
  const handleFilterByCategory = async () => {
    if (!filterCategory) {
      getCateringData();
      return;
    }
    setLoading(true);
    try {
      const response = await getCateringsByCategory(filterCategory);
      setCateringList(response.data);
    } catch (error) {
      console.error("Lỗi khi lọc dịch vụ catering theo danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = (id) => {
    navigate(`/catering/${id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFilterByCategory();
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="container">
      <h2>Quản Lý Sản Phẩm</h2>
      <div className="action-buttons">
        <input
          type="text"
          placeholder="Nhập ID danh mục để lọc"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="button-filter" onClick={handleFilterByCategory}>
          Lọc theo danh mục
        </button>
      </div>
      {loading ? (
        <div className="spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : cateringList.length > 0 ? (
        <ul className="product-list">
          {cateringList.map(item => (
            <li key={item._id} className="product-item">
              <h3 title={item.name}>{item.name}</h3>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=Không+có+hình';
                  }}
                />
              )}
              <p>{item.Description || item.description || "Chưa có mô tả"}</p>
              <p><strong>Giá:</strong> {formatPrice(item.price)}</p>
              <p>
                <strong>Danh mục:</strong>{" "}
                {item.cate_cateringId && item.cate_cateringId.name
                  ? item.cate_cateringId.name
                  : "Chưa xác định"}
              </p>
              <div className="button-group">
                <button onClick={() => handleDetail(item._id)} className="button-detail">
                  Chi Tiết
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-results">
          <p>Không tìm thấy sản phẩm nào. Vui lòng thử lại với bộ lọc khác.</p>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
