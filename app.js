const express = require('express');
const { createServer } =  require('http');
const { Server } =  require('socket.io');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
/**
 *  SERVER-SIDE
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));



app.get('/test', (req, res) => {
    res.send('Welcome to your express API');
});

// app.listen(7777, () => console.log('App running on port 7777 🔥'));


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
    req.io.timeout(5000).emit("tester", (err, responses) => {
        if (err) {
            console.log('err: ', err);
          // some clients did not acknowledge the event in the given delay
        } else {
            res.json(responses) // depending on your data // chỗ này gây lỗi
            console.log('responses: ', responses);
        }
      });
    // send api data, route, info , etc to web client, axios, etc
    // res.send('Users Page');
});

httpServer.listen(port, () => {
    console.log(`listening on *:${port}`);
});

