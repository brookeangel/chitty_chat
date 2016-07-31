const http = require('http'),
      nodestatic = require('node-static');

const file = new nodestatic.Server('./public');
const chatServer = require('./chat_server');

const server = http.createServer((req, res) => {
  req.addListener('end', () => {
    console.log('Serving up file!');
    file.serve(req, res);
  }).resume();
});

chatServer(server);

server.listen(8000);
