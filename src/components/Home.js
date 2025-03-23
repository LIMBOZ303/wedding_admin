import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../public/styles/Home.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Home = () => {
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Doanh thu (VND)',
                data: [500000, 700000, 900000, 800000, 1000000, 1100000],
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
                    label: function (context) {
                        return `${context.dataset.label}: ${context.raw.toLocaleString()} VND`;
                    },
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
                    <h3>Tổng số người dùng</h3>
                    <p>120</p>
                </div>
                <div className="stat-box">
                    <h3>Tổng số dịch vụ cưới</h3>
                    <p>15</p>
                </div>
                <div className="stat-box">
                    <h3>Tổng doanh thu</h3>
                    <p>5,000,000 VND</p>
                </div>
            </div>

            <div className="chart-section">
                <h3>Thống kê doanh thu theo tháng</h3>
                <div className="chart-container">
                    <Line data={data} options={options} />
                </div>
            </div>

            <div className="services-section">
                <h3>Các dịch vụ cưới</h3>
                <div className="service-list">
                    <div className="service-item">
                        <h4>Dịch vụ chụp ảnh cưới</h4>
                        <p>Số lượng khách hàng: 50</p>
                    </div>
                    <div className="service-item">
                        <h4>Dịch vụ trang trí cưới</h4>
                        <p>Số lượng khách hàng: 30</p>
                    </div>
                    <div className="service-item">
                        <h4>Dịch vụ tổ chức tiệc cưới</h4>
                        <p>Số lượng khách hàng: 40</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;