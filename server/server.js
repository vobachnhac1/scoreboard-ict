const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Import Library
const {InitSocket} = require('./config/socket');
const {FetchInitApp} = require('./config/init-app');
const configRoutes = require('./routes/config.routes');

// Sub-Routes
const commonRoutes = require('./routes/common.routes');
const championRoutes = require('./routes/champion.routes');
const athleteRoutes = require('./routes/athlete.routes');
const caidatRouter = require('./old/routes/caidat');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

// Routes
// app.use('/api/common', commonRoutes);
app.use('/api/config', configRoutes);
app.use('/api', commonRoutes);
app.use('/api', championRoutes);
app.use('/api', athleteRoutes);
app.use('/api', caidatRouter);

// Serve static files
app.use(express.static('public'));

// Khởi tạo socket
InitSocket(io);

// Khởi tạo database.


// Gọi khi khởi tạo ứng dụng
FetchInitApp()


// Khởi chạy server Restful API
const PORT = process.env.PORT || 6789;
server.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
