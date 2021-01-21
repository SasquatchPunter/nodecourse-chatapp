const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages.js')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js')

const PORT = process.env.PORT || 3000

const PUBLIC_DIRECTORY_PATH = path.join(__dirname, '../public')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(PUBLIC_DIRECTORY_PATH))

io.on('connection', (socket) => {
    console.log('WebSocket Connected.')

    socket.on('join', ({ username, room }, callback) => {
        const { user, error } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('serverMsg', generateMessage(`Welcome to ${user.room}!`, 'Room Message'))
        socket.broadcast.to(user.room).emit('serverMsg', generateMessage(`${username} has joined the chat.`, 'Room Message'))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('clientMsg', (message, hint) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return hint('Profanity not allowed on this server!')
        }

        io.to(getUser(socket.id).room).emit('serverMsg', generateMessage(message, getUser(socket.id).username))
        hint('Message sent!')
    })

    socket.on('userLoc', (loc, hint) => {
        socket.broadcast.to(getUser(socket.id).room).emit('locationShare', generateLocationMessage(loc, getUser(socket.id).username))
        socket.emit('serverMsg', generateMessage('Location was shared!', 'Room Message'))
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user && user.room) {
            io.to(user.room).emit('serverMsg', generateMessage(`${user.username} has left the chat.`, 'Room Message'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})


// Route to login page
app.get('/', (req, res) => {
    res.render('chat')
})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`)
})