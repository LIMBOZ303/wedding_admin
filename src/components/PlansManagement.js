import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes} from '@fortawesome/free-solid-svg-icons';
import { fetchPlanswithUser } from '../api/plan_api';
import Swal from 'sweetalert2';
import "../public/styles/PlanManagement.css";

const PlansManagement = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const fetchData = async () => {
        Swal.fire({
            title: 'Đang tải danh sách kế hoạch...',
            position: 'center',
            width: '500px',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
        try {
            const [plansRes] = await Promise.all([fetchPlanswithUser()]);
            setPlans(plansRes || []);
        } catch (err) {
            setError('Không thể tải dữ liệu');
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể tải danh sách kế hoạch',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false,
            });
        } finally {
            setLoading(false);
            Swal.close();
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openDetailModal = (plan) => {
        setSelectedPlan(plan);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedPlan(null);
    };

    // Hàm tính tổng giá dịch vụ ẩm thực
    const calculateCateringTotal = (caterings, guestCount) => {
        if (!guestCount) return 0;
        return caterings.reduce((total, item) => total + item.price * (guestCount / 10), 0);
    };

    // Hàm tính tổng giá dịch vụ trang trí
    const calculateDecorateTotal = (decorates) => {
        return decorates.reduce((total, item) => total + item.price, 0);
    };

    // Hàm tính tổng giá dịch vụ MC/Quà tặng
    const calculatePresentTotal = (presents) => {
        return presents.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    };

    if (loading) return null;
    if (error) return <div className="plans-management"><p className="error-text">{error}</p></div>;

    return (
        <div className="plans-management">
            <div className="header">
                <h1>Quản Lý Kế Hoạch</h1>
            </div>

            <div className="plans-section">
                <h2>Kế Hoạch</h2>
                {plans.length > 0 ? (
                    <div className="plans-list">
                        {plans.map(plan => (
                            <div key={plan._id} className="plan-item" onClick={() => openDetailModal(plan)}>
                                <div className="plan-image-container">
                                    <img
                                        src={plan.SanhId.imageUrl || 'https://via.placeholder.com/120'}
                                        alt={plan.name}
                                        className="plan-image"
                                    />
                                </div>
                                <div className="plan-details">
                                    <h3>{plan.name}</h3>
                                    <p><strong>Sảnh:</strong> {plan.SanhId?.name || 'N/A'}</p>
                                    <p><strong>Tổng giá:</strong> {plan.totalPrice.toLocaleString()} VNĐ</p>
                                    <p><strong>Ngày sự kiện:</strong> {plan.plandateevent ? new Date(plan.plandateevent).toLocaleDateString('vi-VN') : 'Chưa xác định'}</p>
                                    <p><strong>Người phụ trách:</strong> {plan.UserId?.name || 'N/A'}</p>
                                    <p><strong>Trạng thái:</strong> {plan.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-plans">Không có kế hoạch nào.</p>
                )}
            </div>

            {showDetailModal && selectedPlan && (
                <div className="modal-overlay" onClick={e => {
                    if (e.target.className === 'modal-overlay') closeDetailModal();
                }}>
                    <div className="modal-content">
            <div className="modal-header">
                <h2>Chi Tiết Kế Hoạch: {selectedPlan.name}</h2>
                <button className="close-btn" onClick={closeDetailModal}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            {/* Phần thông tin cơ bản của kế hoạch */}
            <div className="plan-detail-section">
                <div className="plan-details">
                    <h3 className="plan-name">{selectedPlan.name}</h3>
                    <div className="plan-info">
                        <p><span className="label">Tổng giá:</span> <span className="value price">{selectedPlan.totalPrice.toLocaleString()} VNĐ</span></p>
                        <p><span className="label">Ngày sự kiện:</span> <span className="value">{selectedPlan.plandateevent ? new Date(selectedPlan.plandateevent).toLocaleDateString('vi-VN') : 'Chưa xác định'}</span></p>
                        <p><span className="label">Số lượng khách:</span> <span className="value">{selectedPlan.plansoluongkhach || 'Chưa xác định'}</span></p>
                        <p><span className="label">Người phụ trách:</span> <span className="value">{selectedPlan.UserId?.name || 'N/A'}</span></p>
                        <p><span className="label">Trạng thái:</span> <span className={`value status ${selectedPlan.status === 'Chưa kích hoạt' ? 'inactive' : selectedPlan.status === 'Đã kích hoạt' ? 'active' : 'canceled'}`}>{selectedPlan.status}</span></p>
                    </div>
                </div>
            </div>

            {/* Phần chi tiết sảnh riêng biệt */}
            <div className="sanh-detail-section">
                <h3>Chi Tiết Sảnh</h3>
                <div className="sanh-content">
                    <div className="sanh-image-container">
                        <img
                            src={selectedPlan.SanhId?.imageUrl || 'https://via.placeholder.com/120'}
                            alt={selectedPlan.SanhId?.name || 'Sảnh'}
                            className="sanh-image"
                        />
                    </div>
                    <div className="sanh-details">
                        <p><span className="label">Tên sảnh:</span> <span className="value">{selectedPlan.SanhId?.name || 'N/A'}</span></p>
                        <p><span className="label">Giá:</span> <span className="value price">{selectedPlan.SanhId?.price.toLocaleString() || 'N/A'} VNĐ</span></p>
                    </div>
                </div>
            </div>

                        <div className="form-group">
                            <h3>Dịch Vụ Ẩm Thực</h3>
                            {selectedPlan.caterings.length > 0 ? (
                                <>
                                    <div className="item-list">
                                        {selectedPlan.caterings.map(item => (
                                            <div key={item._id} className="list-item">
                                                <div className="item-image-container">
                                                    <img
                                                        src={item.imageUrl || 'https://via.placeholder.com/120'}
                                                        alt={item.name}
                                                        className="item-image"
                                                    />
                                                </div>
                                                <div className="item-details">
                                                    <h4>{item.name}</h4>
                                                    <div className="item-info">
                                                        <span className="price">{item.price.toLocaleString()} VNĐ</span>
                                                        {selectedPlan.plansoluongkhach && (
                                                            <span className="total-per-item">
                                                                Tổng: {(item.price * (selectedPlan.plansoluongkhach / 10)).toLocaleString()} VNĐ
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="service-total">
                                        <strong>Tổng giá dịch vụ ẩm thực:</strong> {calculateCateringTotal(selectedPlan.caterings, selectedPlan.plansoluongkhach).toLocaleString()} VNĐ
                                    </div>
                                </>
                            ) : (
                                <p>Không có dịch vụ ẩm thực nào.</p>
                            )}
                        </div>

                        <div className="form-group">
                            <h3>Dịch Vụ Trang Trí</h3>
                            {selectedPlan.decorates.length > 0 ? (
                                <>
                                    <div className="item-list">
                                        {selectedPlan.decorates.map(item => (
                                            <div key={item._id} className="list-item">
                                                <div className="item-image-container">
                                                    <img
                                                        src={item.imageUrl || 'https://via.placeholder.com/120'}
                                                        alt={item.name}
                                                        className="item-image"
                                                    />
                                                </div>
                                                <div className="item-details">
                                                    <h4>{item.name}</h4>
                                                    <div className="item-info">
                                                        <span className="price">{item.price.toLocaleString()} VNĐ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="service-total">
                                        <strong>Tổng giá dịch vụ trang trí:</strong> {calculateDecorateTotal(selectedPlan.decorates).toLocaleString()} VNĐ
                                    </div>
                                </>
                            ) : (
                                <p>Không có dịch vụ trang trí nào.</p>
                            )}
                        </div>

                        <div className="form-group">
                            <h3>Dịch Vụ MC/Quà Tặng</h3>
                            {selectedPlan.presents.length > 0 ? (
                                <>
                                    <div className="item-list">
                                        {selectedPlan.presents.map(item => (
                                            <div key={item._id} className="list-item">
                                                <div className="item-image-container">
                                                    <img
                                                        src={item.imageUrl || 'https://via.placeholder.com/120'}
                                                        alt={item.name}
                                                        className="item-image"
                                                    />
                                                </div>
                                                <div className="item-details">
                                                    <h4>{item.name}</h4>
                                                    <div className="item-info">
                                                        <span className="price">{item.price.toLocaleString()} VNĐ</span>
                                                        <span className="quantity">Số lượng: {item.quantity || 1}</span>
                                                        <span className="total-per-item">
                                                            Tổng: {(item.price * (item.quantity || 1)).toLocaleString()} VNĐ
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="service-total">
                                        <strong>Tổng giá dịch vụ Quà tặng:</strong> {calculatePresentTotal(selectedPlan.presents).toLocaleString()} VNĐ
                                    </div>
                                </>
                            ) : (
                                <p>Không có dịch vụ quà tặng nào.</p>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={closeDetailModal}>
                                <FontAwesomeIcon icon={faTimes} /> Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlansManagement;