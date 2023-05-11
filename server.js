// Server Setup & Dependancies 
const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*', // You can restrict this to specific domains if needed.
        methods: ['GET', 'POST']
    }
});
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.static('public'));

// Our Imports
const clientConnect = require('./client/clientConnect.js');
const clientIdentify = require('./client/clientIdentify.js')
const clientLogin = require('./client/clientLogin.js');
const clientMessage = require('./client/clientMessage.js');
const clientDisconnect = require('./client/clientDisconnect.js');
const leaderBoard = require('./userData/leaderboardPosition.js');
const removingTreasure = require('./management/removingTreasure.js')
// GENERATE TREASURE ON SERVER START
require('./management/generateTreasure.js');
const clientScore = require('./client/clientScore.js');
const scoreAdd = require('./client/scoreAdd.js');
const clientUserAchievement = require('./client/clientUserAchievement.js');


// Test generation
require('./management/testwallsfloor.js')

// CONNECTION DETAILS
let intervalID;
io.on('connection', (socket) => {

  // Handle Client Connections
  clientConnect(socket);

    // Handle Client Messages
    socket.on('ident', (message) => {
        clientIdentify(message, socket, io)
    });

    socket.on('login', (message) => {
        clientLogin(message, socket, io)
    });

    // Handle Client Messages
    socket.on('message', (message) => {
        clientMessage(message, socket, io)
    });

    // Handle Client Disconnections
    socket.on('disconnect', () => {
        clientDisconnect(socket, io);
    });

    // // Gem Collected Variable

    socket.on('gemcollected', (message) => {
        removingTreasure(message, socket, io);
    });

  // Handle point collection
  socket.on('collectPoints', (message) => {
    clientScore(message, socket, io);
  });

  // Handle End of Round
  socket.on('roundEnd', () => {
    scoreAdd(); 3
  })

  // Handle Client Disconnections
  socket.on('disconnect', () => {
    clientDisconnect(socket, io);
    scoreAdd();
  });

    // Handle client requests for user achievement
    socket.on('getUserAchievement', (username) => {
      console.log('[Server]: Received getUserAchievement request for user:', username);
      const userAchievement = clientUserAchievement({ username: username });
      // Emit the user achievement data back to the client
      socket.emit('userAchievement', userAchievement);
  });

  // Start sending test messages to all clients in the 'users' room
  if (!intervalID) {
    intervalID = setInterval(() => {
      //console.log("Test message sent to users")
      io.to('user').emit(
        'message',
        'This is a test message from the server!');
    }, 10000);
  }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

leaderBoard();