document.addEventListener('DOMContentLoaded', ()=> {
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', ()=>{
        // Sending a message
        document.querySelector('#messageInputForm').onsubmit = () => {
            let messageContent = document.querySelector('#messageInput').value;
            let messageName = document.querySelector('#username').textContent;
            let messageTime = getCurrentTime();

            socket.emit('send message', 
                        {'channel': document.querySelector('#channelName').dataset.id,
                        'content': messageContent, 
                        'name': messageName, 
                        'time':messageTime});
            

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

function getCurrentTime(){
    var time = new Date();

    var t = {
        'year': time.getFullYear(),
        'month': time.getMonth(),
        'date': time.getDate(),
        'hour': time.getHours(),
        'minute': time.getMinutes(),
        'second':time.getSeconds(),
    }
    t['string'] = time.toLocaleDateString() + " " + t['hour'] + ':' + t['minute'] + ':' + t['second'];

    return t;
}