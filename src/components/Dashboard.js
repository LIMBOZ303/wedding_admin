// src/components/Dashboard.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../public/styles/Home.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
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
                {/* Thống kê */}
            </div>
            <div className="chart-section">
                <h3>Thống kê doanh thu theo tháng</h3>
                <div className="chart-container">
                    <Line data={data} options={options} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;