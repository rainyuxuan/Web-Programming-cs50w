const displayNameModal = Handlebars.compile(document.querySelector('#displayNameModalTemplate').innerHTML);
const createChannelModal = Handlebars.compile(document.querySelector('#createChannelModalTemplate').innerHTML);
const channelListItem = Handlebars.compile(document.querySelector('#channelListItemTemplate').innerHTML);
const messageOfUser = Handlebars.compile(document.querySelector('#messageOfUserTemplate').innerHTML);
const messageOfOther = Handlebars.compile(document.querySelector('#messageOfOtherTemplate').innerHTML);
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

var displayName = "";
var currentChannel = 1;

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content loaded");
    //const Handlebars = require("handlebars");

    // show dnm after page loaded
    if (!localStorage['username'] || localStorage['username'] === ''){
        document.body.innerHTML += (displayNameModal({
            'name': ''
        }));
        
    } else {
        // displayName = localStorage['username'];
        console.log('Have a stored name already');
        document.body.innerHTML += (displayNameModal({
            'name': localStorage['username']
        }));
    }
    console.log("AUTO-loaded dnm");

    // load channel when start
    if (!localStorage['channel'] || localStorage['channel'] == ''){
        // first user, load Universo
        console.log('Opening channel UNIVERSO');
        openChannel('1');
        console.log('Finished opening Universo');
    } else {
        // load last channel
        console.log(`Opening channel ${localStorage['channel']}`);
        openChannel(localStorage['channel']);
        console.log(`Finished opening ${localStorage['channel']}`);
    }

    // check for ENTER
    document.getElementById('messageInput').onkeypress=function(e){
        if(e.keyCode==13){
            document.getElementById('sendBtn').click();
        }
    }    

    // Connect to websocket
    socket.on('error', function(){
        console.log("Sorry, there seems to be an issue with the connection!");
    });

    socket.on('connect', () => {
        console.log('socket.io is on connected')
    });
    

    // when someone create a channel, user also add this channel to list
    socket.on('announce channel', data => {
        // receive data
        const channelName = data['channel_name'];
        const channelID = data['channel_id'];
        const creator = data['creator'];
        console.log('RECEIVED and announcing #' + channelID + channelName);
        const newChannel = channelListItem({'channelID': channelID, 'channelName': channelName});
        // Announce channel creation
        if (creator == displayName){
            sendMessage({'channel': channelID, 'name': creator, 'time': getCurrentTime()['string'],
                        'content': `Saluton! Mi nur trovis #${channelID} ${channelName}!`});
            document.querySelector('#favChannels').innerHTML += newChannel;
            openChannel(channelID);
        } else {
            document.querySelector('#exploreChannels').innerHTML += newChannel;
        }
        console.log('ADD '+ channelID + channelName +' to channel list');
    });
    

    // post message to channel after respond from server
    socket.on('post message', data => {
        // receive data
        const channelID = data['channel'];
        const name = data['name'];
        const time = data['time'];
        const content = data['content'];
        console.log(`RECEIVED and will announce #${channelID}, ${name}@${time}: ${content}`);
        // create HTML element
        if (channelID == currentChannel){
            console.log('GET a message of this channel')
            let newMessage = null;
            if (name == displayName){
                console.log('This is message of Mine');
                newMessage = messageOfUser({'messageName': name, 'messageTime': time, 'messageContent': content});
                // add to message list and remove input
                document.querySelector('#messageList').innerHTML += newMessage;
                document.querySelector('#messageInput').value = '';
                toBottom();
            } else {
                console.log('This is message of Other');
                newMessage = messageOfOther({'messageName': name, 'messageTime': time, 'messageContent': content});
                document.querySelector('#messageList').innerHTML += newMessage;
            }
        }
    });
});



///////////////////// CCM MODAL /////////////////////

// show ccm after clicking new star button
function createChannel(){
    console.log('CLICKED new star button => INTO createChannel');
    document.body.innerHTML += createChannelModal();
    console.log('OPENED ccm, finished function\n=========');
}

// submit channel to the server and channel list after clicking depart button
function submitChannel(){
    console.log('CLICKED DEPART button => INTO submitChannel');
    const channelName = document.querySelector('#inputChannelName').value;
    console.log("GET <" + channelName + "> as a new Channel");

    // Check restrictions
    if (channelName.length < 2){
        console.log('REJECT name for too short');
        return;
    }

    // Add to server
    console.log("going to server")
    socket.emit('create channel', {'channel_name': channelName, 'creator': displayName});

    // close modal
    cancelModal();
    
    // open this new channel
    console.log('FINISHED submitChannel!\n=========');
}


///////////////////// DNM MODAL /////////////////////

// show dnm after clicking logout button
function logout(){
    console.log('CLICKED Log-out button => INTO logout');
    // const oldName = document.querySelector('#username').innerHTML;
    const oldName = localStorage['username'];
    document.body.innerHTML += displayNameModal({
        'name': oldName
    });
    console.log('OPENED dnm, finished function\n=========');
}

// submit display name after clicking CONFIRM (#submitDisplayNameBtn)
function submitDisplayName(){
    console.log('CLICKED CONFIRM button => INTO submitDisplayName');
    const name = document.querySelector('#inputDisplayName').value;
    // Check restrictions
    if (name.length < 2){
        console.log('REJECT name for too short');
        localStorage['username'] = '';
        return;
    }
    console.log("GET <" + name + "> as newName and CALL updateDisplayName\n-----");
    updateDisplayName(name);

    // close modal
    cancelModal();
    console.log('FINISHED submitDisplayName!\n=========');
}

// update display name
function updateDisplayName(newName) {
    console.log('INTO updateDisplayName with:' + newName);
    // update local storage
    localStorage['username'] = newName;
    // update to to app
    // update to html
    displayName = newName;
    document.querySelector('#username').innerHTML = newName;
    console.log('CHANGED displayed #username, finished function\n-----');
}



// cancel create channel by hiding ccm
function cancelModal(){
    // close modal
    document.querySelector(".modal").remove();
    document.querySelector(".back-cover").remove();
}


///////////////////// SEND MESSAGES /////////////////////

// submit a message
function submitMessage() {
    console.log('SUBMIT message => INTO submitMessage');
    const messageContent = document.querySelector('#messageInput').value;
    const messageTime = getCurrentTime()['string'];
    const messageName = document.querySelector("#username").textContent;

    // check restrictions
    if(messageContent.length == 0){
        return;
    }

    console.log(messageName +'@' + messageTime + ": '" + messageContent + "'");
    // Add to server
    console.log("going to server")
    sendMessage({'channel': currentChannel, 'name': messageName, 'time': messageTime, 'content': messageContent})
    // socket.emit('send message', {'channel': currentChannel, 'name': messageName, 'time': messageTime, 'content': messageContent});
    
    console.log('FINISHED submitMessage');
}

// send message to the server {channel, name, time, content}
function sendMessage(message){
    console.log('INTO sendMessage');
    const channel = message.channel;
    const name = message.name;
    const time = message.time;
    const content = message.content;

    // send to server
    socket.emit('send message', {'channel': channel, 'name': name, 'time': time, 'content': content});
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



///////////////////// CHAT SECTION /////////////////////

// open a channel to the chat section
function openChannel(channelID){
    console.log("INTO function => openChannel #" +channelID);
    // set to html
    currentChannel = channelID;
    localStorage['channel'] = channelID;
    // get messages from the server
    const request = new XMLHttpRequest();
    request.open('GET', `/${channelID}`);
    request.onload = () => {
        const response = JSON.parse(request.response);
        console.log("GET RESPONSE: " + response);
        const id = response.id;
        const name = response.name;
        // Update channel name
        document.querySelector('#channelName').innerHTML = `${name} #${id}`
        // Update channel messages
        const messages = response.messages;
        console.log('contents will be #' + id + name +": "+ messages);
        messagesHTML = loadMessages(messages);
        document.querySelector('#messageList').innerHTML = messagesHTML;  
        toBottom();
    };
    request.send();    
}

// return the HTML contents for the messages
function loadMessages(messages){
    result = null;
    // if no messages
    if (messages.length == 0){
        return Handlebars.compile('');
    }
    // make each message into HTML element
    // message = [name, time, content]
    for (const message of messages){
        // console.log('LOOP to one message: ' + message);
        if (message[0] == displayName){
            result += messageOfUser({'messageName': message[0], 'messageTime': message[1], 'messageContent': message[2]});
        } else {
            result += messageOfOther({'messageName': message[0], 'messageTime': message[1], 'messageContent': message[2]});
        }
    };
    return result;
}


function toBottom(){
    // scroll to bottom
    $("#messageContainer").scrollTop($("#messageList")[0].scrollHeight);
}


// a sleep function
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
