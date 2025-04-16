import React from 'react';
import '../public/styles/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', variant = 'default', text, className = '', containerClassName = '' }) => {
    const getSpinnerClass = () => {
        switch (size) {
            case 'small':
                return 'loading-spinner small';
            case 'large':
                return 'loading-spinner large';
            default:
                return 'loading-spinner';
        }
    };

    const getSpinnerVariant = () => {
        switch (variant) {
            case 'button':
                return 'button-spinner';
            case 'table':
                return 'table-spinner';
            case 'card':
                return 'card-spinner';
            default:
                return getSpinnerClass();
        }
    };

    return (
        <div className={`spinner-container ${containerClassName} ${variant === 'default' ? 'pulse' : ''}`}>
            <div className={`${getSpinnerVariant()} ${className}`} />
            {text && <span className="loading-text">{text}</span>}
        </div>
    );
};

export default LoadingSpinner;
