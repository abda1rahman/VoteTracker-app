import { Server } from "socket.io";
import express from "express";
import http from "http";
import moment from "moment";
import { object } from "zod";
const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [`http://127.0.0.1:5501`, `http://localhost:1337`],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);
    // Welcome current user
    socket.emit("message", formatMessages('user',room, "Welcome to chat app"));

    // broadcast when user join chat
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessages('user',room, `${user.username} has joined the chat `));
  });

  // LListen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    console.log('server ', user)

    io.to(user.room).emit("message", formatMessages(user.username,user.room, msg));
  });

  // run when user disconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id)
    if(user){
      io.to(user.room).emit("message", formatMessages(user.username, user.room, `${user.username} left the chat`));
    }
  });

});

export { app, server, io };

function formatMessages(username?: string, room?: string, text?: string) {
  return {
    username,
    text,
    time: moment().format("h:mm a"),
  };
}
interface Iuser {
  id: string;
  username: string;
  room: string;
}
const users: Iuser[] = [];

// Join user to chat
function userJoin(id: string, username: string, room: string) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id: string) {
  const user = users.find((user) => user.id === id);
  return user as Iuser;
}

function userLeave(id:string) {
  const index = users.findIndex(user=> user.id == id)
  if(index !== -1) return users.splice(index, 1)[0] as Iuser
}

// Get room users 
function getRoomUsers(room:string) {
  return users.filter(user=> user.room === room)
}