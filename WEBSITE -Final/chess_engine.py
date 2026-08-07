import chess
import chess.engine
import random
import shutil
import subprocess


# Piece base values in centipawns
PIECE_VALUES = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 20000
}

# Piece-Square Tables (from White's perspective, A1 is index 56 in python-chess representation if mapped directly)
# python-chess square index: A1=0, B1=1 ... H1=7, A8=56 ... H8=63
# We define tables relative to square index 0..63.

PAWN_TABLE = [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0
]

KNIGHT_TABLE = [
   -50,-40,-30,-30,-30,-30,-40,-50,
   -40,-20,  0,  0,  0,  0,-20,-40,
   -30,  0, 10, 15, 15, 10,  0,-30,
   -30,  5, 15, 20, 20, 15,  5,-30,
   -30,  0, 15, 20, 20, 15,  0,-30,
   -30,  5, 10, 15, 15, 10,  5,-30,
   -40,-20,  0,  5,  5,  0,-20,-40,
   -50,-40,-30,-30,-30,-30,-40,-50
]

BISHOP_TABLE = [
   -20,-10,-10,-10,-10,-10,-10,-20,
   -10,  0,  0,  0,  0,  0,  0,-10,
   -10,  0,  5, 10, 10,  5,  0,-10,
   -10,  5,  5, 10, 10,  5,  5,-10,
   -10,  0, 10, 10, 10, 10,  0,-10,
   -10, 10, 10, 10, 10, 10, 10,-10,
   -10,  5,  0,  0,  0,  0,  5,-10,
   -20,-10,-10,-10,-10,-10,-10,-20
]

ROOK_TABLE = [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0
]

QUEEN_TABLE = [
   -20,-10,-10, -5, -5,-10,-10,-20,
   -10,  0,  0,  0,  0,  0,  0,-10,
   -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
     0,  0,  5,  5,  5,  5,  0, -5,
   -10,  5,  5,  5,  5,  5,  0,-10,
   -10,  0,  5,  0,  0,  0,  0,-10,
   -20,-10,-10, -5, -5,-10,-10,-20
]

KING_TABLE_MIDGAME = [
   -30,-40,-40,-50,-50,-40,-40,-30,
   -30,-40,-40,-50,-50,-40,-40,-30,
   -30,-40,-40,-50,-50,-40,-40,-30,
   -30,-40,-40,-50,-50,-40,-40,-30,
   -20,-30,-30,-40,-40,-30,-30,-20,
   -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20
]

PST = {
    chess.PAWN: PAWN_TABLE,
    chess.KNIGHT: KNIGHT_TABLE,
    chess.BISHOP: BISHOP_TABLE,
    chess.ROOK: ROOK_TABLE,
    chess.QUEEN: QUEEN_TABLE,
    chess.KING: KING_TABLE_MIDGAME
}

def evaluate_board(board: chess.Board) -> int:
    """
    Evaluates the board position in centipawns.
    Positive score favors White, negative favors Black.
    """
    if board.is_checkmate():
        # If it's black turn, white delivered checkmate (+100000)
        return -100000 if board.turn == chess.WHITE else 100000
    if board.is_stalemate() or board.is_insufficient_material() or board.can_claim_threefold_repetition():
        return 0


    score = 0
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece is not None:
            # Material value
            val = PIECE_VALUES[piece.piece_type]
            
            # Position table value
            # Note: python-chess index 0 = A1 (rank 1), index 56 = A8 (rank 8).
            # Tables above are indexed top-to-bottom (0=A8, 56=A1).
            # So for White we flip rank: row = 7 - (square // 8), col = square % 8
            sq_row = 7 - (square // 8)
            sq_col = square % 8
            pst_index = sq_row * 8 + sq_col
            
            table = PST.get(piece.piece_type, [0]*64)
            pos_val = table[pst_index] if sq_row < 8 else 0

            if piece.color == chess.WHITE:
                score += val + pos_val
            else:
                # For Black, mirror the PST vertically
                black_sq_row = square // 8
                black_pst_index = black_sq_row * 8 + sq_col
                pos_val_black = table[black_pst_index] if black_sq_row < 8 else 0
                score -= (val + pos_val_black)

    return score

def order_moves(board: chess.Board, moves):
    """
    Orders moves to improve Alpha-Beta pruning performance.
    Captures, checks, and promotions are evaluated first.
    """
    scored_moves = []
    for move in moves:
        score = 0
        if board.is_capture(move):
            attacker = board.piece_at(move.from_square)
            victim = board.piece_at(move.to_square)
            if victim and attacker:
                score += 10 * PIECE_VALUES.get(victim.piece_type, 100) - PIECE_VALUES.get(attacker.piece_type, 100)
            else:
                score += 100
        if move.promotion:
            score += 800
        board.push(move)
        if board.is_check():
            score += 50
        board.pop()
        scored_moves.append((score, move))
    
    scored_moves.sort(key=lambda x: x[0], reverse=True)
    return [move for _, move in scored_moves]

def minimax(board: chess.Board, depth: int, alpha: int, beta: int, maximizing_player: bool) -> tuple[int, chess.Move | None]:
    """
    Minimax search with Alpha-Beta pruning.
    """
    if depth == 0 or board.is_game_over():
        return evaluate_board(board), None

    best_move = None
    legal_moves = list(board.legal_moves)
    ordered_legal_moves = order_moves(board, legal_moves)

    if maximizing_player:
        max_eval = -999999
        for move in ordered_legal_moves:
            board.push(move)
            eval_val, _ = minimax(board, depth - 1, alpha, beta, False)
            board.pop()
            if eval_val > max_eval:
                max_eval = eval_val
                best_move = move
            alpha = max(alpha, eval_val)
            if beta <= alpha:
                break
        return max_eval, best_move
    else:
        min_eval = 999999
        for move in ordered_legal_moves:
            board.push(move)
            eval_val, _ = minimax(board, depth - 1, alpha, beta, True)
            board.pop()
            if eval_val < min_eval:
                min_eval = eval_val
                best_move = move
            beta = min(beta, eval_val)
            if beta <= alpha:
                break
        return min_eval, best_move

def check_stockfish_available() -> str | None:
    """Checks if stockfish executable exists in PATH."""
    return shutil.which("stockfish")

def get_best_move(board: chess.Board, difficulty: str = "medium") -> chess.Move | None:
    """
    Selects the best AI move for the current board based on difficulty.
    - Easy: Random legal move with 60% preference for captures
    - Medium: 2-ply Minimax
    - Hard: 3-ply Minimax with Alpha-Beta pruning (or Stockfish if installed)
    """
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return None

    difficulty = difficulty.lower()

    if difficulty == "easy":
        # 60% chance to pick a capture if available, otherwise random
        captures = [m for m in legal_moves if board.is_capture(m)]
        if captures and random.random() < 0.6:
            return random.choice(captures)
        return random.choice(legal_moves)

    elif difficulty == "medium":
        # Depth 2 Minimax
        is_white = board.turn == chess.WHITE
        _, best_move = minimax(board, depth=2, alpha=-999999, beta=999999, maximizing_player=is_white)
        return best_move if best_move else random.choice(legal_moves)

    elif difficulty == "hard":
        # Check if Stockfish is available as an option
        stockfish_path = check_stockfish_available()
        if stockfish_path:
            try:
                with chess.engine.SimpleEngine.popen_uci(stockfish_path) as engine:

                    result = engine.play(board, chess.engine.Limit(time=0.1))
                    if result.move:
                        return result.move
            except Exception:
                pass # Fallback to internal engine

        # Internal Depth 3 Alpha-Beta search
        is_white = board.turn == chess.WHITE
        _, best_move = minimax(board, depth=3, alpha=-999999, beta=999999, maximizing_player=is_white)
        return best_move if best_move else random.choice(legal_moves)

    return random.choice(legal_moves)
