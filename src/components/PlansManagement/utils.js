// Constants
export const STATUS_CLASSES = {
    'Đã đặt cọc': 'status-badge confirmed',
    'Đang chờ xác nhận': 'status-badge pending',
    'Đã hủy': 'status-badge cancelled',
    'Đã kích hoạt': 'status-badge active'
};

export const STATUS_LABELS = {
    'Đã đặt cọc': 'Đã đặt cọc',
    'Đang chờ xác nhận': 'Chờ xác nhận',
    'Đã hủy': 'Đã hủy',
    'Đã kích hoạt': 'Đã xác nhận'
};

// Utility functions
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export const calculateCateringTotal = (caterings, guestCount) => {
    if (!guestCount) return 0;
    return caterings.reduce((total, item) => total + item.price * (guestCount / 10), 0);
};

export const calculateDecorateTotal = (decorates) => {
    return decorates.reduce((total, item) => total + item.price, 0);
};

export const calculatePresentTotal = (presents) => {
    return presents.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
};

export const getStatusBadge = (status) => {
    return <span className={STATUS_CLASSES[status] || 'status-badge'}>{STATUS_LABELS[status] || status}</span>;
};

export const getDefaultImage = () => 'https://via.placeholder.com/120';

export const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') || 'N/A';
}; 