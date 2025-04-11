import React, { useEffect, useState } from "react";
import { fetchTransaction } from "../api/transaction_api";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag } from "@fortawesome/free-solid-svg-icons";

const LatestOrder = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    fetchData();
  }, []);

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
    <div className="latest-orders">
      <div className="card-header">
        <h3>
          <FontAwesomeIcon icon={faShoppingBag} /> Đơn hàng gần đây
        </h3>
      </div>
      <div className="table-responsive">
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
            {data.map((order, index) => (
              <tr key={order._id}>
                <td>{index + 1}</td>
                <td data-full-text={order.userId.name}>{order.userId.name}</td>
                <td data-full-text={order.planId}>{order.planId}</td>
                <td data-full-text={order.depositAmount?.toLocaleString()}>{order.depositAmount?.toLocaleString()} VND</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status === 'active' ? 'Đã kích hoạt' : 
                     order.status === 'pending' ? 'Đang chờ' : 'Đã hủy'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LatestOrder;
