import React, { useState, useEffect, useRef, useContext } from 'react';
import { fetchChatHistory, fetchAllChatUsers } from '../api/chat_api';
import { getUserById } from '../api/users_api';
import { io } from 'socket.io-client';
import '../styles/AdminChat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppContext } from '../AppContext';
import {
    faPaperPlane,
    faSync,
    faUser,
    faInfoCircle,
    faClock,
    faEnvelope,
    faArrowDown,
    faImage,
    faTimes,
    faExpand,
    faEdit,
    faSave,
    faSpinner,
    faCheck,
    faList
} from '@fortawesome/free-solid-svg-icons';
import { fetchLobbies } from '../api/order_api';
import { fetchCatering } from '../api/catering_api';
import { fetchDecorate } from '../api/decorate_api';
import { fetchGifts } from '../api/gift_api';
import Swal from 'sweetalert2';

const UserNameDisplay = ({ userName, highlight = false, fallback = 'Khách hàng' }) => {
    const displayName = userName || fallback;

    return (
        <span className={highlight ? "user-name-highlight" : "sender-name"}>
            {displayName}
        </span>
    );
};

const AdminChat = () => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserInfo, setCurrentUserInfo] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [userLoading, setUserLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [currentPlanId, setCurrentPlanId] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [localUnreadCount, setLocalUnreadCount] = useState(0);
    const [imageUpload, setImageUpload] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImage, setModalImage] = useState('');
    const [refreshingUsers, setRefreshingUsers] = useState(false);
    const [refreshingMessages, setRefreshingMessages] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editedPlan, setEditedPlan] = useState(null);
    const [planDetails, setPlanDetails] = useState(null);
    const [planOptions, setPlanOptions] = useState({
        sanh: [],
        catering: [],
        decorate: [],
        present: []
    });
    const [planLoading, setPlanLoading] = useState(false);
    const [planError, setPlanError] = useState(null);
    const [planSuccess, setPlanSuccess] = useState(false);
    const [showLists, setShowLists] = useState({
        sanh: false,
        catering: false,
        decorate: false,
        present: false
    });

    const appContext = useContext(AppContext) || {};
    const setUnreadMessages = appContext.setUnreadMessages || (() => {
        console.warn('setUnreadMessages not available in AppContext, using local state');
        setLocalUnreadCount(prev => prev + 1);
    });

    const clonePlan = async (planId) => {
        try {
            const response = await fetch(`https://apidatn.onrender.com/plan/clone/${planId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (result.success) {
                return result.data;
            }
            throw new Error('Không thể clone kế hoạch');
        } catch (error) {
            console.error('Lỗi clone kế hoạch:', error);
            throw error;
        }
    };

    const fetchPlanDetails = async (planId) => {
        try {
            const response = await fetch(`https://apidatn.onrender.com/plan/${planId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (result.status) {
                return result.data;
            }
            throw new Error(result.message || 'Không thể lấy chi tiết kế hoạch');
        } catch (error) {
            console.error('Lỗi lấy chi tiết kế hoạch:', error);
            throw error;
        }
    };

    const updatePlan = async (planId, planData) => {
        try {
            const response = await fetch(`https://apidatn.onrender.com/plan/update/${planId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(planData),
            });
            const result = await response.json();
            console.log('Update plan response:', result);
            if (!result.status) {
                throw new Error(result.message || 'Không thể cập nhật kế hoạch');
            }
            return result.data;
        } catch (error) {
            console.error('Lỗi cập nhật kế hoạch:', error);
            throw error;
        }
    };

    const fetchPlanData = async () => {
        setPlanLoading(true);
        try {
            const [lobbyRes, cateringRes, decorateRes, presentRes] = await Promise.all([
                fetchLobbies(),
                fetchCatering(),
                fetchDecorate(),
                fetchGifts()
            ]);
            setPlanOptions({
                sanh: lobbyRes.data || [],
                catering: cateringRes.data || [],
                decorate: decorateRes.data || [],
                present: presentRes.data || []
            });
        } catch (err) {
            setPlanError('Không thể tải dữ liệu kế hoạch');
        } finally {
            setPlanLoading(false);
        }
    };

    useEffect(() => {
        const newSocket = io('https://apidatn.onrender.com', {
            transports: ['websocket'],
            upgrade: false
        });

        setSocket(newSocket);
        newSocket.emit('registerAdmin');
        newSocket.on('newMessage', handleNewMessage);
        newSocket.on('messageSent', handleMessageSent);
        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return () => {
            newSocket.off('newMessage', handleNewMessage);
            newSocket.off('messageSent', handleMessageSent);
            newSocket.disconnect();
        };
    }, []);

    const handleNewMessage = async (data) => {
        const { message, userId } = data;

        let userName = message.userName;

        if (message.senderType === 'user') {
            if (!userName) {
                const userInList = users.find(u => u.userId === message.senderId);
                if (userInList && userInList.name) {
                    userName = userInList.name;
                }
            }
        } else if (message.senderType === 'admin') {
            userName = currentUserInfo?.name || findUserName(message.receiverId) || 'Khách hàng';
        }

        const processedMessage = {
            ...message,
            messageType: message.messageType || (
                message.message && message.message.startsWith('data:image/') ? 'image' : 'text'
            ),
            userName: userName || (message.senderType === 'user' ? message.senderId : 'Khách hàng')
        };

        // Handle plan message
        if (processedMessage.messageType === 'plan' && processedMessage.senderType === 'user' && currentUserId === userId) {
            try {
                const parsedContent = JSON.parse(processedMessage.message);
                if (parsedContent.planId) {
                    setCurrentPlanId(parsedContent.planId);
                } else {
                    console.warn('No planId in plan message:', processedMessage.message);
                }
            } catch (e) {
                console.error('Lỗi parse JSON in handleNewMessage:', e, 'Content:', processedMessage.message);
            }
        }

        const senderId = processedMessage.senderId;

        if (processedMessage.senderType !== 'admin') {
            if (currentUserId !== senderId) {
                try {
                    setUnreadMessages(prev => prev + 1);
                } catch (error) {
                    console.error('Error updating unread messages count:', error);
                    setLocalUnreadCount(prev => prev + 1);
                }
            }
        }

        const existingUserIndex = users.findIndex(user => user.userId === senderId);

        if (existingUserIndex >= 0 && processedMessage.senderType !== 'admin') {
            setUsers(prevUsers => {
                const updatedUsers = [...prevUsers];

                const updatedName = processedMessage.userName && processedMessage.userName !== 'Khách hàng' && processedMessage.userName !== senderId
                    ? processedMessage.userName
                    : updatedUsers[existingUserIndex].name;

                updatedUsers[existingUserIndex] = {
                    ...updatedUsers[existingUserIndex],
                    name: updatedName,
                    lastMessage: processedMessage.message,
                    lastMessageType: processedMessage.messageType,
                    lastMessageTime: processedMessage.createdAt,
                    unreadCount: currentUserId === senderId
                        ? 0
                        : (updatedUsers[existingUserIndex].unreadCount || 0) + 1
                };
                return updatedUsers;
            });
        } else if (processedMessage.senderType !== 'admin') {
            const userDisplayName = (processedMessage.userName && processedMessage.userName !== senderId)
                ? processedMessage.userName
                : 'Khách hàng';

            setUsers(prevUsers => [
                {
                    userId: senderId,
                    name: userDisplayName,
                    lastMessage: processedMessage.message,
                    lastMessageType: processedMessage.messageType,
                    lastMessageTime: processedMessage.createdAt,
                    unreadCount: currentUserId === senderId ? 0 : 1
                },
                ...prevUsers
            ]);
        }

        if (currentUserId === userId || currentUserId === senderId) {
            setMessages(prevMessages => [...prevMessages, processedMessage]);
            socket.emit('markAsRead', { userId: senderId });
        }
    };

    const handleMessageSent = (data) => {
        const { message } = data;

        let userName = message.userName;
        if (message.senderType === 'admin' && (!userName || userName === 'Admin')) {
            userName = currentUserInfo?.name || findUserName(message.receiverId) || 'Khách hàng';
        }

        const processedMessage = {
            ...message,
            messageType: message.messageType || (
                message.message && message.message.startsWith('data:image/') ? 'image' : 'text'
            ),
            userName: userName || message.senderId
        };

        setMessages(prevMessages => [...prevMessages, processedMessage]);

        setUsers(prevUsers => {
            const userIndex = prevUsers.findIndex(user => user.userId === processedMessage.receiverId);

            if (userIndex >= 0) {
                const updatedUsers = [...prevUsers];
                updatedUsers[userIndex] = {
                    ...updatedUsers[userIndex],
                    lastMessage: processedMessage.message,
                    lastMessageType: processedMessage.messageType,
                    lastMessageTime: processedMessage.createdAt
                };
                return updatedUsers;
            }
            return prevUsers;
        });
    };

    const fetchUsers = async () => {
        try {
            setUserLoading(true);
            setRefreshingUsers(true);
            const result = await fetchAllChatUsers();
            if (result.success) {
                const usersWithInfo = result.data.map(user => {
                    const userName = user.userName || user.name || extractUserName(user) || 'Khách hàng';

                    return {
                        ...user,
                        name: userName,
                        lastMessageType: user.lastMessageType || (
                            user.lastMessage && user.lastMessage.startsWith('data:image')
                                ? 'image'
                                : 'text'
                        )
                    };
                });

                setUsers(usersWithInfo);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng chat:', error);
        } finally {
            setUserLoading(false);
            setRefreshingUsers(false);
        }
    };

    const fetchUserInfo = async (userId) => {
        try {
            const userInfo = await getUserById(userId);
            const existingUser = users.find(u => u.userId === userId);
            let userName = existingUser?.name;
            const isGenericName = !userName || userName === 'Khách hàng' || userName === userId;

            if (isGenericName && userInfo && userInfo.data) {
                userName = extractUserName(userInfo.data);
                const userEmail = userInfo.data.email || '';
                const userAvatar = userInfo.data.avatar || userInfo.data.avatarUrl || '';

                if (userName === 'Khách hàng' && userInfo.data) {
                    for (const key in userInfo.data) {
                        const value = userInfo.data[key];
                        if (typeof value === 'string' && value.length > 0 &&
                            key !== 'email' && key !== '_id' && key !== 'id' && key !== 'userId') {
                            userName = value;
                            break;
                        }
                    }
                }

                if (userName === 'Khách hàng' && userEmail) {
                    userName = userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);
                }

                setCurrentUserInfo({
                    name: userName,
                    email: userEmail,
                    avatar: userAvatar
                });

                if (userName !== 'Khách hàng' && userName !== userId) {
                    setUsers(prevUsers => {
                        const userIndex = prevUsers.findIndex(user => user.userId === userId);
                        if (userIndex >= 0 && (prevUsers[userIndex].name === 'Khách hàng' || prevUsers[userIndex].name === userId)) {
                            const updatedUsers = [...prevUsers];
                            updatedUsers[userIndex] = {
                                ...updatedUsers[userIndex],
                                name: userName
                            };
                            return updatedUsers;
                        }
                        return prevUsers;
                    });
                }
            } else {
                setCurrentUserInfo({
                    name: userName || 'Khách hàng',
                    email: userInfo?.data?.email || '',
                    avatar: userInfo?.data?.avatar || userInfo?.data?.avatarUrl || ''
                });
            }
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin người dùng ${userId}:`, error);
            const existingUser = users.find(u => u.userId === userId);
            setCurrentUserInfo({
                name: existingUser?.name || 'Khách hàng',
                email: '',
                avatar: ''
            });
        }
    };

    const fetchMessages = async (userId) => {
        try {
            setLoading(true);
            setRefreshingMessages(true);
            const result = await fetchChatHistory(userId);
            if (result.success) {
                const processedMessages = result.data.map(msg => {
                    let userName;

                    if (msg.senderType === 'user') {
                        userName = msg.userName || findUserName(userId) || currentUserInfo?.name;
                    } else {
                        userName = currentUserInfo?.name || findUserName(userId);
                    }

                    return {
                        ...msg,
                        messageType: msg.messageType || (
                            msg.message && msg.message.startsWith('data:image/') ? 'image' : 'text'
                        ),
                        userName: userName || 'Khách hàng'
                    };
                });

                // Find the latest plan message from the user
                const planMessage = processedMessages
                    .filter(msg => msg.messageType === 'plan' && msg.senderType === 'user')
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

                if (planMessage) {
                    try {
                        const parsedContent = JSON.parse(planMessage.message);
                        if (parsedContent.planId) {
                            setCurrentPlanId(parsedContent.planId);
                        } else {
                            setCurrentPlanId(null); // No valid planId in message
                        }
                    } catch (e) {
                        console.error('Lỗi parse JSON in fetchMessages:', e, 'Content:', planMessage.message);
                        setCurrentPlanId(null); // Error parsing, reset planId
                    }
                } else {
                    setCurrentPlanId(null); // No plan message found
                }

                setMessages(processedMessages);

                const userMessages = processedMessages.filter(msg => msg.senderType === 'user');
                if (userMessages.length > 0) {
                    const lastUserMessage = userMessages[userMessages.length - 1];
                    if (lastUserMessage.userName && lastUserMessage.userName !== 'Khách hàng' && lastUserMessage.userName !== userId) {
                        setUsers(prevUsers => {
                            const userIndex = prevUsers.findIndex(user => user.userId === userId);
                            if (userIndex >= 0) {
                                const updatedUsers = [...prevUsers];
                                if (lastUserMessage.userName !== updatedUsers[userIndex].name) {
                                    updatedUsers[userIndex] = {
                                        ...updatedUsers[userIndex],
                                        name: lastUserMessage.userName
                                    };
                                    return updatedUsers;
                                }
                            }
                            return prevUsers;
                        });
                    }
                }

                setTimeout(() => {
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 300);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setCurrentPlanId(null); // Reset on error
        } finally {
            setLoading(false);
            setRefreshingMessages(false);
        }
    };

    const handleSelectUser = (userId) => {
        setCurrentUserId(userId);
        setCurrentPlanId(null); // Reset plan ID when switching users
        fetchMessages(userId);
        fetchUserInfo(userId);

        if (socket) {
            socket.emit('markAsRead', { userId });
        }
    };

    const handleSendMessage = () => {
        if ((!messageInput.trim() && !imagePreview) || !currentUserId || !socket) return;

        const userName = currentUserInfo?.name || findUserName(currentUserId) || 'Khách hàng';

        if (imagePreview) {
            const messageData = {
                senderId: 'admin',
                receiverId: currentUserId,
                message: imagePreview,
                senderType: 'admin',
                messageType: 'image',
                userName: userName
            };

            socket.emit('sendMessage', messageData);
            setImagePreview('');
            setImageUpload(null);

            return;
        }

        const messageData = {
            senderId: 'admin',
            receiverId: currentUserId,
            message: messageInput.trim(),
            senderType: 'admin',
            messageType: 'text',
            userName: userName
        };

        socket.emit('sendMessage', messageData);
        setMessageInput('');
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            alert('Vui lòng chọn file hình ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước ảnh không được vượt quá 5MB');
            return;
        }

        setImageUpload(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 100);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImageUpload(null);
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setTimeout(() => {
            const inputElement = document.querySelector('.chat-input input');
            if (inputElement) {
                inputElement.focus();
            }
        }, 100);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleOpenPlanModal = async () => {
        if (!currentUserId || !currentPlanId) return;
        setPlanLoading(true);
        try {
            await fetchPlanData();
            const clonedPlan = await clonePlan(currentPlanId);
            const fetchedPlanDetails = await fetchPlanDetails(clonedPlan.newPlanId);
            setPlanDetails(fetchedPlanDetails);
            setEditedPlan({
                _id: clonedPlan.newPlanId,
                name: fetchedPlanDetails.name || 'Kế hoạch mới',
                SanhId: fetchedPlanDetails.SanhId?._id || fetchedPlanDetails.SanhId,
                cateringId: fetchedPlanDetails.caterings?.map(item => item._id) || [],
                decorateId: fetchedPlanDetails.decorates?.map(item => item._id) || [],
                presentId: fetchedPlanDetails.presents?.map(item => item._id) || [],
                totalPrice: fetchedPlanDetails.totalPrice || 0,
            });
            setShowPlanModal(true);
        } catch (error) {
            Swal.fire({
                title: 'Lỗi!',
                text: error.message || 'Không thể tải kế hoạch',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setPlanLoading(false);
        }
    };

    const handleClosePlanModal = () => {
        setShowPlanModal(false);
        setEditedPlan(null);
        setPlanDetails(null);
        setPlanError(null);
        setPlanSuccess(false);
        setShowLists({ sanh: false, catering: false, decorate: false, present: false });
    };

    const handleSendNewPlan = async () => {
        if (!editedPlan.name || !editedPlan.SanhId) {
            setPlanError('Vui lòng nhập Tên Kế hoạch và chọn Sảnh!');
            return;
        }
        setPlanLoading(true);
        try {
            const updateData = {
                UserId: currentUserId,
                name: editedPlan.name,
                SanhId: editedPlan.SanhId,
                caterings: editedPlan.cateringId,
                decorates: editedPlan.decorateId,
                presents: editedPlan.presentId.map(id => ({
                    id,
                    quantity: planDetails?.presents?.find(p => p._id === id)?.quantity || 1,
                })),
                totalPrice: calculateTotalPrice(editedPlan),
                forceDuplicate: false,
            };

            console.log('Sending update data:', JSON.stringify(updateData, null, 2));

            const updatedPlan = await updatePlan(editedPlan._id, updateData);

            const userName = currentUserInfo?.name || findUserName(currentUserId) || 'Khách hàng';
            const messageData = {
                senderId: 'admin',
                receiverId: currentUserId,
                message: JSON.stringify({
                    action: 'new_plan',
                    planId: editedPlan._id,
                    name: editedPlan.name
                }, null, 2),
                senderType: 'admin',
                messageType: 'new_plan',
                userName: userName,
            };

            console.log('Gửi tin nhắn new_plan:', JSON.stringify(messageData, null, 2));

            socket.emit('sendMessage', messageData);

            setPlanSuccess(true);
            Swal.fire({
                title: 'Thành công!',
                text: 'Kế hoạch đã được cập nhật và gửi thành công.',
                icon: 'success',
                confirmButtonText: 'OK',
            });

            setTimeout(() => {
                handleClosePlanModal();
            }, 2000);
        } catch (error) {
            console.error('Lỗi gửi kế hoạch mới:', error);
            setPlanError(error.message || 'Không thể gửi kế hoạch mới');
            Swal.fire({
                title: 'Lỗi!',
                text: error.message || 'Không thể gửi kế hoạch mới',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setPlanLoading(false);
        }
    };

    const calculateTotalPrice = (plan) => {
        let total = 0;
        const selectedLobby = planOptions.sanh.find(item => item._id === plan.SanhId);
        if (selectedLobby) total += selectedLobby.price || 0;
        plan.cateringId.forEach(id => {
            const item = planOptions.catering.find(item => item._id === id);
            if (item) total += item.price || 0;
        });
        plan.decorateId.forEach(id => {
            const item = planOptions.decorate.find(item => item._id === id);
            if (item) total += item.price || 0;
        });
        plan.presentId.forEach(id => {
            const item = planOptions.present.find(item => item._id === id);
            if (item) total += (item.price || 0) * (planDetails?.presents?.find(p => p._id === id)?.quantity || 1);
        });
        return total;
    };

    const toggleList = (type) => {
        setShowLists(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleSelectLobby = (id) => {
        setEditedPlan(prev => ({ ...prev, SanhId: id }));
    };

    const handleToggleItem = (type, id) => {
        setEditedPlan(prev => {
            const currentIds = prev[type];
            if (currentIds.includes(id)) {
                return { ...prev, [type]: currentIds.filter(item => item !== id) };
            }
            return { ...prev, [type]: [...currentIds, id] };
        });
    };

    const renderPlanList = (type, items, selectedIds) => {
        const typeMap = {
            sanh: { idField: 'SanhId', singleSelect: true },
            catering: { idField: 'cateringId', singleSelect: false },
            decorate: { idField: 'decorateId', singleSelect: false },
            present: { idField: 'presentId', singleSelect: false },
        };
        const { idField, singleSelect } = typeMap[type];

        return (
            <div className="form-group">
                <div className="form-group-header">
                    <label>
                        {type === 'sanh' ? 'Sảnh' : type === 'catering' ? 'Dịch Vụ Ẩm Thực' : type === 'decorate' ? 'Dịch Vụ Trang Trí' : 'Dịch Vụ Quà Tặng'}{' '}
                        {type === 'sanh' && <span className="required">*</span>}
                    </label>
                    <button className={`list-btn ${showLists[type] ? 'active' : ''}`} onClick={() => toggleList(type)}>
                        <FontAwesomeIcon icon={faList} /> {showLists[type] ? 'Ẩn' : 'Hiện'}
                    </button>
                </div>
                {showLists[type] && (
                    <div className="list-container">
                        <div className="item-list">
                            {items.map(item => (
                                <div
                                    key={item._id}
                                    className={`list-item ${singleSelect ? selectedIds === item._id : selectedIds.includes(item._id) ? 'selected' : ''}`}
                                    onClick={() => (singleSelect ? handleSelectLobby(item._id) : handleToggleItem(idField, item._id))}
                                >
                                    <div className="selection-indicator">
                                        <input
                                            type={singleSelect ? 'radio' : 'checkbox'}
                                            name={singleSelect ? 'sanh' : type}
                                            checked={singleSelect ? selectedIds === item._id : selectedIds.includes(item._id)}
                                            onChange={() => {}}
                                            disabled={planLoading}
                                        />
                                        {(singleSelect ? selectedIds === item._id : selectedIds.includes(item._id)) && (
                                            <span className="checkmark">
                                                <FontAwesomeIcon icon={faCheck} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="item-image-container">
                                        <img src={item.imageUrl || 'https://via.placeholder.com/100'} alt={item.name} className="item-image" />
                                    </div>
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <div className="item-info">
                                            <span className="price">{item.price ? item.price.toLocaleString() : 'N/A'} VNĐ</span>
                                            {type === 'sanh' && <span className="capacity">{item.SoLuongKhach || 'N/A'} khách</span>}
                                            {type === 'present' && selectedIds.includes(item._id) && (
                                                <div className="quantity-input">
                                                    <label>Số lượng:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={planDetails?.presents?.find(p => p._id === item._id)?.quantity || 1}
                                                        onChange={(e) => {
                                                            const quantity = parseInt(e.target.value) || 1;
                                                            setPlanDetails(prev => ({
                                                                ...prev,
                                                                presents: prev.presents.map(p =>
                                                                    p._id === item._id ? { ...p, quantity } : p
                                                                ),
                                                            }));
                                                        }}
                                                        disabled={planLoading}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="no-results">
                                    Không có {type === 'sanh' ? 'sảnh' : 'dịch vụ'} nào
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {(singleSelect ? selectedIds : selectedIds.length > 0) && (
                    <div className="selected-summary">
                        <span>Đã chọn: </span>
                        {singleSelect
                            ? planOptions[type].find(item => item._id === selectedIds)?.name
                            : `${selectedIds.length} dịch vụ`}
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 30000);
        return () => clearInterval(interval);
    }, []);

    const extractUserName = (userData) => {
        if (userData.name) return userData.name;
        if (userData.fullName) return userData.fullName;
        if (userData.displayName) return userData.displayName;
        if (userData.username) return userData.username;
        if (userData.firstName && userData.lastName) return `${userData.firstName} ${userData.lastName}`;
        if (userData.firstName) return userData.firstName;
        if (userData.lastName) return userData.lastName;
        if (userData.email) {
            const emailName = userData.email.split('@')[0];
            return emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
        return 'Khách hàng';
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            return `${days[date.getDay()]} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const formatMessageDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();

        if (date.toDateString() === now.toDateString()) {
            return 'Hôm nay';
        }

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Hôm qua';
        }

        if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
            const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
            return days[date.getDay()];
        }

        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const shouldShowDate = (messages, index) => {
        if (index === 0) return true;

        const currentDate = new Date(messages[index].createdAt).toDateString();
        const prevDate = new Date(messages[index - 1].createdAt).toDateString();

        return currentDate !== prevDate;
    };

    const truncateMessage = (message, maxLength, messageType) => {
        if (!message) return '';

        if (messageType === 'image') {
            return '[Hình ảnh]';
        }

        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    const checkScrollPosition = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 300;
        setShowScrollButton(isScrolledUp);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, []);

    const openImageModal = (imageUrl) => {
        setModalImage(imageUrl);
        setShowImageModal(true);
        document.body.style.overflow = 'hidden';
    };

    const closeImageModal = () => {
        setShowImageModal(false);
        setModalImage('');
        document.body.style.overflow = 'auto';
    };

    const findUserName = (userId) => {
        const user = users.find(u => u.userId === userId);
        return user ? user.name : null;
    };

    return (
        <div className="admin-chat-container">
            <div className="chat-header">
                <h2>Chat với người dùng</h2>
            </div>

            <div className="chat-content">
                <div className="user-list-container">
                    <div className="user-list-header">
                        <h5>Danh sách người dùng</h5>
                        <button
                            className={`refresh-button ${refreshingUsers ? 'refreshing' : ''}`}
                            onClick={fetchUsers}
                            title="Tải lại danh sách"
                            disabled={refreshingUsers}
                        >
                            <FontAwesomeIcon icon={faSync} />
                        </button>
                    </div>

                    <div className="user-list">
                        {userLoading ? (
                            <div className="loading-spinner">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden"></span>
                                </div>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="no-users">
                                <p>Chưa có người dùng nào chat</p>
                            </div>
                        ) : (
                            users.map((user) => (
                                <div
                                    key={user.userId}
                                    className={`user-item ${currentUserId === user.userId ? 'active' : ''} ${user.unreadCount > 0 ? 'unread' : ''}`}
                                    onClick={() => handleSelectUser(user.userId)}
                                    title={`${user.name || 'Khách hàng'}${user.email ? ' - ' + user.email : ''}`}
                                >
                                    <div className="user-avatar">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name || 'User'} />
                                        ) : (
                                            <div className="default-avatar">
                                                <FontAwesomeIcon icon={faUser} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="user-item-content">
                                        <div className="user-info">
                                            <h6>
                                                <UserNameDisplay userName={user.name} highlight={true} />
                                            </h6>
                                            <p>{truncateMessage(user.lastMessage, 30, user.lastMessageType)}</p>
                                            <small>{formatTime(user.lastMessageTime)}</small>
                                        </div>
                                        {user.unreadCount > 0 && (
                                            <div className="unread-badge">
                                                <span>{user.unreadCount}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="chat-window">
                    <div className="chat-window-header">
                        {currentUserId ? (
                            <div className="current-user-info">
                                <div className="user-details">
                                    <div className="header-avatar">
                                        <div className="default-avatar">
                                            <FontAwesomeIcon icon={faUser} />
                                        </div>
                                    </div>
                                    <div className="user-header-info">
                                        <h5>
                                            <UserNameDisplay
                                                userName={currentUserInfo?.name || findUserName(currentUserId)}
                                                highlight={true}
                                            />
                                        </h5>
                                        {currentUserInfo?.email && (
                                            <div className="user-email">
                                                <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
                                                <span>{currentUserInfo.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="chat-actions">
                                    <button
                                        className={`action-button ${refreshingMessages ? 'refreshing' : ''}`}
                                        onClick={() => fetchMessages(currentUserId)}
                                        title="Tải lại tin nhắn"
                                        disabled={refreshingMessages}
                                    >
                                        {/* <FontAwesomeIcon icon={faSyncdynamodb}/> */}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <h5>Chọn một người dùng để bắt đầu chat</h5>
                        )}
                    </div>

                    <div className="chat-messages-wrapper">
                        <div className="chat-messages" ref={messagesContainerRef} onScroll={checkScrollPosition}>
                            {!currentUserId ? (
                                <div className="no-user-selected">
                                    <div className="empty-state">
                                        <FontAwesomeIcon icon={faInfoCircle} className="empty-icon" />
                                        <p>Chọn một người dùng để bắt đầu chat</p>
                                    </div>
                                </div>
                            ) : loading ? (
                                <div className="loading-spinner">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden"></span>
                                    </div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="no-messages">
                                    <div className="empty-state">
                                        <FontAwesomeIcon icon={faClock} className="empty-icon" />
                                        <p>Chưa có tin nhắn nào</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="messages-container">
                                    {messages.map((message, index) => {
                                        const isImage = message.messageType === 'image';
                                        const isPlan = message.messageType === 'plan';
                                        const isNewPlan = message.messageType === 'new_plan';
                                        const isConfirmation = message.messageType === 'confirmation';
                                        let senderName = message.senderType === 'user'
                                            ? (message.userName || findUserName(message.senderId) || currentUserInfo?.name || 'Khách hàng')
                                            : (currentUserInfo?.name || findUserName(currentUserId) || 'Khách hàng');
                                        let messageContent = message.message;
                                        let parsedContent = {};

                                        if ((isPlan || isNewPlan || isConfirmation) && typeof message.message === 'string') {
                                            if (message.message.trim().startsWith('{') || message.message.trim().startsWith('[')) {
                                                try {
                                                    parsedContent = JSON.parse(message.message);
                                                    messageContent = parsedContent.details
                                                        ? JSON.stringify(parsedContent.details, null, 2)
                                                        : parsedContent.name
                                                            ? JSON.stringify({ planId: parsedContent.planId, name: parsedContent.name }, null, 2)
                                                            : message.message;
                                                } catch (e) {
                                                    console.error('Lỗi parse JSON:', e, 'Content:', message.message, 'MessageType:', message.messageType);
                                                    messageContent = message.message;
                                                }
                                            } else {
                                                console.warn('Non-JSON content detected:', message.messageType, 'Content:', message.message);
                                                messageContent = message.message;
                                            }
                                        }

                                        return (
                                            <React.Fragment key={message._id || index}>
                                                {shouldShowDate(messages, index) && (
                                                    <div className="date-separator">
                                                        <span>{formatMessageDate(message.createdAt)}</span>
                                                    </div>
                                                )}
                                                <div className={`message ${message.senderType === 'admin' ? 'sent' : 'received'}`}>
                                                    <div className="message-content">
                                                        <div className="message-sender">
                                                            <UserNameDisplay userName={senderName} highlight={true} />
                                                        </div>
                                                        {isImage ? (
                                                            <div className="message-image-container">
                                                                <img
                                                                    src={message.message}
                                                                    alt="Hình ảnh"
                                                                    className="message-image"
                                                                    onClick={() => openImageModal(message.message)}
                                                                />
                                                                <div className="image-expand-icon">
                                                                    <FontAwesomeIcon icon={faExpand} />
                                                                </div>
                                                            </div>
                                                        ) : isPlan || isNewPlan ? (
                                                            <pre className="plan-message">{messageContent}</pre>
                                                        ) : isConfirmation && parsedContent.action === 'confirm' ? (
                                                            <div>
                                                                <p>Yêu cầu xác nhận kế hoạch {parsedContent.planId}</p>
                                                            </div>
                                                        ) : (
                                                            <p>{messageContent}</p>
                                                        )}
                                                        <div className="message-footer">
                                                            <span className="message-time">{formatTime(message.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}

                            {showScrollButton && (
                                <button className="scroll-bottom-button" onClick={scrollToBottom} title="Cuộn xuống cuối">
                                    <FontAwesomeIcon icon={faArrowDown} />
                                </button>
                            )}
                        </div>

                        {currentUserId && (
                            <div className="chat-input-container">
                                <button
                                    className="confirmation-button"
                                    onClick={handleOpenPlanModal}
                                    disabled={!currentUserId || !currentPlanId || planLoading}
                                    title={currentPlanId ? "Chỉnh sửa và gửi kế hoạch mới" : "Chưa có kế hoạch từ người dùng"}
                                >
                                    Gửi kế hoạch mới
                                </button>

                                <button
                                    className="confirmation-button"
                                    onClick={() => {
                                        if (!currentUserId || !socket || !currentPlanId) return;
                                        const userName = currentUserInfo?.name || findUserName(currentUserId) || 'Khách hàng';
                                        const messageData = {
                                            senderId: 'admin',
                                            receiverId: currentUserId,
                                            message: JSON.stringify({ action: 'confirm', planId: currentPlanId }),
                                            senderType: 'admin',
                                            messageType: 'confirmation',
                                            userName: userName
                                        };
                                        socket.emit('sendMessage', messageData);
                                    }}
                                    disabled={!currentUserId || !currentPlanId}
                                    title={currentPlanId ? "Gửi yêu cầu xác nhận" : "Chưa có kế hoạch từ người dùng"}
                                >
                                    Gửi yêu cầu xác nhận
                                </button>

                                {imagePreview && (
                                    <div className="image-preview-container">
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Preview" />
                                            <button
                                                className="remove-image-btn"
                                                onClick={handleRemoveImage}
                                                title="Xóa ảnh"
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                        <p className="image-ready-text">Ảnh đã sẵn sàng để gửi</p>
                                    </div>
                                )}

                                <div className="chat-input">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={imagePreview ? "Ấn gửi để gửi ảnh..." : "Nhập tin nhắn..."}
                                        disabled={!!imagePreview}
                                    />

                                    <button
                                        className="upload-image-button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={!!imagePreview}
                                        title="Gửi hình ảnh"
                                    >
                                        <FontAwesomeIcon icon={faImage} />
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleImageSelect}
                                        />
                                    </button>

                                    <button
                                        className="send-button"
                                        onClick={handleSendMessage}
                                        disabled={(!messageInput.trim() && !imagePreview) || !currentUserId}
                                    >
                                        <FontAwesomeIcon icon={faPaperPlane} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showImageModal && (
                <div className={`image-modal ${showImageModal ? 'active' : ''}`} onClick={closeImageModal}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <img src={modalImage} alt="Full size" />
                        <button className="image-modal-close" onClick={closeImageModal}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </div>
            )}

            {showPlanModal && editedPlan && (
                <div className="modal-overlay" onClick={e => {
                    if (e.target.className === 'modal-overlay') handleClosePlanModal();
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Chỉnh Sửa Kế hoạch: {editedPlan.name}</h2>
                            <button className="close-btn" onClick={handleClosePlanModal}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        {planError && <div className="error-message"><FontAwesomeIcon icon={faTimes} /> {planError}</div>}
                        {planSuccess && <div className="success-message"><FontAwesomeIcon icon={faCheck} /> Gửi kế hoạch thành công!</div>}

                        {planLoading ? (
                            <div className="loading-spinner">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden"></span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label htmlFor="edit-plan-name">Tên Kế hoạch <span className="required">*</span></label>
                                    <input
                                        id="edit-plan-name"
                                        type="text"
                                        value={editedPlan.name}
                                        onChange={(e) => setEditedPlan(prev => ({ ...prev, name: e.target.value }))}
                                        disabled={planLoading}
                                        placeholder="Nhập tên kế hoạch..."
                                        className="edit-input"
                                    />
                                </div>

                                {renderPlanList('sanh', planOptions.sanh, editedPlan.SanhId)}
                                {renderPlanList('catering', planOptions.catering, editedPlan.cateringId)}
                                {renderPlanList('decorate', planOptions.decorate, editedPlan.decorateId)}
                                {renderPlanList('present', planOptions.present, editedPlan.presentId)}

                                <div className="combo-summary">
                                    <div className="summary-header">
                                        <h3>Tổng cộng</h3>
                                        <div className="total-price">{calculateTotalPrice(editedPlan).toLocaleString()} VNĐ</div>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        className="save-btn"
                                        onClick={handleSendNewPlan}
                                        disabled={planLoading || planSuccess}
                                    >
                                        <FontAwesomeIcon icon={planLoading ? faSpinner : faSave} spin={planLoading} />
                                        {planLoading ? 'Đang gửi...' : 'Gửi Kế hoạch'}
                                    </button>
                                    <button
                                        className="cancel-btn"
                                        onClick={handleClosePlanModal}
                                        disabled={planLoading}
                                    >
                                        <FontAwesomeIcon icon={faTimes} /> Hủy
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminChat;