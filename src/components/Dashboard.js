// src/components/Dashboard.js
import React from 'react';
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
  // Revenue data for line chart
  const revenueData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: [15000000, 17500000, 21000000, 19500000, 23000000, 25000000],
        fill: true,
        backgroundColor: 'rgba(92, 124, 250, 0.1)',
        borderColor: 'rgba(92, 124, 250, 1)',
        tension: 0.4,
      },
    ],
  };

  // Revenue chart options
  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw.toLocaleString()} VND`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString() + ' VND';
          },
        },
      },
    },
  };

  // Order data for bar chart
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
  
  // Order chart options
  const orderOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Service distribution data for doughnut chart
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

  // Service chart options
  const serviceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Tổng khách hàng',
      value: '1,254',
      icon: faUsers,
      color: 'var(--primary-color)',
      bgColor: 'var(--primary-light)',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Đơn hàng mới',
      value: '45',
      icon: faShoppingCart,
      color: 'var(--accent-color)',
      bgColor: '#FFEDED',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Doanh thu tháng',
      value: '25,000,000đ',
      icon: faMoneyBillWave,
      color: 'var(--success-color)',
      bgColor: '#EBFBEC',
      change: '+22%',
      changeType: 'positive'
    },
    {
      title: 'Giao dịch',
      value: '152',
      icon: faExchangeAlt,
      color: 'var(--info-color)',
      bgColor: '#E3F2FD',
      change: '+8%',
      changeType: 'positive'
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Tổng quan</h1>
          <p className="subtitle">Chào mừng bạn đến với bảng điều khiển quản trị dịch vụ cưới.</p>
        </div>
        <div className="date-display">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
    </div>
  );
};

export default Dashboard;
