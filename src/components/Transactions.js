import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import '../public/styles/Transaction.css';
import { fetchTransaction } from '../api/transaction_api';
import { fetchPlanById } from '../api/plan_api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
  faSearch,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [planNames, setPlanNames] = useState({});
  const [loadingPlanNames, setLoadingPlanNames] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [error, setError] = useState(null);

  const planRequestsInProgress = useRef(new Set());
  const lastFetchTime = useRef(Date.now());
  const isMounted = useRef(true);

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Hàm lấy thông tin tên kế hoạch với timeout
  const fetchPlanName = useCallback(async (planId) => {
    if (loadingPlanNames[planId] || planNames[planId] || planRequestsInProgress.current.has(planId)) return;

    planRequestsInProgress.current.add(planId);
    try {
      setLoadingPlanNames((prev) => ({ ...prev, [planId]: true }));
      const response = await Promise.race([
        fetchPlanById(planId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout fetching plan')), 5000)),
      ]);
      console.log(`Plan ${planId} response:`, response);
      if (isMounted.current && response.status) {
        setPlanNames((prev) => ({
          ...prev,
          [planId]: response.data.name || 'Không có tên kế hoạch',
        }));
      }
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin kế hoạch ${planId}:`, error.message);
      if (isMounted.current) {
        setPlanNames((prev) => ({ ...prev, [planId]: null }));
      }
    } finally {
      planRequestsInProgress.current.delete(planId);
      if (isMounted.current) {
        setLoadingPlanNames((prev) => ({ ...prev, [planId]: false }));
      }
    }
  }, []);

  // Batch fetch plan names
  const batchFetchPlanNames = useCallback(
    async (transactions) => {
      const uniquePlanIds = new Set();
      transactions.forEach((tx) => {
        if (tx.planId && !planNames[tx.planId] && !loadingPlanNames[tx.planId]) {
          uniquePlanIds.add(tx.planId);
        }
      });

      const batchSize = 5;
      const planIdArray = Array.from(uniquePlanIds);
      try {
        for (let i = 0; i < planIdArray.length; i += batchSize) {
          const batch = planIdArray.slice(i, i + batchSize);
          await Promise.all(batch.map((planId) => fetchPlanName(planId)));
        }
      } catch (error) {
        console.error('Lỗi khi lấy tên kế hoạch:', error.message);
        setError('Không thể lấy tên kế hoạch: ' + error.message);
      }
      console.log('planNames sau khi fetch:', planNames);
    },
    [fetchPlanName, planNames, loadingPlanNames]
  );

  const getTransactions = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force && now - lastFetchTime.current < 5000) {
        console.log('Bỏ qua fetch do chưa đủ thời gian debounce');
        return;
      }

      try {
        setLoadingTransactions(true);
        setError(null);
        lastFetchTime.current = now;

        if (!userId || !userRole) {
          throw new Error('Vui lòng đăng nhập với tài khoản admin');
        }

        console.log('Bắt đầu gọi API fetchTransaction...');
        const data = await Promise.race([
          fetchTransaction(userId, userRole),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout fetching transactions')), 10000)),
        ]);
        console.log('Phản hồi API:', data);

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

          console.log('Dữ liệu sau khi sắp xếp:', sortedData);
          setTransactions(sortedData);
          console.log('Đã gọi setTransactions với dữ liệu:', sortedData);
        } else {
          throw new Error(data.message || 'Không lấy được danh sách giao dịch');
        }
      } catch (err) {
        setError(`Lỗi: ${err.message}`);
        console.error('Lỗi khi lấy danh sách giao dịch:', err.message);
      } finally {
        setLoadingTransactions(false);
        console.log('loadingTransactions:', loadingTransactions);
        console.log('transactions sau khi set:', transactions);
      }
    },
    [userId, userRole]
  );

  // Gọi batchFetchPlanNames sau khi transactions được cập nhật
  useEffect(() => {
    if (transactions.length > 0) {
      console.log('Gọi batchFetchPlanNames vì transactions đã cập nhật:', transactions);
      batchFetchPlanNames(transactions);
    }
  }, [transactions, batchFetchPlanNames]);

  // Initial fetch
  useEffect(() => {
    console.log('Gọi getTransactions lần đầu...');
    getTransactions(true);
  }, [getTransactions]);

  // Auto refresh with increasing interval
  useEffect(() => {
    let interval = 30000;
    const maxInterval = 300000;

    const intervalId = setInterval(() => {
      if (document.hidden) {
        interval = Math.min(interval * 1.5, maxInterval);
      } else {
        interval = 30000;
      }
      console.log('Gọi getTransactions theo interval...');
      getTransactions();
    }, interval);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab được hiển thị, gọi getTransactions...');
        getTransactions(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

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
    console.log('Filtering with searchTerm:', searchTerm);
    return transactions.filter((tx) => {
      if (!searchTerm) return true;

      const searchString = searchTerm.toLowerCase();
      const matches =
        (tx._id && String(tx._id).toLowerCase().includes(searchString)) ||
        (tx.userId?.name && tx.userId.name.toLowerCase().includes(searchString)) ||
        (tx.userId?.email && tx.userId.email.toLowerCase().includes(searchString)) ||
        (planNames[tx.planId] && planNames[tx.planId].toLowerCase().includes(searchString));

      console.log(`Transaction ${tx._id} matches:`, matches);
      return matches;
    });
  }, [transactions, searchTerm, planNames]);

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
          aValue = planNames[a.planId] || '';
          bValue = planNames[b.planId] || '';
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
  }, [filteredTransactions, sortConfig, planNames]);

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

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
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
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
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
                    <td data-full-text={planNames[tx.planId] || 'Không có tên kế hoạch'}>
                      {loadingPlanNames[tx.planId] ? (
                        <span>Đang tải...</span>
                      ) : (
                        planNames[tx.planId] || 'Không có tên kế hoạch'
                      )}
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
                  {loadingPlanNames[selectedTransaction.planId] ? (
                    <div className="loading-name">
                      <div className="loading-spinner small"></div>
                      <span>Đang tải...</span>
                    </div>
                  ) : (
                    planNames[selectedTransaction.planId] || 'Không có tên kế hoạch'
                  )}
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
              {selectedTransaction.status !== 'Đã đặt cọc' &&
                selectedTransaction.status !== 'Đã hủy' &&
                userRole === 'admin' && (
                  <div className="detail-group">
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