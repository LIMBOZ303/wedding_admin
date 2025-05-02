import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../LoadingSpinner';
import { formatDate, formatPrice, getDefaultImage, getStatusBadge } from './utils';

const TransactionDetailModal = ({
    transaction,
    planDetails,
    loadingPlanDetails,
    loadingConfirm,
    userRole,
    onClose,
    onConfirm
}) => {
    if (!transaction) return null;

    return (
        <div className="transaction-modal-overlay" onClick={onClose}>
            <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Chi tiết Giao dịch</h3>
                    <button className="modal-close" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className="transaction-details">
                    <div className="section-title">Thông tin giao dịch</div>
                    <div className="detail-group transaction-id-group">
                        <span className="detail-label">Mã giao dịch</span>
                        <span className="detail-value transaction-id">{transaction._id || 'N/A'}</span>
                    </div>
                    <div className="detail-group">
                        <span className="detail-label">Người đặt cọc</span>
                        <span className="detail-value">{transaction.userId?.name || 'N/A'}</span>
                    </div>
                    <div className="detail-group">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{transaction.userId?.email || 'N/A'}</span>
                    </div>
                    <div className="detail-group">
                        <span className="detail-label">Tên kế hoạch</span>
                        <span className="detail-value">{transaction.planName || 'Không có tên kế hoạch'}</span>
                    </div>
                    <div className="detail-group">
                        <span className="detail-label">Trạng thái</span>
                        <span className="detail-value status">{getStatusBadge(transaction.status)}</span>
                    </div>
                    <div className="detail-group">
                        <span className="detail-label">Ngày tạo giao dịch</span>
                        <span className="detail-value date">{formatDate(transaction.createdAt)}</span>
                    </div>

                    {loadingPlanDetails ? (
                        <LoadingSpinner size="small" text="Đang tải thông tin kế hoạch..." />
                    ) : planDetails ? (
                        <>
                            <div className="section-title">Chi tiết kế hoạch</div>
                            <div className="plan-details-section">
                                <div className="plan-image-container">
                                    <img 
                                        src={planDetails.image || getDefaultImage()} 
                                        alt={planDetails.name}
                                        className="plan-image"
                                    />
                                </div>
                                <div className="plan-info">
                                    <div className="detail-group">
                                        <span className="detail-label">Sảnh</span>
                                        <span className="detail-value">{planDetails.sanhName || 'N/A'}</span>
                                    </div>
                                    <div className="detail-group">
                                        <span className="detail-label">Tổng giá</span>
                                        <span className="detail-value price">{formatPrice(planDetails.totalPrice)} VNĐ</span>
                                    </div>
                                    <div className="detail-group">
                                        <span className="detail-label">Ngày tổ chức</span>
                                        <span className="detail-value">{formatDate(planDetails.eventDate)}</span>
                                    </div>
                                    <div className="detail-group">
                                        <span className="detail-label">Số bàn</span>
                                        <span className="detail-value">{planDetails.tableCount || 'N/A'}</span>
                                    </div>
                                    <div className="detail-group">
                                        <span className="detail-label">Menu</span>
                                        <span className="detail-value">{planDetails.menuName || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-plan-details">
                            Không có thông tin chi tiết kế hoạch
                        </div>
                    )}

                    {transaction.status !== 'Đã đặt cọc' &&
                        transaction.status !== 'Đã hủy' &&
                        userRole === 'admin' && (
                            <div className="detail-group actions">
                                <button
                                    className="button-confirm"
                                    onClick={() => {
                                        onConfirm(transaction._id);
                                        onClose();
                                    }}
                                    disabled={loadingConfirm[transaction._id]}
                                >
                                    <FontAwesomeIcon icon={faCheckCircle} /> Xác nhận giao dịch
                                </button>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailModal; 