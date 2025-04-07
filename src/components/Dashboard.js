import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
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
  const [monthlyOrderStats, setMonthlyOrderStats] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeekRange, setSelectedWeekRange] = useState('1-12');
  const [selectedQuarter, setSelectedQuarter] = useState(1);

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

  // Hàm lấy dữ liệu thống kê theo tháng
  const fetchMonthlyData = async () => {
    try {
      setLoadingMonthlyRevenue(true);
      const revenueByMonthData = await Promise.all(
        Array.from({ length: 6 }, async (_, i) => {
          const res = await fetchRevenueByMonth(selectedYear, i + 1);
          return res.success && res.data ? res.data.totalDeposit : 0;
        })
      );
      setMonthlyRevenue(revenueByMonthData);
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
    } finally {
      setLoadingMonthlyRevenue(false);
    }
  };

  // Hàm lấy dữ liệu thống kê theo quý
  const fetchQuarterData = async () => {
    try {
      setLoadingQuarterRevenue(true);
      const quarterData = await Promise.all(
        Array.from({ length: 4 }, async (_, i) => {
          const res = await fetchRevenueByQuarter(selectedYear, i + 1);
          if (res.success && res.data) {
            return {
              totalDeposit: res.data.totalDeposit || 0,
              transactionCount: res.data.transactionCount || 0
            };
          }
          return { totalDeposit: 0, transactionCount: 0 };
        })
      );
      setQuarterRevenue(quarterData);
    } catch (error) {
      console.error('Error fetching quarter revenue:', error);
      setQuarterRevenue(Array(4).fill({ totalDeposit: 0, transactionCount: 0 }));
    } finally {
      setLoadingQuarterRevenue(false);
    }
  };

  // Hàm lấy dữ liệu thống kê theo tuần
  const fetchWeekData = async () => {
    try {
      setLoadingWeekRevenue(true);
      
      // Lấy phạm vi tuần từ selectedWeekRange
      const [startWeek, endWeek] = selectedWeekRange.split('-').map(Number);
      const weekCount = endWeek - startWeek + 1;
      
      const weekData = await Promise.all(
        Array.from({ length: weekCount }, async (_, i) => {
          const weekNumber = startWeek + i;
          const res = await fetchRevenueByWeek(selectedYear, weekNumber);
          if (res.success && res.data) {
            return {
              totalDeposit: res.data.totalDeposit || 0,
              transactionCount: res.data.transactionCount || 0
            };
          }
          return { totalDeposit: 0, transactionCount: 0 };
        })
      );
      setWeekRevenue(weekData);
    } catch (error) {
      console.error('Error fetching week revenue:', error);
      setWeekRevenue([]);
    } finally {
      setLoadingWeekRevenue(false);
    }
  };

  // Hàm lấy dữ liệu thống kê đơn hàng theo tháng
  const fetchMonthlyOrderData = async () => {
    try {
      setLoadingMonthlyOrderStats(true);
      const monthlyOrderData = await Promise.all(
        Array.from({ length: 12 }, async (_, i) => {
          const res = await fetchRevenueByMonth(selectedYear, i + 1);
          return res.success && res.data ? res.data : { totalDeposit: 0, transactionCount: 0 };
        })
      );
      setMonthlyOrderStats(monthlyOrderData);
    } catch (error) {
      console.error('Error fetching monthly order stats:', error);
    } finally {
      setLoadingMonthlyOrderStats(false);
    }
  };

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
        await fetchMonthlyData();

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
        await fetchQuarterData();

        // Fetch Week Revenue
        await fetchWeekData();

        // Fetch Monthly Order Stats (12 tháng trong năm được chọn)
        await fetchMonthlyOrderData();

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [chosenStatus, sampleUserId, currentYear, currentMonth, selectedYear]);

  // Cập nhật dữ liệu khi năm được chọn thay đổi
  useEffect(() => {
    fetchMonthlyOrderData();
  }, [selectedYear]);

  // Cập nhật dữ liệu khi quý được chọn thay đổi
  useEffect(() => {
    fetchQuarterData();
  }, [selectedYear]);

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
    labels: [`Tháng 1/${selectedYear}`, `Tháng 2/${selectedYear}`, `Tháng 3/${selectedYear}`, `Tháng 4/${selectedYear}`, `Tháng 5/${selectedYear}`, `Tháng 6/${selectedYear}`],
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
  const quarterLabels = [`Quý 1/${selectedYear}`, `Quý 2/${selectedYear}`, `Quý 3/${selectedYear}`, `Quý 4/${selectedYear}`];
  const quarterData = {
    labels: quarterLabels,
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: quarterRevenue.map(q => q.totalDeposit),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 8,
        barThickness: 20,
      },
      {
        label: 'Số giao dịch',
        data: quarterRevenue.map(q => q.transactionCount),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 8,
        barThickness: 20,
      }
    ],
  };
  const quarterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { 
          usePointStyle: true, 
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        titleFont: {
          size: 13,
          weight: 'normal'
        },
        bodyColor: '#666',
        bodyFont: {
          size: 12
        },
        padding: 12,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw;
            if (label.includes('Doanh thu')) {
              return `${label}: ${value.toLocaleString()} VND`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value) {
            if (this.chart.data.datasets[0].data.includes(value)) {
              return value.toLocaleString() + ' VND';
            }
            return value;
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      }
    }
  };

  // Biểu đồ doanh thu theo tuần (Line Chart)
  const [startWeek, endWeek] = selectedWeekRange.split('-').map(Number);
  const weekLabels = Array.from(
    { length: endWeek - startWeek + 1 }, 
    (_, i) => `Tuần ${startWeek + i}/${selectedYear}`
  );
  
  const weekData = {
    labels: weekLabels,
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: weekRevenue.map(w => w.totalDeposit),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Số giao dịch',
        data: weekRevenue.map(w => w.transactionCount),
        fill: false,
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.4,
        yAxisID: 'y1',
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ],
  };
  const weekOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { 
          usePointStyle: true, 
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        titleFont: {
          size: 13,
          weight: 'normal'
        },
        bodyColor: '#666',
        bodyFont: {
          size: 12
        },
        padding: 12,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw;
            if (label.includes('Doanh thu')) {
              return `${label}: ${value.toLocaleString()} VND`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          callback: value => value.toLocaleString() + ' VND'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          callback: value => value
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11
          },
          autoSkip: true,
          maxTicksLimit: 12
        }
      }
    }
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
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        marginBottom: '24px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#333',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>Doanh thu theo quý</h3>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <label style={{
                fontSize: '14px',
                color: '#666',
                fontWeight: 500
              }}>Năm:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                  color: '#333',
                  cursor: 'pointer',
                  minWidth: '100px'
                }}
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <label style={{
                fontSize: '14px',
                color: '#666',
                fontWeight: 500
              }}>Quý:</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                  color: '#333',
                  cursor: 'pointer',
                  minWidth: '100px'
                }}
              >
                {Array.from({ length: 4 }, (_, i) => i + 1).map(quarter => (
                  <option key={quarter} value={quarter}>Quý {quarter}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div style={{
          padding: '20px',
          height: '300px',
          position: 'relative',
          background: '#fff'
        }}>
          {loadingQuarterRevenue ? (
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '50%',
              borderTopColor: '#4CAF50',
              animation: 'spin 1s linear infinite',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}></div>
          ) : (
            <Bar data={quarterData} options={quarterOptions} />
          )}
        </div>
      </div>

      {/* Week Revenue Chart */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        marginBottom: '24px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#333',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>Doanh thu theo tuần</h3>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <label style={{
                fontSize: '14px',
                color: '#666',
                fontWeight: 500
              }}>Năm:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                  color: '#333',
                  cursor: 'pointer',
                  minWidth: '100px'
                }}
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <label style={{
                fontSize: '14px',
                color: '#666',
                fontWeight: 500
              }}>Tuần:</label>
              <select
                value={selectedWeekRange}
                onChange={(e) => setSelectedWeekRange(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                  color: '#333',
                  cursor: 'pointer',
                  minWidth: '100px'
                }}
              >
                <option value="1-12">Tuần 1-12</option>
                <option value="13-26">Tuần 13-26</option>
                <option value="27-39">Tuần 27-39</option>
                <option value="40-53">Tuần 40-53</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{
          padding: '20px',
          height: '300px',
          position: 'relative',
          background: '#fff'
        }}>
          {loadingWeekRevenue ? (
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '50%',
              borderTopColor: '#4CAF50',
              animation: 'spin 1s linear infinite',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}></div>
          ) : (
            <Line data={weekData} options={weekOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;