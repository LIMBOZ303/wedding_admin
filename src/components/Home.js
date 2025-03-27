import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../public/styles/Home.css';
import { fetchTransactionStats, fetchRevenueStats, fetchRevenueByMonth } from '../api/transaction_api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Home = () => {
  const [transactionStats, setTransactionStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy thống kê giao dịch
        const transactionResponse = await fetchTransactionStats();
        console.log('Transaction Data:', transactionResponse);
        // Giả sử API trả về dữ liệu trong trường data
        setTransactionStats(transactionResponse.data);

        // Lấy doanh thu theo tháng cho 6 tháng đầu năm hiện tại
        const currentYear = new Date().getFullYear();
        const monthlyData = await Promise.all(
          Array.from({ length: 6 }, async (_, i) => {
            try {
              const response = await fetchRevenueByMonth(currentYear, i + 1);
              console.log(`Revenue for month ${i + 1}:`, response);
              // Giả sử API trả về dữ liệu trong trường data với totalDeposit
              return response.data ? response.data.totalDeposit : 0;
            } catch (error) {
              console.error(`Error fetching revenue for month ${i + 1}:`, error);
              return 0;
            }
          })
        );
        setMonthlyRevenue(monthlyData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const totalTransactions =
    transactionStats && transactionStats.byStatus
      ? transactionStats.byStatus.reduce((sum, stat) => sum + stat.count, 0)
      : 0;

  const chartData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: monthlyRevenue,
        fill: false,
        borderColor: '#3498db',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Doanh thu theo tháng',
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.raw.toLocaleString()} VND`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="home-container">
      <header className="header">
        <h2>Trang Quản Trị Admin</h2>
        <p>Chào mừng bạn đến với bảng điều khiển quản trị dịch vụ cưới.</p>
      </header>

      <div className="dashboard">
        <div className="stat-box">
          <h3>Tổng số giao dịch</h3>
          <p>{totalTransactions}</p>
        </div>
        <div className="stat-box">
          <h3>Tổng doanh thu</h3>
          <p>
            {transactionStats
              ? `${transactionStats.totalDeposit.toLocaleString()} VND`
              : '0 VND'}
          </p>
        </div>
      </div>

      <div className="chart-section">
        <h3>Thống kê doanh thu theo tháng</h3>
        <div className="chart-container">
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Home;
