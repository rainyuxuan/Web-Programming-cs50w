import os

from flask import Flask, session, render_template, request, redirect, url_for
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/search", methods=["POST"])
def search():
    search = request.form.get("search")

    if not search:
        search = ""
        redirect(url_for('index'))
    return render_template("search.html", search=search)

@app.route("/log-in", methods=["GET", "POST"])
def log_in():
    error = None
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not username or not password:
            error = "Please input your username and password!"
        elif username != password:
            error = "Username and password did not match!"
        else:
            return redirect(url_for('index'))
    
    return render_template("log-in.html", error=error)

@app.route("/sign-up", methods=["GET", "POST"])
def sign_up():
    error = None
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        confirm = request.form.get("confirm")

        if not username or not password or not confirm:
            error = "Please input your information!"
        elif confirm != password :
            error = "Please confirm your password!"
        else:
            return redirect(url_for('index'))

    return render_template("sign-up.html", error=error)