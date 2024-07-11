let onlineUsers = [];
export default function (socket, io) {
  //user joins or opens the application !
  socket.on("join", (user) => {
    socket.join(user);
    //add joined user to online users
    if (!onlineUsers.some((u) => u.userId === user)) {
      onlineUsers.push({ userId: user, socketId: socket.id });
    }
    //send online users to Frontend
    io.emit("get-online-users", onlineUsers);
    //Send socket id
    io.emit("setup socket", socket.id);
  });
  //socket disconnect
  socket.on("disconnect", () => {
    //Filter the current not online user and send back
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("get-online-users", onlineUsers);
  });

  //Join a conversation room
  socket.on("join conversation", (conversation) => {
    socket.join(conversation);
  });

  //Send and Recieve Message
  socket.on("send message", (message) => {
    let conversation = message.conversation;
    if (!conversation.users) return;
    conversation.users.forEach((user) => {
      if (user._id === message.sender._id) return;
      socket.in(user._id).emit("receive message", message);
    });
  });

  socket.on("typing", (conversation) => {
    socket.in(conversation).emit("typing", conversation);
  });

  socket.on("stop typing", (conversation) => {
    socket.in(conversation).emit("stop trying");
  });
  //call
  //---call user
  socket.on("call user", (data) => {
    let userId = data.userToCall;
    let userSocketId = onlineUsers.find((user) => user.userId == userId);
    io.to(userSocketId.socketId).emit("call user", {
      signal: data.signal,
      from: data.from,
      name: data.name,
      picture: data.picture,
    });
  });
  //---answer call
  socket.on("answer call", (data) => {
    console.log(`answered now sent --> ${data}`);
    console.log(data);
    io.to(data.to).emit("call accepted", data.signal);
  });

  //---end call
  socket.on("end call", (id) => {
    io.to(id).emit("end call");
  });
}
