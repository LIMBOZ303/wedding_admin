import React, { useEffect, useState } from "react";
import { fetchTransaction } from "../api/transaction_api";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import { faExclamationTriangle, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

const LatestOrder = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="status-badge status-active">
            <FontAwesomeIcon icon={faCheckCircle} /> Đã xác nhận
          </span>
        );
      case "pending":
        return (
          <span className="status-badge status-pending">
            <FontAwesomeIcon icon={faExclamationTriangle} /> Chờ xác nhận
          </span>
        );
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchTransaction(userId, userRole);
      // Sắp xếp dữ liệu theo ngày tạo mới nhất
      const sortedData = response?.data?.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ) || [];
      setData(sortedData);
    } catch (error) {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="chart-card recent-orders">
      <div className="chart-header">
        <h3>
          <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
          Đơn hàng gần đây
        </h3>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : !data.length ? (
        <p className="no-data">Không có đơn hàng nào</p>
      ) : (
        <div className="recent-orders-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Khách hàng</th>
                <th>Gói</th>
                <th>Giá trị</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.map((it, index) => (
                <tr key={it._id}>
                  <td>{index + 1}</td>
                  <td>{it.userId.name}</td>
                  <td>{it.planId}</td>
                  <td>{it.depositAmount?.toLocaleString()} VND</td>
                  <td>{formatDate(it.createdAt)}</td>
                  <td>{getStatusBadge(it.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .recent-orders-list {
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
        }
        
        .recent-orders-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .recent-orders-list::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .recent-orders-list::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.5);
          border-radius: 20px;
          border: transparent;
        }

        .spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s ease-in-out infinite;
        }

        .no-data {
          text-align: center;
          color: #666;
          padding: 20px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .me-2 {
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
};

export default LatestOrder;
