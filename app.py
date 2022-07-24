from multiprocessing.connection import wait
from flask import Flask, render_template
import waitress
import flask
PORT = 666

app = Flask(__name__, static_url_path='/static', static_folder='./static')


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    print(f"http://localhost:{PORT}")
    waitress.serve(app=app, port=PORT)