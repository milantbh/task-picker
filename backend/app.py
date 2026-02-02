from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import random
import time
import os

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///taskpicker.db')
if app.config['SQLALCHEMY_DATABASE_URI'].startswith("postgres://"):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace("postgres://", "postgresql://", 1)

# --- Configuration ---
app.config['JWT_SECRET_KEY'] = 'dev-secret-key-123' # Change this for production!
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    tasks = db.relationship('Task', backref='owner', lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    weight = db.Column(db.Integer, default=1)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Initialize Database
with app.app_context():
    db.create_all()

# --- Auth Routes ---

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"msg": "Username already exists"}), 400
    
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=str(user.id))
        # Send the username back too!
        return jsonify({
            "access_token": access_token,
            "username": user.username 
        }), 200
    return jsonify({"msg": "Invalid username or password"}), 401

# --- Task Routes ---

@app.route('/pick-task', methods=['POST'])
@jwt_required() # This protects the route!
def pick_task():
    current_user_id = get_jwt_identity()
    data = request.json
    tasks = data.get('tasks', [])
    
    if not tasks:
        return jsonify({"error": "No tasks provided"}), 400
    
    # Your original logic
    names = [t['name'] for t in tasks]
    weights = [int(t['weight']) for t in tasks]
    
    time.sleep(2) # Reduced from 15 for better testing, change back if you wish!
    selection = random.choices(names, weights=weights, k=1)[0]
    
    return jsonify({"choice": selection})

# --- Saved Tasks Logic ---

@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    user_tasks = Task.query.filter_by(user_id=user_id).all()
    # Return as list of dicts for React
    return jsonify([{"id": t.id, "name": t.name, "weight": t.weight} for t in user_tasks]), 200

@app.route('/tasks', methods=['POST'])
@jwt_required()
def add_task():
    user_id = get_jwt_identity()
    data = request.json
    
    new_task = Task(
        name=data['name'],
        weight=data['weight'],
        user_id=user_id
    )
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify({"id": new_task.id, "name": new_task.name, "weight": new_task.weight}), 201

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task_db(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    
    if not task:
        return jsonify({"msg": "Task not found"}), 404
        
    db.session.delete(task)
    db.session.commit()
    return jsonify({"msg": "Task deleted"}), 200

@app.route('/')
def health_check():
    return {"status": "online", "message": "I am awake!"}, 200
    

if __name__ == '__main__':
    app.run(debug=True)