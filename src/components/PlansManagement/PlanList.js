import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const PlanList = ({ plans, onPlanClick }) => {
    if (plans.length === 0) {
        return <p className="no-plans">Không có kế hoạch nào.</p>;
    }

    return (
        <div className="plans-list">
            {plans.map(plan => (
                <div key={plan._id} className="plan-item" onClick={() => onPlanClick(plan)}>
                    <div className="plan-image-container">
                        <img
                            src={plan.SanhId?.imageUrl || 'https://via.placeholder.com/120'}
                            alt={plan.name}
                            className="plan-image"
                        />
                    </div>
                    <div className="plan-details">
                        <h3>{plan.name}</h3>
                        <p><strong>Sảnh:</strong> {plan.SanhId?.name || 'N/A'}</p>
                        <p><strong>Tổng giá:</strong> {plan.totalPrice.toLocaleString()} VNĐ</p>
                        <p><strong>Ngày sự kiện:</strong> {plan.plandateevent ? new Date(plan.plandateevent).toLocaleDateString('vi-VN') : 'Chưa xác định'}</p>
                        {plan.UserId && (
                            <p><strong>Khách hàng:</strong> {plan.UserId.name || 'N/A'}</p>
                        )}
                        <p>
                            <strong>Trạng thái:</strong> 
                            <span className={`status ${plan.status === 'Đã đặt cọc' ? 'deposited' : 'not-deposited'}`}>
                                {plan.status}
                            </span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PlanList; 