import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faTimes, faList, faCheck, faSearch, faSpinner, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { createCombo } from '../api/combo_api';
import { fetchCatering } from '../api/catering_api';
import { fetchDecorate } from '../api/decorate_api';
import { fetchGifts } from '../api/gift_api';
import { fetchLobbies } from '../api/order_api';
import { fetchPlansNoUser, updatePlan, deletePlan } from '../api/plan_api';
import '../public/styles/ComboManagement.css';

const ComboManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [editedPlan, setEditedPlan] = useState(null);
    const [showLists, setShowLists] = useState({
        sanh: false,
        catering: false,
        decorate: false,
        present: false
    });
    const [currentCombo, setCurrentCombo] = useState({
        name: '',
        SanhId: '',
        cateringId: [],
        decorateId: [],
        presentId: []
    });
    const [options, setOptions] = useState({
        sanh: [],
        catering: [],
        decorate: [],
        present: []
    });
    const [plansNoUser, setPlansNoUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [filters, setFilters] = useState({
        sanh: '',
        catering: '',
        decorate: '',
        present: ''
    });

    const calculateTotalPrice = (combo) => {
        let total = 0;
        const selectedLobby = options.sanh.find(item => item._id === combo.SanhId);
        if (selectedLobby) total += selectedLobby.price;
        combo.cateringId.forEach(id => {
            const item = options.catering.find(item => item._id === id);
            if (item) total += item.price;
        });
        combo.decorateId.forEach(id => {
            const item = options.decorate.find(item => item._id === id);
            if (item) total += item.price;
        });
        combo.presentId.forEach(id => {
            const item = options.present.find(item => item._id === id);
            if (item) total += item.price;
        });
        return total;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [lobbyRes, cateringRes, decorateRes, presentRes, plansNoUserRes] = await Promise.all([
                fetchLobbies(),
                fetchCatering(),
                fetchDecorate(),
                fetchGifts(),
                fetchPlansNoUser()
            ]);
            setOptions({
                sanh: lobbyRes.data || [],
                catering: cateringRes.data || [],
                decorate: decorateRes.data || [],
                present: presentRes.data || []
            });
            setPlansNoUser(plansNoUserRes || []);
        } catch (err) {
            setError('Không thể tải dữ liệu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleItem = (type, id, isEditMode = false) => {
        if (isEditMode) {
            setEditedPlan(prev => {
                const currentIds = prev[type];
                if (currentIds.includes(id)) {
                    return { ...prev, [type]: currentIds.filter(item => item !== id) };
                }
                return { ...prev, [type]: [...currentIds, id] };
            });
        } else {
            setCurrentCombo(prev => {
                const currentIds = prev[type];
                if (currentIds.includes(id)) {
                    return { ...prev, [type]: currentIds.filter(item => item !== id) };
                }
                return { ...prev, [type]: [...currentIds, id] };
            });
        }
    };

    const handleSelectLobby = (id, isEditMode = false) => {
        if (isEditMode) {
            setEditedPlan(prev => ({ ...prev, SanhId: id }));
        } else {
            setCurrentCombo(prev => ({ ...prev, SanhId: id }));
        }
    };

    const handleSaveCombo = async () => {
        if (!currentCombo.name || !currentCombo.SanhId) {
            setError('Vui lòng nhập Tên Combo và chọn Sảnh!');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await createCombo(currentCombo);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                closeModal();
                fetchData();
            }, 2000);
        } catch (err) {
            setError('Có lỗi khi thêm combo');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => {
        setCurrentCombo({ name: '', SanhId: '', cateringId: [], decorateId: [], presentId: [] });
        setShowLists({ sanh: false, catering: false, decorate: false, present: false });
        setShowModal(true);
        setError(null);
        setSuccess(false);
    };

    const closeModal = () => {
        setShowModal(false);
        setError(null);
    };

    const openDetailModal = (plan) => {
        setSelectedPlan(plan);
        setEditedPlan({
            ...plan,
            SanhId: plan.SanhId?._id || plan.SanhId,
            cateringId: plan.caterings.map(item => item._id),
            decorateId: plan.decorates.map(item => item._id),
            presentId: plan.presents.map(item => item._id),
        });
        setShowDetailModal(true);
        setIsEditing(false);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedPlan(null);
        setEditedPlan(null);
        setIsEditing(false);
        setShowLists({ sanh: false, catering: false, decorate: false, present: false });
    };

    const toggleList = (type) => {
        setShowLists(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleFilterChange = (type, value) => {
        setFilters(prev => ({ ...prev, [type]: value }));
    };

    const getFilteredItems = (type) => {
        const searchTerm = filters[type].toLowerCase();
        return options[type].filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        );
    };

    const handleEditPlan = () => {
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (!editedPlan.name || !editedPlan.SanhId) {
            setError('Vui lòng nhập Tên Combo và chọn Sảnh!');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const updatedData = {
                name: editedPlan.name,
                SanhId: editedPlan.SanhId,
                plandateevent: editedPlan.plandateevent,
                plansoluongkhach: editedPlan.plansoluongkhach,
                status: editedPlan.status,
                caterings: editedPlan.cateringId,
                decorates: editedPlan.decorateId,
                presents: editedPlan.presentId,
            };
            await updatePlan(selectedPlan._id, updatedData);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                closeDetailModal();
                fetchData();
            }, 2000);
        } catch (err) {
            setError('Có lỗi khi cập nhật plan');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlan = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa plan này?')) {
            setLoading(true);
            setError(null);
            try {
                await deletePlan(selectedPlan._id);
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    closeDetailModal();
                    fetchData();
                }, 2000);
            } catch (err) {
                setError('Có lỗi khi xóa plan');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const renderList = (type, items, selectedIds, isEditMode = false) => {
        const typeMap = {
            sanh: { idField: 'SanhId', singleSelect: true },
            catering: { idField: 'cateringId', singleSelect: false },
            decorate: { idField: 'decorateId', singleSelect: false },
            present: { idField: 'presentId', singleSelect: false }
        };
        const { idField, singleSelect } = typeMap[type];

        return (
            <div className="form-group">
                <div className="form-group-header">
                    <label>{type === 'sanh' ? 'Sảnh' : type === 'catering' ? 'Dịch Vụ Ẩm Thực' : type === 'decorate' ? 'Dịch Vụ Trang Trí' : 'Dịch Vụ Quà Tặng'} {type === 'sanh' && <span className="required">*</span>}</label>
                    <button 
                        className={`list-btn ${showLists[type] ? 'active' : ''}`} 
                        onClick={() => toggleList(type)}
                    >
                        <FontAwesomeIcon icon={faList} /> {showLists[type] ? 'Ẩn' : 'Hiện'}
                    </button>
                </div>
                {showLists[type] && (
                    <div className="list-container">
                        <div className="search-container">
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            <input
                                type="text"
                                placeholder={`Tìm kiếm ${type === 'sanh' ? 'sảnh' : type === 'catering' ? 'dịch vụ ẩm thực' : type === 'decorate' ? 'dịch vụ trang trí' : 'quà tặng'}...`}
                                value={filters[type]}
                                onChange={(e) => handleFilterChange(type, e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="item-list">
                            {getFilteredItems(type).map(item => (
                                <div 
                                    key={item._id} 
                                    className={`list-item ${singleSelect ? selectedIds === item._id : selectedIds.includes(item._id) ? 'selected' : ''}`}
                                    onClick={() => singleSelect ? handleSelectLobby(item._id, isEditMode) : handleToggleItem(idField, item._id, isEditMode)}
                                >
                                    <div className="selection-indicator">
                                        <input
                                            type={singleSelect ? 'radio' : 'checkbox'}
                                            name={singleSelect ? 'sanh' : type}
                                            checked={singleSelect ? selectedIds === item._id : selectedIds.includes(item._id)}
                                            onChange={() => {}}
                                            disabled={loading}
                                        />
                                        {(singleSelect ? selectedIds === item._id : selectedIds.includes(item._id)) && (
                                            <span className="checkmark">
                                                <FontAwesomeIcon icon={faCheck} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="item-image-container">
                                        <img
                                            src={item.imageUrl || 'https://via.placeholder.com/100'}
                                            alt={item.name}
                                            className="item-image"
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <div className="item-info">
                                            <span className="price">{item.price.toLocaleString()} VNĐ</span>
                                            {type === 'sanh' && <span className="capacity">{item.SoLuongKhach} khách</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {getFilteredItems(type).length === 0 && (
                                <div className="no-results">Không tìm thấy {type === 'sanh' ? 'sảnh' : 'dịch vụ'} phù hợp</div>
                            )}
                        </div>
                    </div>
                )}
                {(singleSelect ? selectedIds : selectedIds.length > 0) && (
                    <div className="selected-summary">
                        <span>Đã chọn: </span>
                        {singleSelect 
                            ? options[type].find(item => item._id === selectedIds)?.name 
                            : `${selectedIds.length} dịch vụ`}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="combo-management">
            <div className="header">
                <h1>Quản lý Combo</h1>
                <button className="add-btn" onClick={openModal} disabled={loading}>
                    <FontAwesomeIcon icon={faPlus} /> Thêm Combo
                </button>
            </div>

            {/* Danh sách Plans không có User */}
            <div className="plans-no-user-section">
                <h2>Combo</h2>
                {loading ? (
                    <div className="loading"><FontAwesomeIcon icon={faSpinner} spin /> Đang tải...</div>
                ) : plansNoUser.length > 0 ? (
                    <div className="plans-list">
                        {plansNoUser.map(plan => (
                            <div key={plan._id} className="plan-item" onClick={() => openDetailModal(plan)}>
                                <div className="plan-image-container">
                                    <img
                                        src={plan.SanhId?.imageUrl || 'https://via.placeholder.com/150'}
                                        alt={plan.name}
                                        className="plan-image"
                                    />
                                </div>
                                <div className="plan-details">
                                    <h3>{plan.name}</h3>
                                    <p><strong>Sảnh:</strong> {plan.SanhId?.name || 'N/A'}</p>
                                    <p><strong>Tổng giá:</strong> {plan.totalPrice.toLocaleString()} VNĐ</p>
                                    <p><strong>Ngày sự kiện:</strong> {plan.plandateevent || 'Chưa xác định'}</p>
                                    <p><strong>Trạng thái:</strong> {plan.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Không có plan nào không liên kết với người dùng.</p>
                )}
            </div>

            {/* Modal Thêm Combo */}
            {showModal && (
                <div className="modal-overlay" onClick={e => {
                    if (e.target.className === 'modal-overlay') closeModal();
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Thêm Combo</h2>
                            <button className="close-btn" onClick={closeModal}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        
                        {error && <div className="error-message"><FontAwesomeIcon icon={faTimes} /> {error}</div>}
                        {success && <div className="success-message"><FontAwesomeIcon icon={faCheck} /> Thêm combo thành công!</div>}
                        {loading && <div className="loading"><FontAwesomeIcon icon={faSpinner} spin /> Đang tải...</div>}

                        <div className="form-group">
                            <label htmlFor="combo-name">Tên Combo <span className="required">*</span></label>
                            <input
                                id="combo-name"
                                type="text"
                                value={currentCombo.name}
                                onChange={(e) => setCurrentCombo(prev => ({ ...prev, name: e.target.value }))}
                                disabled={loading}
                                placeholder="Nhập tên combo..."
                            />
                        </div>

                        {renderList('sanh', options.sanh, currentCombo.SanhId)}
                        {renderList('catering', options.catering, currentCombo.cateringId)}
                        {renderList('decorate', options.decorate, currentCombo.decorateId)}
                        {renderList('present', options.present, currentCombo.presentId)}

                        <div className="combo-summary">
                            <div className="summary-header">
                                <h3>Tổng cộng</h3>
                                <div className="total-price">{calculateTotalPrice(currentCombo).toLocaleString()} VNĐ</div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="save-btn" onClick={handleSaveCombo} disabled={loading || success}>
                                <FontAwesomeIcon icon={loading ? faSpinner : faSave} spin={loading} /> 
                                {loading ? 'Đang lưu...' : 'Lưu Combo'}
                            </button>
                            <button className="cancel-btn" onClick={closeModal} disabled={loading}>
                                <FontAwesomeIcon icon={faTimes} /> Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Chi Tiết Plan */}
            {showDetailModal && selectedPlan && (
    <div className="modal-overlay" onClick={e => {
        if (e.target.className === 'modal-overlay') closeDetailModal();
    }}>
        <div className="modal-content">
            <div className="modal-header">
                <h2>{isEditing ? 'Chỉnh Sửa Combo' : 'Chi Tiết Combo'}: {selectedPlan.name}</h2>
                <button className="close-btn" onClick={closeDetailModal}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            {error && <div className="error-message"><FontAwesomeIcon icon={faTimes} /> {error}</div>}
            {success && <div className="success-message"><FontAwesomeIcon icon={faCheck} /> {isEditing ? 'Cập nhật' : 'Xóa'} thành công!</div>}
            {loading && <div className="loading"><FontAwesomeIcon icon={faSpinner} spin /> Đang xử lý...</div>}

            {isEditing ? (
                /* Phần chỉnh sửa giữ nguyên */
                <>
                    <div className="form-group">
                        <label htmlFor="edit-combo-name">Tên Combo <span className="required">*</span></label>
                        <input
                            id="edit-combo-name"
                            type="text"
                            value={editedPlan.name}
                            onChange={(e) => setEditedPlan(prev => ({ ...prev, name: e.target.value }))}
                            disabled={loading}
                            placeholder="Nhập tên combo..."
                            className="edit-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Ngày Sự Kiện</label>
                        <input
                            type="text"
                            value={editedPlan.plandateevent || ''}
                            onChange={(e) => setEditedPlan(prev => ({ ...prev, plandateevent: e.target.value }))}
                            disabled={loading}
                            placeholder="Ngày sự kiện (dd/mm/yyyy)"
                            className="edit-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Số Lượng Khách</label>
                        <input
                            type="number"
                            value={editedPlan.plansoluongkhach || ''}
                            onChange={(e) => setEditedPlan(prev => ({ ...prev, plansoluongkhach: Number(e.target.value) }))}
                            disabled={loading}
                            placeholder="Số lượng khách"
                            className="edit-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Trạng Thái</label>
                        <select
                            value={editedPlan.status}
                            onChange={(e) => setEditedPlan(prev => ({ ...prev, status: e.target.value }))}
                            disabled={loading}
                            className="edit-input"
                        >
                            <option value="Chưa kích hoạt">Chưa kích hoạt</option>
                            <option value="Đã kích hoạt">Đã kích hoạt</option>
                            <option value="Hủy">Hủy</option>
                        </select>
                    </div>

                    {renderList('sanh', options.sanh, editedPlan.SanhId, true)}
                    {renderList('catering', options.catering, editedPlan.cateringId, true)}
                    {renderList('decorate', options.decorate, editedPlan.decorateId, true)}
                    {renderList('present', options.present, editedPlan.presentId, true)}

                    <div className="combo-summary">
                        <div className="summary-header">
                            <h3>Tổng cộng</h3>
                            <div className="total-price">{calculateTotalPrice(editedPlan).toLocaleString()} VNĐ</div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Phần thông tin cơ bản của combo */}
                    <div className="plan-detail-section">
                        <div className="plan-details">
                            <h3 className="plan-name">{selectedPlan.name}</h3>
                            <div className="plan-info">
                                <p><span className="label">Tổng giá:</span> <span className="value price">{selectedPlan.totalPrice.toLocaleString()} VNĐ</span></p>
                                <p><span className="label">Ngày sự kiện:</span> <span className="value">{selectedPlan.plandateevent ? new Date(selectedPlan.plandateevent).toLocaleDateString('vi-VN') : 'Chưa xác định'}</span></p>
                                <p><span className="label">Số lượng khách:</span> <span className="value">{selectedPlan.plansoluongkhach || 'Chưa xác định'}</span></p>
                                <p><span className="label">Trạng thái:</span> <span className={`value status ${selectedPlan.status === 'Chưa kích hoạt' ? 'inactive' : selectedPlan.status === 'Đã kích hoạt' ? 'active' : 'canceled'}`}>{selectedPlan.status}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Phần chi tiết sảnh riêng biệt */}
                    <div className="sanh-detail-section">
                        <h3>Chi Tiết Sảnh</h3>
                        <div className="sanh-content">
                            <div className="sanh-image-container">
                                <img
                                    src={selectedPlan.SanhId?.imageUrl || 'https://via.placeholder.com/150'}
                                    alt={selectedPlan.SanhId?.name || 'Sảnh'}
                                    className="sanh-image"
                                />
                            </div>
                            <div className="sanh-details">
                                <p><span className="label">Tên sảnh:</span> <span className="value">{selectedPlan.SanhId?.name || 'N/A'}</span></p>
                                <p><span className="label">Giá:</span> <span className="value price">{selectedPlan.SanhId?.price.toLocaleString() || 'N/A'} VNĐ</span></p>
                                <p><span className="label">Số lượng khách tối đa:</span> <span className="value">{selectedPlan.SanhId?.SoLuongKhach || 'N/A'}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Dịch Vụ Ẩm Thực */}
                    <div className="form-group">
                        <h3>Dịch Vụ Ẩm Thực</h3>
                        {selectedPlan.caterings.length > 0 ? (
                            <div className="item-list">
                                {selectedPlan.caterings.map(item => (
                                    <div key={item._id} className="list-item">
                                        <div className="item-image-container">
                                            <img
                                                src={item.imageUrl || 'https://via.placeholder.com/100'}
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
                        ) : (
                            <p>Không có dịch vụ ẩm thực nào.</p>
                        )}
                    </div>

                    {/* Dịch Vụ Trang Trí */}
                    <div className="form-group">
                        <h3>Dịch Vụ Trang Trí</h3>
                        {selectedPlan.decorates.length > 0 ? (
                            <div className="item-list">
                                {selectedPlan.decorates.map(item => (
                                    <div key={item._id} className="list-item">
                                        <div className="item-image-container">
                                            <img
                                                src={item.imageUrl || 'https://via.placeholder.com/100'}
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
                        ) : (
                            <p>Không có dịch vụ trang trí nào.</p>
                        )}
                    </div>

                    {/* Dịch Vụ Quà Tặng */}
                    <div className="form-group">
                        <h3>Dịch Vụ Quà Tặng</h3>
                        {selectedPlan.presents.length > 0 ? (
                            <div className="item-list">
                                {selectedPlan.presents.map(item => (
                                    <div key={item._id} className="list-item">
                                        <div className="item-image-container">
                                            <img
                                                src={item.imageUrl || 'https://via.placeholder.com/100'}
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
                        ) : (
                            <p>Không có dịch vụ quà tặng nào.</p>
                        )}
                    </div>
                </>
            )}

            <div className="modal-actions">
                {!isEditing ? (
                    <>
                        <button className="edit-btn" onClick={handleEditPlan} disabled={loading}>
                            <FontAwesomeIcon icon={faEdit} /> Sửa
                        </button>
                        <button className="delete-btn" onClick={handleDeletePlan} disabled={loading}>
                            <FontAwesomeIcon icon={faTrash} /> Xóa
                        </button>
                        <button className="cancel-btn" onClick={closeDetailModal} disabled={loading}>
                            <FontAwesomeIcon icon={faTimes} /> Đóng
                        </button>
                    </>
                ) : (
                    <>
                        <button className="save-btn" onClick={handleSaveEdit} disabled={loading}>
                            <FontAwesomeIcon icon={loading ? faSpinner : faSave} spin={loading} /> 
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button className="cancel-btn" onClick={closeDetailModal} disabled={loading}>
                            <FontAwesomeIcon icon={faTimes} /> Hủy
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default ComboManagement;