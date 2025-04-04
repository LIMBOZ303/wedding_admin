import React, { useState, useEffect, useRef, useContext } from 'react';
import { fetchChatHistory, fetchAllChatUsers, sendMessage } from '../api/chat_api';
import { getUserById } from '../api/users_api';
import { io } from 'socket.io-client';
import '../styles/AdminChat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppContext } from '../AppContext';
import {
    faPaperPlane,
    faCircle,
    faSync,
    faUser,
    faInfoCircle,
    faClock,
    faBell,
    faEnvelope,
    faCheck,
    faCheckDouble,
    faArrowDown,
    faImage,
    faTimes,
    faExpand
} from '@fortawesome/free-solid-svg-icons';

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
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [localUnreadCount, setLocalUnreadCount] = useState(0);
    
    // Safely get context, providing fallbacks if not available
    const appContext = useContext(AppContext) || {};
    const setUnreadMessages = appContext.setUnreadMessages || (() => {
        console.warn('setUnreadMessages not available in AppContext, using local state');
        setLocalUnreadCount(prev => prev + 1);
    });
    
    // Image upload state
    const [imageUpload, setImageUpload] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    // Image modal state
    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImage, setModalImage] = useState('');

    // Add state for tracking refresh operations
    const [refreshingUsers, setRefreshingUsers] = useState(false);
    const [refreshingMessages, setRefreshingMessages] = useState(false);

    // Kết nối Socket.IO khi component được mount
    useEffect(() => {
        // Kết nối đến server socket
        const newSocket = io('https://apidatn.onrender.com', {
            transports: ['websocket'],
            upgrade: false
        });

        setSocket(newSocket);

        // Đăng ký là admin
        newSocket.emit('registerAdmin');

        // Xử lý sự kiện khi nhận tin nhắn mới
        newSocket.on('newMessage', handleNewMessage);

        // Xử lý xác nhận tin nhắn đã gửi
        newSocket.on('messageSent', handleMessageSent);

        // Xử lý lỗi kết nối
        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        // Clean up khi component unmount
        return () => {
            newSocket.off('newMessage', handleNewMessage);
            newSocket.off('messageSent', handleMessageSent);
            newSocket.disconnect();
        };
    }, []);

    // Xử lý khi nhận tin nhắn mới
    const handleNewMessage = async (data) => {
        const { message, userId } = data;

        // Đảm bảo message có messageType và userName
        const processedMessage = {
            ...message,
            messageType: message.messageType || (
                message.message && message.message.startsWith('data:image/') ? 'image' : 'text'
            ),
            // Ensure userName is defined
            userName: message.userName || (message.senderType === 'admin' ? 'Admin' : message.senderId)
        };

        // Xác định ID người dùng từ tin nhắn
        const senderId = processedMessage.senderId;

        console.log('------------------------------------');
        console.log('📩 NHẬN TIN NHẮN MỚI');
        console.log('📱 ID người gửi:', senderId);
        console.log('👤 Tên người gửi:', processedMessage.userName);
        console.log('💬 Nội dung:', processedMessage.messageType === 'image' ? '[Hình ảnh]' : processedMessage.message);
        console.log('📝 Loại tin nhắn:', processedMessage.messageType);
        console.log('🔢 Thông tin tin nhắn đầy đủ:', JSON.stringify(processedMessage, null, 2));

        // Cập nhật số tin nhắn chưa đọc trong AppContext nếu tin nhắn từ người dùng
        if (processedMessage.senderType !== 'admin') {
            // Nếu đang không xem tin nhắn của người dùng này, tăng số tin nhắn chưa đọc
            if (currentUserId !== senderId) {
                try {
                    setUnreadMessages(prev => prev + 1);
                } catch (error) {
                    console.error('Error updating unread messages count:', error);
                    // Fallback to local state if context fails
                    setLocalUnreadCount(prev => prev + 1);
                }
            }
        }

        // Kiểm tra xem người dùng đã có trong danh sách chưa
        const existingUserIndex = users.findIndex(user => user.userId === senderId);

        if (existingUserIndex >= 0 && processedMessage.senderType !== 'admin') {
            // Người dùng đã có trong danh sách, cập nhật thông tin
            console.log('🔄 Cập nhật thông tin người dùng trong danh sách');
            setUsers(prevUsers => {
                const updatedUsers = [...prevUsers];
                updatedUsers[existingUserIndex] = {
                    ...updatedUsers[existingUserIndex],
                    // Update the name if a userName is provided in the message
                    name: processedMessage.userName || updatedUsers[existingUserIndex].name,
                    lastMessage: processedMessage.message,
                    lastMessageType: processedMessage.messageType,
                    lastMessageTime: processedMessage.createdAt,
                    unreadCount: currentUserId === senderId 
                        ? 0 // If we're currently viewing this user's messages, mark as read
                        : (updatedUsers[existingUserIndex].unreadCount || 0) + 1
                };
                return updatedUsers;
            });
        } else if (processedMessage.senderType !== 'admin') {
            // Người dùng chưa có trong danh sách, thêm mới
            console.log('➕ Thêm người dùng mới vào danh sách chat');
            setUsers(prevUsers => [
                {
                    userId: senderId,
                    name: processedMessage.userName || senderId,
                    lastMessage: processedMessage.message,
                    lastMessageType: processedMessage.messageType,
                    lastMessageTime: processedMessage.createdAt,
                    unreadCount: currentUserId === senderId ? 0 : 1
                },
                ...prevUsers
            ]);
        }

        // Nếu đang chat với người dùng này, cập nhật tin nhắn và đánh dấu đã đọc
        if (currentUserId === userId || currentUserId === senderId) {
            console.log('📨 Cập nhật tin nhắn vào cuộc trò chuyện hiện tại');
            setMessages(prevMessages => [...prevMessages, processedMessage]);

            // Đánh dấu tin nhắn đã đọc
            console.log('✓ Đánh dấu tin nhắn đã đọc');
            socket.emit('markAsRead', { userId: senderId });
        }

        console.log('------------------------------------');
    };

    // Xử lý xác nhận tin nhắn đã gửi
    const handleMessageSent = (data) => {
        const { message } = data;

        // Đảm bảo message có messageType và userName
        const processedMessage = {
            ...message,
            messageType: message.messageType || (
                message.message && message.message.startsWith('data:image/') ? 'image' : 'text'
            ),
            // Ensure userName is defined
            userName: message.userName || (message.senderType === 'admin' ? 'Admin' : message.senderId)
        };

        console.log('✅ Tin nhắn đã được gửi:', processedMessage.messageType === 'image' ? '[Hình ảnh]' : processedMessage.message);
        console.log('👤 Tên người gửi:', processedMessage.userName);

        // Thêm tin nhắn mới vào danh sách
        setMessages(prevMessages => [...prevMessages, processedMessage]);

        // Cập nhật thông tin người dùng hiện tại trong danh sách
        setUsers(prevUsers => {
            const userIndex = prevUsers.findIndex(user => user.userId === processedMessage.receiverId);
            
            if (userIndex >= 0) {
                const updatedUsers = [...prevUsers];
                updatedUsers[userIndex] = {
                    ...updatedUsers[userIndex],
                    name: updatedUsers[userIndex].name || processedMessage.receiverId, // Preserve existing name
                    lastMessage: processedMessage.message,
                    lastMessageType: processedMessage.messageType,
                    lastMessageTime: processedMessage.createdAt
                };
                return updatedUsers;
            }
            return prevUsers;
        });
    };

    // Lấy danh sách người dùng đã chat và thông tin của họ
    const fetchUsers = async () => {
        try {
            setUserLoading(true);
            setRefreshingUsers(true);
            const result = await fetchAllChatUsers();
            if (result.success) {
                // Map the user data, ensuring userName property is processed
                const usersWithInfo = result.data.map(user => {
                    return {
                        ...user,
                        // If the API returns userName, use it; otherwise try to get it from other properties
                        name: user.userName || user.name || extractUserName(user) || 'Khách hàng',
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

    // Lấy thông tin người dùng khi chọn một cuộc trò chuyện
    const fetchUserInfo = async (userId) => {
        try {
            console.log(`Đang lấy thông tin chi tiết cho người dùng: ${userId}`);
            const userInfo = await getUserById(userId);
            console.log('Thông tin chi tiết người dùng:', JSON.stringify(userInfo, null, 2));

            if (userInfo && userInfo.data) {
                // Sử dụng hàm extractUserName để lấy tên người dùng
                let userName = extractUserName(userInfo.data);
                const userEmail = userInfo.data.email || '';
                const userAvatar = userInfo.data.avatar || userInfo.data.avatarUrl || '';

                console.log('Đã trích xuất tên người dùng:', userName);

                // Thử sử dụng trường khác nếu tên là "Khách hàng"
                if (userName === 'Khách hàng' && userInfo.data) {
                    console.log(`🔄 Thử tìm tên trong các trường khác:`, Object.keys(userInfo.data).join(', '));

                    // Thử tìm trong các trường có thể chứa tên
                    for (const key in userInfo.data) {
                        const value = userInfo.data[key];
                        if (typeof value === 'string' && value.length > 0 && key !== 'email' && key !== '_id' && key !== 'id' && key !== 'userId') {
                            console.log(`🔍 Thử dùng trường ${key} với giá trị: ${value}`);
                            userName = value;
                            break;
                        }
                    }
                }

                // Nếu vẫn không có tên thì dùng email
                if (userName === 'Khách hàng' && userEmail) {
                    userName = userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);
                    console.log('📧 Sử dụng tên từ email:', userName);
                }

                setCurrentUserInfo({
                    name: userName,
                    email: userEmail,
                    avatar: userAvatar
                });
            } else {
                setCurrentUserInfo({
                    name: 'Khách hàng',
                    email: '',
                    avatar: ''
                });
            }
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin người dùng ${userId}:`, error);
            setCurrentUserInfo({
                name: 'Khách hàng',
                email: '',
                avatar: ''
            });
        }
    };

    // Lấy lịch sử chat với một user
    const fetchMessages = async (userId) => {
        try {
            setLoading(true);
            setRefreshingMessages(true);
            const result = await fetchChatHistory(userId);
            if (result.success) {
                // Process messages to ensure they have messageType and handle userName
                const processedMessages = result.data.map(msg => ({
                    ...msg,
                    messageType: msg.messageType || (
                        msg.message && msg.message.startsWith('data:image/') ? 'image' : 'text'
                    ),
                    // If userName is not provided, use default values
                    userName: msg.userName || (msg.senderType === 'admin' ? 'Admin' : userId)
                }));
                setMessages(processedMessages);
                // Đảm bảo cuộn xuống sau khi dữ liệu đã tải
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
            setRefreshingMessages(false);
        }
    };

    // Xử lý khi chọn một user để chat
    const handleSelectUser = (userId) => {
        setCurrentUserId(userId);
        fetchMessages(userId);
        fetchUserInfo(userId);

        // Đánh dấu tin nhắn đã đọc
        if (socket) {
            socket.emit('markAsRead', { userId });
        }
    };

    // Gửi tin nhắn mới
    const handleSendMessage = () => {
        if ((!messageInput.trim() && !imagePreview) || !currentUserId || !socket) return;

        // Get current user name from state
        const userName = currentUserInfo?.name || 'Admin';

        // Nếu có hình ảnh để gửi
        if (imagePreview) {
            // Chuẩn bị dữ liệu tin nhắn hình ảnh
            const messageData = {
                senderId: 'admin',
                receiverId: currentUserId,
                message: imagePreview,
                senderType: 'admin',
                messageType: 'image',
                userName: userName
            };

            // Gửi tin nhắn hình ảnh qua socket
            socket.emit('sendMessage', messageData);

            // Reset image state
            setImagePreview('');
            setImageUpload(null);
            
            return;
        }

        // Chuẩn bị dữ liệu tin nhắn văn bản
        const messageData = {
            senderId: 'admin',
            receiverId: currentUserId,
            message: messageInput.trim(),
            senderType: 'admin',
            messageType: 'text',
            userName: userName
        };

        // Gửi tin nhắn qua socket
        socket.emit('sendMessage', messageData);

        // Reset input
        setMessageInput('');
    };

    // Xử lý khi chọn file hình ảnh
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Kiểm tra nếu file là hình ảnh
        if (!file.type.match('image.*')) {
            alert('Vui lòng chọn file hình ảnh');
            return;
        }

        // Kiểm tra kích thước file (giới hạn 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước ảnh không được vượt quá 5MB');
            return;
        }

        setImageUpload(file);
        
        // Đọc file và hiển thị preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Xóa hình ảnh đã chọn
    const handleRemoveImage = () => {
        setImageUpload(null);
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Xử lý khi nhấn phím Enter để gửi tin nhắn
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Lấy danh sách người dùng khi component mount
    useEffect(() => {
        fetchUsers();

        // Cập nhật danh sách người dùng mỗi 30 giây
        const interval = setInterval(fetchUsers, 30000);

        return () => clearInterval(interval);
    }, []);

    // Hàm trích xuất tên người dùng từ dữ liệu
    const extractUserName = (userData) => {
        console.log('Dữ liệu người dùng nhận được để trích xuất tên:', userData);

        // Kiểm tra các thuộc tính phổ biến chứa tên người dùng
        if (userData.name) {
            console.log('Sử dụng trường name:', userData.name);
            return userData.name;
        }
        if (userData.fullName) {
            console.log('Sử dụng trường fullName:', userData.fullName);
            return userData.fullName;
        }
        if (userData.displayName) {
            console.log('Sử dụng trường displayName:', userData.displayName);
            return userData.displayName;
        }
        if (userData.username) {
            console.log('Sử dụng trường username:', userData.username);
            return userData.username;
        }
        if (userData.firstName && userData.lastName) {
            const fullName = `${userData.firstName} ${userData.lastName}`;
            console.log('Sử dụng họ và tên:', fullName);
            return fullName;
        }
        if (userData.firstName) {
            console.log('Sử dụng tên:', userData.firstName);
            return userData.firstName;
        }
        if (userData.lastName) {
            console.log('Sử dụng họ:', userData.lastName);
            return userData.lastName;
        }

        // Nếu có email, lấy phần trước @
        if (userData.email) {
            const emailName = userData.email.split('@')[0];
            // Biến đổi thành dạng tên hợp lý (viết hoa chữ cái đầu)
            const emailUserName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
            console.log('Sử dụng tên từ email:', emailUserName);
            return emailUserName;
        }

        // Mặc định trả về "Khách hàng"
        console.log('Không tìm thấy tên người dùng, sử dụng mặc định "Khách hàng"');
        return 'Khách hàng';
    };

    // Format thời gian
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // Nếu tin nhắn được gửi trong ngày hôm nay, hiển thị giờ
        if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Nếu tin nhắn được gửi trong tuần này, hiển thị thứ
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            return `${days[date.getDay()]} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        // Nếu tin nhắn được gửi trước đó, hiển thị ngày tháng năm
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    // Format ngày để hiển thị giữa các tin nhắn
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

        // Nếu tin nhắn được gửi trong tuần này
        if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
            const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
            return days[date.getDay()];
        }

        // Nếu tin nhắn cũ hơn, hiển thị ngày tháng năm
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Kiểm tra nếu cần hiển thị ngày giữa các tin nhắn
    const shouldShowDate = (messages, index) => {
        if (index === 0) return true;

        const currentDate = new Date(messages[index].createdAt).toDateString();
        const prevDate = new Date(messages[index - 1].createdAt).toDateString();

        return currentDate !== prevDate;
    };

    // Rút gọn tin nhắn
    const truncateMessage = (message, maxLength, messageType) => {
        // Check if it's an image by type or content
        if (messageType === 'image' || (message && typeof message === 'string' && message.startsWith('data:image/'))) {
            return '[Hình ảnh]';
        }
        
        if (!message || typeof message !== 'string') {
            return '';
        }
        
        return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    };

    // Kiểm tra nếu nên hiển thị nút cuộn xuống
    const checkScrollPosition = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        // Hiển thị nút khi người dùng kéo lên khỏi cuối tối thiểu 300px
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 300;
        setShowScrollButton(isScrolledUp);
    };

    // Cuộn xuống tin nhắn cuối cùng
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Cuộn xuống ngay khi mở cuộc trò chuyện hoặc có tin nhắn mới
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Thêm sự kiện scroll để kiểm tra vị trí cuộn
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, []);

    // Hiển thị modal hình ảnh khi click vào hình ảnh
    const openImageModal = (imageUrl) => {
        setModalImage(imageUrl);
        setShowImageModal(true);
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
    };

    // Đóng modal hình ảnh
    const closeImageModal = () => {
        setShowImageModal(false);
        setModalImage('');
        // Restore scrolling
        document.body.style.overflow = 'auto';
    };

    return (
        <div className="admin-chat-container">
            <div className="chat-header">
                <h2>Chat với người dùng</h2>
            </div>

            <div className="chat-content">
                {/* Danh sách người dùng */}
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
                                                {user.name || 'Khách hàng'}
                                                {user.email && <span className="user-email-inline"> ({user.email})</span>}
                                            </h6>
                                            <div className="user-id-display">ID: {user.userId}</div>
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

                {/* Khung chat */}
                <div className="chat-window">
                    <div className="chat-window-header">
                        {currentUserId ? (
                            <div className="current-user-info">
                                <div className="user-details">
                                    <div className="user-avatar header-avatar">
                                        {currentUserInfo?.avatar ? (
                                            <img src={currentUserInfo.avatar} alt={currentUserInfo.name || 'User'} />
                                        ) : (
                                            <div className="default-avatar">
                                                <FontAwesomeIcon icon={faUser} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h5>{currentUserInfo?.name || 'Khách hàng'}</h5>
                                        <div className="user-id-display header">ID: {currentUserId}</div>
                                        {currentUserInfo?.email && (
                                            <div className="user-email">
                                                <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
                                                {currentUserInfo.email}
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
                                        <FontAwesomeIcon icon={faSync} />
                                    </button>
                                    <div className="online-status">
                                        <FontAwesomeIcon icon={faCircle} className="online-icon" />
                                        <span>Online</span>
                                    </div>
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
                                        // Xác định tên người gửi cho tin nhắn
                                        let senderName = message.userName || 'Admin';
                                        let senderInfo = null;

                                        // Nếu không phải admin gửi và không có userName trong message
                                        if (message.senderType !== 'admin' && !message.userName) {
                                            // Tìm trong danh sách người dùng dựa vào senderId
                                            const userInList = users.find(u => u.userId === message.senderId);
                                            if (userInList && userInList.name) {
                                                // Nếu tìm thấy tên từ danh sách users
                                                senderName = userInList.name;
                                                senderInfo = userInList;
                                                console.log(`📝 Sử dụng tên người dùng từ danh sách: ${senderName}`);
                                            } else if (currentUserInfo && currentUserId === message.senderId) {
                                                // Nếu đang chat với người dùng này, sử dụng thông tin hiện tại
                                                senderName = currentUserInfo.name || 'Khách hàng';
                                                senderInfo = currentUserInfo;
                                                console.log(`📝 Sử dụng tên người dùng hiện tại: ${senderName}`);
                                            } else {
                                                // Mặc định sử dụng senderId nếu không tìm thấy tên
                                                senderName = message.senderId;
                                                console.log(`⚠️ Không tìm thấy tên người dùng, sử dụng ID: ${senderName}`);
                                            }
                                        }

                                        // Hiển thị ngày nếu cần
                                        const showDateHeader = shouldShowDate(messages, index);

                                        // Determine if this is an image message
                                        const isImage = message.messageType === 'image' || 
                                                      (message.message && typeof message.message === 'string' && 
                                                       message.message.startsWith('data:image/'));

                                        return (
                                            <React.Fragment key={index}>
                                                {showDateHeader && (
                                                    <div className="date-separator">
                                                        <span>{formatMessageDate(message.createdAt)}</span>
                                                    </div>
                                                )}
                                                <div
                                                    className={`message ${message.senderType === 'admin' ? 'sent' : 'received'}`}
                                                >
                                                    <div className="message-content">
                                                        <div className="message-sender">
                                                            {senderName}
                                                            {senderInfo?.email && (
                                                                <small className="sender-email"> ({senderInfo.email})</small>
                                                            )}
                                                            {message.senderType !== 'admin' && (
                                                                <div className="message-sender-id">ID: {message.senderId}</div>
                                                            )}
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
                                                        ) : (
                                                            <p>{message.message}</p>
                                                        )}
                                                        
                                                        <div className="message-footer">
                                                            <small className="message-time">{formatTime(message.createdAt)}</small>
                                                            {message.senderType === 'admin' && (
                                                                <small className="message-status">
                                                                    <FontAwesomeIcon icon={message.read ? faCheckDouble : faCheck} />
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}

                            {/* Nút cuộn xuống cuối cùng */}
                            {showScrollButton && (
                                <button className="scroll-bottom-button" onClick={scrollToBottom} title="Cuộn xuống cuối">
                                    <FontAwesomeIcon icon={faArrowDown} />
                                </button>
                            )}
                        </div>

                        {currentUserId && (
                            <div className="chat-input-container">
                                {/* Image preview */}
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
                                    
                                    {/* Image upload button */}
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

            {/* Image Modal */}
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
        </div>
    );
};

export default AdminChat; 