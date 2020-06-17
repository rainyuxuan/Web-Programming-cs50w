import os
from pip._vendor import requests

from flask import Flask, session, render_template, request, redirect, url_for, jsonify
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
# Set up database
# set DATABASE_URL=postgres://vzmwajfljusmpe:71073bfaaeeb5ebcdb98f04e360058843870d01305ff1a30828d4392404cebf3@ec2-18-233-32-61.compute-1.amazonaws.com:5432/dr9b48f0b5ur3
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))

USER = None


@app.route("/")
def index():
    return render_template('index.html')


# @app.route("/send", methods=["POST"])
# def send():
#     message = request.form.get("messageInput")
#     name = session['user'].name


@socketio.on("send message")
def send(message):
    emit('announce message', message, broadcast=True)
