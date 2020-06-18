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
    session.clear()

    channels = db.execute('SELECT * FROM channels')
    return render_template('index.html')


# @app.route("/send", methods=["POST"])
# def send():
#     message = request.form.get("messageInput")
#     name = session['user'].name


@socketio.on("send message")
def send(message):
    emit('announce message', message, broadcast=True)