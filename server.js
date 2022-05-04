const server = require('./index')

server.listen(5000, '127.0.0.1', () => {
    console.log('Server écoute sur le port 5000')
})