import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  fetchCatering,
  addCatering,
  updateCatering,
  deleteCatering
} from '../api/catering_api';
import {
  fetchDecorate,
  addDecorate,
  updateDecorate,
  deleteDecorate
} from '../api/decorate_api';
import '../public/styles/ProductManagement.css';

const ProductManagement = () => {
  // State cho thanh điều hướng
  const [activeTab, setActiveTab] = useState("DichVu");

  // State quản lý Dịch Vụ (Catering)
  const [cateringList, setCateringList] = useState([]);
  // State quản lý Trang Trí (Decorate)
  const [decorateList, setDecorateList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  // State cho modal chi tiết (cả Catering và Decorate)
  const [selectedItem, setSelectedItem] = useState(null);
  const [editName, setEditName] = useState("");

  // State cho modal thêm mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (activeTab === "DichVu") {
      getCateringData();
    } else if (activeTab === "TrangTri") {
      getDecorateData();
    }
  }, [activeTab]);

  // ===== API cho Dịch Vụ =====
  const getCateringData = async () => {
    setLoading(true);
    try {
      const data = await fetchCatering();
      setCateringList(data.data);
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể lấy danh sách món ăn.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== API cho Trang Trí =====
  const getDecorateData = async () => {
    setLoading(true);
    try {
      const data = await fetchDecorate();
      setDecorateList(data.data);
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể lấy danh sách trang trí.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Lọc danh sách (áp dụng cho cả hai loại)
  const filteredList = () => {
    const list = activeTab === "DichVu" ? cateringList : decorateList;
    return filterText
      ? list.filter(item =>
          item.name.toLowerCase().includes(filterText.toLowerCase())
        )
      : list;
  };

  // Khi nhấn "Chi Tiết", chọn sản phẩm từ danh sách đã có
  const handleShowDetail = (id) => {
    const list = activeTab === "DichVu" ? cateringList : decorateList;
    const item = list.find(item => item._id === id);
    if (item) {
      setSelectedItem({ ...item, type: activeTab });
      setEditName(item.name);
    }
  };

  // Cập nhật tên sản phẩm
  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      const updateFunc = selectedItem.type === "DichVu" ? updateCatering : updateDecorate;
      const res = await updateFunc(selectedItem._id, { name: editName });
      if (res.status) {
        if (selectedItem.type === "DichVu") {
          setCateringList(prev =>
            prev.map(item => (item._id === res.data._id ? res.data : item))
          );
        } else {
          setDecorateList(prev =>
            prev.map(item => (item._id === res.data._id ? res.data : item))
          );
        }
        setSelectedItem(null);
        Swal.fire("Thành công!", "Cập nhật thành công.", "success");
      }
    } catch (error) {
      Swal.fire("Lỗi!", "Cập nhật thất bại.", "error");
    }
  };

  // Xóa sản phẩm
  const handleDelete = async () => {
    if (!selectedItem) return;
    const confirmResult = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    });
    if (confirmResult.isConfirmed) {
      try {
        const deleteFunc = selectedItem.type === "DichVu" ? deleteCatering : deleteDecorate;
        const res = await deleteFunc(selectedItem._id);
        if (res.status) {
          if (selectedItem.type === "DichVu") {
            setCateringList(prev =>
              prev.filter(item => item._id !== selectedItem._id)
            );
          } else {
            setDecorateList(prev =>
              prev.filter(item => item._id !== selectedItem._id)
            );
          }
          setSelectedItem(null);
          Swal.fire("Xóa thành công!", "Sản phẩm đã bị xóa.", "success");
        }
      } catch (error) {
        Swal.fire("Lỗi!", "Xóa thất bại.", "error");
      }
    }
  };

  // Thêm sản phẩm mới
  const handleAdd = async () => {
    if (!newName.trim()) {
      Swal.fire("Lỗi!", "Vui lòng nhập tên!", "warning");
      return;
    }
    try {
      const addFunc = activeTab === "DichVu" ? addCatering : addDecorate;
      const res = await addFunc({ name: newName });
      if (res.status) {
        if (activeTab === "DichVu") {
          setCateringList(prev => [...prev, res.data]);
        } else {
          setDecorateList(prev => [...prev, res.data]);
        }
        setNewName("");
        setShowAddModal(false);
        Swal.fire("Thành công!", "Thêm mới thành công.", "success");
      }
    } catch (error) {
      Swal.fire("Lỗi!", "Thêm thất bại.", "error");
    }
  };

  // Render nội dung theo tab
  const renderContent = () => {
    if (activeTab === "DichVu" || activeTab === "TrangTri") {
      return (
        <>
          <div className="action-buttons">
            <input
              type="text"
              placeholder={`Nhập từ khóa để lọc ${activeTab === "DichVu" ? "món ăn" : "trang trí"}`}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="spinner-container">
              <div className="loading-spinner"></div>
            </div>
          ) : filteredList().length > 0 ? (
            <ul className="product-list">
              {filteredList().map(item => (
                <li key={item._id} className="product-item">
                  <h3 title={item.name}>{item.name}</h3>
                  <div className="button-group">
                    <button 
                      className="button-detail" 
                      onClick={() => handleShowDetail(item._id)}
                    >
                      Chi Tiết
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">
              <p>Không tìm thấy sản phẩm nào.</p>
            </div>
          )}

          {/* Modal Chi Tiết (Cập nhật - Xóa) */}
          {selectedItem && (
            <div className="detail-card">
              <div className="detail-card-content">
                <button 
                  className="detail-card-close" 
                  onClick={() => setSelectedItem(null)}
                >
                  &times;
                </button>
                <h3>Chi Tiết Sản Phẩm</h3>
                <p><strong>ID:</strong> {selectedItem._id}</p>
                <div>
                  <label><strong>Tên:</strong></label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                  />
                </div>
                <div className="detail-card-buttons">
                  <button className="button-update" onClick={handleUpdate}>
                    Cập Nhật
                  </button>
                  <button className="button-delete" onClick={handleDelete}>
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Nút "Thêm Mới" cố định */}
          <button 
            className="button-add" 
            onClick={() => setShowAddModal(true)}
          >
            Thêm Mới
          </button>

          {/* Modal Thêm mới */}
          {showAddModal && (
            <div className="detail-card">
              <div className="detail-card-content">
                <button 
                  className="detail-card-close" 
                  onClick={() => setShowAddModal(false)}
                >
                  &times;
                </button>
                <h3>Thêm Mới</h3>
                <div>
                  <label><strong>Tên:</strong></label>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    placeholder="Nhập tên sản phẩm" 
                  />
                </div>
                <div className="detail-card-buttons">
                  <button className="button-update" onClick={handleAdd}>
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    } else {
      // Các tab khác hiện thông báo placeholder
      let label = "";
      switch (activeTab) {
        case "QuaTang":
          label = "Quà Tặng";
          break;
        case "Order":
          label = "Order";
          break;
        default:
          label = "";
      }
      return (
        <div className="placeholder-section">
          <h3>{label}</h3>
          <p>Chức năng của mục này đang được phát triển.</p>
        </div>
      );
    }
  };

  return (
    <div className="container">
      {/* Thanh điều hướng */}
      <nav className="nav-tabs">
        <ul>
          <li className={activeTab === "DichVu" ? "active" : ""} onClick={() => setActiveTab("DichVu")}>
            Dịch Vụ
          </li>
          <li className={activeTab === "QuaTang" ? "active" : ""} onClick={() => setActiveTab("QuaTang")}>
            Quà Tặng
          </li>
          <li className={activeTab === "TrangTri" ? "active" : ""} onClick={() => setActiveTab("TrangTri")}>
            Trang Trí
          </li>
          <li className={activeTab === "Order" ? "active" : ""} onClick={() => setActiveTab("Order")}>
            Order
          </li>
        </ul>
      </nav>
      
      {renderContent()}
    </div>
  );
};

export default ProductManagement;
