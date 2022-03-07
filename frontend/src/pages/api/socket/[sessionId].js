import { Server } from 'Socket.IO'

const users = {}

const SocketHandler = (req, res) => {
  const { query } = req
  const { sessionId } = query

  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {

      socket.on('check-user-connection', ({ user }) => {
        const status = users[user.id] === sessionId ? 'online': 'offline'
        socket.broadcast.emit('update-user-connection', {user, status})
      })

      socket.on('user-connection', msg => {
        console.log(msg)
        users[msg.user.id] = sessionId
        socket.broadcast.emit('update-user-connection', {user: msg.user, status: "online"})
      })

      socket.on('user-disconnect', msg => {
        console.log("Disconnect user", msg.user.username)
        delete users[msg.user.id]
        socket.broadcast.emit('update-user-connection', {user: msg.user, status: "offline"})
      });

      socket.on('pause-session', (msg) => {
        socket.broadcast.emit('update-pause-session', msg)
      })

      socket.on('end-session', () => {
        socket.broadcast.emit('update-end-session')
      })

    })
  }
  res.end()
}

export default SocketHandler
