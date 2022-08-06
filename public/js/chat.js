// io()
//io is only possible cause we loaded <script src="/socket.io/socket.io.js"></script> and then loaded this script.io()
const socket = io() //TO recieve socket.emit value here, 
// with this we can send and recieve events from both server and client
// socket.on('countUpdated', (count) => { //This has event and function to do when that event runs

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')

//     //Emit from client and listen on server
//     socket.emit('increment')
// })

//Elements! One for form, one for input and one for button!
const $messageForm = document.querySelector('#message-form')
const $messageInput = $messageForm.querySelector('input') //From message form, select input, button and everything inside this form! Easy
const $messageButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//To render the template  we need template itself and a place to render the template((div where message will be showed up))

//Templates 
const messageTemplates = document.querySelector('#message-template').innerHTML
const locationTemplates = document.querySelector('#location-template').innerHTML
const sidebarTemplates = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true}) //This will after containing no prefix, we have 

const autoscroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom) //String to number
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //vISIBLE HEIGHT
    const visibleHeight = $messages.offsetHeight

    //Container Height
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled
    const scrollOffSet = $messages.scrollTop + visibleHeight
    console.log(containerHeight - newMessageHeight,scrollOffSet)
    if( (containerHeight - newMessageHeight) > scrollOffSet){ //We want to make sure we were at bottom before the last message
        $messages.scrollTop = $messages.scrollHeight + newMessageHeight
    }

}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplates, {
        username: message.username,
        //To access message
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML("beforeend",html) //HElps us insert adjacent html, we have before after being and end
    //The first message is welcome of the server
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplates, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplates, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

//Send message to the server
$messageForm.addEventListener('submit', (e) => { //messageForm is an element
    e.preventDefault()
    //Gotta disable form here
    $messageButton.setAttribute('disabled', 'disabled') //Disable after one input, function name, name of value

    const message = $messageInput.value
    socket.emit('sendMessage', message, (error) => { //3rd argument is function which runs when event is acknowledged!
        //Gotta Enabled form here again!
        $messageButton.removeAttribute('disabled')
        $messageInput.value = '' //Null the value
        $messageInput.focus() //Focus on the input
        
        if(error){
            $messageButton.removeAttribute('disabled')
            $messageInput.value = '' //Null the value
            $messageInput.focus() //Focus on the input
            console.log(error)
        }
        console.log('Message Delivered') //We find event listener in index.jjs and go back to callback function
    })
})

//Send location to the chat
$sendLocation.addEventListener('click', () => { 
    $sendLocation.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation){ //Doesn't exist then
        return alert('Geolocation is not supported by your browser')
    } 

    navigator.geolocation.getCurrentPosition((position) => { //Since promise is not supported
        // console.log(position)
        socket.emit('sendLocation', {
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, () => {
            $sendLocation.removeAttribute('disabled')
            console.log('Location shared') //Passing something in callback gave me error hence i used this
        })
    })
})

//accept the username and room you want to join, perform validation 
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error) //If error send back to root
        location.href='/'
    }
})