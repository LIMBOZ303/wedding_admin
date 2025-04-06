import React, { useEffect, useState } from "react";
import { fetchAllPlans } from "../api/plan_api";
import Swal from "sweetalert2";
import "../public/styles/PlanManagement.css";

const PlansManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const loadPlans = async () => {
      Swal.fire({
        title: "Đang tải danh sách kế hoạch...",
        position: "center",
        width: "500px",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const data = await fetchAllPlans();
        setPlans(data);
      } catch (err) {
        setError("Không thể tải danh sách kế hoạch.");
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể tải danh sách kế hoạch",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
        });
      } finally {
        setLoading(false);
        Swal.close();
      }
    };

    loadPlans();
  }, []);

  const handlePlanClick = (plan) => {
    setSelectedPlan(plan);
  };

  const closeModal = () => {
    setSelectedPlan(null);
    setZoomedImage(null);
  };

  const handleImageClick = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  const closeZoomedImage = () => {
    setZoomedImage(null);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedPlans = plans
    .filter(plan => 
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.SanhId && plan.SanhId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (plan.UserId && plan.UserId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'SanhId') {
        aValue = a.SanhId?.name || '';
        bValue = b.SanhId?.name || '';
      } else if (sortConfig.key === 'UserId') {
        aValue = a.UserId?.name || '';
        bValue = b.UserId?.name || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="plans-container">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="plans-container">
      <h2>Quản Lý Kế Hoạch</h2>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, sảnh hoặc người phụ trách..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="plans-table">
          <thead>
            <tr>
              <th>STT</th>
              <th onClick={() => handleSort('name')}>Tên kế hoạch {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('SanhId')}>Sảnh {sortConfig.key === 'SanhId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th>Hình ảnh</th>
              <th onClick={() => handleSort('plandateevent')}>Ngày sự kiện {sortConfig.key === 'plandateevent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('plansoluongkhach')}>Số khách {sortConfig.key === 'plansoluongkhach' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('totalPrice')}>Tổng giá {sortConfig.key === 'totalPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('priceDifference')}>Chênh lệch giá {sortConfig.key === 'priceDifference' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('UserId')}>Người phụ trách {sortConfig.key === 'UserId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPlans.length > 0 ? (
              filteredAndSortedPlans.map((plan, index) => (
                <tr key={plan._id} onClick={() => handlePlanClick(plan)}>
                  <td className="row-number">{index + 1}</td>
                  <td>{plan.name}</td>
                  <td>{plan.SanhId ? plan.SanhId.name : "N/A"}</td>
                  <td>
                    {plan.SanhId && plan.SanhId.imageUrl ? (
                      <img
                        src={plan.SanhId.imageUrl}
                        alt={plan.SanhId.name}
                        className="sanh-image"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(plan.SanhId.imageUrl);
                        }}
                      />
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="date-cell">
                    {plan.plandateevent
                      ? new Date(plan.plandateevent).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="number-cell">{plan.plansoluongkhach || "-"}</td>
                  <td className="price-cell">
                    {plan.totalPrice
                      ? plan.totalPrice.toLocaleString() + " VND"
                      : "-"}
                  </td>
                  <td className="price-cell">
                    {plan.priceDifference
                      ? plan.priceDifference.toLocaleString() + " VND"
                      : "-"}
                  </td>
                  <td>{plan.UserId ? plan.UserId.name : "N/A"}</td>
                  <td>
                    <button className="view-details-btn">Xem chi tiết</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedPlan && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <h2>Chi tiết kế hoạch</h2>
            <div className="modal-grid">
              <div className="modal-section">
                <h3>Thông tin cơ bản</h3>
                <p><strong>ID:</strong> {selectedPlan._id}</p>
                <p><strong>Tên kế hoạch:</strong> {selectedPlan.name}</p>
                <p><strong>Sảnh:</strong> {selectedPlan.SanhId ? selectedPlan.SanhId.name : "N/A"}</p>
                <p><strong>Ngày sự kiện:</strong> {new Date(selectedPlan.plandateevent).toLocaleDateString("vi-VN")}</p>
                <p><strong>Số khách:</strong> {selectedPlan.plansoluongkhach || "-"}</p>
              </div>
              <div className="modal-section">
                <h3>Thông tin tài chính</h3>
                <p><strong>Tổng giá:</strong> {selectedPlan.totalPrice ? selectedPlan.totalPrice.toLocaleString() + " VND" : "-"}</p>
                <p><strong>Chênh lệch giá:</strong> {selectedPlan.priceDifference ? selectedPlan.priceDifference.toLocaleString() + " VND" : "-"}</p>
                <p><strong>Người phụ trách:</strong> {selectedPlan.UserId ? selectedPlan.UserId.name : "N/A"}</p>
              </div>
              <div className="modal-section">
                <h3>Dịch vụ</h3>
                <div className="service-summary">
                  <p>
                    <strong>Dịch vụ:</strong> 
                    <span className="service-count">
                      {selectedPlan.caterings ? selectedPlan.caterings.length : 0} /{" "}
                      {selectedPlan.decorates ? selectedPlan.decorates.length : 0} /{" "}
                      {selectedPlan.presents ? selectedPlan.presents.length : 0}
                    </span>
                  </p>
                </div>
                <div className="items-grid">
                  {selectedPlan.foodItems && selectedPlan.foodItems.length > 0 && (
                    <div className="items-section">
                      <h4>Món ăn</h4>
                      {selectedPlan.foodItems.map((item) => (
                        <div key={item.id} className="item-container">
                          <span>{item.name}</span>
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="item-image"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageClick(item.imageUrl);
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedPlan.gifts && selectedPlan.gifts.length > 0 && (
                    <div className="items-section">
                      <h4>Quà tặng</h4>
                      {selectedPlan.gifts.map((gift) => (
                        <div key={gift.id} className="item-container">
                          <span>{gift.name}</span>
                          {gift.imageUrl && (
                            <img
                              src={gift.imageUrl}
                              alt={gift.name}
                              className="item-image"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageClick(gift.imageUrl);
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedPlan.decorations && selectedPlan.decorations.length > 0 && (
                    <div className="items-section">
                      <h4>Trang trí</h4>
                      {selectedPlan.decorations.map((decoration) => (
                        <div key={decoration.id} className="item-container">
                          <span>{decoration.name}</span>
                          {decoration.imageUrl && (
                            <img
                              src={decoration.imageUrl}
                              alt={decoration.name}
                              className="item-image"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageClick(decoration.imageUrl);
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {zoomedImage && (
        <div className="zoomed-modal" onClick={closeZoomedImage}>
          <div className="zoomed-content" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedImage} alt="Zoomed" className="zoomed-image" />
            <span className="close" onClick={closeZoomedImage}>
              &times;
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansManagement;
