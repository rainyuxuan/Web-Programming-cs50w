import os
from pip._vendor import requests

from flask import Flask, session, render_template, request, redirect, url_for, jsonify
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

USER = None
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


@app.route("/book/<string:isbn>", methods=["GET", "POST"])
def book(isbn):
    # if not session['user']:
    #     return redirect(url_for('log_in'))
    book = db.execute("SELECT * FROM books WHERE isbn = :isbn", {"isbn": isbn}).fetchone()
    if book is None:
        return "404, cannot find book"
    if request.method == "POST":
        book_id = book.id
        try:
            user_id = session['user'].id 
        except:
            return redirect(url_for('log_in'))
        rating = request.form.get("rating")
        content = request.form.get("content")
        if db.execute("SELECT * FROM reviews WHERE book_id= :book_id AND user_id= :user_id", {"user_id": user_id, "book_id": book_id}).fetchone() is not None:
            db.execute("UPDATE reviews SET rating= :rating WHERE book_id= :book_id AND user_id= :user_id", {"user_id": user_id, "book_id": book_id, "rating": rating})
            db.execute("UPDATE reviews SET content= :content WHERE book_id= :book_id AND user_id= :user_id", {"user_id": user_id, "book_id": book_id, "content": content})
        else:
            db.execute("INSERT INTO reviews (user_id, book_id, rating, content) VALUES (:user_id, :book_id, :rating, :content)", {"user_id": user_id, "book_id": book_id, "rating": rating, "content": content})
    reviews = db.execute("SELECT * FROM reviews JOIN users ON users.id = reviews.user_id WHERE book_id = :id", {"id": book.id}).fetchall()
    db.commit()

    res = requests.get("https://www.goodreads.com/book/review_counts.json", params={"key": "oyGvliX30gY1vmzF6pbtw", "isbns": isbn})
    data = res.json()
    ratings_count = data['books'][0]["ratings_count"]
    average_rating = data['books'][0]["average_rating"]

    return render_template("book.html", book=book, reviews=reviews, ratings_count=ratings_count, average_rating=average_rating)

@app.route("/log-in", methods=["GET", "POST"])
def log_in():
    error = None
    session.clear()
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not username or not password:
            error = "Please input your username and password!"
        elif db.execute("SELECT username FROM users WHERE username = :username", {"username": username}).fetchone() is None:
            error = "Cannot find your account!"
        else:
            USER = db.execute("SELECT * FROM users WHERE username = :username", {"username": username}).fetchone()
            db.commit()
            if password == USER.password:
                session["user"] = USER
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

@app.route("/log-out")
def log_out():
    USER = None
    session.clear()
    return redirect("/")

@app.route("/api/<string:isbn>")
def review_api(isbn):
    """Return details about a single flight."""

    # Make sure flight exists.
    book = db.execute("SELECT * FROM books WHERE isbn = :isbn", {'isbn': isbn}).fetchone()
    if book is None:
        return jsonify({"error": "Invalid isbn"}), 404

    # Get all passengers.
    reviews = db.execute("SELECT * FROM reviews WHERE book_id = :book_id", {'book_id': book.id}).fetchall()
    comments = []
    for review in reviews:
        username = db.execute("SELECT username FROM users WHERE id = :user_id", {"user_id": review.user_id}).fetchone()[0]
        comments.append(f"{username}({review.rating}): {review.content}")
    return jsonify({
            "title": book.title,
            "author": book.author,
            "publication year": book.year,
            "isbn": book.isbn,
            "reviews": comments
        })