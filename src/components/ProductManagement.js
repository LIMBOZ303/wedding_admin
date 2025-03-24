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
      const updatedCatering = response.data.data;
      setCateringList(prevList =>
        prevList.map(item => (item._id === id ? updatedCatering : item))
      );
      console.log("Cập nhật dịch vụ thành công:", updatedCatering);
    } catch (error) {
      console.error("Lỗi khi cập nhật dịch vụ catering:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await deleteCatering(id);
      console.log("Xóa dịch vụ thành công:", response.data);
      getCateringData();
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

  // Khi ấn "Chi Tiết", chuyển hướng sang trang chi tiết sản phẩm
  const handleDetail = (id) => {
    navigate(`/catering/${id}`);
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
        />
        <button className="button-filter" onClick={handleFilterByCategory}>Lọc theo danh mục</button>
      </div>
      {loading ? (
        <div className="spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <ul className="product-list">
          {cateringList.map(item => (
            <li key={item._id} className="product-item">
              <h3>{item.name}</h3>
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} />
              )}
              <p>{item.Description || item.description}</p>
              <p>Giá: {item.price}</p>
              <p>
                Danh mục:{" "}
                {item.cate_cateringId && item.cate_cateringId.name
                  ? item.cate_cateringId.name
                  : "Chưa xác định"}
              </p>
              <div className="button-group">
                <button onClick={() => handleUpdate(item._id)} className="button-update">
                  Cập Nhật
                </button>
                <button onClick={() => handleDelete(item._id)} className="button-delete">
                  Xóa
                </button>
                <button onClick={() => handleDetail(item._id)} className="button-detail">
                  Chi Tiết
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductManagement;
