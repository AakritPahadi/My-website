import os
import sqlite3
import datetime
import urllib.request
import json
import random
from flask import Flask, render_template, request, jsonify
import chess
from chess_engine import get_best_move

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def init_db():
    """Initializes the SQLite database for contact submissions, poll votes, and Friday chats."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS poll_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            option_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Rich Question Bank for Random MCQ Quiz
QUIZ_QUESTION_BANK = [
    {
        "id": 1,
        "category": "Algorithms",
        "question": "What is the average time complexity of QuickSort?",
        "options": ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
        "answer": 1,
        "explanation": "QuickSort divides the array around a pivot element, achieving O(n log n) average time complexity."
    },
    {
        "id": 2,
        "category": "Python",
        "question": "Which data structure in Python is immutable?",
        "options": ["List", "Dictionary", "Tuple", "Set"],
        "answer": 2,
        "explanation": "Tuples in Python cannot be changed after creation, making them immutable."
    },
    {
        "id": 3,
        "category": "Artificial Intelligence",
        "question": "Which algorithm is used in chess engines for tree search optimization?",
        "options": ["Dijkstra's Algorithm", "Alpha-Beta Pruning", "K-Means Clustering", "Bellman-Ford"],
        "answer": 1,
        "explanation": "Alpha-Beta pruning decreases the number of nodes evaluated by the minimax algorithm in game trees."
    },
    {
        "id": 4,
        "category": "Computer Science",
        "question": "What does CPU stand for?",
        "options": ["Central Processing Unit", "Central Program Utility", "Computer Power Unit", "Core Processing Control"],
        "answer": 0,
        "explanation": "CPU stands for Central Processing Unit, the main electronic circuitry that executes instructions."
    },
    {
        "id": 5,
        "category": "Web Development",
        "question": "Which HTTP method is idempotent and used to retrieve data?",
        "options": ["POST", "GET", "PATCH", "DELETE"],
        "answer": 1,
        "explanation": "GET requests retrieve representation of resources without side effects on the server state."
    },
    {
        "id": 6,
        "category": "Databases",
        "question": "In SQL, which command is used to remove duplicate rows from a query result?",
        "options": ["UNIQUE", "DISTINCT", "FILTER", "GROUP BY"],
        "answer": 1,
        "explanation": "The SELECT DISTINCT statement is used to return only distinct (different) values."
    },
    {
        "id": 7,
        "category": "Python",
        "question": "What does GIL stand for in Python implementation?",
        "options": ["Global Interface Layer", "Global Interpreter Lock", "General Instruction Loop", "Graphic Input Library"],
        "answer": 1,
        "explanation": "GIL stands for Global Interpreter Lock, a mutex that protects access to Python objects."
    },
    {
        "id": 8,
        "category": "Data Structures",
        "question": "Which data structure operates on a LIFO (Last-In, First-Out) basis?",
        "options": ["Queue", "Stack", "Linked List", "Binary Tree"],
        "answer": 1,
        "explanation": "A Stack follows Last-In, First-Out where the last element inserted is the first removed."
    },
    {
        "id": 9,
        "category": "Artificial Intelligence",
        "question": "Which activation function outputs values in the range (0, 1)?",
        "options": ["ReLU", "Sigmoid", "Tanh", "LeakyReLU"],
        "answer": 1,
        "explanation": "The Sigmoid function maps real-valued numbers into a probability-like range between 0 and 1."
    },
    {
        "id": 10,
        "category": "Computer Engineering",
        "question": "What is the decimal equivalent of binary number 1010?",
        "options": ["8", "10", "12", "14"],
        "answer": 1,
        "explanation": "1010 in binary equals 1*8 + 0*4 + 1*2 + 0*1 = 10."
    },
    {
        "id": 11,
        "category": "Web Development",
        "question": "In Flask, which decorator defines a URL route?",
        "options": ["@app.route()", "@app.get()", "@route.add()", "@server.url()"],
        "answer": 0,
        "explanation": "@app.route() is the standard Flask decorator to bind a view function to a URL."
    },
    {
        "id": 12,
        "category": "Operating Systems",
        "question": "Which condition is NOT one of Coffman's four conditions for deadlock?",
        "options": ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"],
        "answer": 2,
        "explanation": "No Preemption is a deadlock condition; allow preemption actually prevents deadlocks."
    }
]

def calculate_captured_pieces(board: chess.Board):
    initial_counts = {
        'P': 8, 'N': 2, 'B': 2, 'R': 2, 'Q': 1, 'K': 1,
        'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1, 'k': 1
    }
    current_counts = {
        'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'K': 0,
        'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0, 'k': 0
    }
    for sq in chess.SQUARES:
        piece = board.piece_at(sq)
        if piece:
            current_counts[piece.symbol()] += 1

    captured_white = []
    for piece, count in [('P', 8), ('N', 2), ('B', 2), ('R', 2), ('Q', 1)]:
        missing = count - current_counts[piece]
        if missing > 0:
            captured_white.extend([piece] * missing)

    captured_black = []
    for piece, count in [('p', 8), ('n', 2), ('b', 2), ('r', 2), ('q', 1)]:
        missing = count - current_counts[piece]
        if missing > 0:
            captured_black.extend([piece] * missing)

    return {
        'white_captured': captured_white,
        'black_captured': captured_black
    }

def get_board_state_response(board: chess.Board, user_move_uci=None, ai_move_uci=None):
    is_check = board.is_check()
    is_checkmate = board.is_checkmate()
    is_stalemate = board.is_stalemate()
    is_game_over = board.is_game_over()
    turn_color = "White" if board.turn == chess.WHITE else "Black"

    if is_checkmate:
        winner = "Black" if board.turn == chess.WHITE else "White"
        status_text = f"Checkmate! {winner} wins!"
    elif is_stalemate:
        status_text = "Draw by Stalemate!"
    elif board.is_insufficient_material():
        status_text = "Draw by Insufficient Material!"
    elif board.can_claim_threefold_repetition():
        status_text = "Draw by Threefold Repetition!"
    elif is_check:
        status_text = f"Check! {turn_color}'s turn."
    else:
        status_text = f"{turn_color}'s turn."

    legal_moves = [move.uci() for move in board.legal_moves]

    return {
        "fen": board.fen(),
        "turn": "white" if board.turn == chess.WHITE else "black",
        "user_move": user_move_uci,
        "ai_move": ai_move_uci,
        "is_check": is_check,
        "is_checkmate": is_checkmate,
        "is_stalemate": is_stalemate,
        "is_game_over": is_game_over,
        "status_text": status_text,
        "captured": calculate_captured_pieces(board),
        "legal_moves": legal_moves
    }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chess/state', methods=['POST'])
def chess_state():
    data = request.get_json() or {}
    fen = data.get('fen', chess.STARTING_FEN)
    try:
        board = chess.Board(fen)
    except ValueError:
        board = chess.Board()
    return jsonify(get_board_state_response(board))

@app.route('/api/chess/move', methods=['POST'])
def chess_move():
    data = request.get_json() or {}
    fen = data.get('fen', chess.STARTING_FEN)
    move_uci = data.get('move')
    difficulty = data.get('difficulty', 'medium')
    player_side = data.get('player_side', 'white')

    try:
        board = chess.Board(fen)
    except ValueError:
        return jsonify({"error": "Invalid FEN position"}), 400

    user_move_made = None
    ai_move_made = None

    if move_uci:
        try:
            user_move = chess.Move.from_uci(move_uci)
            if user_move in board.legal_moves:
                board.push(user_move)
                user_move_made = move_uci
            else:
                return jsonify({"error": f"Illegal move: {move_uci}"}), 400
        except ValueError:
            return jsonify({"error": f"Malformed UCI move: {move_uci}"}), 400

    ai_turn_color = chess.BLACK if player_side == 'white' else chess.WHITE
    if not board.is_game_over() and board.turn == ai_turn_color:
        best_ai_move = get_best_move(board, difficulty=difficulty)
        if best_ai_move and best_ai_move in board.legal_moves:
            ai_move_made = best_ai_move.uci()
            board.push(best_ai_move)

    resp = get_board_state_response(board, user_move_uci=user_move_made, ai_move_uci=ai_move_made)
    return jsonify(resp)

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return jsonify({"success": False, "error": "All fields (Name, Email, Message) are required."}), 400

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
            (name, email, message)
        )
        conn.commit()
        conn.close()
        return jsonify({
            "success": True,
            "message": "Thank you! Your message has been received successfully."
        })
    except Exception:
        return jsonify({"success": False, "error": "Database error occurred."}), 500

@app.route('/api/poll', methods=['GET', 'POST'])
def handle_poll():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.get_json() or {}
        option_id = data.get('option_id')
        if option_id in ['ai', 'web', 'embed', 'algorithms']:
            cursor.execute("INSERT INTO poll_votes (option_id) VALUES (?)", (option_id,))
            conn.commit()

    cursor.execute("SELECT option_id, COUNT(*) FROM poll_votes GROUP BY option_id")
    rows = cursor.fetchall()
    conn.close()

    results = {'ai': 0, 'web': 0, 'embed': 0, 'algorithms': 0}
    total = 0
    for opt, cnt in rows:
        if opt in results:
            results[opt] = cnt
            total += cnt

    return jsonify({"success": True, "results": results, "total": total})

@app.route('/api/friday/chat', methods=['POST'])
def friday_chat():
    """F.R.I.D.A.Y. AI Assistant endpoint for answering questions."""
    data = request.get_json() or {}
    msg = data.get('message', '').strip().lower()

    if not msg:
        return jsonify({"reply": "F.R.I.D.A.Y. online. How may I assist you today, boss?"})

    # Response matrix for F.R.I.D.A.Y.
    if any(k in msg for k in ['who are you', 'what is your name', 'friday']):
        reply = "I am F.R.I.D.A.Y., Aakrit Pahadi's personal AI assistant! I am here to help you navigate Aakrit's portfolio, answer coding queries, and discuss computer engineering topics."

    elif any(k in msg for k in ['aakrit', 'who is aakrit', 'about aakrit', 'owner']):
        reply = "Aakrit Pahadi is a Computer Engineering student from Dudhauli-9, Sindhuli, Nepal. He is passionate about Artificial Intelligence, Web Development, and software engineering!"

    elif any(k in msg for k in ['skill', 'python', 'c++', 'java', 'tech', 'stack']):
        reply = "Aakrit is proficient in Python, C++, Java, JavaScript, HTML, CSS, SQL, Django, Flask, React, Git, Machine Learning, and Artificial Intelligence."

    elif any(k in msg for k in ['contact', 'email', 'phone', 'address', 'reach']):
        reply = "You can contact Aakrit via email at pahadiaakrit777@gmail.com, phone at 97**********, or find him in Dudhauli-9, Sindhuli, Nepal. You can also send a direct message in the Contact section!"

    elif any(k in msg for k in ['chess', 'game', 'play']):
        reply = "Aakrit built a custom playable Chess Engine right here on the site! Scroll to the 'Aakrit Chess' section to challenge the AI at Easy, Medium, or Hard difficulty levels."

    elif any(k in msg for k in ['github', 'project', 'repo', 'code']):
        reply = "Aakrit's projects are hosted on GitHub at https://github.com/AakritPahadi. You can search his live public repos directly in the 'GitHub & Projects' section of this website!"

    elif any(k in msg for k in ['hello', 'hi', 'hey', 'greetings', 'morning']):
        reply = "Hello there! F.R.I.D.A.Y. at your service. What would you like to know about Aakrit's engineering work or computer science?"

    elif any(k in msg for k in ['ai', 'artificial intelligence', 'machine learning']):
        reply = "AI is one of Aakrit's core passions! He works with machine learning algorithms, minimax tree search, and natural language processing concepts."

    elif any(k in msg for k in ['quiz', 'test', 'question']):
        reply = "Looking for a challenge? Scroll to the 'Tech Quiz Challenge' section to test your Computer Science knowledge with randomized MCQs!"

    else:
        reply = f"That is a great question! As Aakrit's AI assistant, I can confirm Aakrit specializes in Computer Engineering, AI development, and software design. Feel free to explore his projects or send him a message in the Contact section!"

    return jsonify({"reply": reply})

@app.route('/api/quiz/questions', methods=['GET'])
def get_quiz_questions():
    """Returns a randomized set of MCQ quiz questions."""
    count = min(int(request.args.get('count', 5)), len(QUIZ_QUESTION_BANK))
    randomized = random.sample(QUIZ_QUESTION_BANK, count)
    return jsonify({"questions": randomized, "total_bank": len(QUIZ_QUESTION_BANK)})

@app.route('/api/github', methods=['GET'])
def get_github_info():
    username = "AakritPahadi"
    headers = {"User-Agent": "AakritPahadi-Portfolio-App"}

    profile_data = {
        "login": username,
        "name": "Aakrit Pahadi",
        "html_url": f"https://github.com/{username}",
        "public_repos": 0,
        "followers": 0,
        "following": 0,
        "bio": "Computer Engineering Student | AI Enthusiast | Web Developer"
    }
    repos_data = []

    try:
        req = urllib.request.Request(f"https://api.github.com/users/{username}", headers=headers)
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status == 200:
                profile_data = json.loads(resp.read().decode())

        req_repos = urllib.request.Request(f"https://api.github.com/users/{username}/repos?sort=updated&per_page=12", headers=headers)
        with urllib.request.urlopen(req_repos, timeout=4) as resp_repos:
            if resp_repos.status == 200:
                raw_repos = json.loads(resp_repos.read().decode())
                repos_data = [
                    {
                        "name": r.get("name"),
                        "description": r.get("description") or "No description provided.",
                        "html_url": r.get("html_url"),
                        "language": r.get("language") or "Code",
                        "stargazers_count": r.get("stargazers_count", 0),
                        "forks_count": r.get("forks_count", 0)
                    }
                    for r in raw_repos if not r.get("fork")
                ]
    except Exception:
        pass

    return jsonify({
        "profile": profile_data,
        "repos": repos_data
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
