import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Channel(db.Model):
    __tablename__ = "channels"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)


class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(db.Integer, primary_key=True)
    # the name of the message sender
    name = db.Column(db.String, nullable=False)
    # time of sending <yyyy/mm/dd hh:MM:s>
    time = db.Column(db.String, nullable=False)
    # content of the message
    content = db.Column(db.String, nullable=False)
    channel_id = db.Column(db.Integer, db.ForeignKey("channels.id"), nullable=False)


