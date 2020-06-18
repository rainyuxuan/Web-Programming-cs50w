# Project 2: Anonymous Async Chatroom Website: Stelamaso

###Tech Implementation
- Full-duplex communication
    - Socket.io: message sending and announcing; 
- Return non-screen: channel-message loading;

### Technical Challenges
- css and js not updating
    - reason: browser cache
    - solution: code in app.py
- conflicting Jinja template and Handlebars template
    - reason: Jinja is loaded first so that Handlebars won't be loaded
    - solution: {% raw -%}{%- raw %} can indicate Handlebars

### Left Questions
- DOMContentLoaded ?
- script in head or body