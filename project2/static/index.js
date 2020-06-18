const displayNameModal = Handlebars.compile(document.querySelector('#displayNameModalTemplate').innerHTML);
const createChannelModal = Handlebars.compile(document.querySelector('#createChannelModalTemplate').innerHTML);
var channelListItem = Handlebars.compile(document.querySelector('#channelListItemTemplate').innerHTML);
var messageOfUser = Handlebars.compile(document.querySelector('#messageOfUserTemplate').innerHTML);
var messageOfOther = Handlebars.compile(document.querySelector('#messageOfOtherTemplate').innerHTML);


// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content loaded");
    
    //const Handlebars = require("handlebars");
    // show dnm after page loaded
    if (!localStorage['username'] || localStorage['username'] === ''){
        document.body.innerHTML += (displayNameModal({
            'name': 'Tell me thy name'
        }));
        console.log("AUTO-loaded dnm");
    }else{
        console.log('Have a stored name already');
        updateDisplayName(localStorage['username']);
    }
    

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
        // Sending a message
        document.querySelector('#messageInputForm').onsubmit = () => {
            let messageContent = document.querySelector('#messageInput').value;
            let messageName = document.querySelector('#username').textContent;
            let messageTime = getCurrentTime();

            socket.emit('send message', {
                'channel': document.querySelector('#channelName').dataset.id,
                'content': messageContent,
                'name': messageName,
                'time': messageTime
            });


            // request.open('POST', '/send');

            // request.onload = () =>{
            //     const message = JSON.parse(request.responseText);

            //     const name = message.name;
            //     const time = message.time;
            //     const content = message.content;
            // };
        };
    });

    socket.on('announce message', message => {
        const li = document.createElement('li');
        li.innerHTML = `Vote recorded: ${data.selection}`;
        document.querySelector('#votes').append(li);
    });

});



// show ccm after clicking new star button
function createChannel(){
    console.log('CLICKED new star button => INTO createChannel');
    document.body.innerHTML += createChannelModal();
    console.log('OPENED ccm, finished function\n=========');
}

// submit channel to the server and channel list after clicking depart button
function submitChannel(){
    console.log('CLICKED DEPART button => INTO submitChannel');
    channelName = document.querySelector('#inputChannelName').value;
    console.log("GET <" + name + "> as newName");

    // Check restrictions
    if (name.length < 2){
        console.log('REJECT name for too short');
        return;
    }

    // Add to server
    
    channelID = 1231;
    newChannel = channelListItem({'name': channelName, 'id': channelID});
    // Add to channel list
    document.querySelector('#exploreChannels').innerHTML += newChannel;
    console.log('ADD '+ channelID + channelName +' to channel list');

    // close modal
    document.querySelector("#modalCreateChannel").remove();
    document.querySelector(".back-cover").remove();
    console.log('FINISHED submitChannel!\n=========');
}

// show dnm after clicking logout button
function logout(){
    console.log('CLICKED Log-out button => INTO logout');
    const oldName = document.querySelector('#username').innerHTML;
    document.body.innerHTML += displayNameModal({
        'name': oldName
    });
    console.log('OPENED dnm, finished function\n=========');
}

// submit display name after clicking CONFIRM (#submitDisplayNameBtn)
function submitDisplayName(){
    console.log('CLICKED CONFIRM button => INTO submitDisplayName');
    name = document.querySelector('#inputDisplayName').value;
    // Check restrictions
    if (name.length < 2){
        console.log('REJECT name for too short');
        localStorage['username'] = '';
        return;
    }
    console.log("GET <" + name + "> as newName and CALL updateDisplayName\n-----");
    updateDisplayName(name);

    // close modal
    document.querySelector("#modalDisplayName").remove();
    document.querySelector(".back-cover").remove();
    console.log('FINISHED submitDisplayName!\n=========');
}

// update display name
function updateDisplayName(newName) {
    console.log('INTO updateDisplayName with:' + newName);
    // update local storage
    localStorage['username'] = newName;
    // update to app
    // update to html
    document.querySelector('#username').innerHTML = newName;
    console.log('CHANGED displayed #username, finished function\n-----');
}


// submit a message
function submitMessage() {
    console.log('SUBMIT message => INTO submitMessage');
    let messageContent = document.querySelector('#messageInput').value;
    let messageTime = getCurrentTime()['string'];
    let messageName = document.querySelector("#username").textContent;

    console.log(messageName +'@' + messageTime + ": '" + messageContent + "'");
    // add to server
    // add to user
    let message = messageOfUser({'messageName': messageName, 'messageTime': messageTime, "messageContent": messageContent});
    document.querySelector('#messageList').innerHTML += message;
    console.log('send message to my list')
    // add to other

    
    //document.querySelector('#messageInput').value = "";
    console.log('FINISHED submitMessage');
    setTimeout(() => {  console.log("World!"); }, 5000);
}


// get current time => dict{}
function getCurrentTime() {
    var time = new Date();
    var t = {
        'year': time.getFullYear(),
        'month': time.getMonth(),
        'date': time.getDate(),
        'hour': time.getHours(),
        'minute': time.getMinutes(),
        'second': time.getSeconds(),
    };
    t['string'] = time.toLocaleDateString() + " " + t['hour'] + ':' + t['minute'] + ':' + t['second'];
    return t;
}


// a sleep function
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}