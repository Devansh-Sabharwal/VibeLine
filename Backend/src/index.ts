import WebSocket, { WebSocketServer } from "ws";
import * as dotenv from 'dotenv'
dotenv.config();

type customWebSocket = WebSocket & {roomId:string} & {userId:string}
const PORT = parseInt(process.env.PORT||"1000",10);
const wss = new WebSocketServer({ port:PORT });
const allSockets = new Map();
wss.on("connection",(socket:customWebSocket)=>{
    socket.on("close", () => {
      // console.log("Socket disconnected");   
    });
      socket.on("message",(message)=>{

        const msg = message.toString();
        const parsedMessage = JSON.parse(msg);   
      try{
        if(parsedMessage.type=="create"){
         const roomId = parsedMessage.payload.roomId;
         allSockets.set(roomId,[socket]);
         const body = {
            status:"success",
            message:"Room Created: "+roomId
         }
         socket.send(JSON.stringify(body));
         return;
        }
        if(parsedMessage.type=="join"){
            const roomId = parsedMessage.payload.roomId;
            const sockets = allSockets.get(roomId);
            if(!sockets){
               const body = {
                  status:"error",
                  payload:{
                     message:"No Room Found,Please check roomId and try again"
                  }
               }
               socket.send(JSON.stringify(body));
               return;
            }
            socket.roomId = roomId;
            sockets.push(socket);
            if(sockets){
               sockets.forEach((s:customWebSocket)=>{
                  s.send(JSON.stringify({
                     status:"success",
                     payload:{
                        message:parsedMessage.payload.name + " joined",
                        userId:parsedMessage.payload.userId,
                        name:parsedMessage.payload.name,
                        type:"greeting"
                     }
                  }));
               })
            }
        }
        if(parsedMessage.type=="chat"){
            const senderRoomId = socket.roomId;
            if(!senderRoomId){
               const body = {
                  status:"error",
                  payload:{
                     message:"No Room Found,Please check roomId and try again"
                  }
               }
               socket.send(JSON.stringify(body));
               return;
            }
            const sockets = allSockets.get(senderRoomId);
            if(sockets){
               sockets.forEach((s:customWebSocket)=>{
                  s.send(JSON.stringify({
                        status:"success",
                        type:"chat",
                        payload:{
                           message:parsedMessage.payload.message,
                           userId:parsedMessage.payload.userId,
                           name:parsedMessage.payload.name
                        }
                  })); 
               })
            }
        }
      }
      catch(e){
         // console.log(e);
         socket.send(JSON.stringify({
            status:"error",
            payload:{
               message:"Error Occured"
            }
         }))
      }
     })
     
})