import { Server } from "socket.io";
import express from "express";
import http from "http";
import { getFinalResultCandidate } from "../redis/trackRecods";
import log from "./logger";

const app = express();

const server = http.createServer(app);

interface ICandidate {
  candidate_id: string;
  socketId: string;
}

interface IRecords {
  totalVote: number;
}

export let socketCandidtes:ICandidate[] = [];
let allCandidate: any = new Set();

const io = new Server(server, {
  cors: {
    origin: [`http://127.0.0.1:5501`, `http://localhost:1337`],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  log.info('=======================================================')
  console.log(`Connection successful ✅ socketId: ${socket.id}`);

  // Handle new socketCandidtes
  socket.on("new_candidate", async (id) => {
    if (!allCandidate.has(socket.id) && socket.id && id.length > 10) {
      socketCandidtes.push({ candidate_id: id, socketId: socket.id });
      allCandidate.add(socket.id);
      console.log('Socket Data :', socketCandidtes)

      // Get final result for candidate
      const finalResult = await getFinalResultCandidate(id);
      console.log(`finalResult: ${finalResult} for this ${id} `)
      socket.emit("get_result", finalResult );
    } else {
      log.info('=======================================================')
      console.log('Socket Data :', socketCandidtes)
      log.warn(`already exist socket.id ${socket.id}`);
      socket.emit("error", {
        message: "Invalid candidate ID or already connected.",
      });
      log.error('Invalid candidate ID or already connected webSocket.')
    }
  });

  // run when user disconnect
  socket.on("disconnect", () => {
    console.log('==================================================')
    log.info(`dissconnected ❌ socket Id: ${socket.id}`);
    socketCandidtes = socketCandidtes.filter(
      (cand: ICandidate) => cand.socketId !== socket.id
    );
    allCandidate.delete(socket.id);
  });
});

export function emitWebSocketEvent(
  candidate_id: string,
  finalResult: IRecords
) {
  const socketData = socketCandidtes.find(
    (cand: any) => cand.candidate_id === candidate_id
  );
  if (socketData) {
    log.info("socketData", socketData);
    io.to(socketData.socketId as string).emit("get_result",  finalResult.totalVote );
  }
}

export { app, server, io };


