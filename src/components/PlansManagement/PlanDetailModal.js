import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {
    calculateCateringTotal,
    calculateDecorateTotal,
    calculatePresentTotal,
    formatDate,
    formatPrice,
    getDefaultImage,
    getStatusBadge
} from './utils';

const PlanDetailModal = ({ plan, onClose }) => {
    if (!plan) return null;

    return (
        <div className="modal-overlay" onClick={e => {
            if (e.target.className === 'modal-overlay') onClose();
        }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Chi Tiết Kế Hoạch: {plan.name}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="plan-detail-section">
                    <div className="plan-details">
                        <h3 className="plan-name">{plan.name}</h3>
                        <div className="plan-info">
                            <p><span className="label">Tổng giá:</span> <span className="value price">{formatPrice(plan.totalPrice)} VNĐ</span></p>
                            <p><span className="label">Ngày sự kiện:</span> <span className="value">{formatDate(plan.plandateevent)}</span></p>
                            <p><span className="label">Số lượng khách:</span> <span className="value">{plan.plansoluongkhach || 'Chưa xác định'}</span></p>
                            {plan.UserId && (
                                <p><span className="label">Khách Hàng:</span> <span className="value">{plan.UserId.name || 'N/A'}</span></p>
                            )}
                            <p>
                                <span className="label">Trạng thái:</span> {getStatusBadge(plan.status)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="sanh-detail-section">
                    <h3>Chi Tiết Sảnh</h3>
                    <div className="sanh-content">
                        <div className="sanh-image-container">
                            <img
                                src={plan.SanhId?.imageUrl || getDefaultImage()}
                                alt={plan.SanhId?.name || 'Sảnh'}
                                className="sanh-image"
                            />
                        </div>
                        <div className="sanh-details">
                            <p><span className="label">Tên sảnh:</span> <span className="value">{plan.SanhId?.name || 'N/A'}</span></p>
                            <p><span className="label">Giá:</span> <span className="value price">{formatPrice(plan.SanhId?.price)} VNĐ</span></p>
                        </div>
                    </div>
                </div>

                {plan.caterings && plan.caterings.length > 0 && (
                    <div className="form-group">
                        <h3>Dịch Vụ Ẩm Thực</h3>
                        <div className="item-list">
                            {plan.caterings.map(item => (
                                <div key={item._id} className="list-item">
                                    <div className="item-image-container">
                                        <img
                                            src={item.imageUrl || getDefaultImage()}
                                            alt={item.name}
                                            className="item-image"
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <div className="item-info">
                                            <span className="price">{formatPrice(item.price)} VNĐ</span>
                                            {plan.plansoluongkhach && (
                                                <span className="total-per-item">
                                                    Tổng: {formatPrice(item.price * (plan.plansoluongkhach / 10))} VNĐ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="service-total">
                            <strong>Tổng giá dịch vụ ẩm thực:</strong> {formatPrice(calculateCateringTotal(plan.caterings, plan.plansoluongkhach))} VNĐ
                        </div>
                    </div>
                )}

                {plan.decorates && plan.decorates.length > 0 && (
                    <div className="form-group">
                        <h3>Dịch Vụ Trang Trí</h3>
                        <div className="item-list">
                            {plan.decorates.map(item => (
                                <div key={item._id} className="list-item">
                                    <div className="item-image-container">
                                        <img
                                            src={item.imageUrl || getDefaultImage()}
                                            alt={item.name}
                                            className="item-image"
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <div className="item-info">
                                            <span className="price">{formatPrice(item.price)} VNĐ</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="service-total">
                            <strong>Tổng giá dịch vụ trang trí:</strong> {formatPrice(calculateDecorateTotal(plan.decorates))} VNĐ
                        </div>
                    </div>
                )}

                {plan.presents && plan.presents.length > 0 && (
                    <div className="form-group">
                        <h3>Dịch Vụ MC/Quà Tặng</h3>
                        <div className="item-list">
                            {plan.presents.map(item => (
                                <div key={item._id} className="list-item">
                                    <div className="item-image-container">
                                        <img
                                            src={item.imageUrl || getDefaultImage()}
                                            alt={item.name}
                                            className="item-image"
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <div className="item-info">
                                            <span className="price">{formatPrice(item.price)} VNĐ</span>
                                            <span className="quantity">Số lượng: {item.quantity || 1}</span>
                                            <span className="total-per-item">
                                                Tổng: {formatPrice(item.price * (item.quantity || 1))} VNĐ
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="service-total">
                            <strong>Tổng giá dịch vụ Quà tặng:</strong> {formatPrice(calculatePresentTotal(plan.presents))} VNĐ
                        </div>
                    </div>
                )}

                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} /> Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlanDetailModal; 