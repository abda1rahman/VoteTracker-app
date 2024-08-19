
import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

interface ICandidate {
  candidate_id:string;
  socketId:string;
}

interface IRecords {
  totalVote: number
}

export let socketCandidtes: any = []
let allCandidate: any = new Set()

const io = new Server(server, {
  cors: {
    origin: [`http://127.0.0.1:5501`, `http://localhost:1337`],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log('Connection successful ✅');

  // Handle new socketCandidtes
  socket.on('new_candidate', (id) => {
    if (!allCandidate.has(socket.id) && socket.id && id.length > 10) {
      socketCandidtes.push({ candidate_id: id, socketId: socket.id });
      allCandidate.add(socket.id);
    }
    console.log('socketCandidtes', socketCandidtes)



  });
  // run when user disconnect
  socket.on("disconnect", () => {
    console.log('dissconnected ❌')
    socketCandidtes = socketCandidtes.filter((cand:ICandidate) => cand.socketId !== socket.id)
    allCandidate.delete(socket.id)
  });

});

export function emitWebSocketEvent(candidate_id: string, finalResult: IRecords) {
  
    const socketData = socketCandidtes.find((cand:any) => cand.candidate_id === candidate_id)
    if(socketData){
      console.log('socketData', socketData)
      io.to(socketData.socketId as string).emit('get_result', {totalVote: finalResult.totalVote})
    }
}

export { app, server, io };