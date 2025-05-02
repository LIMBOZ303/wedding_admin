import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPlans, fetchPlanDetails } from '../../api/plan_api';
import { fetchTransactions, confirmTransaction } from '../../api/transaction_api';
import PlanList from './PlanList';
import TransactionList from './TransactionList';
import PlanDetailModal from './PlanDetailModal';
import TransactionDetailModal from './TransactionDetailModal';
import LoadingSpinner from '../LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { formatDate, getStatusBadge } from './utils';

const PlansManagement = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('plans');
    const [plans, setPlans] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [planDetails, setPlanDetails] = useState(null);
    const [loadingPlanDetails, setLoadingPlanDetails] = useState(false);
    const [loadingConfirm, setLoadingConfirm] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [transactionStatusFilter, setTransactionStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Fetch plans and transactions on component mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const plansData = await fetchPlans();
            setPlans(plansData);
            
            if (user?.role === 'admin') {
                setLoadingTransactions(true);
                const transactionsData = await fetchTransactions();
                setTransactions(transactionsData);
            }
        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
            setLoadingTransactions(false);
        }
    };

    const handlePlanClick = async (plan) => {
        setSelectedPlan(plan);
        setLoadingPlanDetails(true);
        try {
            const details = await fetchPlanDetails(plan._id);
            setPlanDetails(details);
        } catch (err) {
            console.error('Error fetching plan details:', err);
        } finally {
            setLoadingPlanDetails(false);
        }
    };

    const handleTransactionClick = async (transaction) => {
        setSelectedTransaction(transaction);
        if (transaction.planId) {
            setLoadingPlanDetails(true);
            try {
                const details = await fetchPlanDetails(transaction.planId);
                setPlanDetails(details);
            } catch (err) {
                console.error('Error fetching plan details:', err);
            } finally {
                setLoadingPlanDetails(false);
            }
        }
    };

    const handleConfirmTransaction = async (transactionId) => {
        try {
            setLoadingConfirm(prev => ({ ...prev, [transactionId]: true }));
            await confirmTransaction(transactionId);
            await fetchData();
        } catch (err) {
            console.error('Error confirming transaction:', err);
        } finally {
            setLoadingConfirm(prev => ({ ...prev, [transactionId]: false }));
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.planName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = transactionStatusFilter === 'all' || transaction.status === transactionStatusFilter;
        return matchesSearch && matchesStatus;
    });

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="plans-management">
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
                    onClick={() => setActiveTab('plans')}
                >
                    Kế hoạch
                </button>
                {user?.role === 'admin' && (
                    <button
                        className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transactions')}
                    >
                        Giao dịch
                    </button>
                )}
            </div>

            {error && (
                <div className="error-message">
                    <FontAwesomeIcon icon={faExclamationCircle} />
                    {error}
                </div>
            )}

            {activeTab === 'plans' ? (
                loading ? (
                    <LoadingSpinner text="Đang tải danh sách kế hoạch..." />
                ) : (
                    <PlanList
                        plans={plans}
                        onPlanClick={handlePlanClick}
                    />
                )
            ) : (
                <TransactionList
                    transactions={transactions}
                    filteredTransactions={filteredTransactions}
                    sortedTransactions={sortedTransactions}
                    loadingTransactions={loadingTransactions}
                    error={error}
                    searchTerm={searchTerm}
                    transactionStatusFilter={transactionStatusFilter}
                    sortConfig={sortConfig}
                    onRowClick={handleTransactionClick}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    onStatusFilterChange={(e) => setTransactionStatusFilter(e.target.value)}
                    onSort={handleSort}
                    getSortIcon={getSortIcon}
                />
            )}

            {selectedPlan && (
                <PlanDetailModal
                    plan={selectedPlan}
                    planDetails={planDetails}
                    loadingPlanDetails={loadingPlanDetails}
                    onClose={() => {
                        setSelectedPlan(null);
                        setPlanDetails(null);
                    }}
                />
            )}

            {selectedTransaction && (
                <TransactionDetailModal
                    transaction={selectedTransaction}
                    planDetails={planDetails}
                    loadingPlanDetails={loadingPlanDetails}
                    loadingConfirm={loadingConfirm}
                    userRole={user?.role}
                    onClose={() => {
                        setSelectedTransaction(null);
                        setPlanDetails(null);
                    }}
                    onConfirm={handleConfirmTransaction}
                />
            )}
        </div>
    );
};

export default PlansManagement; 