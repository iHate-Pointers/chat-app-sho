const express = require('express')
const http = require('http') //core module
const socketio = require('socket.io')
const path = require('path')
const Filter = require('bad-words')
const {generateMessage, timeStampMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app) //Create server ourselves rather than use inbuilt thing to use in the next line
const io = socketio(server) //If app is passed here directly we get error

const port = process.env.PORT
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// let count = 0

io.on('connection', (socket) => { //Event, what happens after it's connected
    // //This will run everytime a user connects to server or reloads the page
    console.log('New WebSocket Connected!')

    // server (emit) -> client (recieve) - countUpdated
    // client (emit) -> server (recieve) - increment

    // //When we are sending and recieve data, what we are actually doing is transmitting events!
    // //WE want to send an event from server and get it on client side, we use
    // socket.emit('countUpdated', count)

    // //Got this from client 
    // socket.on('increment', () => {
    //     count += 1
    //     // socket.emit('countUpdated', count) //Emit to a single connection alone who asked for the request

    //     //The line below will make sure everyone connected on the server will get the event! io is kinda like a pro
    //     io.emit('countUpdated', count) 
    // })
    
    //This is where we will use all operations on users
    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser ({ id: socket.id, username, room })
        
        if(error) {
             return callback(error)
        }

        socket.join(user.room) //Will only see message on room you join

        socket.emit('message', generateMessage('Master Oogway','If you like to chat, to this room you must be at!')) //For particular connection
        socket.broadcast.to(user.room).emit('message',generateMessage('Master Oogway', `If ${user.username} wants to stay, his girlfriend he must betray!`)) 
        //To all except the user who joins/leaves the chat above

        //To display the room data
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback() //No Error
    })

    socket.on('sendMessage', (message, callback) => { //Callback for acknowledgement of the event
        const user = getUser(socket.id) 
        const filter = new Filter() //TO CHECK FOR BAD WORDS!

        if(filter.isProfane(message)){
            return callback('I am FUCKING GAY. PLEASE SHOVE A DICK up my NOSE!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message)) //To every connection, message will always be object!
        callback()
    })
    
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id) 
        io.to(user.room).emit('locationMessage', timeStampMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){ //To prevent
            io.to(user.room).emit('message', generateMessage('Master Oogway', `If ${user.username} loves art, his virginity must depart!`)) //To every connection in the server
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        } 

    })
})

server.listen(port, () => {
    console.log(`Server has been up in ${port}`)
})
