const express = require("express");
const fs = require("fs");
var app = express();
const http = require('http');
const WebSocket = require('ws');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);
const ws = new WebSocket.Server({ server });


const clients = [];
// clients.push({ "name": "A", "lat": "1", "long": "2", "acc": "3", "date": new Date() });
var client_name, client_lat, client_long, client_acc;

app.use('/', function (req, res, next) {
    console.log("URL://" + req.originalUrl);
    next();
  });

app.get("/", function (req, res) {
    res.render("index");
});

app.get("/client", function (req, res) {
    res.render("client");
});

app.get('/client/response', (req, res) => {
    ws.clients.forEach((client) => {
        console.log(client);
    })
});

server.listen(8080, function () {
    console.log("Server is running on port 8080 ");
});

ws.on('connection', (wss) => {
    console.log('New client connected');
    wss.on('message', message => {
        const recMes = message.toString();
        if(recMes.startsWith('LOC')) {
            client_name = recMes.split(' ')[1];
            client_lat = recMes.split(' ')[2];
            client_long = recMes.split(' ')[3];
            client_acc = recMes.split(' ')[4];

            let existing = clients.find((element) => element.name === client_name);
            if (existing) {
                existing.lat = client_lat;
                existing.long = client_long;
                existing.acc = client_acc;
                existing.date = new Date();
            } else {
                clients.push({ "name": client_name, "lat": client_lat, "long": client_long, "acc": client_acc, "date": new Date() });
            }
        }
        if(recMes.startsWith('SERVER')) {
            const str = JSON.stringify(clients);
            wss.send(str);
            // console.log(str);
        }
        console.log(`Received: ${message}`);
    });
});
