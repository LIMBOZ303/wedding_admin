import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import '../public/styles/Transaction.css';
import { fetchTransaction } from '../api/transaction_api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
  faSearch,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from './LoadingSpinner';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [error, setError] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [loadingPlanDetails, setLoadingPlanDetails] = useState(false);

  const lastFetchTime = useRef(Date.now());
  const isMounted = useRef(true);
  const lastVisibilityChange = useRef(Date.now());
  const minimumRefreshInterval = 600000; // 10 phút (600,000 ms)

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const getTransactions = useCallback(
    async (force = false) => {
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
        
        if (data.status) {
          if (!Array.isArray(data.data)) {
            throw new Error('Dữ liệu giao dịch không hợp lệ');
          }

          const sortedData = [...data.data].sort((a, b) => {
            if (!a.status || !b.status || !a.createdAt || !b.createdAt) {
              console.warn('Giao dịch thiếu trường cần thiết:', a, b);
              return 0;
            }
            if (a.status === 'Chưa kích hoạt' && b.status !== 'Chưa kích hoạt') return -1;
            if (a.status !== 'Chưa kích hoạt' && b.status === 'Chưa kích hoạt') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

          setTransactions(sortedData);
        } else {
          throw new Error(data.message || 'Không lấy được danh sách giao dịch');
        }
      } catch (err) {
        setError(`Lỗi: ${err.message}`);
        console.error('Lỗi khi lấy danh sách giao dịch:', err.message);
      } finally {
        setLoadingTransactions(false);
      }
    },
    [userId, userRole]
  );

  // Initial fetch
  useEffect(() => {
    getTransactions(true);
  }, [getTransactions]);

  // Auto refresh và xử lý visibility
  useEffect(() => {
    let intervalId;

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (!document.hidden) {
        // Chỉ refresh nếu đã qua 10 phút
        if (now - lastVisibilityChange.current >= minimumRefreshInterval) {
          lastVisibilityChange.current = now;
          getTransactions(true);
        }
      }
    };

    // Set up interval refresh
    intervalId = setInterval(() => {
      if (!document.hidden) {
        getTransactions();
      }
    }, 600000); // Refresh mỗi 10 phút khi tab đang active

    // Thêm event listener cho visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getTransactions]);

  const confirmTransaction = useCallback(
    async (transactionId) => {
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
    },
    [userId, userRole, getTransactions]
  );

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      if (!searchTerm) return true;

      const searchString = searchTerm.toLowerCase();
      return (
        (tx._id && String(tx._id).toLowerCase().includes(searchString)) ||
        (tx.userId?.name && tx.userId.name.toLowerCase().includes(searchString)) ||
        (tx.userId?.email && tx.userId.email.toLowerCase().includes(searchString)) ||
        (tx.planName && tx.planName.toLowerCase().includes(searchString))
      );
    });
  }, [transactions, searchTerm]);

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
    }

    console.log('sortedTransactions:', sortableItems);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchPlanDetails = async (planId) => {
    if (!planId) return;
    
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
      }
    } catch (err) {
      console.error('Lỗi khi lấy thông tin kế hoạch:', err);
    } finally {
      setLoadingPlanDetails(false);
    }
  };

  const handleRowClick = async (transaction) => {
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

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h2>Quản lý Giao dịch</h2>
        <div className="header-actions">
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên, email..."
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
        <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
          {error}
        </div>
      )}

      <div className="transactions-content">
        {loadingTransactions ? (
          <LoadingSpinner size="large" text="Đang tải dữ liệu..." />
        ) : transactions.length === 0 ? (
          <div className="no-data">
            <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
            <p>Không có giao dịch nào trong hệ thống</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="no-data">
            <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
            <p>Không tìm thấy giao dịch khớp với tìm kiếm</p>
            <button onClick={() => setSearchTerm('')} className="clear-search-button">
              Xóa tìm kiếm
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
                  <th>Hành động</th>
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
                    <td data-full-text={tx.userId?.name || 'N/A'}>{tx.userId?.name || 'N/A'}</td>
                    <td data-full-text={tx.userId?.email || 'N/A'}>{tx.userId?.email || 'N/A'}</td>
                    <td data-full-text={tx.planName || 'Không có tên kế hoạch'}>
                      {tx.planName || 'Không có tên kế hoạch'}
                    </td>
                    <td>{getStatusBadge(tx.status)}</td>
                    <td>
                      {tx.status === 'Đã đặt cọc' || tx.status === 'Đã hủy' ? (
                        <button
                          className="button-disabled"
                          disabled
                          title={
                            tx.status === 'Đã đặt cọc'
                              ? 'Giao dịch đã được đặt cọc'
                              : 'Giao dịch đã bị hủy'
                          }
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} /> Xác nhận
                        </button>
                      ) : (
                        <button
                          className="button-confirm"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmTransaction(tx._id);
                          }}
                          disabled={loadingConfirm[tx._id]}
                          title="Nhấn để xác nhận giao dịch"
                        >
                          <FontAwesomeIcon icon={faCheckCircle} /> Xác nhận
                        </button>
                      )}
                    </td>
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
                  {selectedTransaction.planName || 'Không có tên kế hoạch'}
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
                <LoadingSpinner size="small" text="Đang tải thông tin kế hoạch..." />
              ) : planDetails ? (
                <>
                  <div className="section-title">Chi tiết kế hoạch</div>
                  <div className="plan-details-section">
                    <div className="plan-image-container">
                      <img 
                        src={planDetails.image || 'placeholder.jpg'} 
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
                        <span className="detail-value price">
                          {planDetails.totalPrice?.toLocaleString('vi-VN')} VNĐ
                        </span>
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
                      <div className="detail-group">
                        <span className="detail-label">Dịch vụ</span>
                        <div className="services-list">
                          {planDetails.services?.map((service, index) => (
                            <div key={index} className="service-item">
                              {service.name} - {service.price?.toLocaleString('vi-VN')} VNĐ
                            </div>
                          )) || 'Không có dịch vụ'}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-plan-details">
                  Không có thông tin chi tiết kế hoạch
                </div>
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
}

export default Transactions;