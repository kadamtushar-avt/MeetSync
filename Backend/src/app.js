import express from "express";
import {createServer} from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import cors from "cors";
import dns from "dns"
import connectToSocket from "./controllers/socketManager.js"
import userRoutes from "./routes/users.routes.js"


//change dns

dns.setServers(["1.1.1.1","8.8.8.8"])




const app = express()
const server = createServer(app)
const io = connectToSocket(server)




app.set("port",(process.env.PORT || 8000))
app.use(cors())
app.use(express.json({limit:"40kb"}))
app.use(express.urlencoded({limit:"40kb",extended:true}))

//Routes
app.use("/users",userRoutes)


const start = async () => {
  
  const connectionDB = await mongoose.connect(
  "mongodb+srv://kadamtushar457_db_user:RVCnongabLUx47Bf@cluster0.kw1yqoa.mongodb.net/zoom_clone?retryWrites=true&w=majority&appName=Cluster0"
  );

  console.log("Connected:", connectionDB.connection.host);

  server.listen(app.get("port"), () => {
    console.log("Listening on port 8000");
  });
  
};

start();
