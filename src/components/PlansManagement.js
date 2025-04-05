import React, { useEffect, useState } from "react";
import { fetchAllPlans } from "../api/plan_api";
import Swal from "sweetalert2";
import "../public/styles/PlanManagement.css";

const PlansManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null); // State for zoomed image

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
    setZoomedImage(null); // Reset zoomed image on close
  };

  const handleImageClick = (imageUrl) => {
    setZoomedImage(imageUrl); // Set the zoomed image
  };

  const closeZoomedImage = () => {
    setZoomedImage(null); // Close the zoomed image
  };

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
      <table className="plans-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên kế hoạch</th>
            <th>Sảnh</th>
            <th>Hình ảnh</th>
            <th>Ngày sự kiện</th>
            <th>Số khách</th>
            <th>Tổng giá</th>
            <th>Chênh lệch giá</th>
            <th>Người phụ trách</th>
            <th>Dịch vụ (C/D/P)</th>
            <th>Món ăn</th>
            <th>Quà tặng</th>
            <th>Trang trí</th>
          </tr>
        </thead>
        <tbody>
          {plans.length > 0 ? (
            plans.map((plan) => (
              <tr key={plan._id} onClick={() => handlePlanClick(plan)}>
                <td>{plan._id}</td>
                <td>{plan.name}</td>
                <td>{plan.SanhId ? plan.SanhId.name : "N/A"}</td>
                <td>
                  {plan.SanhId && plan.SanhId.imageUrl ? (
                    <img
                      src={plan.SanhId.imageUrl}
                      alt={plan.SanhId.name}
                      className="sanh-image"
                      onClick={() => handleImageClick(plan.SanhId.imageUrl)} // Click to zoom
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  {plan.plandateevent
                    ? new Date(plan.plandateevent).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "-"}
                </td>
                <td>{plan.plansoluongkhach || "-"}</td>
                <td>
                  {plan.totalPrice
                    ? plan.totalPrice.toLocaleString() + " VND"
                    : "-"}
                </td>
                <td>
                  {plan.priceDifference
                    ? plan.priceDifference.toLocaleString() + " VND"
                    : "-"}
                </td>
                <td>{plan.UserId ? plan.UserId.name : "N/A"}</td>
                <td>
                  {plan.caterings ? plan.caterings.length : 0} /{" "}
                  {plan.decorates ? plan.decorates.length : 0} /{" "}
                  {plan.presents ? plan.presents.length : 0}
                </td>
                <td>
                  {plan.foodItems && plan.foodItems.length > 0
                    ? plan.foodItems.map((item) => (
                        <div key={item.id}>
                          {item.name}
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="item-image"
                              onClick={() => handleImageClick(item.imageUrl)} // Click to zoom
                            />
                          )}
                        </div>
                      ))
                    : "N/A"}
                </td>
                <td>
                  {plan.gifts && plan.gifts.length > 0
                    ? plan.gifts.map((gift) => (
                        <div key={gift.id}>
                          {gift.name}
                          {gift.imageUrl && (
                            <img
                              src={gift.imageUrl}
                              alt={gift.name}
                              className="item-image"
                              onClick={() => handleImageClick(gift.imageUrl)} // Click to zoom
                            />
                          )}
                        </div>
                      ))
                    : "N/A"}
                </td>
                <td>
                  {plan.decorations && plan.decorations.length > 0
                    ? plan.decorations.map((decoration) => (
                        <div key={decoration.id}>
                          {decoration.name}
                          {decoration.imageUrl && (
                            <img
                              src={decoration.imageUrl}
                              alt={decoration.name}
                              className="item-image"
                              onClick={() =>
                                handleImageClick(decoration.imageUrl)
                              } // Click to zoom
                            />
                          )}
                        </div>
                      ))
                    : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="13">Không có dữ liệu</td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedPlan && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <h2>Chi tiết kế hoạch</h2>
            <p>
              <strong>ID:</strong> {selectedPlan._id}
            </p>
            <p>
              <strong>Tên kế hoạch:</strong> {selectedPlan.name}
            </p>
            <p>
              <strong>Sảnh:</strong>{" "}
              {selectedPlan.SanhId ? selectedPlan.SanhId.name : "N/A"}
            </p>
            <p>
              <strong>Hình ảnh:</strong>{" "}
              {selectedPlan.SanhId && selectedPlan.SanhId.imageUrl ? (
                <img
                  src={selectedPlan.SanhId.imageUrl}
                  alt={selectedPlan.SanhId.name}
                  className="sanh-image"
                  onClick={() => handleImageClick(selectedPlan.SanhId.imageUrl)} // Click to zoom
                />
              ) : (
                "N/A"
              )}
            </p>
            <p>
              <strong>Ngày sự kiện:</strong>{" "}
              {new Date(selectedPlan.plandateevent).toLocaleDateString("vi-VN")}
            </p>
            <p>
              <strong>Số khách:</strong> {selectedPlan.plansoluongkhach || "-"}
            </p>
            <p>
              <strong>Tổng giá:</strong>{" "}
              {selectedPlan.totalPrice
                ? selectedPlan.totalPrice.toLocaleString() + " VND"
                : "-"}
            </p>
            <p>
              <strong>Chênh lệch giá:</strong>{" "}
              {selectedPlan.priceDifference
                ? selectedPlan.priceDifference.toLocaleString() + " VND"
                : "-"}
            </p>
            <p>
              <strong>Người phụ trách:</strong>{" "}
              {selectedPlan.UserId ? selectedPlan.UserId.name : "N/A"}
            </p>
            <p>
              <strong>Dịch vụ:</strong>{" "}
              {selectedPlan.caterings ? selectedPlan.caterings.length : 0} /{" "}
              {selectedPlan.decorates ? selectedPlan.decorates.length : 0} /{" "}
              {selectedPlan.presents ? selectedPlan.presents.length : 0}
            </p>
            <p>
              <strong>Món ăn:</strong>{" "}
              {selectedPlan.foodItems && selectedPlan.foodItems.length > 0
                ? selectedPlan.foodItems.map((item) => (
                    <div key={item.id}>
                      {item.name}
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="item-image"
                          onClick={() => handleImageClick(item.imageUrl)} // Click to zoom
                        />
                      )}
                    </div>
                  ))
                : "N/A"}
            </p>
            <p>
              <strong>Quà tặng:</strong>{" "}
              {selectedPlan.gifts && selectedPlan.gifts.length > 0
                ? selectedPlan.gifts.map((gift) => (
                    <div key={gift.id}>
                      {gift.name}
                      {gift.imageUrl && (
                        <img
                          src={gift.imageUrl}
                          alt={gift.name}
                          className="item-image"
                          onClick={() => handleImageClick(gift.imageUrl)} // Click to zoom
                        />
                      )}
                    </div>
                  ))
                : "N/A"}
            </p>
            <p>
              <strong>Trang trí:</strong>{" "}
              {selectedPlan.decorations && selectedPlan.decorations.length > 0
                ? selectedPlan.decorations.map((decoration) => (
                    <div key={decoration.id}>
                      {decoration.name}
                      {decoration.imageUrl && (
                        <img
                          src={decoration.imageUrl}
                          alt={decoration.name}
                          className="item-image"
                          onClick={() => handleImageClick(decoration.imageUrl)} // Click to zoom
                        />
                      )}
                    </div>
                  ))
                : "N/A"}
            </p>
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
