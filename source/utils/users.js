const users = []

// addUser, removeUser, getUser, getUsersInRoom!

const addUser = ({ id, username, room}) => { //Three props, id, username and room
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room) {
        return {
            error: 'Username and room are required, Dumbfuck!'
        }
    }
    //Check for existing users
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Validate username
    if(existingUser) {
        return {
            error: 'Username is already in use!! Pedo--'
        }
    }
    //Store User
    const user = { id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id) //Returns position of array

    if(index !== -1){
        //Filter would keep on running even after match is found, but this will stop, since username and room is unique, we won't get in trouble
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id) //Grabs first user with this ID
}

const getUserInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

// addUser({
//     id: 23,
//     username: 'Gay',
//     room: 'Man' 
// })

// addUser({
//     id: 23,
//     username: 'Gay1',
//     room: 'Man' 
// })

// addUser({
//     id: 23,
//     username: 'Gay2',
//     room: 'Man' 
// })

// const helvi  = getUser(23)
// const list = getUserInRoom('man')

// console.log(helvi)
// console.log(list)
// console.log(users)

// const removedUser = removeUser(23)

// console.log(removedUser)
// console.log(users)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}