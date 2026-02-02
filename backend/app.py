from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import time

app = Flask(__name__)

CORS(app)

@app.route('/pick-task', methods=['POST'])
def pick_task():
    data = request.json
    tasks = data.get('tasks', []) # List of dictionaries
    
    if not tasks:
        return jsonify({"error": "No tasks provided"}), 400
    
    # Extract names and weights into two parallel lists
    names = [t['name'] for t in tasks]
    weights = [int(t['weight']) for t in tasks]
    
    # k=1 means pick 1 item. random.choices returns a list.
    selection = random.choices(names, weights=weights, k=1)[0]
    
    return jsonify({"choice": selection})

@app.route('/')
def health_check():
    return {"status": "online", "message": "I am awake!"}, 200

if __name__ == '__main__':
    app.run(debug=True)