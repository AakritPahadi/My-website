import os
import sqlite3
import random
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for

app = Flask(__name__)
app.config['SECRET_KEY'] = 'aakrit-pahadi-secret-key-2026'

# --- CHESS AI ENGINE (Python / python-chess with Fallback) ---
try:
    import chess
    HAS_PYTHON_CHESS = True
except ImportError:
    HAS_PYTHON_CHESS = False

PIECE_VALUES = {
    1: 100,   # PAWN
    2: 320,   # KNIGHT
    3: 330,   # BISHOP
    4: 500,   # ROOK
    5: 900,   # QUEEN
    6: 20000  # KING
}

def evaluate_board(board):
    if board.is_checkmate():
        return -10000 if board.turn == chess.WHITE else 10000
    if board.is_stalemate() or board.is_insufficient_material():
        return 0
        
    score = 0
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
            val = PIECE_VALUES.get(piece.piece_type, 0)
            if piece.color == chess.BLACK:
                score += val
            else:
                score -= val
    return score

def minimax(board, depth, alpha, beta, is_maximizing):
    if depth == 0 or board.is_game_over():
        return evaluate_board(board), None
        
    best_move = None
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return evaluate_board(board), None
        
    random.shuffle(legal_moves)
    
    if is_maximizing:
        max_eval = -999999
        for move in legal_moves:
            board.push(move)
            eval_score, _ = minimax(board, depth - 1, alpha, beta, False)
            board.pop()
            if eval_score > max_eval:
                max_eval = eval_score
                best_move = move
            alpha = max(alpha, eval_score)
            if beta <= alpha:
                break
        return max_eval, best_move
    else:
        min_eval = 999999
        for move in legal_moves:
            board.push(move)
            eval_score, _ = minimax(board, depth - 1, alpha, beta, True)
            board.pop()
            if eval_score < min_eval:
                min_eval = eval_score
                best_move = move
            beta = min(beta, eval_score)
            if beta <= alpha:
                break
        return min_eval, best_move

# --- PERSONAL ROUTES ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/skills')
def skills():
    return render_template('skills.html')

@app.route('/projects')
def projects():
    return render_template('projects.html')

@app.route('/github')
def github():
    return render_template('github.html')

@app.route('/chess')
def chess_page():
    return render_template('chess.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

# --- GAMING ROUTES ---

@app.route('/gaming')
def gaming():
    return render_template('gaming.html')

@app.route('/gaming/arcade')
def arcade():
    return render_template('arcade.html')

@app.route('/gaming/aim-lab')
def aim_lab():
    return render_template('aim-lab.html')

@app.route('/gaming/daily-challenge')
def daily_challenge():
    return render_template('daily-challenge.html')

@app.route('/gaming/valorant')
def valorant():
    return render_template('valorant.html')

@app.route('/gaming/piditverse')
def piditverse():
    return render_template('piditverse.html')

@app.route('/gaming/pahadiyt')
def pahadiyt():
    return render_template('pahadiyt.html')

# Redirect removed sections gracefully to /gaming
@app.route('/gaming/leaderboard')
@app.route('/gaming/moments')
@app.route('/gaming/memes')
def removed_sections_redirect():
    return redirect(url_for('gaming'))

# --- API ENDPOINTS ---

@app.route('/api/chess/move', methods=['POST'])
def chess_move():
    data = request.get_json() or {}
    fen = data.get('fen')
    difficulty = data.get('difficulty', 'medium').lower()
    
    if not HAS_PYTHON_CHESS or not fen:
        return jsonify({'error': 'Chess engine unavailable or missing FEN'}), 400
        
    try:
        board = chess.Board(fen)
        if board.is_game_over():
            return jsonify({'game_over': True, 'result': board.result()})
            
        legal_moves = list(board.legal_moves)
        if not legal_moves:
            return jsonify({'game_over': True})
            
        if difficulty == 'easy':
            if random.random() < 0.8:
                chosen_move = random.choice(legal_moves)
            else:
                _, chosen_move = minimax(board, 1, -99999, 99999, board.turn == chess.BLACK)
        elif difficulty == 'medium':
            _, chosen_move = minimax(board, 2, -99999, 99999, board.turn == chess.BLACK)
        else: # hard
            _, chosen_move = minimax(board, 3, -99999, 99999, board.turn == chess.BLACK)
            
        if not chosen_move:
            chosen_move = random.choice(legal_moves)
            
        move_san = board.san(chosen_move)
        move_uci = chosen_move.uci()
        
        board.push(chosen_move)
        
        return jsonify({
            'uci': move_uci,
            'san': move_san,
            'from': move_uci[:2],
            'to': move_uci[2:4],
            'promotion': move_uci[4:] if len(move_uci) > 4 else None,
            'fen': board.fen(),
            'is_check': board.is_check(),
            'is_checkmate': board.is_checkmate(),
            'is_draw': board.is_stalemate() or board.is_insufficient_material()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Aakrit Pahadi & PAHADI Gaming Server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
