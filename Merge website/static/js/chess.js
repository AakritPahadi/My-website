/*
 * Aakrit Chess Engine - Enhanced Board Renderer & AI Client
 */

class AakritChessGame {
    constructor() {
        this.boardElement = document.getElementById('chessBoard');
        this.statusElement = document.getElementById('chessStatus');
        this.turnElement = document.getElementById('chessTurn');
        this.capturedWhiteElement = document.getElementById('capturedWhite');
        this.capturedBlackElement = document.getElementById('capturedBlack');
        
        this.difficulty = 'medium';
        this.boardFlipped = false;
        this.selectedSquare = null;
        this.legalMovesForSelected = [];
        this.history = [];
        this.capturedWhite = [];
        this.capturedBlack = [];
        
        // Initial Board Setup (Standard Chess FEN)
        this.initialFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        
        // Crisp High Contrast Piece Symbols
        this.pieceSymbols = {
            'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
            'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
        };
        
        this.boardState = this.parseFEN(this.initialFEN);
        this.turn = 'w'; // 'w' or 'b'
        this.gameOver = false;

        if (this.boardElement) {
            this.initEvents();
            this.renderBoard();
        }
    }

    parseFEN(fen) {
        const parts = fen.split(' ');
        const rows = parts[0].split('/');
        const grid = [];

        for (let r = 0; r < 8; r++) {
            const row = [];
            const str = rows[r];
            for (let c = 0; c < str.length; c++) {
                const char = str[c];
                if (!isNaN(char)) {
                    const count = parseInt(char, 10);
                    for (let i = 0; i < count; i++) row.push(null);
                } else {
                    row.push(char);
                }
            }
            grid.push(row);
        }
        return grid;
    }

    renderBoard() {
        if (!this.boardElement) return;
        this.boardElement.innerHTML = '';

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const displayR = this.boardFlipped ? 7 - r : r;
                const displayC = this.boardFlipped ? 7 - c : c;
                
                const square = document.createElement('div');
                const isLight = (displayR + displayC) % 2 === 0;
                square.className = `square ${isLight ? 'light' : 'dark'}`;
                square.dataset.row = displayR;
                square.dataset.col = displayC;

                const piece = this.boardState[displayR][displayC];
                if (piece) {
                    square.textContent = this.pieceSymbols[piece] || piece;
                    square.dataset.piece = piece;
                    
                    if (this.isWhitePiece(piece)) {
                        square.style.color = "#ffffff";
                        square.style.textShadow = "0 1px 3px rgba(0,0,0,0.9), 0 0 2px #000000";
                    } else {
                        square.style.color = "#000000";
                        square.style.textShadow = "0 0 2px rgba(255,255,255,0.7)";
                    }
                }

                // Highlight selected square
                if (this.selectedSquare && this.selectedSquare.row === displayR && this.selectedSquare.col === displayC) {
                    square.classList.add('selected');
                }

                // Highlight legal moves
                const isLegalMove = this.legalMovesForSelected.some(m => m.r === displayR && m.c === displayC);
                if (isLegalMove) {
                    if (piece) {
                        square.classList.add('highlight-capture');
                    } else {
                        square.classList.add('highlight-move');
                    }
                }

                square.addEventListener('click', () => this.handleSquareClick(displayR, displayC));
                this.boardElement.appendChild(square);
            }
        }

        this.updateUI();
    }

    handleSquareClick(r, c) {
        if (this.gameOver || this.turn !== 'w') return;

        const piece = this.boardState[r][c];

        if (this.selectedSquare && this.selectedSquare.row === r && this.selectedSquare.col === c) {
            this.deselect();
            return;
        }

        if (this.selectedSquare) {
            const isLegal = this.legalMovesForSelected.some(m => m.r === r && m.c === c);
            if (isLegal) {
                this.executeMove(this.selectedSquare.row, this.selectedSquare.col, r, c);
                this.deselect();
                return;
            }
        }

        if (piece && this.isWhitePiece(piece)) {
            this.selectedSquare = { row: r, col: c };
            this.legalMovesForSelected = this.calculatePseudoLegalMoves(r, c, piece);
            this.renderBoard();
        } else {
            this.deselect();
        }
    }

    deselect() {
        this.selectedSquare = null;
        this.legalMovesForSelected = [];
        this.renderBoard();
    }

    calculatePseudoLegalMoves(r, c, piece) {
        const moves = [];
        const isWhite = this.isWhitePiece(piece);
        const type = piece.toLowerCase();

        const directions = {
            'r': [[1,0],[-1,0],[0,1],[0,-1]],
            'b': [[1,1],[1,-1],[-1,1],[-1,-1]],
            'q': [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],
            'n': [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]],
            'k': [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]
        };

        if (type === 'p') {
            const dir = isWhite ? -1 : 1;
            const startRow = isWhite ? 6 : 1;
            
            if (r + dir >= 0 && r + dir < 8 && !this.boardState[r + dir][c]) {
                moves.push({ r: r + dir, c: c });
                if (r === startRow && !this.boardState[r + 2 * dir][c]) {
                    moves.push({ r: r + 2 * dir, c: c });
                }
            }
            for (let dc of [-1, 1]) {
                const nr = r + dir, nc = c + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    const target = this.boardState[nr][nc];
                    if (target && this.isWhitePiece(target) !== isWhite) {
                        moves.push({ r: nr, c: nc });
                    }
                }
            }
        } else if (type === 'n' || type === 'k') {
            for (let [dr, dc] of directions[type]) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    const target = this.boardState[nr][nc];
                    if (!target || this.isWhitePiece(target) !== isWhite) {
                        moves.push({ r: nr, c: nc });
                    }
                }
            }
        } else if (type === 'r' || type === 'b' || type === 'q') {
            for (let [dr, dc] of directions[type]) {
                let nr = r + dr, nc = c + dc;
                while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    const target = this.boardState[nr][nc];
                    if (!target) {
                        moves.push({ r: nr, c: nc });
                    } else {
                        if (this.isWhitePiece(target) !== isWhite) {
                            moves.push({ r: nr, c: nc });
                        }
                        break;
                    }
                    nr += dr; nc += dc;
                }
            }
        }

        return moves;
    }

    isWhitePiece(piece) {
        return piece && piece === piece.toUpperCase();
    }

    executeMove(fromR, fromC, toR, toC) {
        const piece = this.boardState[fromR][fromC];
        const targetPiece = this.boardState[toR][toC];

        if (targetPiece) {
            if (this.isWhitePiece(targetPiece)) {
                this.capturedWhite.push(targetPiece);
            } else {
                this.capturedBlack.push(targetPiece);
            }
        }

        this.history.push(JSON.parse(JSON.stringify(this.boardState)));

        this.boardState[toR][toC] = piece;
        this.boardState[fromR][fromC] = null;
        
        if (piece === 'P' && toR === 0) this.boardState[toR][toC] = 'Q';
        if (piece === 'p' && toR === 7) this.boardState[toR][toC] = 'q';

        this.turn = this.turn === 'w' ? 'b' : 'w';
        this.renderBoard();

        if (this.turn === 'b' && !this.gameOver) {
            this.triggerAIMove();
        }
    }

    async triggerAIMove() {
        if (this.statusElement) this.statusElement.textContent = "Aakrit's AI is evaluating position...";

        try {
            const currentFEN = this.generateFENFromBoard();
            const response = await fetch('/api/chess/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fen: currentFEN, difficulty: this.difficulty })
            });
            const data = await response.json();

            if (data.from && data.to) {
                const fromR = 8 - parseInt(data.from[1], 10);
                const fromC = data.from.charCodeAt(0) - 97;
                const toR = 8 - parseInt(data.to[1], 10);
                const toC = data.to.charCodeAt(0) - 97;

                setTimeout(() => {
                    this.executeMove(fromR, fromC, toR, toC);
                    if (data.is_checkmate) {
                        this.gameOver = true;
                        this.statusElement.textContent = "Checkmate! Game Over.";
                    }
                }, 400);
            } else {
                this.fallbackAIMove();
            }
        } catch (e) {
            this.fallbackAIMove();
        }
    }

    fallbackAIMove() {
        const blackPieces = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.boardState[r][c] && !this.isWhitePiece(this.boardState[r][c])) {
                    const moves = this.calculatePseudoLegalMoves(r, c, this.boardState[r][c]);
                    if (moves.length > 0) {
                        blackPieces.push({ r, c, moves });
                    }
                }
            }
        }

        if (blackPieces.length > 0) {
            const chosen = blackPieces[Math.floor(Math.random() * blackPieces.length)];
            const targetMove = chosen.moves[Math.floor(Math.random() * chosen.moves.length)];

            setTimeout(() => {
                this.executeMove(chosen.r, chosen.c, targetMove.r, targetMove.c);
            }, 500);
        }
    }

    generateFENFromBoard() {
        let fen = "";
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const piece = this.boardState[r][c];
                if (!piece) {
                    empty++;
                } else {
                    if (empty > 0) { fen += empty; empty = 0; }
                    fen += piece;
                }
            }
            if (empty > 0) fen += empty;
            if (r < 7) fen += "/";
        }
        fen += ` ${this.turn} KQkq - 0 1`;
        return fen;
    }

    updateUI() {
        if (this.turnElement) {
            this.turnElement.textContent = this.turn === 'w' ? "Your Turn (White)" : "Aakrit's AI (Black)";
        }
        if (this.statusElement && !this.gameOver) {
            this.statusElement.textContent = this.turn === 'w' ? "Select a piece to see legal moves." : "Aakrit's AI is thinking...";
        }
        if (this.capturedWhiteElement) {
            this.capturedWhiteElement.textContent = this.capturedWhite.map(p => this.pieceSymbols[p] || p).join(' ');
        }
        if (this.capturedBlackElement) {
            this.capturedBlackElement.textContent = this.capturedBlack.map(p => this.pieceSymbols[p] || p).join(' ');
        }
    }

    undo() {
        if (this.history.length > 0) {
            this.boardState = this.history.pop();
            this.turn = 'w';
            this.gameOver = false;
            this.deselect();
        }
    }

    flipBoard() {
        this.boardFlipped = !this.boardFlipped;
        this.renderBoard();
    }

    reset() {
        this.boardState = this.parseFEN(this.initialFEN);
        this.turn = 'w';
        this.gameOver = false;
        this.history = [];
        this.capturedWhite = [];
        this.capturedBlack = [];
        this.deselect();
    }

    setDifficulty(diff) {
        this.difficulty = diff;
    }

    initEvents() {
        const resetBtn = document.getElementById('chessReset');
        const undoBtn = document.getElementById('chessUndo');
        const flipBtn = document.getElementById('chessFlip');

        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        if (flipBtn) flipBtn.addEventListener('click', () => this.flipBoard());

        document.querySelectorAll('.btn-difficulty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-difficulty').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setDifficulty(e.target.dataset.difficulty);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chessBoard')) {
        window.aakritChess = new AakritChessGame();
    }
});
