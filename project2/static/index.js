const displayNameModal = Handlebars.compile(document.querySelector('#modalDisplayNameTemplate').innerHTML);
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content loaded");
    // load display name modal
    //const Handlebars = require("handlebars");

    //document.body.innerHTML += displayNameModel;
    document.body.innerHTML += (displayNameModal({
        'name': 'Enter your display name'
    }));
    console.log("auto-loaded display name");

    // DisplayNameModal: submit display name btn clicked => update the name
    document.querySelector('#submitDisplayNameBtn').onclick = () => {
        updateDisplayName(document.querySelector('#inputDisplayName').value);
        console.log('displayNameModal submitted!');
    }

    // DisplayNameModal: cancel btn clicked => modal disappear
    document.querySelector('#cancelDisplayNameBtn').onclick = () => {
        document.querySelector("#modalDisplayName").remove();
        document.querySelector(".back-cover").remove();
        console.log('displayNameModal cancelled');
    }

    // nav section: logout btn clicked => show displayNameModal
    document.querySelector('#logoutBtn').onclick = () => {
        console.log('LogoutBtn Clicked');
        const oldName = document.querySelector('#username').innerHTML;
        document.body.innerHTML += displayNameModal({
            'name': oldName
        });
        console.log('displayNameModal out');
    };

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

function getCurrentTime() {
    var time = new Date();

    var t = {
        'year': time.getFullYear(),
        'month': time.getMonth(),
        'date': time.getDate(),
        'hour': time.getHours(),
        'minute': time.getMinutes(),
        'second': time.getSeconds(),
    }
    t['string'] = time.toLocaleDateString() + " " + t['hour'] + ':' + t['minute'] + ':' + t['second'];

    return t;
}

function updateDisplayName(newName) {
    document.querySelector('#username').innerHTML = newName;
    console.log('changed Name')
    document.querySelector("#modalDisplayName").remove();
    document.querySelector(".back-cover").remove();
}
/*function sendMessageSubmit() {
            let data = document.querySelector('#messageInput').value;
            console.log('SUBMIT!');
            console.log(data);
            document.querySelector('#messageInput').value = "";
            console.log(document.querySelector('#messageInput').value);
        }*/