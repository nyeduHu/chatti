const figlet = require('figlet');
const fetch = require('node-fetch');
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
const chalk = require('chalk');
const IP = require('ip');

/*
 * SERVER VARIABLES 
 */

let serverIP = "";
let serverPort = "";

const GMessages = [];

let isDone;

/**
 * USER VARIABLES
 */

let username = "";

//Loading and some questions

console.log(chalk.yellow(figlet.textSync('Chatti', { horizontalLayout: 'full' })))
console.log(chalk.yellow(figlet.textSync('CLIENT', { horizontalLayout: 'full', font: 'Big Money-ne' })))

rl.question(chalk.red('What server do you want to join? (please make sure your syntax is something like this: 111.222.33.44.555)? '), (ip) =>{
    serverIP = ip;
    rl.question(chalk.red("What the server's port do you want to join? (please make sure your syntax is something like this: 1234)? "), (port) =>{
        serverPort = port;
        rl.question(chalk.red('What will be your username in the chat? (e.g. nyedu)? '), (name) => {
            username = name;
            let body = {"name":`${username}@${IP.address()}`};

            fetch(`http://${serverIP}:${serverPort}/connected/`, {
                    method: 'post',
                    body:    JSON.stringify(body),
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(res => res.json())
                .then(json => console.log(`Connected to server! (${serverIP}:${serverPort}) \nResponse: ${json.status}`));
            isDone = true;
        })
    })
})

/**
 * constantly getting messages, and writing them out if we have new ones.
 */

let int = setInterval(() => {
    if(isDone){
        fetch(`http://${serverIP}:${serverPort}/comments/`)
        .then(res => res.json())
        .then(json =>{

            json.messages.forEach(ele => {
                if(!GMessages.includes(ele.name)){
                    console.log(`${ele.author}: ${chalk.yellowBright(ele.content)}`);
                    GMessages.push(ele.name)
                }
            })
            
            cMessages = json.messages;
        });
    }
}, 800);

/**
 * getting input and sending msg
 * (also handleing commands)
 */

rl.on('line', (input) => {
    if(input == "exit()") return process.exit(1);
    return SendMessage(input);
});

const SendMessage = async (message) => {
    let cMessages;
    fetch(`http://${serverIP}:${serverPort}/comments/`)
    .then(res => res.json())
    .then(json =>{
        cMessages = json.messages;
    });
    setTimeout(() => {
        let id = cMessages[cMessages.length - 1] != undefined ? cMessages[cMessages.length - 1].id + 1 : 1;
        let body = [
            {"name":`message-${id}`, "id":id, "author": `${username}@${IP.address()}`, "content":message}
        ]
        fetch(`http://${serverIP}:${serverPort}/sendMSG/`, {
                method: 'post',
                body:    JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            })
            .then(res => res.json())
    }, 200)
}