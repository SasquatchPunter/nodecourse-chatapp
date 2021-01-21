const users = []

function addUser({ id, username, room }) {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'Username and room are required.'
        }
    }

    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })
    if (existingUser) {
        return {
            error: 'That username is in use.'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

function removeUser(id) {
    const index = users.findIndex(user => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

function getUser(id) {
    return users.find(user => user.id === id)
}

function getUsersInRoom(room) {
    room = room.trim().toLowerCase()
    const usersInRoom = users.filter(user => user.room === room)
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}