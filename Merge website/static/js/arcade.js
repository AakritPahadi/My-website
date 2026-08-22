/*
 * PAHADI ARCADE - Browser Games Engine
 * (Featuring Original Flappy Bird Engine)
 */

document.addEventListener('DOMContentLoaded', () => {
    initArcadeGameLaunchers();
});

function initArcadeGameLaunchers() {
    document.querySelectorAll('[data-play-game]').forEach(button => {
        button.addEventListener('click', (e) => {
            const gameId = e.currentTarget.dataset.playGame;
            launchGameModal(gameId);
        });
    });

    const closeBtn = document.getElementById('gameModalClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeGameModal);
    }
}

function launchGameModal(gameId) {
    const modal = document.getElementById('gamePlayModal');
    const container = document.getElementById('gameViewportContainer');
    const titleEl = document.getElementById('gameModalTitle');
    
    if (!modal || !container) return;
    
    container.innerHTML = '';
    modal.classList.add('active');

    switch (gameId) {
        case 'tictactoe':
            titleEl.textContent = 'Tic Tac Toe';
            startTicTacToe(container);
            break;
        case 'rps':
            titleEl.textContent = 'Rock Paper Scissors';
            startRPS(container);
            break;
        case 'memory':
            titleEl.textContent = 'Memory Match';
            startMemoryMatch(container);
            break;
        case 'reaction':
            titleEl.textContent = 'Reaction Test';
            startReactionTest(container);
            break;
        case 'number':
            titleEl.textContent = 'Number Guessing';
            startNumberGuessing(container);
            break;
        case 'minesweeper':
            titleEl.textContent = 'Minesweeper';
            startMinesweeper(container);
            break;
        case 'flappy':
            titleEl.textContent = 'Flappy Pahadi';
            startFlappyPahadi(container);
            break;
        case 'aim':
            titleEl.textContent = 'Aim Trainer';
            startAimTrainerArcade(container);
            break;
        default:
            container.innerHTML = '<p>Game coming soon!</p>';
    }
}

function closeGameModal() {
    const modal = document.getElementById('gamePlayModal');
    const container = document.getElementById('gameViewportContainer');
    if (modal) modal.classList.remove('active');
    if (container) container.innerHTML = '';
}

// ==================== 1. TIC TAC TOE ====================
function startTicTacToe(container) {
    let board = Array(9).fill(null);
    let currentPlayer = 'X';
    let vsAI = true;

    container.innerHTML = `
        <div style="display:flex; gap:1rem; margin-bottom:1rem;">
            <button class="btn btn-secondary" id="tttModeBtn">Mode: Vs Computer</button>
            <button class="btn btn-secondary" id="tttResetBtn">Restart</button>
        </div>
        <div id="tttBoard" style="display:grid; grid-template-columns:repeat(3, 90px); gap:6px; background:#262838; padding:6px; border-radius:12px;">
            ${Array(9).fill(0).map((_, i) => `<div class="square dark" data-idx="${i}" style="width:90px; height:90px; font-size:2.5rem; font-weight:800; color:#fff;"></div>`).join('')}
        </div>
        <p id="tttStatus" style="margin-top:1rem; font-weight:600; color:#94a3b8;">Player X's turn</p>
    `;

    const squares = container.querySelectorAll('[data-idx]');
    const statusEl = container.querySelector('#tttStatus');

    container.querySelector('#tttModeBtn').addEventListener('click', (e) => {
        vsAI = !vsAI;
        e.target.textContent = vsAI ? 'Mode: Vs Computer' : 'Mode: 2 Players';
        resetTTT();
    });

    container.querySelector('#tttResetBtn').addEventListener('click', resetTTT);

    squares.forEach(sq => {
        sq.addEventListener('click', () => {
            const idx = parseInt(sq.dataset.idx, 10);
            if (board[idx] || checkTTTWinner(board)) return;

            makeTTTMove(idx, currentPlayer);

            if (!checkTTTWinner(board) && !board.every(cell => cell)) {
                if (vsAI && currentPlayer === 'O') {
                    setTimeout(makeTTTAIMove, 300);
                }
            }
        });
    });

    function makeTTTMove(idx, player) {
        board[idx] = player;
        squares[idx].textContent = player;
        squares[idx].style.color = player === 'X' ? '#3b82f6' : '#ec4899';

        const winner = checkTTTWinner(board);
        if (winner) {
            statusEl.textContent = `Player ${winner} Wins! 🎉`;
            unlockAchievement('FIRST_WIN');
        } else if (board.every(cell => cell)) {
            statusEl.textContent = "It's a Draw! 🤝";
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusEl.textContent = `Player ${currentPlayer}'s turn`;
        }
    }

    function makeTTTAIMove() {
        const emptyIndices = board.map((val, i) => val === null ? i : null).filter(val => val !== null);
        if (emptyIndices.length > 0) {
            const choice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            makeTTTMove(choice, 'O');
        }
    }

    function checkTTTWinner(b) {
        const lines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (let [a,b_idx,c] of lines) {
            if (b[a] && b[a] === b[b_idx] && b[a] === b[c]) return b[a];
        }
        return null;
    }

    function resetTTT() {
        board = Array(9).fill(null);
        currentPlayer = 'X';
        squares.forEach(sq => { sq.textContent = ''; });
        statusEl.textContent = "Player X's turn";
    }
}

// ==================== 2. ROCK PAPER SCISSORS ====================
function startRPS(container) {
    let playerScore = 0, compScore = 0;

    container.innerHTML = `
        <div style="font-weight:700; margin-bottom:1.5rem; font-size:1.2rem;">
            Player: <span id="rpsPlayer" style="color:#3b82f6;">0</span> - Computer: <span id="rpsComp" style="color:#ec4899;">0</span>
        </div>
        <div style="display:flex; gap:1rem; margin-bottom:1.5rem;">
            <button class="btn btn-secondary" id="rpsRock" style="font-size:2rem;">✊</button>
            <button class="btn btn-secondary" id="rpsPaper" style="font-size:2rem;">✋</button>
            <button class="btn btn-secondary" id="rpsScissors" style="font-size:2rem;">✌️</button>
        </div>
        <p id="rpsResult" style="font-weight:600; color:#94a3b8;">Choose your weapon!</p>
    `;

    const choices = ['Rock', 'Paper', 'Scissors'];
    const emojis = { Rock: '✊', Paper: '✋', Scissors: '✌️' };

    function playRPS(userChoice) {
        const compChoice = choices[Math.floor(Math.random() * 3)];
        let res = "";

        if (userChoice === compChoice) {
            res = `Draw! Both picked ${emojis[userChoice]}`;
        } else if (
            (userChoice === 'Rock' && compChoice === 'Scissors') ||
            (userChoice === 'Paper' && compChoice === 'Rock') ||
            (userChoice === 'Scissors' && compChoice === 'Paper')
        ) {
            playerScore++;
            res = `You Win! ${emojis[userChoice]} beats ${emojis[compChoice]}`;
            if (playerScore >= 3) unlockAchievement('FIRST_WIN');
        } else {
            compScore++;
            res = `Computer Wins! ${emojis[compChoice]} beats ${emojis[userChoice]}`;
        }

        container.querySelector('#rpsPlayer').textContent = playerScore;
        container.querySelector('#rpsComp').textContent = compScore;
        container.querySelector('#rpsResult').textContent = res;
    }

    container.querySelector('#rpsRock').onclick = () => playRPS('Rock');
    container.querySelector('#rpsPaper').onclick = () => playRPS('Paper');
    container.querySelector('#rpsScissors').onclick = () => playRPS('Scissors');
}

// ==================== 3. MEMORY MATCH ====================
function startMemoryMatch(container) {
    const icons = ['🎮', '🎯', '🐍', '🧩', '⌨️', '👑', '⚡', '🏆'];
    const deck = [...icons, ...icons].sort(() => 0.5 - Math.random());
    let flipped = [], matched = 0, moves = 0;

    container.innerHTML = `
        <div style="margin-bottom:1rem; font-weight:700;">Moves: <span id="memMoves">0</span></div>
        <div style="display:grid; grid-template-columns:repeat(4, 65px); gap:10px;">
            ${deck.map((icon, i) => `
                <div class="mem-card" data-icon="${icon}" data-i="${i}" style="width:65px; height:65px; background:#1e1f2e; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.8rem; cursor:pointer;">❓</div>
            `).join('')}
        </div>
    `;

    container.querySelectorAll('.mem-card').forEach(card => {
        card.addEventListener('click', () => {
            if (flipped.length < 2 && !card.classList.contains('flipped')) {
                card.classList.add('flipped');
                card.textContent = card.dataset.icon;
                flipped.push(card);

                if (flipped.length === 2) {
                    moves++;
                    container.querySelector('#memMoves').textContent = moves;

                    if (flipped[0].dataset.icon === flipped[1].dataset.icon) {
                        matched += 2;
                        flipped = [];
                        if (matched === 16) unlockAchievement('FIRST_WIN');
                    } else {
                        setTimeout(() => {
                            flipped.forEach(c => { c.classList.remove('flipped'); c.textContent = '❓'; });
                            flipped = [];
                        }, 800);
                    }
                }
            }
        });
    });
}

// ==================== 4. REACTION TEST ====================
function startReactionTest(container) {
    container.innerHTML = `
        <div id="reactBox" style="width:100%; height:260px; background:#ef4444; border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.5rem; color:#fff; cursor:pointer; user-select:none;">
            Wait for Green...
        </div>
    `;

    const box = container.querySelector('#reactBox');
    let startTime = 0, timer = null, state = 'wait';

    function setGreen() {
        state = 'ready';
        box.style.background = '#10b981';
        box.textContent = 'CLICK NOW!';
        startTime = Date.now();
    }

    timer = setTimeout(setGreen, 2000 + Math.random() * 3000);

    box.addEventListener('click', () => {
        if (state === 'wait') {
            clearTimeout(timer);
            box.textContent = 'Too early! Click to try again.';
            state = 'done';
        } else if (state === 'ready') {
            const reactionTime = Date.now() - startTime;
            box.style.background = '#3b82f6';
            box.textContent = `${reactionTime} ms! Click to restart.`;
            updateStat('best_reaction_ms', reactionTime, true);
            if (reactionTime < 250) unlockAchievement('QUICK_REACTION');
            state = 'done';
        } else {
            startReactionTest(container);
        }
    });
}

// ==================== 5. NUMBER GUESSING ====================
function startNumberGuessing(container) {
    const target = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;

    container.innerHTML = `
        <p style="margin-bottom:1rem; color:#94a3b8;">Guess a number between 1 and 100</p>
        <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
            <input type="number" id="numInput" min="1" max="100" style="padding:0.6rem; border-radius:8px; border:1px solid #262838; background:#12131c; color:#fff; font-size:1.1rem; width:100px; text-align:center;">
            <button class="btn btn-primary" id="numSubmit">Guess</button>
        </div>
        <p id="numHint" style="font-weight:700; color:#8b5cf6;"></p>
    `;

    container.querySelector('#numSubmit').onclick = () => {
        const val = parseInt(container.querySelector('#numInput').value, 10);
        attempts++;
        const hintEl = container.querySelector('#numHint');

        if (val === target) {
            hintEl.textContent = `Correct! You got it in ${attempts} attempts! 🎉`;
            unlockAchievement('FIRST_WIN');
        } else if (val < target) {
            hintEl.textContent = "Higher! ⬆️";
        } else {
            hintEl.textContent = "Lower! ⬇️";
        }
    };
}

// ==================== 6. MINESWEEPER ====================
function startMinesweeper(container) {
    container.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(6, 40px); gap:4px; background:#262838; padding:4px; border-radius:8px;">
            ${Array(36).fill(0).map((_, i) => `<div class="ms-cell" data-idx="${i}" style="width:40px; height:40px; background:#1e1f2e; display:flex; align-items:center; justify-content:center; font-weight:800; cursor:pointer;"></div>`).join('')}
        </div>
    `;

    const mines = new Set([3, 7, 12, 18, 25]);
    container.querySelectorAll('.ms-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const idx = parseInt(cell.dataset.idx, 10);
            if (mines.has(idx)) {
                cell.style.background = '#ef4444';
                cell.textContent = '💣';
                alert('Boom! Game Over.');
            } else {
                cell.style.background = '#10b981';
                cell.textContent = '1';
            }
        });
    });
}

// ==================== 7. ORIGINAL FLAPPY BIRD ENGINE (ROCK-SOLID RE-ARCHITECTED) ====================
function startFlappyPahadi(container) {
    container.innerHTML = `
        <div id="flappyWrapper" style="position:relative; width:320px; height:420px; margin:0 auto; overflow:hidden; border-radius:12px; border:3px solid #1e1f2e; box-shadow:0 8px 24px rgba(0,0,0,0.6); user-select:none;">
            <canvas id="flappyCanvas" width="320" height="420" style="display:block; background:#70c5ce; cursor:pointer;"></canvas>
            <div id="flappyOverlay" style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); color:#fff; text-align:center; padding:1rem; pointer-events:auto;">
                <h2 style="font-size:2rem; font-weight:900; color:#facc15; text-shadow:0 2px 4px #000; margin-bottom:0.5rem;">FLAPPY PAHADI</h2>
                <p style="font-size:0.95rem; font-weight:700; margin-bottom:1.5rem;">Tap screen or Press Space to Jump</p>
                <button class="btn btn-purple" id="flappyStartBtn">START GAME 🚀</button>
            </div>
        </div>
    `;

    const wrapper = container.querySelector('#flappyWrapper');
    const canvas = container.querySelector('#flappyCanvas');
    const ctx = canvas.getContext('2d');
    const overlay = container.querySelector('#flappyOverlay');
    const startBtn = container.querySelector('#flappyStartBtn');

    let birdY = 200;
    let velocity = 0;
    const gravity = 0.42;
    const jump = -6.8;
    let score = 0;
    let highScore = localStorage.getItem('flappy_high_score') || 0;
    let pipes = [];
    let frame = 0;
    let gameState = 'START'; // 'START', 'PLAYING', 'GAMEOVER'
    let animId = null;

    function resetGame() {
        birdY = 200;
        velocity = 0;
        score = 0;
        pipes = [];
        frame = 0;
        gameState = 'PLAYING';
        overlay.style.display = 'none';
        
        if (animId) cancelAnimationFrame(animId);
        loop();
    }

    function flap() {
        if (gameState === 'PLAYING') {
            velocity = jump;
        } else if (gameState === 'START' || gameState === 'GAMEOVER') {
            resetGame();
        }
    }

    // Scoped Event Handlers
    wrapper.addEventListener('pointerdown', (e) => {
        if (e.target !== startBtn) {
            e.preventDefault();
            flap();
        }
    });

    startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetGame();
    });
    
    const keyHandler = (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            flap();
        }
    };
    
    window.addEventListener('keydown', keyHandler);

    function spawnPipe() {
        const gapHeight = 125;
        const minHeight = 50;
        const maxHeight = canvas.height - 50 - gapHeight - 40;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + gapHeight,
            passed: false
        });
    }

    function update() {
        if (gameState !== 'PLAYING') return;

        frame++;
        velocity += gravity;
        birdY += velocity;

        // Spawn pipes every 95 frames (~1.5s)
        if (frame % 95 === 0) {
            spawnPipe();
        }

        // Move pipes & collision check
        for (let i = 0; i < pipes.length; i++) {
            const p = pipes[i];
            p.x -= 2.2;

            // Score check
            if (!p.passed && p.x + 50 < 60) {
                p.passed = true;
                score++;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('flappy_high_score', highScore);
                }
                if (score >= 10) unlockAchievement('FIRST_WIN');
            }

            // Precise Pipe Hitbox Check (Bird X=60, Radius=13, Pipe Width=52)
            const birdX = 60;
            const birdRadius = 13;

            if (birdX + birdRadius > p.x && birdX - birdRadius < p.x + 52) {
                if (birdY - birdRadius < p.topHeight || birdY + birdRadius > p.bottomY) {
                    gameOver();
                    return;
                }
            }
        }

        // Remove offscreen pipes
        pipes = pipes.filter(p => p.x > -60);

        // Ground / Ceiling Collision
        if (birdY + 13 >= canvas.height - 40 || birdY - 13 <= 0) {
            gameOver();
        }
    }

    function gameOver() {
        gameState = 'GAMEOVER';
        window.removeEventListener('keydown', keyHandler);
        
        overlay.style.display = 'flex';
        overlay.innerHTML = `
            <h2 style="font-size:2.2rem; font-weight:900; color:#ef4444; text-shadow:0 2px 4px #000; margin-bottom:0.5rem;">GAME OVER</h2>
            <div style="background:rgba(0,0,0,0.6); padding:1rem 1.5rem; border-radius:8px; border:1px solid #3b82f6; margin-bottom:1.5rem;">
                <p style="font-size:1.2rem; font-weight:800; color:#fff;">Score: ${score}</p>
                <p style="font-size:1rem; font-weight:700; color:#facc15;">Best: ${highScore}</p>
            </div>
            <button class="btn btn-purple" id="flappyRetryBtn">PLAY AGAIN 🔄</button>
        `;
        
        overlay.querySelector('#flappyRetryBtn').onclick = (e) => {
            e.stopPropagation();
            window.addEventListener('keydown', keyHandler);
            resetGame();
        };
    }

    function draw() {
        // Sky Background
        ctx.fillStyle = '#70c5ce';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath(); ctx.arc(60, 80, 25, 0, Math.PI * 2); ctx.arc(90, 75, 35, 0, Math.PI * 2); ctx.arc(120, 80, 25, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(220, 110, 20, 0, Math.PI * 2); ctx.arc(245, 105, 30, 0, Math.PI * 2); ctx.arc(270, 110, 20, 0, Math.PI * 2); ctx.fill();

        // Draw Green Pipes
        pipes.forEach(p => {
            const pipeWidth = 52;
            
            // Top Pipe Body
            ctx.fillStyle = '#73bf2e';
            ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
            ctx.strokeStyle = '#538021'; ctx.lineWidth = 3;
            ctx.strokeRect(p.x, 0, pipeWidth, p.topHeight);

            // Top Pipe Collar
            ctx.fillStyle = '#83d333';
            ctx.fillRect(p.x - 3, p.topHeight - 20, pipeWidth + 6, 20);
            ctx.strokeRect(p.x - 3, p.topHeight - 20, pipeWidth + 6, 20);

            // Bottom Pipe Body
            ctx.fillStyle = '#73bf2e';
            ctx.fillRect(p.x, p.bottomY, pipeWidth, canvas.height - 40 - p.bottomY);
            ctx.strokeRect(p.x, p.bottomY, pipeWidth, canvas.height - 40 - p.bottomY);

            // Bottom Pipe Collar
            ctx.fillStyle = '#83d333';
            ctx.fillRect(p.x - 3, p.bottomY, pipeWidth + 6, 20);
            ctx.strokeRect(p.x - 3, p.bottomY, pipeWidth + 6, 20);
        });

        // Draw Ground
        ctx.fillStyle = '#ddd894';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        ctx.fillStyle = '#73bf2e';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 10);
        ctx.strokeStyle = '#538021'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, canvas.height - 40); ctx.lineTo(canvas.width, canvas.height - 40); ctx.stroke();

        // Draw Flappy Bird (Body, Eye, Beak, Wing, Pitch Rotation)
        ctx.save();
        ctx.translate(60, birdY);
        const angle = Math.min(Math.PI / 3, Math.max(-Math.PI / 4, velocity * 0.09));
        ctx.rotate(angle);

        // Yellow Body
        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2; ctx.stroke();

        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(6, -4, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.arc(8, -4, 2, 0, Math.PI * 2); ctx.fill();

        // Beak
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(20, 4); ctx.lineTo(10, 8); ctx.closePath(); ctx.fill();

        // Wing
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.ellipse(-6, 2, 7, 4, Math.PI / 4, 0, Math.PI * 2); ctx.fill();

        ctx.restore();

        // Live Score Text
        if (gameState === 'PLAYING') {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.strokeText(score, canvas.width / 2, 50);
            ctx.fillText(score, canvas.width / 2, 50);
        }
    }

    function loop() {
        update();
        draw();
        if (gameState === 'PLAYING') {
            animId = requestAnimationFrame(loop);
        }
    }
}

// ==================== 8. AIM TRAINER ARCADE ====================
function startAimTrainerArcade(container) {
    let score = 0;
    container.innerHTML = `
        <div style="font-weight:700; margin-bottom:1rem;">Score: <span id="aimScore">0</span></div>
        <div id="aimArea" style="width:100%; height:260px; background:#050608; border:2px solid #262838; border-radius:8px; position:relative; overflow:hidden; cursor:crosshair;">
            <div id="aimTarget" style="width:36px; height:36px; background:#ec4899; border-radius:50%; position:absolute; top:100px; left:100px;"></div>
        </div>
    `;

    const target = container.querySelector('#aimTarget');
    const area = container.querySelector('#aimArea');

    target.addEventListener('click', (e) => {
        e.stopPropagation();
        score++;
        container.querySelector('#aimScore').textContent = score;
        target.style.top = `${Math.random() * 200}px`;
        target.style.left = `${Math.random() * 240}px`;
        if (score >= 10) unlockAchievement('AIM_MASTER');
    });
}
