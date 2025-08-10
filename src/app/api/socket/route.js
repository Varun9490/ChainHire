import { Server } from "socket.io";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
    res.end();
    return;
  }

  console.log("Socket is initializing...");
  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    socket.on("join_chat", (jobId) => {
      socket.join(jobId);
      console.log(`User joined chat: ${jobId}`);
    });

    socket.on("leave_chat", (jobId) => {
      socket.leave(jobId);
      console.log(`User left chat: ${jobId}`);
    });

    socket.on("new_message", (message) => {
      io.to(message.jobId).emit("message_received", message);
    });

    socket.on("typing", ({ jobId, user }) => {
      socket.to(jobId).emit("user_typing", user);
    });

    socket.on("stop_typing", ({ jobId, user }) => {
      socket.to(jobId).emit("user_stop_typing", user);
    });
  });

  res.end();
};

export default SocketHandler;
