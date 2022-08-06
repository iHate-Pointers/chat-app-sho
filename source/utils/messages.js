//This is a simple js code to hold some snippets we plan to reuse over and over!
const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const timeStampMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = 
{
    generateMessage,
    timeStampMessage
}