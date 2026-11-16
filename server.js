import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;


const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    fs.readFile("./public/index.html", "utf8", (err, data) => {
        res.end(data);
    })
})

const wss = new WebSocketServer({ server });

wss.on("connection", (socket, req) => {
    const username = new URL(req.url, "http://localhost").searchParams.get("username",);
    console.log(`{ "type": "system", "text": "${username} joined" }`);
    
    const joinMessage = JSON.stringify({ type: "system", text: `${username} joined` });
    wss.clients.forEach((client) => {
        client.send(joinMessage);
    });

    socket.on("message", (data) => {
        const { username, text } = JSON.parse(data.toString());
        const chatMessage = JSON.stringify({ type: "chat", username, text });
        
        wss.clients.forEach((client) => {
            client.send(chatMessage);
        });
    });

    socket.on("close", () => {
        const leaveMessage = JSON.stringify({ type: "system", text: `${username} left` });
        wss.clients.forEach((client) => {
            client.send(leaveMessage);
        });
    });

});

server.listen(PORT, () => {
    console.log(`Chat server running at http://localhost:3001`);
});