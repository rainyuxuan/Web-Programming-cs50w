import os
from pip._vendor import requests

from flask import Flask, session, render_template, request, redirect, url_for, jsonify
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from flask_socketio import SocketIO, emit

from datetime import timedelta


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Check for environment variable
app.config['DATABASE_URL'] = "postgres://vzmwajfljusmpe:71073bfaaeeb5ebcdb98f04e360058843870d01305ff1a30828d4392404cebf3@ec2-18-233-32-61.compute-1.amazonaws.com:5432/dr9b48f0b5ur3"
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.run(debug=True)
Session(app)

# Set up database
#Host       ec2-18-233-32-61.compute-1.amazonaws.com
#User       vzmwajfljusmpe
#Password   71073bfaaeeb5ebcdb98f04e360058843870d01305ff1a30828d4392404cebf3
#Database   dr9b48f0b5ur3
# set FLASK_ENV=development
# set DATABASE_URL=postgres://vzmwajfljusmpe:71073bfaaeeb5ebcdb98f04e360058843870d01305ff1a30828d4392404cebf3@ec2-18-233-32-61.compute-1.amazonaws.com:5432/dr9b48f0b5ur3
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))


# 以下代码用于清除浏览器cache以便css更新
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=10) # 修改缓存时间，秒做单位
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=10) # 修改回话存活时间，秒做单位

@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
    if filename:
        file_path = os.path.join(app.root_path, endpoint, filename)
    values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)
# end of cache cleaning


USER = None


@app.route("/")
def index():
    # session.clear()
    print("OPEN")
    fav_channels = db.execute('SELECT * FROM channels WHERE id < 6 ORDER BY id ASC').fetchall()
    explore_channels = db.execute('SELECT * FROM channels WHERE id > 5 ORDER BY id ASC').fetchall()
    db.commit()
    return render_template('index.html', favChannels=fav_channels, channels=explore_channels)


@app.route("/<string:channel_id>")
def channel(channel_id):
    channel = db.execute("SELECT * FROM channels WHERE id = :id", {'id':channel_id}).fetchone();
    if channel is None:
        return f"Error 404: Stelo #{channel_id} not Found"
    # build message list
    delete_messages(channel_id)
    messages = db.execute("SELECT * FROM messages WHERE channel_id = :channel_id ORDER BY id ASC", {'channel_id':channel_id}).fetchall();
    db.commit()
    # print(messages)
    # print({'id' : channel_id, 'name' : channel.name, 'messages' : messages})
    
    # 直到这里都是没问题的
    # FIXME: want a better solution than this
    m = []
    for message in messages:
        n = message.name;
        t = message.time;
        c = message.content;
        m.append([n, t, c])
    print("JSON: ", str(jsonify({'id' : channel_id, 'name' : channel.name, 'messages' : m})))
    # result = 
    # print(result)
    return jsonify({'id' : channel_id, 'name' : channel.name, 'messages' : m})


# @app.route("/send", methods=["POST"])
# def message(data):
#     channel_id = data['channel']
#     name = data['name']
#     time = data['time']
#     content = data['content']


@socketio.on("create channel")
def create(data):
    print('INTO SOCKET')
    channel_name = data['channel_name']
    db.execute("INSERT INTO channels (name) VALUES (:channel_name)", {"channel_name": channel_name})
    new_channel = db.execute("SELECT * FROM channels WHERE name = :channel_name", {"channel_name": channel_name}).fetchone()
    db.commit()
    channel_id = new_channel['id']
    channel_name = new_channel['name']
    print(channel_id, channel_name, new_channel)
    emit("announce channel", {"channel_name":channel_name, "channel_id": channel_id, 'creator': data['creator']}, broadcast=True)



@socketio.on("send message")
def send(data):
    # data = {'channel', 'name', 'time', 'content'}
    print('INTO send Socket')
    channel_id = data['channel']
    name = data['name']
    time = data['time']
    content = data['content']
    db.execute('INSERT INTO messages (channel_id, name, time, content) VALUES (:channel_id, :name, :time, :content)', {'channel_id':channel_id, 'name':name, 'time':time, 'content':content})
    # Delete extra messages of this channel
    delete_messages(channel_id)
        
    db.commit()
    print(f"Inserted message: #{channel_id} {name}@{time}: {content}")
    emit("post message", data, broadcast=True)



def delete_messages(channel_id):
    count = db.execute('SELECT COUNT(*) FROM messages WHERE channel_id = :channel_id', {'channel_id': channel_id}).fetchone()[0]
    if count > 100:
        num_delete = count - 100
        delete_targets = db.execute('SELECT id FROM messages WHERE channel_id = :channel_id ORDER BY id ASC LIMIT :num', {'channel_id': channel_id, 'num': num_delete}).fetchall()
        print(delete_targets)
        print(channel_id)
        for target in delete_targets:
            print(target[0])
            db.execute('DELETE FROM messages WHERE id= :id', {'id': target[0]})


if __name__ == '__main__': 
    socketio.run(app)

