import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import CategoryManagement from './components/CategoryManagement';
import ProductManagement from './components/ProductManagement';
import AccountManagement from './components/AccountManagement';
import ComboManagement from './components/ComboManagement';
import Statistics from './components/Statistics';
import Dashboard from './components/Dashboard';
import './public/styles/Home.css';
import './public/styles/Slidebar.css';
import Blog from './components/Blog';

const App = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/';

    return (
        <div className="app-container">
            {!isLoginPage && <Sidebar isOpen={true} />}
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<Dashboard />} />
                    <Route path="/categories" element={<CategoryManagement />} />
                    <Route path="/products" element={<ProductManagement />} />
                    <Route path="/accounts" element={<AccountManagement />} />
                    <Route path="/combos" element={<ComboManagement />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/blog" element={<Blog />} />
                </Routes>
            </div>
        </div>
    );
};

const AppWrapper = () => {
    return (
        <Router>
            <App />
        </Router>
    );
};

export default AppWrapper;