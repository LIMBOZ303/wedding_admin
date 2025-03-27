// AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [socket, setSocket] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Check for user preference on dark mode
  useEffect(() => {
    // Check if user has previously set a preference
    const savedDarkMode = localStorage.getItem('darkMode');
    
    // Check for system preference if no saved preference
    if (savedDarkMode === null) {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    } else {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Apply dark mode to body when state changes
  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode);
    
    // Apply or remove dark-mode class on body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Khởi tạo kết nối Socket.IO khi có người dùng đăng nhập
  useEffect(() => {
    if (user) {
      // Kết nối đến server socket
      const newSocket = io('https://apidatn.onrender.com', {
        transports: ['websocket'],
        upgrade: false
      });
      
      setSocket(newSocket);
      
      // Đăng ký là admin
      newSocket.emit('registerAdmin');
      
      // Lắng nghe sự kiện có tin nhắn mới
      newSocket.on('newMessage', (data) => {
        const { message } = data;
        
        // Nếu tin nhắn từ người dùng và chưa đọc, tăng số tin nhắn chưa đọc
        if (message.senderType === 'user' && !message.read) {
          setUnreadMessages(prev => prev + 1);
        }
      });
      
      // Clean up khi component unmount
      return () => {
        newSocket.disconnect();
      };
    } else {
      // Nếu không có user, đóng kết nối socket nếu có
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  // Hàm để đánh dấu tất cả tin nhắn đã đọc
  const markAllMessagesAsRead = () => {
    setUnreadMessages(0);
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      setUser, 
      darkMode, 
      setDarkMode, 
      socket,
      unreadMessages,
      markAllMessagesAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};
