let io = null;
const onlineUsers = new Map();

export const setIo = (socketIoInstance) => {
  io = socketIoInstance;
};

export const getIo = () => io;

export const getOnlineUsers = () => onlineUsers;
