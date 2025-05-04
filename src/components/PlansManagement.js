import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes,
    faFilter,
    faMoneyBill,
    faCalendarCheck,
    faList,
    faCheckCircle,
    faExclamationTriangle,
    faSearch
} from '@fortawesome/free-solid-svg-icons';
import { fetchPlanswithUser, fetchPlansNoUser, fetchPlanById } from '../api/plan_api';
import { fetchTransaction } from '../api/transaction_api';
import axios from 'axios';
import Swal from 'sweetalert2';
import "../public/styles/PlanManagement.css";
import LoadingSpinner from './LoadingSpinner';

const PlansManagement = () => {
    const [activeTab, setActiveTab] = useState('other'); // 'other', 'deposited', 'transactions'
    const [otherPlans, setOtherPlans] = useState([]);
    const [depositedPlans, setDepositedPlans] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    // New state variables for transactions
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [loadingConfirm, setLoadingConfirm] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [planDetails, setPlanDetails] = useState(null);
    const [loadingPlanDetails, setLoadingPlanDetails] = useState(false);

    const [transactionStatusFilter, setTransactionStatusFilter] = useState('all');

    const lastFetchTime = useRef(Date.now());
    const isMounted = useRef(true);
    const lastVisibilityChange = useRef(Date.now());
    const minimumRefreshInterval = 600000; // 10 minutes

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    const fetchData = async () => {
        setLoading(true);
        try {
            // Lấy tất cả kế hoạch
            const [userPlansRes, defaultPlansRes] = await Promise.all([
                fetchPlanswithUser(),
                fetchPlansNoUser()
            ]);

            // Lọc kế hoạch đã đặt cọc
            const deposited = userPlansRes.filter(plan => plan.status === 'Đã đặt cọc');
            // Lọc kế hoạch khác (chỉ lấy kế hoạch của User chưa đặt cọc và chưa hủy)
            const others = userPlansRes.filter(plan =>
                plan.status !== 'Đã đặt cọc' &&
                plan.status !== 'Đã hủy'
            );

            setDepositedPlans(deposited);
            setOtherPlans(others);

            // Lấy dữ liệu giao dịch
            if (userId && userRole) {
                const transactionRes = await fetchTransaction(userId, userRole);
                setTransactions(transactionRes.data || []);
            }

        } catch (err) {
            setError('Không thể tải dữ liệu');
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể tải dữ liệu',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId, userRole]);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const getTransactions = useCallback(async (force = false) => {
        const now = Date.now();
        if (!force && now - lastFetchTime.current < 5000) {
            return;
        }

        try {
            setLoadingTransactions(true);
            setError(null);
            lastFetchTime.current = now;

            if (!userId || !userRole) {
                throw new Error('Vui lòng đăng nhập với tài khoản admin');
            }

            const data = await fetchTransaction(userId, userRole);
            console.log('Raw transaction data from API:', data);

            if (data.status) {
                if (!Array.isArray(data.data)) {
                    throw new Error('Dữ liệu giao dịch không hợp lệ');
                }

                const sortedData = [...data.data].sort((a, b) => {
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return dateB - dateA;
                });

                setTransactions(sortedData);
            } else {
                throw new Error(data.message || 'Không lấy được danh sách giao dịch');
            }
        } catch (err) {
            setError(`Lỗi: ${err.message}`);
            console.error('Lỗi khi lấy danh sách giao dịch:', err);
        } finally {
            setLoadingTransactions(false);
        }
    }, [userId, userRole]);

    // Auto refresh for transactions
    useEffect(() => {
        let intervalId;

        const handleVisibilityChange = () => {
            const now = Date.now();
            if (!document.hidden) {
                if (now - lastVisibilityChange.current >= minimumRefreshInterval) {
                    lastVisibilityChange.current = now;
                    getTransactions(true);
                }
            }
        };

        intervalId = setInterval(() => {
            if (!document.hidden) {
                getTransactions();
            }
        }, 600000);

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [getTransactions]);

    const confirmTransaction = useCallback(async (transactionId) => {
        if (loadingConfirm[transactionId]) return;

        try {
            setLoadingConfirm((prev) => ({ ...prev, [transactionId]: true }));
            const response = await axios.patch(
                `https://apidatn.onrender.com/users/transactions/${transactionId}/confirm`,
                {},
                {
                    headers: {
                        'user-id': userId,
                        'user-role': userRole,
                    },
                }
            );

            if (response.data.status) {
                setTransactions((prev) =>
                    prev.map((tx) =>
                        tx._id === transactionId ? { ...tx, status: 'Đã kích hoạt' } : tx
                    )
                );
                getTransactions(true);
            } else {
                throw new Error('Không thể xác nhận giao dịch: ' + response.data.message);
            }
        } catch (err) {
            setError('Lỗi khi xác nhận giao dịch: ' + err.message);
            console.error('Lỗi khi xác nhận giao dịch:', err.message);
        } finally {
            setLoadingConfirm((prev) => ({ ...prev, [transactionId]: false }));
        }
    }, [userId, userRole, getTransactions]);

    const filteredTransactions = React.useMemo(() => {
        return transactions.filter((tx) => {
            // Lọc theo searchTerm
            if (!searchTerm) {
                // Lọc theo trạng thái
                if (transactionStatusFilter === 'all') return true;
                return tx.status === transactionStatusFilter;
            }

            const searchString = searchTerm.toLowerCase();
            const matchesSearch = (
                (tx._id && String(tx._id).toLowerCase().includes(searchString)) ||
                (tx.userId?.name && tx.userId.name.toLowerCase().includes(searchString)) ||
                (tx.userId?.email && tx.userId.email.toLowerCase().includes(searchString)) ||
                (tx.planName && tx.planName.toLowerCase().includes(searchString))
            );

            // Lọc theo trạng thái
            if (transactionStatusFilter === 'all') return matchesSearch;
            return matchesSearch && tx.status === transactionStatusFilter;
        });
    }, [transactions, searchTerm, transactionStatusFilter]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedTransactions = React.useMemo(() => {
        let sortableItems = [...filteredTransactions];

        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;

                if (sortConfig.key === 'userName') {
                    aValue = a.userId?.name || '';
                    bValue = b.userId?.name || '';
                } else if (sortConfig.key === 'userEmail') {
                    aValue = a.userId?.email || '';
                    bValue = b.userId?.email || '';
                } else if (sortConfig.key === 'planName') {
                    aValue = a.planName || '';
                    bValue = b.planName || '';
                } else if (sortConfig.key === 'createdAt') {
                    return sortConfig.direction === 'ascending'
                        ? new Date(a.createdAt) - new Date(b.createdAt)
                        : new Date(b.createdAt) - new Date(a.createdAt);
                } else {
                    aValue = a[sortConfig.key] || '';
                    bValue = b[sortConfig.key] || '';
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        } else {
            // Mặc định sắp xếp theo ngày mới nhất nếu không có tiêu chí sắp xếp nào khác
            sortableItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return sortableItems;
    }, [filteredTransactions, sortConfig]);

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) {
            return null;
        }
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Đã kích hoạt':
                return (
                    <span className="status-badge status-active">
                        <FontAwesomeIcon icon={faCheckCircle} /> Đã xác nhận
                    </span>
                );
            case 'Chưa kích hoạt':
                return (
                    <span className="status-badge status-pending">
                        <FontAwesomeIcon icon={faExclamationTriangle} /> Chờ xác nhận
                    </span>
                );
            case 'Đã đặt cọc':
                return (
                    <span className="status-badge status-deposited">
                        <FontAwesomeIcon icon={faCheckCircle} /> Đã đặt cọc
                    </span>
                );
            case 'Đã hủy':
                return (
                    <span className="status-badge status-canceled">
                        <FontAwesomeIcon icon={faTimes} /> Đã hủy
                    </span>
                );
            default:
                return <span className="status-badge">{status || 'N/A'}</span>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const fetchPlanDetails = async (planId) => {
        if (!planId) {
            setPlanDetails(null);
            return;
        }

        try {
            setLoadingPlanDetails(true);
            const response = await axios.get(
                `https://apidatn.onrender.com/plans/${planId}`,
                {
                    headers: {
                        'user-id': userId,
                        'user-role': userRole,
                    },
                }
            );

            if (response.data.status) {
                setPlanDetails(response.data.data);
            } else {
                console.error('API không trả về dữ liệu hợp lệ:', response.data);
                setPlanDetails(null);
            }
        } catch (err) {
            console.error('Lỗi khi lấy thông tin kế hoạch:', err.message);
            setPlanDetails(null); // Vẫn cho phép modal hiển thị dù không có chi tiết kế hoạch
        } finally {
            setLoadingPlanDetails(false);
        }
    };

    const handleRowClick = async (transaction) => {
        console.log('Row clicked:', transaction);
        setSelectedTransaction(transaction);
        if (transaction.planId) {
            await fetchPlanDetails(transaction.planId);
        } else {
            setPlanDetails(null);
        }
    };

    const closeModal = () => {
        setSelectedTransaction(null);
        setPlanDetails(null);
    };

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

    const filterPlansByStatus = (plans) => {
        if (statusFilter === 'all') return plans;
        return plans.filter(plan => {
            if (statusFilter === 'deposited') {
                return plan.status === 'Đã đặt cọc';
            } else if (statusFilter === 'not-deposited') {
                return plan.status === 'Chưa đặt cọc';
            }
            return true;
        });
    };

    // Render danh sách kế hoạch
    const renderPlanList = (plans) => {
        const filteredPlans = filterPlansByStatus(plans);

        if (filteredPlans.length === 0) {
            return <p className="no-plans">Không có kế hoạch nào.</p>;
        }

        return (
            <div className="plans-list">
                {filteredPlans.map(plan => (
                    <div key={plan._id} className="plan-item" onClick={() => openDetailModal(plan)}>
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

    // Updated renderTransactionList function
    const renderTransactionList = () => {
        return (
            <div className="transactions-container">
                <div className="transactions-header">
                    <h2>Quản lý Giao dịch</h2>
                    <div className="header-actions">
                        {/* Bộ lọc trạng thái */}
                        <div className="status-filter-container">
                            <label htmlFor="status-filter">Lọc theo trạng thái: </label>
                            <select
                                id="status-filter"
                                value={transactionStatusFilter}
                                onChange={(e) => setTransactionStatusFilter(e.target.value)}
                                className="status-filter"
                            >
                                <option value="all">Tất cả</option>

                                <option value="Đang chờ">Chờ xác nhận</option>
                                <option value="Đã đặt cọc">Đã đặt cọc</option>
                                <option value="Đã hủy">Đã hủy</option>
                            </select>
                        </div>
                        {/* Thanh tìm kiếm */}
                        <div className="search-container">
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm tên, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="clear-search">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="transactions-content">
                    {loadingTransactions ? (
                        <LoadingSpinner size="large" text="Đang tải giao dịch..." />
                    ) : transactions.length === 0 ? (
                        <div className="no-data">
                            <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
                            <p>Không có giao dịch nào trong hệ thống</p>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="no-data">
                            <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
                            <p>Không tìm thấy giao dịch khớp với tìm kiếm hoặc bộ lọc</p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setTransactionStatusFilter('all');
                                }}
                                className="clear-search-button"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => requestSort('index')} className="sortable">
                                            STT {getSortIcon('index')}
                                        </th>
                                        <th onClick={() => requestSort('userName')} className="sortable">
                                            Người dùng {getSortIcon('userName')}
                                        </th>
                                        <th onClick={() => requestSort('userEmail')} className="sortable">
                                            Email {getSortIcon('userEmail')}
                                        </th>
                                        <th onClick={() => requestSort('planName')} className="sortable">
                                            Tên kế hoạch {getSortIcon('planName')}
                                        </th>
                                        <th onClick={() => requestSort('status')} className="sortable">
                                            Trạng thái {getSortIcon('status')}
                                        </th>
                                        <th onClick={() => requestSort('createdAt')} className="sortable">
                                            Ngày tạo {getSortIcon('createdAt')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedTransactions.map((tx, index) => (
                                        <tr
                                            key={tx._id || index}
                                            onClick={() => handleRowClick(tx)}
                                            className={tx.status === 'Chưa kích hoạt' ? 'pending-row' : ''}
                                        >
                                            <td className="index-column">{index + 1}</td>
                                            <td>{tx.userId?.name || 'N/A'}</td>
                                            <td>{tx.userId?.email || 'N/A'}</td>
                                            <td>{tx.planName || 'N/A'}</td>
                                            <td>
                                                <span className={`status-badge ${tx.status === 'Đã đặt cọc' ? 'status-deposited' :
                                                    tx.status === 'Đã hủy' ? 'status-canceled' :
                                                        tx.status === 'Đã kích hoạt' ? 'status-active' :
                                                            'status-pending'
                                                    }`}>
                                                    {tx.status === 'Đã đặt cọc' ? 'Đã đặt cọc' :
                                                        tx.status === 'Đã hủy' ? 'Đã hủy' :
                                                            tx.status === 'Đã kích hoạt' ? 'Đã xác nhận' :
                                                                'Chờ xác nhận'}
                                                </span>
                                            </td>
                                            <td>{formatDate(tx.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {selectedTransaction && (
                    <div className="transaction-modal-overlay" onClick={closeModal}>
                        <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Chi tiết Giao dịch</h3>
                                <button className="modal-close" onClick={closeModal}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                            <div className="transaction-details">
                                <div className="section-title">Thông tin giao dịch</div>
                                <div className="detail-group transaction-id-group">
                                    <span className="detail-label">Mã giao dịch</span>
                                    <span className="detail-value transaction-id">{selectedTransaction._id || 'N/A'}</span>
                                </div>
                                <div className="detail-group">
                                    <span className="detail-label">Người đặt cọc</span>
                                    <span className="detail-value">{selectedTransaction.userId?.name || 'N/A'}</span>
                                </div>
                                <div className="detail-group">
                                    <span className="detail-label">Email</span>
                                    <span className="detail-value">{selectedTransaction.userId?.email || 'N/A'}</span>
                                </div>
                                <div className="detail-group">
                                    <span className="detail-label">Tên kế hoạch</span>
                                    <span className="detail-value">
                                        {selectedTransaction.planName ||
                                            (selectedTransaction.planDetails && selectedTransaction.planDetails.name) ||
                                            'Không có tên kế hoạch'}
                                    </span>
                                </div>
                                <div className="detail-group">
                                    <span className="detail-label">Trạng thái</span>
                                    <span className="detail-value status">{getStatusBadge(selectedTransaction.status)}</span>
                                </div>
                                <div className="detail-group">
                                    <span className="detail-label">Ngày tạo giao dịch</span>
                                    <span className="detail-value date">{formatDate(selectedTransaction.createdAt)}</span>
                                </div>

                                {loadingPlanDetails ? (
                                    <LoadingSpinner size="small" text="Đang tải dữ liệu..." />
                                ) : planDetails ? (
                                    <>
                                        <div className="section-title">Chi tiết kế hoạch</div>
                                        <div className="plan-details-section">
                                            <div className="plan-image-container">
                                                <img
                                                    src={planDetails.image || 'https://via.placeholder.com/120'}
                                                    alt={planDetails.name}
                                                    className="plan-image"
                                                />
                                            </div>
                                            <div className="plan-info">
                                                <div className="detail-group">
                                                    <span className="detail-label">Tên kế hoạch</span>
                                                    <span className="detail-value">{planDetails.name || 'N/A'}</span>
                                                </div>
                                                <div className="detail-group">
                                                    <span className="detail-label">Sảnh</span>
                                                    <span className="detail-value">{planDetails.sanhName || 'N/A'}</span>
                                                </div>
                                                <div className="detail-group">
                                                    <span className="detail-label">Tổng giá</span>
                                                    <span className="detail-value price">{planDetails.totalPrice?.toLocaleString('vi-VN')} VNĐ</span>
                                                </div>
                                                <div className="detail-group">
                                                    <span className="detail-label">Ngày tổ chức</span>
                                                    <span className="detail-value">{formatDate(planDetails.eventDate)}</span>
                                                </div>
                                                <div className="detail-group">
                                                    <span className="detail-label">Số lượng khách</span>
                                                    <span className="detail-value">{planDetails.guestCount || 'N/A'}</span>
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

                                        {/* Dịch vụ ẩm thực */}
                                        {planDetails.caterings && planDetails.caterings.length > 0 && (
                                            <div className="service-section">
                                                <div className="section-title">Dịch vụ Ẩm thực</div>
                                                <div className="service-list">
                                                    {planDetails.caterings.map((item, index) => (
                                                        <div key={index} className="service-item">
                                                            <div className="service-image-container">
                                                                <img
                                                                    src={item.imageUrl || 'https://via.placeholder.com/80'}
                                                                    alt={item.name}
                                                                    className="service-image"
                                                                />
                                                            </div>
                                                            <div className="service-info">
                                                                <span className="service-name">{item.name}</span>
                                                                <span className="service-price">{item.price?.toLocaleString('vi-VN')} VNĐ</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="service-total">
                                                    <span className="total-label">Tổng giá dịch vụ ẩm thực:</span>
                                                    <span className="total-value">{calculateCateringTotal(planDetails.caterings, planDetails.guestCount)?.toLocaleString('vi-VN')} VNĐ</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Dịch vụ trang trí */}
                                        {planDetails.decorates && planDetails.decorates.length > 0 && (
                                            <div className="service-section">
                                                <div className="section-title">Dịch vụ Trang trí</div>
                                                <div className="service-list">
                                                    {planDetails.decorates.map((item, index) => (
                                                        <div key={index} className="service-item">
                                                            <div className="service-image-container">
                                                                <img
                                                                    src={item.imageUrl || 'https://via.placeholder.com/80'}
                                                                    alt={item.name}
                                                                    className="service-image"
                                                                />
                                                            </div>
                                                            <div className="service-info">
                                                                <span className="service-name">{item.name}</span>
                                                                <span className="service-price">{item.price?.toLocaleString('vi-VN')} VNĐ</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="service-total">
                                                    <span className="total-label">Tổng giá dịch vụ trang trí:</span>
                                                    <span className="total-value">{calculateDecorateTotal(planDetails.decorates)?.toLocaleString('vi-VN')} VNĐ</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Dịch vụ MC/Quà tặng */}
                                        {planDetails.presents && planDetails.presents.length > 0 && (
                                            <div className="service-section">
                                                <div className="section-title">Dịch vụ MC/Quà tặng</div>
                                                <div className="service-list">
                                                    {planDetails.presents.map((item, index) => (
                                                        <div key={index} className="service-item">
                                                            <div className="service-image-container">
                                                                <img
                                                                    src={item.imageUrl || 'https://via.placeholder.com/80'}
                                                                    alt={item.name}
                                                                    className="service-image"
                                                                />
                                                            </div>
                                                            <div className="service-info">
                                                                <span className="service-name">{item.name}</span>
                                                                <span className="service-price">{item.price?.toLocaleString('vi-VN')} VNĐ</span>
                                                                <span className="service-quantity">Số lượng: {item.quantity || 1}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="service-total">
                                                    <span className="total-label">Tổng giá dịch vụ MC/Quà tặng:</span>
                                                    <span className="total-value">{calculatePresentTotal(planDetails.presents)?.toLocaleString('vi-VN')} VNĐ</span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div></div>
                                )}

                                {selectedTransaction.status !== 'Đã đặt cọc' &&
                                    selectedTransaction.status !== 'Đã hủy' &&
                                    userRole === 'admin' && (
                                        <div className="detail-group actions">
                                            <button
                                                className="button-confirm"
                                                onClick={() => {
                                                    confirmTransaction(selectedTransaction._id);
                                                    closeModal();
                                                }}
                                                disabled={loadingConfirm[selectedTransaction._id]}
                                            >
                                                <FontAwesomeIcon icon={faCheckCircle} /> Xác nhận giao dịch
                                            </button>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <LoadingSpinner size="large" text="Đang tải kế hoạch..." />;
    if (error) return <div className="plans-management"><p className="error-text">{error}</p></div>;

    return (
        <div className="plans-management">
            <div className="header">
                <h1>Quản Lý Kế Hoạch & Giao Dịch</h1>
            </div>

            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'other' ? 'active' : ''}`}
                    onClick={() => setActiveTab('other')}
                >
                    <FontAwesomeIcon icon={faList} /> Khác
                </button>
                <button
                    className={`tab-button ${activeTab === 'deposited' ? 'active' : ''}`}
                    onClick={() => setActiveTab('deposited')}
                >
                    <FontAwesomeIcon icon={faCalendarCheck} /> Kế hoạch đã đặt cọc
                </button>
                <button
                    className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    <FontAwesomeIcon icon={faMoneyBill} /> Giao dịch
                </button>
            </div>

            <div className="content-section">
                {activeTab === 'other' && (
                    <>
                        <h2>Kế Hoạch Khác</h2>
                        {renderPlanList(otherPlans)}
                    </>
                )}

                {activeTab === 'deposited' && (
                    <>
                        <h2>Kế Hoạch Đã Đặt Cọc</h2>
                        {renderPlanList(depositedPlans)}
                    </>
                )}

                {activeTab === 'transactions' && renderTransactionList()}
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
                                    {selectedPlan.UserId && (
                                        <p><span className="label">Khách Hàng:</span> <span className="value">{selectedPlan.UserId.name || 'N/A'}</span></p>
                                    )}
                                    <p>
                                        <span className="label">Trạng thái:</span>
                                        <span className={`value status ${selectedPlan.status === 'Đã đặt cọc' ? 'deposited' : 'not-deposited'}`}>
                                            {selectedPlan.status}
                                        </span>
                                    </p>
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

// Thêm CSS vào cuối file, trước export default
const styles = `
<style>
.status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9em;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.status-badge.status-deposited {
    background-color: #4CAF50;
    color: white;
}

.status-badge.status-canceled {
    background-color: #f44336;
    color: white;
}

.status-badge.status-active {
    background-color: #2196F3;
    color: white;
}

.status-badge.status-pending {
    background-color: #ff9800;
    color: white;
}

.status-badge svg {
    font-size: 0.9em;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', styles);

export default PlansManagement;