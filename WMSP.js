// Write here the IP of the server that is running this
const myIP = "";
/* Although you can run WMSP without using a key, your server will be listed as unverified.
If you get a key your server will be verified and official */
const key = "";

/* Here starts the code. Don't touch it if you don't know */
var Utility = require('./Utility/Utility');
var CreateFunction = Utility.CreateFunction;
var WebSocket = require('ws');
const mainServerIp = "62.4.16.132";
const mainServerPort = "7778";
var port = 20000;

console.log("WMSP started!");

var ws;
var connect = function() {
    ws = new WebSocket("ws://" + mainServerIp + ":" + mainServerPort + "/");
    ws.onopen = CreateFunction(this, function(evt) {
        console.log("WMSP connected to main server")
    });
    ws.onclose = CreateFunction(this, function(evt) {
        console.log("Connection closed. Trying to reconnect in 30 seconds...");
        setTimeout(connect, 30000);
    });
    ws.onerror = CreateFunction(this, function(evt) {
        console.log("Connection error");
    });
    ws.onmessage = CreateFunction(this, function (evt) {
        var received_msg = evt.data;
        console.log("Got message: " + received_msg);
        send({ message: "Key", key: key });
        var message = JSON.parse(received_msg);
        var messageTitle = message['message'];
        switch (messageTitle) {
            case "StartGame": {  //{message: "StartGame", text: String};
                startGameServer(message['gameJSON'], message['lobbyID'])
            } break;
            case "CouldYouStart": {
                send({ message: "SureICan", lobbyID: message['lobbyID'] })
            } break;
        }
    })
}
connect();

function send(object) {
    ws.send(JSON.stringify(object));
};


function startGameServer(gameJSON, lobbyID) {
    const exec = require('child_process');
    const game = exec.exec('mono /LoM/GameServer/GameServerApp.exe --port ' + port + ' --config-json ' + gameJSON,
        { cwd: '/LoM/GameServer', maxBuffer: 1024 * 90000 });
    console.log(port)
    var waitingForBoot = true;
    game.stdout.on('data', (data) => {
        if (waitingForBoot) {
            //if (data.indexOf("Game is ready.") !== -1) {
            console.log("Game is ready, doing callback");
            waitingForBoot = false;
            send({ message: "PortToUse", port, lobbyID, ip: myIP });
            port++;
        }

    });
    game.on('close', (code) => {
        //messageCallback(`child process exited with code ${code}`);
        console.log(`child process exited with code ${code}`);
    });
}