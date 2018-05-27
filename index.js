var Utility = require('./Utility/Utility');
var CreateFunction = Utility.CreateFunction;
const mainServerIp = "62.4.16.132";
const mainServerPort = "7778";
var port = 20000;
var WebSocketServer = require('ws');
var ws = new WebSocketServer("ws://" + mainServerIp + ":" + mainServerPort + "/");
ws.onmessage = CreateFunction(this, function (evt) {
    var received_msg = evt.data;
    console.log("Got message: " + received_msg);
    var message = JSON.parse(received_msg);
    var messageTitle = message['message'];
    switch (messageTitle) {
        case "StartGame": {  //{message: "StartGame", text: String};
            startGameServer(message['gameJSON'])
        } break;
        case "CouldYouStart": {
            ws.send({ message: "SureICan" })
        } break;
    }
})



function startGameServer(gameJSON) {
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
            ws.send({ message: "PortToUse", port });
            port++;
        }

    });
    game.on('close', (code) => {
        messageCallback(`child process exited with code ${code}`);
        console.log(`child process exited with code ${code}`);
    });
}