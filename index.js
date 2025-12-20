const { json } = require("body-parser");
const express = require("express");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/authRoutes");
const {Server} = require('socket.io')
const http =require("http")
const socketHandler = require('./sockets/socketHandler')
require("./config/db");


const httpServer = http.createServer(app); //initialize the socket.io 
const io = new Server(httpServer,{
cors:{
 origin:"*",
 method:['GET','POST']
}
})
socketHandler(io) //  logic is inside this function // pass the initialized socket

app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes)

// --- GLOBAL ERROR HANDLING ---
// Catches errors anywhere in the app so the server doesn't crash
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
