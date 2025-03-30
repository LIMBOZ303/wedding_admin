import React, { useState, useEffect, useRef } from 'react';
import { fetchChatHistory, fetchAllChatUsers, sendMessage } from '../api/chat_api';
import { getUserById } from '../api/users_api';
import { io } from 'socket.io-client';
import '../styles/AdminChat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
    faPaperclip
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
    const [selectedImage, setSelectedImage] = useState(null);
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setSelectedImage(reader.result); // Lưu trữ hình ảnh dưới dạng base64
          };
          reader.readAsDataURL(file);
        }
      };
      const handleKeyPress = (e) => {
        if (e.key === 'Enter' && messageInput.trim()) {
          e.preventDefault();
          handleSendMessage();
        }
      };
    // Xử lý khi nhận tin nhắn mới
    const handleNewMessage = async (data) => {
        const { message, userId } = data;
        
        // Xác định ID người dùng từ tin nhắn
        const senderId = message.senderId;
        console.log('📩 Nhận tin nhắn mới:', JSON.stringify(message, null, 2));
        if (message.image) {
            console.log('🖼️ Hình ảnh nhận được:', message.image.substring(0, 50) + '...');
        } else {
            console.log('⚠️ Tin nhắn không chứa hình ảnh');
        }
        console.log('------------------------------------');
        console.log('📩 NHẬN TIN NHẮN MỚI');
        console.log('📱 ID người gửi:', senderId);
        console.log('💬 Nội dung:', message.message);
        console.log('🔢 Thông tin tin nhắn đầy đủ:', JSON.stringify(message, null, 2));
        
        // Nếu tin nhắn từ người dùng (không phải admin), lấy thông tin người dùng
        if (message.senderType !== 'admin' && senderId) {
            try {
                console.log('🔍 Đang truy vấn thông tin người dùng với ID:', senderId);
                const userInfo = await getUserById(senderId);
                
                console.log('Kết quả truy vấn thông tin người dùng:', JSON.stringify(userInfo, null, 2));
                
                if (userInfo && userInfo.data) {
                    // Xác định tên người dùng từ dữ liệu
                    let userName = extractUserName(userInfo.data);
                    let userEmail = userInfo.data.email || '';
                    
                    console.log('👤 Xác định được tên người dùng:', userName);
                    console.log('📧 Email người dùng:', userEmail || 'Không có');
                    
                    // Thử sử dụng trường khác nếu tên là "Khách hàng"
                    if (userName === 'Khách hàng' && userInfo.data) {
                        console.log('🔄 Thử tìm tên trong các trường khác:', Object.keys(userInfo.data).join(', '));
                        
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
                    
                    // Cập nhật thông tin người dùng hiện tại nếu đang chat với họ
                    if (currentUserId === senderId) {
                        console.log('📌 Đang cập nhật thông tin người dùng hiện tại');
                        setCurrentUserInfo({
                            name: userName,
                            email: userEmail,
                            avatar: userInfo.data.avatar || ''
                        });
                    }
                    
                    // Kiểm tra xem người dùng đã có trong danh sách chưa
                    const existingUserIndex = users.findIndex(user => user.userId === senderId);
                    
                    if (existingUserIndex >= 0) {
                        // Người dùng đã có trong danh sách, cập nhật thông tin
                        console.log('🔄 Cập nhật thông tin người dùng trong danh sách');
                        setUsers(prevUsers => {
                            const updatedUsers = [...prevUsers];
                            updatedUsers[existingUserIndex] = {
                                ...updatedUsers[existingUserIndex],
                                name: userName,
                                email: userEmail,
                                lastMessage: message.message,
                                lastMessageTime: message.createdAt,
                                unreadCount: updatedUsers[existingUserIndex].unreadCount + 1
                            };
                            return updatedUsers;
                        });
                    } else {
                        // Người dùng chưa có trong danh sách, thêm mới
                        console.log('➕ Thêm người dùng mới vào danh sách chat');
                        setUsers(prevUsers => [
                            {
                                userId: senderId,
                                name: userName,
                                email: userEmail,
                                lastMessage: message.message,
                                lastMessageTime: message.createdAt,
                                unreadCount: 1,
                                avatar: userInfo.data.avatar || ''
                            },
                            ...prevUsers
                        ]);
                    }
                } else {
                    console.warn('⚠️ Không nhận được thông tin người dùng từ API');
                }
            } catch (error) {
                console.error('❌ Lỗi khi lấy thông tin người dùng:', error);
                
                // Ngay cả khi có lỗi, vẫn thêm người dùng vào danh sách nếu chưa có
                const existingUserIndex = users.findIndex(user => user.userId === senderId);
                if (existingUserIndex === -1) {
                    console.log('➕ Thêm người dùng mới vào danh sách (mặc định Khách hàng)');
                    setUsers(prevUsers => [
                        {
                            userId: senderId,
                            name: 'Khách hàng',
                            lastMessage: message.message,
                            lastMessageTime: message.createdAt,
                            unreadCount: 1
                        },
                        ...prevUsers
                    ]);
                }
            }
        }
        
        // Nếu đang chat với người dùng này, cập nhật tin nhắn và đánh dấu đã đọc
        if (currentUserId === userId || currentUserId === senderId) {
            console.log('📨 Cập nhật tin nhắn vào cuộc trò chuyện hiện tại');
            setMessages(prevMessages => [...prevMessages, message]);
            
            // Đánh dấu tin nhắn đã đọc
            console.log('✓ Đánh dấu tin nhắn đã đọc');
            socket.emit('markAsRead', { userId: senderId });
        }
        
        console.log('------------------------------------');
    };
    
    // Xử lý xác nhận tin nhắn đã gửi
    const handleMessageSent = (data) => {
        const { message } = data;
        console.log('✅ Tin nhắn đã gửi thành công từ server:', JSON.stringify(message, null, 2));
        if (selectedImage && !message.image) {
          console.warn('⚠️ Backend chưa xử lý hình ảnh! Dữ liệu ảnh gửi đi nhưng không nhận lại được.');
          // Thêm thông báo nếu cần
          alert('Hình ảnh đã gửi nhưng backend chưa xử lý đúng. Vui lòng kiểm tra server.');
        } else if (message.image) {
          console.log('🖼️ Hình ảnh được backend xử lý và trả về:', message.image.substring(0, 50) + '...');
        }
        setMessages(prevMessages => [...prevMessages, message]);
      };
    
    // Lấy danh sách người dùng đã chat và thông tin của họ
    const fetchUsers = async () => {
        try {
            setUserLoading(true);
            const result = await fetchAllChatUsers();
            if (result.success) {
                // Thêm thông tin người dùng cho mỗi cuộc trò chuyện
                const usersWithInfo = await Promise.all(
                    result.data.map(async (user) => {
                        try {
                            console.log(`Đang lấy thông tin cho người dùng: ${user.userId}`);
                            const userInfo = await getUserById(user.userId);
                            console.log('Thông tin người dùng nhận được:', userInfo);
                            
                            if (userInfo && userInfo.data) {
                                // Sử dụng hàm extractUserName để lấy tên người dùng
                                const userName = extractUserName(userInfo.data);
                                const userEmail = userInfo.data.email || '';
                                const userAvatar = userInfo.data.avatar || userInfo.data.avatarUrl || '';
                                
                                console.log(`Tên người dùng cho ${user.userId}:`, userName);
                                
                                // Thử sử dụng trường khác nếu tên là "Khách hàng"
                                let finalUserName = userName;
                                if (userName === 'Khách hàng' && userInfo.data) {
                                    console.log(`🔄 Thử tìm tên trong các trường khác cho ${user.userId}:`, Object.keys(userInfo.data).join(', '));
                                    
                                    // Thử tìm trong các trường có thể chứa tên
                                    for (const key in userInfo.data) {
                                        const value = userInfo.data[key];
                                        if (typeof value === 'string' && value.length > 0 && key !== 'email' && key !== '_id' && key !== 'id' && key !== 'userId') {
                                            console.log(`🔍 Thử dùng trường ${key} với giá trị: ${value}`);
                                            finalUserName = value;
                                            break;
                                        }
                                    }
                                }
                                
                                // Nếu vẫn không có tên thì dùng email
                                if (finalUserName === 'Khách hàng' && userEmail) {
                                    finalUserName = userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);
                                    console.log(`📧 Sử dụng tên từ email cho ${user.userId}:`, finalUserName);
                                }
                                
                                return {
                                    ...user,
                                    name: finalUserName,
                                    email: userEmail,
                                    avatar: userAvatar
                                };
                            }
                            
                            return {
                                ...user,
                                name: 'Khách hàng',
                                email: '',
                                avatar: ''
                            };
                        } catch (error) {
                            console.error(`Lỗi khi lấy thông tin người dùng ${user.userId}:`, error);
                            return {
                                ...user,
                                name: 'Khách hàng',
                                email: '',
                                avatar: ''
                            };
                        }
                    })
                );
                setUsers(usersWithInfo);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng chat:', error);
        } finally {
            setUserLoading(false);
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
            const result = await fetchChatHistory(userId);
            if (result.success) {
                setMessages(result.data);
                // Đảm bảo cuộn xuống sau khi dữ liệu đã tải
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
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
        if ((!messageInput.trim() && !selectedImage) || !currentUserId || !socket) return;
      
        const messageData = {
          senderId: 'admin',
          receiverId: currentUserId,
          senderType: 'admin',
        };
      
        if (messageInput.trim()) {
          messageData.message = messageInput.trim();
          console.log('📤 Gửi tin nhắn văn bản:', messageData.message);
        }
        if (selectedImage) {
          messageData.image = selectedImage;
          console.log('📤 Gửi hình ảnh (base64):', selectedImage.substring(0, 50) + '...'); // Chỉ log 50 ký tự đầu để tránh dài dòng
        }
      
        console.log('📤 Dữ liệu gửi đi:', JSON.stringify(messageData, null, 2));
        socket.emit('sendMessage', messageData);
      
        setMessageInput('');
        setSelectedImage(null);
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
    const truncateMessage = (message, maxLength) => {
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
                        <button className="refresh-button" onClick={fetchUsers} title="Tải lại danh sách">
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
                                            <p>{truncateMessage(user.lastMessage, 30)}</p>
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
                                    <button className="action-button" onClick={() => fetchMessages(currentUserId)} title="Tải lại tin nhắn">
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
    let senderName = 'Admin';
    let senderInfo = null;

    if (message.senderType !== 'admin') {
      const userInList = users.find((u) => u.userId === message.senderId);
      if (userInList && userInList.name && userInList.name !== 'Khách hàng') {
        senderName = userInList.name;
        senderInfo = userInList;
      } else if (currentUserInfo && currentUserId === message.senderId) {
        senderName = currentUserInfo.name || 'Khách hàng';
        senderInfo = currentUserInfo;
      } else {
        senderName = 'Khách hàng';
        // Logic lấy thông tin người dùng không đổi
      }
    }

    const showDateHeader = shouldShowDate(messages, index);

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
            {message.senderType !== 'admin' && (
              <div className="message-sender">
                {senderName}
                {senderInfo?.email && (
                  <small className="sender-email"> ({senderInfo.email})</small>
                )}
                <div className="message-sender-id">ID: {message.senderId}</div>
              </div>
            )}
            {/* Hiển thị văn bản nếu có */}
            {message.message && <p>{message.message}</p>}
            {/* Hiển thị hình ảnh nếu có */}
            {message.image && (
              <div className="message-image">
                <img
                  src={message.image}
                  alt="Chat attachment"
                  style={{ maxWidth: '200px', maxHeight: '200px', cursor: 'pointer' }}
                  onClick={() => window.open(message.image, '_blank')}
                />
              </div>
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
  <div className="chat-input-area">
    {/* Thêm phần xem trước ảnh ở đây */}
    {selectedImage && (
      <div className="image-preview">
        <img
          src={selectedImage}
          alt="Preview"
          style={{ maxWidth: '100px', maxHeight: '100px', marginBottom: '10px' }}
        />
        <button
          className="remove-image-button"
          onClick={() => setSelectedImage(null)}
        >
          Xóa
        </button>
      </div>
    )}
    {/* Phần input hiện tại */}
    <div className="chat-input">
      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Nhập tin nhắn..."
        disabled={!currentUserId}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageSelect(e)}
        disabled={!currentUserId}
        style={{ display: "none" }}
        id="image-upload"
      />
      <label htmlFor="image-upload" className="image-upload-button">
        <FontAwesomeIcon icon={faPaperclip} />
      </label>
      <button
        className="send-button"
        onClick={handleSendMessage}
        disabled={!messageInput.trim() && !selectedImage || !currentUserId}
      >
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </div>
  </div>
)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminChat; 