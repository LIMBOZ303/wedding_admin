import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { createCombo } from '../api/combo_api';
import '../public/styles/ComboManagement.css';

const ComboManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [currentCombo, setCurrentCombo] = useState({
        name: '',
        SanhId: '',
        cateringId: [],
        decorateId: [],
        presentId: []
    });

    // Giả lập danh sách tùy chọn (thay bằng API thực tế nếu có)
    const sanhOptions = [
        { id: '67c53bb3c87f505698d5cd9e', name: 'Sảnh 1' }
    ];
    const cateringOptions = [
        { id: '67bf3bc616fc073e575f3e16', name: 'Ẩm thực 1' },
        { id: '67bf3ecc16fc073e575f3e28', name: 'Ẩm thực 2' },
        { id: '67bf3f8316fc073e575f3e2c', name: 'Ẩm thực 3' },
        { id: '67bf432516fc073e575f3e3e', name: 'Ẩm thực 4' }
    ];
    const decorateOptions = [
        { id: '67c52b9e4a00200b0ab153a8', name: 'Trang trí 1' },
        { id: '67c52c9a4a00200b0ab153b1', name: 'Trang trí 2' },
        { id: '67c52d4f4a00200b0ab153b4', name: 'Trang trí 3' }
    ];
    const presentOptions = [
        { id: 'pres1', name: 'MC 1' },
        { id: 'pres2', name: 'MC 2' }
    ];

    // Thêm combo mới
    const handleSaveCombo = async () => {
        // Validate required fields
        if (!currentCombo.name || !currentCombo.SanhId) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên Combo, Sảnh)!');
            return;
        }

        // Convert empty strings to null for optional fields
        const comboData = {
            ...currentCombo,
            cateringId: currentCombo.cateringId || [],
            decorateId: currentCombo.decorateId || [],
            presentId: currentCombo.presentId || []
        };

        try {
            console.log('Sending combo data:', comboData);
            await createCombo(comboData);
            alert('Thêm combo thành công!');
            setShowModal(false);
            setCurrentCombo({
                name: '',
                SanhId: '',
                cateringId: [],
                decorateId: [],
                presentId: []
            });
        } catch (error) {
            console.error('Lỗi khi thêm combo:', error);
            alert(error.message || 'Có lỗi xảy ra khi thêm combo!');
        }
    };

    // Mở modal để thêm combo
    const openModal = () => {
        setCurrentCombo({
            name: '',
            SanhId: '',
            cateringId: [],
            decorateId: [],
            presentId: []
        });
        setShowModal(true);
    };

    // Đóng modal
    const closeModal = () => {
        setShowModal(false);
        setCurrentCombo({
            name: '',
            SanhId: '',
            cateringId: [],
            decorateId: [],
            presentId: []
        });
    };

    return (
        <div className="combo-management">
            <div className="header">
                <h1>Quản lý Combo</h1>
                <button className="add-btn" onClick={openModal}>
                    <FontAwesomeIcon icon={faPlus} /> Thêm Combo
                </button>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Thêm Combo</h2>
                        <div className="form-group">
                            <label>Tên Combo *</label>
                            <input 
                                type="text" 
                                value={currentCombo.name} 
                                onChange={(e) => setCurrentCombo({ ...currentCombo, name: e.target.value })} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Sảnh *</label>
                            <select 
                                value={currentCombo.SanhId} 
                                onChange={(e) => setCurrentCombo({ ...currentCombo, SanhId: e.target.value })}
                            >
                                <option value="">Chọn sảnh</option>
                                {sanhOptions.map(sanh => (
                                    <option key={sanh.id} value={sanh.id}>{sanh.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Dịch Vụ Ẩm Thực</label>
                            <select 
                                multiple 
                                value={currentCombo.cateringId} 
                                onChange={(e) => setCurrentCombo({ ...currentCombo, cateringId: Array.from(e.target.selectedOptions, option => option.value) })}
                            >
                                {cateringOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Dịch Vụ Trang Trí</label>
                            <select 
                                multiple 
                                value={currentCombo.decorateId} 
                                onChange={(e) => setCurrentCombo({ ...currentCombo, decorateId: Array.from(e.target.selectedOptions, option => option.value) })}
                            >
                                {decorateOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Dịch Vụ MC</label>
                            <select 
                                multiple 
                                value={currentCombo.presentId} 
                                onChange={(e) => setCurrentCombo({ ...currentCombo, presentId: Array.from(e.target.selectedOptions, option => option.value) })}
                            >
                                {presentOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="save-btn" onClick={handleSaveCombo}>
                                <FontAwesomeIcon icon={faSave} /> Lưu
                            </button>
                            <button className="cancel-btn" onClick={closeModal}>
                                <FontAwesomeIcon icon={faTimes} /> Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComboManagement;