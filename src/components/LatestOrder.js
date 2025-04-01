import React, { useEffect, useState } from "react";
import { fetchTransaction } from "../api/transaction_api";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const LatestOrder = () => {
  const [data, setData] = useState([]);

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
      const data = await fetchTransaction(userId, userRole);
      setData(data?.data);
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
    }
  };

  return (
    <div className="chart-card recent-orders">
      <div className="chart-header">
        <h3>Đơn hàng gần đây</h3>
      </div>

      {!data.length ? (
        <p>Không có đơn hàng nào</p>
      ) : (
        <div className="recent-orders-list">
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Gói</th>
                <th>Giá trị</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((it) => (
                <tr key={it._id}>
                  <td>#{it._id}</td>
                  <td>{it.userId.name}</td>
                  <td>{it.planId}</td>
                  <td>{it.depositAmount?.toLocaleString()} VND</td>
                  <td>{getStatusBadge(it.status)}</td>
                </tr>
              ))}
              {/* <tr>
                <td>#WD1206</td>
                <td>Trần Thị B</td>
                <td>Chụp ảnh cưới</td>
                <td>3,500,000đ</td>
                <td>
                  <span className="status-badge pending">Đang xử lý</span>
                </td>
              </tr>
              <tr>
                <td>#WD1207</td>
                <td>Lê Văn C</td>
                <td>Trang trí sảnh</td>
                <td>2,800,000đ</td>
                <td>
                  <span className="status-badge in-progress">
                    Đang thực hiện
                  </span>
                </td>
              </tr>
              <tr>
                <td>#WD1208</td>
                <td>Phạm Thị D</td>
                <td>Combo tiệc cưới</td>
                <td>6,200,000đ</td>
                <td>
                  <span className="status-badge pending">Đang xử lý</span>
                </td>
              </tr> */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LatestOrder;
