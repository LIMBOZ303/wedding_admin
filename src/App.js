import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './components/Login';
import CategoryManagement from './components/CategoryManagement';
import ProductManagement from './components/ProductManagement';
import AccountManagement from './components/AccountManagement';
import ComboManagement from './components/ComboManagement';
import Statistics from './components/Statistics';
import Dashboard from './components/Dashboard';
import Blog from './components/Blog';
import Transactions from './components/Transactions';
import CateringDetail from './components/CateringDetail';
import { AppProvider } from './AppContext';
import './public/styles/theme.css';
import './public/styles/Slidebar.css';
import './public/styles/Home.css';
import './App.css';

const App = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/';

    return (
        <div className="app-container">
            {!isLoginPage && <Sidebar />}
            <div className={`main-content ${isLoginPage ? 'login-page' : ''}`}>
                {!isLoginPage && <Navbar />}
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<Dashboard />} />
                    <Route path="/categories" element={<CategoryManagement />} />
                    <Route path="/products" element={<ProductManagement />} />
                    <Route path="/accounts" element={<AccountManagement />} />
                    <Route path="/combos" element={<ComboManagement />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/transaction" element={<Transactions />} />
                    <Route path="/catering/:id" element={<CateringDetail />} />
                </Routes>
            </div>
        </div>
    );
};

const AppWrapper = () => {
    return (
        <AppProvider>
            <Router>
                <App />
            </Router>
        </AppProvider>
    );
};

export default AppWrapper;
