const express = require('express');
const http = require('http'); // <-- Dòng này quan trọng
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Import Library
const {InitSocket} = require('./server/config/socket');
const {FetchInitApp} = require('./server/config/init-app');
const configRoutes = require('./server/routes/config.routes');

// Sub-Routes
const commonRoutes = require('./server/routes/common.routes');
const championRoutes = require('./server/routes/champion.routes');
const athleteRoutes = require('./server/routes/athlete.routes');
const competitionRoutes = require('./server/routes/competition.routes');
const competitionMatchRoutes = require('./server/routes/competition_match.routes');
const competitionMatchTeamRoutes = require('./server/routes/competition_match_team.routes');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploads từ USER_DATA_PATH (khi build) hoặc local (khi dev)
let uploadsDir;

console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  uploadsDir = path.join(__dirname, 'server/uploads');
  console.log('📁 Development mode - Using local uploads:', uploadsDir);
} else {
  uploadsDir = path.join(process.env.USER_DATA_PATH, 'uploads');
  console.log('📁 Production mode - Using USER_DATA_PATH:', uploadsDir);
}
// Tạo thư mục uploads nếu chưa tồn tại
const logosDir = path.join(uploadsDir, 'logos');
if (!fs.existsSync(logosDir)) {
  try {
    fs.mkdirSync(logosDir, { recursive: true });
    console.log('✅ Created uploads directory:', logosDir);
  } catch (error) {
    console.error('❌ Error creating uploads directory:', error);
  }
}

console.log('📁 Uploads directory:', uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// allow cors
app.use(cors());

// set route in middleware
// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

app.use('/api/config', configRoutes);
app.use('/api', commonRoutes);
app.use('/api', championRoutes);
app.use('/api', athleteRoutes);
app.use('/api', competitionRoutes);
app.use('/api', competitionMatchRoutes);
app.use('/api', competitionMatchTeamRoutes);


// Khởi tạo socket
InitSocket(io);

// Khởi tạo database.

// Gọi khi khởi tạo ứng dụng
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
    // Development: Khởi tạo ngay
    console.log('🔧 Development mode - Initializing app immediately');
    FetchInitApp();
} else {
    // Production: Đợi USER_DATA_PATH từ Electron
    console.log('process.env.USER_DATA_PATH: ', process.env.USER_DATA_PATH);

    if (process.env.USER_DATA_PATH) {
        FetchInitApp();
    } else {
        console.log('Chờ userDataPath...');
        let interval = setInterval(() => {
            if (process.env.USER_DATA_PATH) {
                clearInterval(interval);
                FetchInitApp();
            }
        }, 1000);
    }
}


// Error handlers
// Catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   const error = new Error('Not Found');
//   error.status = 404;
//   next(error);
// });

// Development error handler
// Will print stacktrace
// if (app.get('env') !== 'development') {
//   app.use(function (error, req, res, next) {
//     res.status(error.status || 500);
//     res.send({
//       message: error.message,
//       error: error
//     });
//   });
// }

// Production error handler
// No stacktraces leaked to user
// app.use(function (error, req, res, next) {
//   res.status(error.status || 500);
//   res.send({
//     message: error.message,
//     error: error
//   });
// });

// app.listen(6789, () => console.log('API running on port 6789 🔥'));

// server.listen(6789, () => {
//   console.log(`Server đang chạy tại http://localhost:${6789}`);
// });

server.listen(6789,() => {
    console.log(`Server đang chạy tại http://localhost:${6789}`);
});
