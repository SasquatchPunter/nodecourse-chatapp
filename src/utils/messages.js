const generateMessage = (text, author) => {
    return {
        author,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = ({latitude, longitude}, author) => {
    return {
        author,
        url: `https://www.google.com/maps?q=${latitude},${longitude}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}