import React, { useEffect, useState } from "react";
import { fetchTransaction } from "../api/transaction_api";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag, faSpinner } from "@fortawesome/free-solid-svg-icons";
import "../public/styles/LatestOrder.css";

const LatestOrder = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  // Hàm ánh xạ trạng thái sang nhãn và kiểu dáng
  const getStatusStyles = (status) => {
    switch (status) {
      case "Đã đặt cọc":
        return { label: "Đã đặt cọc", color: "#4CAF50", bgColor: "#E8F5E9" };
      case "Đang chờ":
        return { label: "Đang chờ", color: "#FFA500", bgColor: "#FFF3E0" };
      case "Đã hủy":
        return { label: "Đã hủy", color: "#F44336", bgColor: "#FFEBEE" };
      default:
        return { label: "Không xác định", color: "#9E9E9E", bgColor: "#F5F5F5" };
    }
  };

  // Hàm lấy dữ liệu đơn hàng
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchTransaction(userId, userRole);
        let transactions = [];
        if (Array.isArray(response)) {
          transactions = response;
        } else if (response?.transactions) {
          transactions = response.transactions;
        } else if (response?.data) {
          transactions = response.data;
        } else {
          throw new Error("Dữ liệu giao dịch không hợp lệ.");
        }
        const sortedData = transactions
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setData(sortedData);
      } catch (error) {
        setError(error.message || "Không lấy được danh sách giao dịch.");
        Swal.fire({
          title: "Lỗi!",
          text: error.message || "Không lấy được danh sách giao dịch.",
          icon: "error",
          position: "center",
          width: "300px",
          timer: 3000,
          toast: true,
          showConfirmButton: false,
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId && userRole) {
      fetchData();
    } else {
      setError("Không tìm thấy thông tin người dùng.");
      setLoading(false);
    }
  }, [userId, userRole]);

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Hàm định dạng giá trị tiền
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  return (
    <div className="latest-orders">
      <div className="card-header">
        <h3>
          <FontAwesomeIcon icon={faShoppingBag} /> Đơn hàng gần đây
        </h3>
      </div>
      <div className="table-responsive">
        {loading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="empty-container">
            <p>Không có đơn hàng nào gần đây.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Khách hàng</th>
                <th>Gói</th>
                <th>Giá trị</th>
                <th>Ngày đặt cọc</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.map((order, index) => {
                const { label, color, bgColor } = getStatusStyles(order.status);
                return (
                  <tr key={order._id || index}>
                    <td>{index + 1}</td>
                    <td data-full-text={order.userId?.name || "N/A"}>
                      {order.userId?.name || "N/A"}
                    </td>
                    <td data-full-text={order.planId || "N/A"}>
                      {order.planId || "N/A"}
                    </td>
                    <td data-full-text={formatCurrency(order.depositAmount)}>
                      {formatCurrency(order.depositAmount)}
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ color, backgroundColor: bgColor }}
                      >
                        {label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LatestOrder;