const displayNameModal = Handlebars.compile(document.querySelector('#displayNameModalTemplate').innerHTML);
const createChannelModal = Handlebars.compile(document.querySelector('#createChannelModalTemplate').innerHTML);
const channelListItem = Handlebars.compile(document.querySelector('#channelListItemTemplate').innerHTML);
const messageOfUser = Handlebars.compile(document.querySelector('#messageOfUserTemplate').innerHTML);
const messageOfOther = Handlebars.compile(document.querySelector('#messageOfOtherTemplate').innerHTML);
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content loaded");
    
    //const Handlebars = require("handlebars");
    // show dnm after page loaded
    if (!localStorage['username'] || localStorage['username'] === ''){
        document.body.innerHTML += (displayNameModal({
            'name': ''
        }));
        
    }else{
        console.log('Have a stored name already');
        document.body.innerHTML += (displayNameModal({
            'name': localStorage['username']
        }));
    }
    console.log("AUTO-loaded dnm");

    // Connect to websocket
    socket.on('error', function(){
        console.log("Sorry, there seems to be an issue with the connection!");
    });
    // var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.on('connect', () => {

        console.log('socket.io is on connected')
        // Sending a message
        // document.querySelector('#messageInputForm').onsubmit = () => {
        //     let messageContent = document.querySelector('#messageInput').value;
        //     let messageName = document.querySelector('#username').textContent;
        //     let messageTime = getCurrentTime();
    
        //     socket.emit('send message', {
        //         'channel': document.querySelector('#channelName').dataset.id,
        //         'content': messageContent,
        //         'name': messageName,
        //         'time': messageTime
        //     });
    
    
        //     // request.open('POST', '/send');
    
        //     // request.onload = () =>{
        //     //     const message = JSON.parse(request.responseText);
    
        //     //     const name = message.name;
        //     //     const time = message.time;
        //     //     const content = message.content;
        //     // };
        // };
    
        
    });
    

    // when someone create a channel, user also add this channel to list
    socket.on('announce channel', data => {
        const channelName = data['channel_name'];
        const channelID = data['channel_id'];
        console.log('RECEIVED and announcing #' + channelID + channelName);
        const newChannel = channelListItem({'channelID': channelID, 'channelName': channelName});
        // Add to channel list
        document.querySelector('#exploreChannels').innerHTML += newChannel;
        console.log('ADD '+ channelID + channelName +' to channel list');
    });
    
});


///////////////////// ON START /////////////////////



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
    socket.emit('create channel', {'channel_name': channelName});
    
    // const channelID = 1231;
    // const newChannel = channelListItem({'channelID': channelID, 'channelName': channelName});
    // Add to channel list
    // document.querySelector('#favChannels').innerHTML += newChannel;
    // console.log('ADD '+ channelID + channelName +' to channel list');

    // close modal
    cancelModal();
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
    // update to app
    // update to html
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

    console.log(messageName +'@' + messageTime + ": '" + messageContent + "'");
    // add to server
    // add to user
    const message = messageOfUser({'messageName': messageName, 'messageTime': messageTime, "messageContent": messageContent});
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



///////////////////// CHAT SECTION /////////////////////

// open a channel to the chat section
function openChannel(channelID){
    console.log("open channel #" +channelID);
    // get messages from the server
    messages= "";
    loadChannel(messages);
}

// put messages of this channel to the chat section
function loadChannel(messages){

}




// a sleep function
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
