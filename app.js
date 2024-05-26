const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const testRouter = require('./server/routes/caidat.ts');
/**
 *  SERVER-SIDE
 */
// const app = express();
// // we imported config
// // we imported router
// // we imported mongoose
// // we imported cors
// // we imported express and set up a new express
// // instance const app = express().

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// allow cors
app.use(cors());

// set route in middleware
// app.use(router);
app.use('/api', testRouter);

// Error handlers

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Development error handler
// Will print stacktrace
if (app.get('env') !== 'development') {
  app.use(function (error, req, res, next) {
    res.status(error.status || 500);
    res.send({
      message: error.message,
      error: error
    });
  });
}

// Production error handler
// No stacktraces leaked to user
app.use(function (error, req, res, next) {
  res.status(error.status || 500);
  res.send({
    message: error.message,
    error: error
  });
});

app.listen(7778, () => console.log('API running on port 7778 🔥'));

//-----------------------------------------------------------------------------------------------//
/**
 * SOCKET.IO
 */

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});
// If you are using typescript include this declare block
// Used to extend express Request (req) type definition
// declare global {
//     namespace Express {
//         interface Request {
//             admin: any;
//             io: Server; // Server is coming from the import
//         }
//     }
// }

const port = process.env.PORT || 7777;
io.on('connection', (socket) => {
  console.log('socket: ', socket);
  // ...
});

// Allows you to send emits from express
app.use(function (request, response, next) {
  request.io = io;
  next();
});

// This is how you can use express to emit to other sockets
app.get('/users', (req, res) => {
  // emit to other sockets or room (all socket.io events supported)
  req.io.timeout(5000).emit('tester', (err, responses) => {
    if (err) {
      console.log('err: ', err);
      // some clients did not acknowledge the event in the given delay
    } else {
      res.json(responses); // depending on your data // chỗ này gây lỗi
      console.log('responses: ', responses);
    }
  });
  // send api data, route, info , etc to web client, axios, etc
  // res.send('Users Page');
});

httpServer.listen(port, () => {
  console.log(`Socket listening on *:${port}`);
});
