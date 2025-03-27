import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faShoppingCart,
  faMoneyBillWave,
  faExchangeAlt,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import '../public/styles/Home.css';
import Swal from 'sweetalert2';

import {
  fetchTransactionStats,
  fetchTransactionStatsByStatus,
  fetchTransactionStatsByUser,
  fetchRevenueStats,
  fetchRevenueByYear,
  fetchRevenueByQuarter,
  fetchRevenueByMonth,
  fetchRevenueByWeek
} from '../api/transaction_api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [transactionStats, setTransactionStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  const [statsByStatus, setStatsByStatus] = useState(null);
  const [statsByUser, setStatsByUser] = useState(null);
  const [revenueByYear, setRevenueByYear] = useState(null);
  const [quarterRevenue, setQuarterRevenue] = useState([]);
  const [weekRevenue, setWeekRevenue] = useState([]);

  const chosenStatus = 'active';
  const sampleUserId = '603d2f5e2e2e2e2e2e2e2e2e';
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      Swal.fire({
        title: 'Đang tải dữ liệu thống kê...',
        position: 'center',
        width: '300px',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const transResponse = await fetchTransactionStats();
        if (transResponse.success) {
          setTransactionStats(transResponse.data);
        }

        const revenueResponse = await fetchRevenueStats();
        if (revenueResponse.success) {
          setRevenueStats(revenueResponse.data);
        }

        const revenueByMonthData = await Promise.all(
          Array.from({ length: 6 }, async (_, i) => {
            const res = await fetchRevenueByMonth(currentYear, i + 1);
            return res.success && res.data ? res.data.totalDeposit : 0;
          })
        );
        setMonthlyRevenue(revenueByMonthData);

        const statusRes = await fetchTransactionStatsByStatus(chosenStatus);
        setStatsByStatus(statusRes);

        const userRes = await fetchTransactionStatsByUser(sampleUserId);
        setStatsByUser(userRes);

        const revYearRes = await fetchRevenueByYear(currentYear);
        setRevenueByYear(revYearRes);

        const quarterData = await Promise.all(
          Array.from({ length: 4 }, async (_, i) => {
            const res = await fetchRevenueByQuarter(currentYear, i + 1);
            return res.success && res.data ? res.data : { totalDeposit: 0, transactionCount: 0 };
          })
        );
        setQuarterRevenue(quarterData);

        const weekData = await Promise.all(
          Array.from({ length: 53 }, async (_, i) => {
            const res = await fetchRevenueByWeek(currentYear, i + 1);
            return res.success && res.data ? res.data : { totalDeposit: 0, transactionCount: 0 };
          })
        );
        setWeekRevenue(weekData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        Swal.close();
      }
    };
    fetchData();
  }, [chosenStatus, sampleUserId, currentYear]);

  // ============== TÍNH TOÁN DỮ LIỆU ==============
  const totalTransactions =
    transactionStats && transactionStats.byStatus
      ? transactionStats.byStatus.reduce((sum, stat) => sum + stat.count, 0)
      : 0;
  const totalCustomers =
    transactionStats && transactionStats.byUser
      ? transactionStats.byUser.length
      : 0;
  const newOrders = 45;
  const currentMonthRevenue =
    monthlyRevenue && monthlyRevenue.length
      ? monthlyRevenue[monthlyRevenue.length - 1]
      : 0;

  // ============== BIỂU ĐỒ DOANH THU THEO THÁNG (Line Chart) ==============
  const revenueData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: monthlyRevenue,
        fill: true,
        backgroundColor: 'rgba(92, 124, 250, 0.1)',
        borderColor: 'rgba(92, 124, 250, 1)',
        tension: 0.4,
      },
    ],
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle' } },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${context.raw.toLocaleString()} VND`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: value => value.toLocaleString() + ' VND' } },
    },
  };

  // ============== BIỂU ĐỒ ĐƠN HÀNG (Bar Chart) ==============
  const orderData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
    datasets: [
      {
        label: 'Số đơn hàng',
        data: [65, 72, 86, 81, 93, 105],
        backgroundColor: 'rgba(92, 124, 250, 0.7)',
      },
    ],
  };

  const orderOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };

  // ============== BIỂU ĐỒ PHÂN BỔ DỊCH VỤ (Doughnut Chart) ==============
  const serviceData = {
    labels: ['Trang trí', 'Chụp ảnh', 'Đặt tiệc', 'Makeup', 'Trang phục'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(92, 124, 250, 0.7)',
          'rgba(255, 107, 107, 0.7)',
          'rgba(76, 175, 80, 0.7)',
          'rgba(255, 193, 7, 0.7)',
          'rgba(156, 39, 176, 0.7)',
        ],
        borderColor: [
          'rgba(92, 124, 250, 1)',
          'rgba(255, 107, 107, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(156, 39, 176, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const serviceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { usePointStyle: true, pointStyle: 'circle' } },
    },
  };

  // ============== CÁC THẺ THỐNG KÊ (STATS CARDS) ==============
  const statsCards = [
    {
      title: 'Tổng khách hàng',
      value: totalCustomers.toLocaleString(),
      icon: faUsers,
      color: 'var(--primary-color)',
      bgColor: 'var(--primary-light)',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Đơn hàng mới',
      value: newOrders,
      icon: faShoppingCart,
      color: 'var(--accent-color)',
      bgColor: '#FFEDED',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Doanh thu tháng',
      value: currentMonthRevenue.toLocaleString() + ' VND',
      icon: faMoneyBillWave,
      color: 'var(--success-color)',
      bgColor: '#EBFBEC',
      change: '+22%',
      changeType: 'positive'
    },
    {
      title: 'Giao dịch',
      value: totalTransactions.toLocaleString(),
      icon: faExchangeAlt,
      color: 'var(--info-color)',
      bgColor: '#E3F2FD',
      change: '+8%',
      changeType: 'positive'
    },
  ];

  // ============== BIỂU ĐỒ DOANH THU THEO QUÝ (Bar Chart) ==============
  const quarterLabels = ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'];
  const quarterData = {
    labels: quarterLabels,
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: quarterRevenue.map(q => q.totalDeposit),
        backgroundColor: 'rgba(76, 175, 80, 0.7)',
      },
    ],
  };
  const quarterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${context.raw.toLocaleString()} VND`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: value => value.toLocaleString() + ' VND' } },
    },
  };

  // ============== BIỂU ĐỒ DOANH THU THEO TUẦN (Line Chart) ==============
  const weekLabels = Array.from({ length: 53 }, (_, i) => `Tuần ${i + 1}`);
  const weekData = {
    labels: weekLabels,
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: weekRevenue.map(w => w.totalDeposit),
        fill: false,
        borderColor: 'rgba(255, 193, 7, 1)',
        tension: 0.2,
      },
    ],
  };
  const weekOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${context.raw.toLocaleString()} VND`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: value => value.toLocaleString() + ' VND' } },
    },
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Tổng quan</h1>
          <p className="subtitle">Chào mừng bạn đến với bảng điều khiển quản trị dịch vụ cưới.</p>
        </div>
        <div className="date-display">
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      <div className="stats-cards">
        {statsCards.map((card, index) => (
          <div className="stats-card" key={index}>
            <div className="stats-card-content">
              <div className="stats-card-info">
                <h3>{card.title}</h3>
                <p className="stats-value">{card.value}</p>
                <span className={`stats-change ${card.changeType}`}>
                  {card.change} so với tháng trước
                </span>
              </div>
              <div className="stats-card-icon" style={{ backgroundColor: card.bgColor, color: card.color }}>
                <FontAwesomeIcon icon={card.icon} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card revenue-chart">
          <div className="chart-header">
            <h3>
              <FontAwesomeIcon icon={faChartLine} /> Doanh thu theo tháng
            </h3>
          </div>
          <div className="chart-container">
            <Line data={revenueData} options={revenueOptions} />
          </div>
        </div>

        <div className="chart-card order-chart">
          <div className="chart-header">
            <h3>
              <FontAwesomeIcon icon={faShoppingCart} /> Đơn hàng theo tháng
            </h3>
          </div>
          <div className="chart-container">
            <Bar data={orderData} options={orderOptions} />
          </div>
        </div>

        <div className="chart-card service-chart">
          <div className="chart-header">
            <h3>Phân bổ dịch vụ</h3>
          </div>
          <div className="chart-container">
            <Doughnut data={serviceData} options={serviceOptions} />
          </div>
        </div>

        <div className="chart-card recent-orders">
          <div className="chart-header">
            <h3>Đơn hàng gần đây</h3>
          </div>
          <div className="recent-orders-list">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Dịch vụ</th>
                  <th>Giá trị</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#WD1205</td>
                  <td>Nguyễn Văn A</td>
                  <td>Combo tiệc cưới</td>
                  <td>5,000,000đ</td>
                  <td><span className="status-badge completed">Hoàn thành</span></td>
                </tr>
                <tr>
                  <td>#WD1206</td>
                  <td>Trần Thị B</td>
                  <td>Chụp ảnh cưới</td>
                  <td>3,500,000đ</td>
                  <td><span className="status-badge pending">Đang xử lý</span></td>
                </tr>
                <tr>
                  <td>#WD1207</td>
                  <td>Lê Văn C</td>
                  <td>Trang trí sảnh</td>
                  <td>2,800,000đ</td>
                  <td><span className="status-badge in-progress">Đang thực hiện</span></td>
                </tr>
                <tr>
                  <td>#WD1208</td>
                  <td>Phạm Thị D</td>
                  <td>Combo tiệc cưới</td>
                  <td>6,200,000đ</td>
                  <td><span className="status-badge pending">Đang xử lý</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="chart-card detail-chart">
        <div className="chart-header">
          <h3>Doanh thu theo quý</h3>
        </div>
        <div className="chart-container" style={{ height: '300px' }}>
          <Bar data={quarterData} options={quarterOptions} />
        </div>
      </div>

      <div className="chart-card detail-chart">
        <div className="chart-header">
          <h3>Doanh thu theo tuần</h3>
        </div>
        <div className="chart-container" style={{ height: '300px' }}>
          <Line data={weekData} options={weekOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
