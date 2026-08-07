/**
 * Aakrit Chess - Interactive Frontend Engine Handler
 */

class AakritChessUI {
    constructor() {
        this.boardElement = document.getElementById('chessboard');
        this.statusTextElement = document.getElementById('status-text');
        this.statusIndicator = document.querySelector('.status-indicator');
        this.capturedWhiteElement = document.getElementById('captured-white');
        this.capturedBlackElement = document.getElementById('captured-black');
        this.moveLogElement = document.getElementById('move-log-content');

        // Game State
        this.fenHistory = ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'];
        this.moveHistorySan = [];
        this.currentFenIndex = 0;
        this.selectedSquare = null;
        this.legalMoves = [];
        this.difficulty = 'medium';
        this.flipped = false;
        this.isProcessingMove = false;

        // Web Audio Synthesizer for move sounds
        this.audioCtx = null;

        // Piece Unicode Map
        this.pieceSymbols = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };

        this.initEventListeners();
        this.loadStateFromFEN(this.currentFEN());
    }

    currentFEN() {
        return this.fenHistory[this.currentFenIndex];
    }

    initEventListeners() {
        document.getElementById('btn-new-game')?.addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-undo')?.addEventListener('click', () => this.undoMove());
        document.getElementById('btn-flip')?.addEventListener('click', () => this.toggleFlipBoard());
        
        document.getElementById('btn-copy-fen')?.addEventListener('click', () => {
            navigator.clipboard.writeText(this.currentFEN());
            alert('Board FEN copied to clipboard!');
        });

        const diffButtons = document.querySelectorAll('.btn-diff');
        diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                diffButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.getAttribute('data-level');
            });
        });
    }

    playMoveSound(freq = 440, type = 'sine') {
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.15);
        } catch (e) {
            // Audio context fallback
        }
    }

    async loadStateFromFEN(fen) {
        try {
            const res = await fetch('/api/chess/state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fen })
            });

            if (!res.ok) throw new Error('Chess API Error');
            const data = await res.json();
            this.updateUI(data);
        } catch (err) {
            console.error('Failed to load board state', err);
        }
    }

    updateUI(state) {
        this.legalMoves = state.legal_moves || [];
        this.renderBoard(state.fen);
        this.updateStatus(state);
        this.renderCapturedPieces(state.captured);
        this.updateMoveLog();
    }

    renderBoard(fen) {
        if (!this.boardElement) return;
        this.boardElement.innerHTML = '';

        const boardMap = this.parseFEN(fen);
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        const displayRanks = this.flipped ? [...ranks].reverse() : ranks;
        const displayFiles = this.flipped ? [...files].reverse() : files;

        for (let r of displayRanks) {
            for (let f of displayFiles) {
                const sqName = f + r;
                const isLight = (files.indexOf(f) + ranks.indexOf(r)) % 2 === 0;

                const sqDiv = document.createElement('div');
                sqDiv.className = `sq ${isLight ? 'light' : 'dark'}`;
                sqDiv.dataset.sq = sqName;

                if (this.selectedSquare === sqName) {
                    sqDiv.classList.add('selected');
                }

                if (this.selectedSquare) {
                    const legalForSelected = this.legalMoves.filter(m => m.startsWith(this.selectedSquare));
                    const targets = legalForSelected.map(m => m.substring(2, 4));

                    if (targets.includes(sqName)) {
                        const targetPiece = boardMap[sqName];
                        if (targetPiece) {
                            sqDiv.classList.add('legal-capture');
                        } else {
                            sqDiv.classList.add('legal-target');
                        }
                    }
                }

                const piece = boardMap[sqName];
                if (piece) {
                    const pieceSpan = document.createElement('span');
                    pieceSpan.className = 'piece';
                    pieceSpan.textContent = this.pieceSymbols[piece] || piece;
                    sqDiv.appendChild(pieceSpan);
                }

                sqDiv.addEventListener('click', () => this.handleSquareClick(sqName, boardMap));
                this.boardElement.appendChild(sqDiv);
            }
        }
    }

    handleSquareClick(sqName, boardMap) {
        if (this.isProcessingMove) return;

        if (!this.selectedSquare) {
            const piece = boardMap[sqName];
            if (piece && this.isWhitePiece(piece)) {
                this.selectedSquare = sqName;
                this.renderBoard(this.currentFEN());
            }
            return;
        }

        if (this.selectedSquare === sqName) {
            this.selectedSquare = null;
            this.renderBoard(this.currentFEN());
            return;
        }

        let moveUci = this.selectedSquare + sqName;
        if (boardMap[this.selectedSquare] === 'P' && sqName.endsWith('8')) {
            moveUci += 'q';
        }

        const isValid = this.legalMoves.some(m => m.startsWith(moveUci.substring(0, 4)));

        if (isValid) {
            const matchedLegalMove = this.legalMoves.find(m => m.startsWith(moveUci.substring(0, 4)));
            this.executeMove(matchedLegalMove || moveUci);
            this.selectedSquare = null;
        } else {
            const clickedPiece = boardMap[sqName];
            if (clickedPiece && this.isWhitePiece(clickedPiece)) {
                this.selectedSquare = sqName;
            } else {
                this.selectedSquare = null;
            }
            this.renderBoard(this.currentFEN());
        }
    }

    async executeMove(moveUci) {
        this.isProcessingMove = true;
        this.statusTextElement.textContent = "AI is thinking...";
        this.playMoveSound(520, 'sine');

        try {
            const res = await fetch('/api/chess/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fen: this.currentFEN(),
                    move: moveUci,
                    difficulty: this.difficulty,
                    player_side: 'white'
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                alert(errData.error || 'Move rejected');
                this.loadStateFromFEN(this.currentFEN());
                return;
            }

            const state = await res.json();

            if (this.currentFenIndex < this.fenHistory.length - 1) {
                this.fenHistory = this.fenHistory.slice(0, this.currentFenIndex + 1);
                this.moveHistorySan = this.moveHistorySan.slice(0, this.currentFenIndex);
            }

            this.fenHistory.push(state.fen);
            if (state.user_move) this.moveHistorySan.push(`You: ${state.user_move}`);
            if (state.ai_move) this.moveHistorySan.push(`AI: ${state.ai_move}`);

            this.currentFenIndex = this.fenHistory.length - 1;

            if (state.ai_move) {
                setTimeout(() => this.playMoveSound(340, 'triangle'), 300);
            }

            this.updateUI(state);

        } catch (err) {
            console.error('Failed to make move', err);
        } finally {
            this.isProcessingMove = false;
        }
    }

    startNewGame() {
        this.fenHistory = ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'];
        this.moveHistorySan = [];
        this.currentFenIndex = 0;
        this.selectedSquare = null;
        this.loadStateFromFEN(this.currentFEN());
    }

    undoMove() {
        if (this.currentFenIndex >= 2) {
            this.currentFenIndex -= 2;
            this.moveHistorySan.pop();
            this.moveHistorySan.pop();
        } else if (this.currentFenIndex === 1) {
            this.currentFenIndex = 0;
            this.moveHistorySan.pop();
        }
        this.selectedSquare = null;
        this.loadStateFromFEN(this.currentFEN());
    }

    toggleFlipBoard() {
        this.flipped = !this.flipped;
        this.renderBoard(this.currentFEN());
    }

    updateStatus(state) {
        if (!this.statusTextElement) return;
        this.statusTextElement.textContent = state.status_text;

        if (state.is_checkmate) {
            this.statusIndicator.style.backgroundColor = '#ef4444';
        } else if (state.is_check) {
            this.statusIndicator.style.backgroundColor = '#f59e0b';
        } else if (state.is_stalemate || state.is_game_over) {
            this.statusIndicator.style.backgroundColor = '#6b7280';
        } else {
            this.statusIndicator.style.backgroundColor = '#22c55e';
        }
    }

    renderCapturedPieces(captured) {
        if (!captured) return;

        if (this.capturedWhiteElement) {
            this.capturedWhiteElement.innerHTML = (captured.white_captured || [])
                .map(p => `<span>${this.pieceSymbols[p] || p}</span>`).join('');
        }

        if (this.capturedBlackElement) {
            this.capturedBlackElement.innerHTML = (captured.black_captured || [])
                .map(p => `<span>${this.pieceSymbols[p] || p}</span>`).join('');
        }
    }

    updateMoveLog() {
        if (!this.moveLogElement) return;
        if (this.moveHistorySan.length === 0) {
            this.moveLogElement.textContent = "Game started.";
            return;
        }
        this.moveLogElement.innerHTML = this.moveHistorySan.map((m, idx) => `<div>${idx + 1}. ${m}</div>`).join('');
        this.moveLogElement.scrollTop = this.moveLogElement.scrollHeight;
    }

    isWhitePiece(symbol) {
        return 'KQRBNP'.includes(symbol);
    }

    parseFEN(fen) {
        const boardMap = {};
        const fenBoard = fen.split(' ')[0];
        const ranks = fenBoard.split('/');
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        for (let r = 0; r < 8; r++) {
            const rankStr = ranks[r];
            let fIdx = 0;
            for (let char of rankStr) {
                if (!isNaN(char)) {
                    fIdx += parseInt(char, 10);
                } else {
                    const sqName = files[fIdx] + (8 - r);
                    boardMap[sqName] = char;
                    fIdx++;
                }
            }
        }
        return boardMap;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.aakritChess = new AakritChessUI();
});
