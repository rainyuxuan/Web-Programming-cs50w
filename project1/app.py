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
    results = []
    if search == "":
        search = ""
        redirect(url_for('index'))
    else:
        results = db.execute("SELECT * FROM books WHERE title LIKE :search OR author LIKE :search OR isbn LIKE :search", {"search": f"%{search}%"}).fetchall()
    return render_template("search.html", search=search, results=results)

# @app.route("/book/<string:isbn>")
# def book(isbn):

@app.route("/book/<string:isbn>", methods=["GET", "POST"])
def book(isbn):
    book = db.execute("SELECT * FROM books WHERE isbn = :isbn", {"isbn": isbn}).fetchone()
    if book is None:
        return "404, cannot find book"
    if request.method == "POST":
        id = book.id
    reviews = db.execute("SELECT * FROM reviews JOIN users ON users.id = reviews.user_id WHERE book_id = :id", {"id": book.id}).fetchall()
    
    return render_template("book.html", book=book, reviews=reviews)

@app.route("/log-in", methods=["GET", "POST"])
def log_in():
    error = None
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not username or not password:
            error = "Please input your username and password!"
        elif db.execute("SELECT username FROM users WHERE username = :username", {"username": username}).fetchone() is None:
            error = "Cannot find your account!"
        else:
            correct = db.execute("SELECT password FROM users WHERE username = :username", {"username": username}).fetchone()[0]
            if correct == password:
                return redirect(url_for('index'))
            else: 
                error = "Username and password did not match!"

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
        elif db.execute("SELECT username FROM users WHERE username = :username", {"username": username}).fetchone() is not None:
            error = "This username has been registered!"
        else:
            db.execute("INSERT INTO users (username, password) VALUES (:username, :password)", {"username": username, "password": password})
            db.commit()
            return redirect(url_for('log_in'))

    return render_template("sign-up.html", error=error)