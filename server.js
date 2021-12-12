const express = require('express');
const path = require('path');
const socket = require('socket.io');

const app = express();

const messages = [];
const users = [];

app.use(express.static(path.join(__dirname, '/client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running on port: 8000');
});

const io = socket(server);

io.on('connection', (socket) => {
  socket.on('message', (message) => {
    messages.push(message);
    console.log('message', message);
    socket.broadcast.emit('message', message);
  });
  socket.on('join', (user) => {
    users.push(user);
    console.log('users', users);
    socket.broadcast.emit('newUser', {
      author: 'Chat Bot',
      content: `${user.name} has joined the conversation!`,
    });
  });
  socket.on('disconnect', () => {
    console.log('Oh, socket ' + socket.id + ' has left');
    const leavingUser = users.find((user) => user.id === socket.id);
    const leavingUserIndex = users.indexOf(leavingUser);
    console.log('leavingUser', leavingUser);
    users.splice(leavingUserIndex);
    socket.broadcast.emit('leavingUser', {
      author: 'Chat Bot',
      content: `${leavingUser.name} has left the conversation... :(`,
    });
    console.log('users', users);
  });
  console.log("I've added a listener on message and disconnect events \n");
});
