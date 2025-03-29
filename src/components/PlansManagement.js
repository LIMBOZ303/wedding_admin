import React, { useEffect, useState } from 'react';
import { fetchAllPlans } from '../api/plan_api';
import Swal from 'sweetalert2';
import '../public/styles/PlanManagement.css';

const PlansManagement = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadPlans = async () => {
            Swal.fire({
                title: 'Đang tải danh sách kế hoạch...',
                position: 'center',
                width: '500px',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            try {
                const data = await fetchAllPlans();
                setPlans(data);
            } catch (err) {
                setError('Không thể tải danh sách kế hoạch.');
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể tải danh sách kế hoạch',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false
                });
            } finally {
                setLoading(false);
                Swal.close();
            }
        };

        loadPlans();
    }, []);

    if (loading) {
        // Không cần hiển thị thông báo riêng vì đã có SweetAlert2 modal
        return null;
    }

    if (error) {
        return (
            <div className="plans-container">
                <p className="error-text">{error}</p>
            </div>
        );
    }

    return (
        <div className="plans-container">
            <h2>Quản Lý Kế Hoạch</h2>
            <table className="plans-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên kế hoạch</th>
                        <th>Sảnh</th>
                        <th>Ngày sự kiện</th>
                        <th>Số khách</th>
                        <th>Tổng giá</th>
                        <th>Chênh lệch giá</th>
                        <th>Người phụ trách</th>
                        <th>Dịch vụ (C/D/P)</th>
                    </tr>
                </thead>
                <tbody>
                    {plans.length > 0 ? (
                        plans.map(plan => (
                            <tr key={plan._id}>
                                <td>{plan._id}</td>
                                <td>{plan.name}</td>
                                <td>{plan.SanhId ? plan.SanhId.name : 'N/A'}</td>
                                <td>
                                    {plan.plandateevent
                                        ? new Date(plan.plandateevent).toLocaleDateString('vi-VN', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric'
                                          })
                                        : '-'}
                                </td>
                                <td>{plan.plansoluongkhach || '-'}</td>
                                <td>{plan.totalPrice ? plan.totalPrice.toLocaleString() + ' VND' : '-'}</td>
                                <td>{plan.priceDifference ? plan.priceDifference.toLocaleString() + ' VND' : '-'}</td>
                                <td>{plan.UserId ? plan.UserId.name : 'N/A'}</td>
                                <td>
                                    {plan.caterings ? plan.caterings.length : 0} / {plan.decorates ? plan.decorates.length : 0} / {plan.presents ? plan.presents.length : 0}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9">Không có dữ liệu</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PlansManagement;
