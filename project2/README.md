# Project 2: Stelamaso

An Online Live Web Chatroom

## Features

- Anonymous: you can freely name yourself with a display name and change it whenever you want.
- Explore thousands of Steloj (chatroom) created by users!
- Create you Stelo!
- Chat with others!
- No tracking.
- Limited message storage.
- Remember locally your display name and selected channel.

### Tech Implementation

- Full-duplex communication
  - Socket.io: create channel and announcing; message sending and announcing; 
- Ajax: channel-message loading;

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
- why failed jsonify?
- request.response what receive types?
