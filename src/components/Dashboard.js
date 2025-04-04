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
import LatestOrder from './LatestOrder';
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
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
  const [monthlyOrderStats, setMonthlyOrderStats] = useState([]); // Thống kê đơn hàng theo tháng
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Trạng thái loading
  const [loadingTransactionStats, setLoadingTransactionStats] = useState(true);
  const [loadingRevenueStats, setLoadingRevenueStats] = useState(true);
  const [loadingMonthlyRevenue, setLoadingMonthlyRevenue] = useState(true);
  const [loadingCurrentMonthRevenue, setLoadingCurrentMonthRevenue] = useState(true);
  const [loadingStatsByStatus, setLoadingStatsByStatus] = useState(true);
  const [loadingStatsByUser, setLoadingStatsByUser] = useState(true);
  const [loadingRevenueByYear, setLoadingRevenueByYear] = useState(true);
  const [loadingQuarterRevenue, setLoadingQuarterRevenue] = useState(true);
  const [loadingWeekRevenue, setLoadingWeekRevenue] = useState(true);
  const [loadingMonthlyOrderStats, setLoadingMonthlyOrderStats] = useState(true);

  const chosenStatus = 'active';
  const sampleUserId = '603d2f5e2e2e2e2e2e2e2e2e';
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Transaction Stats
        setLoadingTransactionStats(true);
        const transResponse = await fetchTransactionStats();
        if (transResponse.success) {
          setTransactionStats(transResponse.data);
        }
        setLoadingTransactionStats(false);

        // Fetch Revenue Stats
        setLoadingRevenueStats(true);
        const revenueResponse = await fetchRevenueStats();
        if (revenueResponse.success) {
          setRevenueStats(revenueResponse.data);
        }
        setLoadingRevenueStats(false);

        // Fetch Monthly Revenue (6 tháng đầu năm)
        setLoadingMonthlyRevenue(true);
        const revenueByMonthData = await Promise.all(
          Array.from({ length: 6 }, async (_, i) => {
            const res = await fetchRevenueByMonth(currentYear, i + 1);
            return res.success && res.data ? res.data.totalDeposit : 0;
          })
        );
        setMonthlyRevenue(revenueByMonthData);
        setLoadingMonthlyRevenue(false);

        // Fetch Current Month Revenue
        setLoadingCurrentMonthRevenue(true);
        const currentMonthRevenueRes = await fetchRevenueByMonth(currentYear, currentMonth);
        if (currentMonthRevenueRes.success && currentMonthRevenueRes.data) {
          setCurrentMonthRevenue(currentMonthRevenueRes.data.totalDeposit);
        }
        setLoadingCurrentMonthRevenue(false);

        // Fetch Stats by Status
        setLoadingStatsByStatus(true);
        const statusRes = await fetchTransactionStatsByStatus(chosenStatus);
        setStatsByStatus(statusRes);
        setLoadingStatsByStatus(false);

        // Fetch Stats by User
        setLoadingStatsByUser(true);
        const userRes = await fetchTransactionStatsByUser(sampleUserId);
        setStatsByUser(userRes);
        setLoadingStatsByUser(false);

        // Fetch Revenue by Year
        setLoadingRevenueByYear(true);
        const revYearRes = await fetchRevenueByYear(currentYear);
        setRevenueByYear(revYearRes);
        setLoadingRevenueByYear(false);

        // Fetch Quarter Revenue
        setLoadingQuarterRevenue(true);
        const quarterData = await Promise.all(
          Array.from({ length: 4 }, async (_, i) => {
            const res = await fetchRevenueByQuarter(currentYear, i + 1);
            return res.success && res.data ? res.data : { totalDeposit: 0, transactionCount: 0 };
          })
        );
        setQuarterRevenue(quarterData);
        setLoadingQuarterRevenue(false);

        // Fetch Week Revenue
        setLoadingWeekRevenue(true);
        const weekData = await Promise.all(
          Array.from({ length: 53 }, async (_, i) => {
            const res = await fetchRevenueByWeek(currentYear, i + 1);
            return res.success && res.data ? res.data : { totalDeposit: 0, transactionCount: 0 };
          })
        );
        setWeekRevenue(weekData);
        setLoadingWeekRevenue(false);

        // Fetch Monthly Order Stats (12 tháng trong năm được chọn)
        setLoadingMonthlyOrderStats(true);
        const monthlyOrderData = await Promise.all(
          Array.from({ length: 12 }, async (_, i) => {
            const res = await fetchRevenueByMonth(selectedYear, i + 1);
            return res.success && res.data ? res.data : { totalDeposit: 0, transactionCount: 0 };
          })
        );
        setMonthlyOrderStats(monthlyOrderData);
        setLoadingMonthlyOrderStats(false);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [chosenStatus, sampleUserId, currentYear, currentMonth, selectedYear]);

  // Tính toán dữ liệu
  const totalTransactions =
    transactionStats && transactionStats.byStatus
      ? transactionStats.byStatus.reduce((sum, stat) => sum + stat.count, 0)
      : 0;
  const totalCustomers =
    transactionStats && transactionStats.byUser
      ? transactionStats.byUser.length
      : 0;
  const newOrders = 45;

  // Biểu đồ doanh thu theo tháng (Line Chart)
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

  // Biểu đồ đơn hàng theo tháng (Bar Chart)
  const orderData = {
    labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
    datasets: [
      {
        label: 'Số đơn hàng',
        data: monthlyOrderStats.map(stat => stat.transactionCount),
        backgroundColor: 'rgba(92, 124, 250, 0.7)',
        borderColor: 'rgba(92, 124, 250, 1)',
        borderWidth: 1,
      },
    ],
  };

  const orderOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle' } },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  // Biểu đồ phân bổ dịch vụ (Doughnut Chart)
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

  // Thẻ thống kê (Stats Cards)
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
      title: 'Doanh Thu Tháng ' + currentMonth,
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

  // Biểu đồ doanh thu theo quý (Bar Chart)
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

  // Biểu đồ doanh thu theo tuần (Line Chart)
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

      {/* Stats Cards */}
      <div className="stats-cards">
        {statsCards.map((card, index) => (
          <div className="stats-card" key={index}>
            {(card.title === 'Tổng khách hàng' || card.title === 'Giao dịch') && loadingTransactionStats ? (
              <div className="spinner"></div>
            ) : card.title.includes('Doanh Thu') && loadingCurrentMonthRevenue ? (
              <div className="spinner"></div>
            ) : (
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
            )}
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card revenue-chart">
          <div className="chart-header">
            <h3>
              <FontAwesomeIcon icon={faChartLine} /> Doanh thu theo tháng
            </h3>
          </div>
          <div className="chart-container">
            {loadingMonthlyRevenue ? (
              <div className="spinner"></div>
            ) : (
              <Line data={revenueData} options={revenueOptions} />
            )}
          </div>
        </div>

        <div className="chart-card order-chart">
          <div className="chart-header">
            <h3>
              <FontAwesomeIcon icon={faShoppingCart} /> Đơn hàng theo tháng
            </h3>
            <div className="year-selector">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="chart-container">
            {loadingMonthlyOrderStats ? (
              <div className="spinner"></div>
            ) : (
              <Bar data={orderData} options={orderOptions} />
            )}
          </div>
        </div>
      </div>

      <LatestOrder />

      {/* Quarter Revenue Chart */}
      <div className="chart-card detail-chart">
        <div className="chart-header">
          <h3>Doanh thu theo quý</h3>
        </div>
        <div className="chart-container" style={{ height: '300px' }}>
          {loadingQuarterRevenue ? (
            <div className="spinner"></div>
          ) : (
            <Bar data={quarterData} options={quarterOptions} />
          )}
        </div>
      </div>

      {/* Week Revenue Chart */}
      <div className="chart-card detail-chart">
        <div className="chart-header">
          <h3>Doanh thu theo tuần</h3>
        </div>
        <div className="chart-container" style={{ height: '300px' }}>
          {loadingWeekRevenue ? (
            <div className="spinner"></div>
          ) : (
            <Line data={weekData} options={weekOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;