/*
 * PAHADI Valorant Hub Interactivity & Knowledge Quiz Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    initValorantCopyID();
    initExpandableGuides();
    initValorantQuiz();
});

// --- 1-CLICK COPY VALORANT ID ---
function initValorantCopyID() {
    const copyBtn = document.getElementById('copyValIdBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const valorantID = 'PAHADI#GMR';
            navigator.clipboard.writeText(valorantID).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Valorant ID copied! ✓';
                copyBtn.style.backgroundColor = '#10b981';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.backgroundColor = '#ff4655';
                }, 2000);
            });
        });
    }
}

// --- EXPANDABLE TACTICAL GUIDES ---
function initExpandableGuides() {
    document.querySelectorAll('.guide-expand-header').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.parentElement;
            card.classList.toggle('active');
        });
    });

    // Agent Tabs
    document.querySelectorAll('.val-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.val-tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const category = e.target.dataset.valCategory;
            document.querySelectorAll('[data-val-group]').forEach(group => {
                if (category === 'all' || group.dataset.valGroup === category) {
                    group.style.display = 'block';
                } else {
                    group.style.display = 'none';
                }
            });
        });
    });
}

// --- VALORANT KNOWLEDGE QUIZ ---
const VALORANT_QUIZ_QUESTIONS = [
    {
        q: "Which agent possesses the ability 'Tailwind' (Dash)?",
        options: ["Reyna", "Jett", "Raze", "Phoenix"],
        answer: 1
    },
    {
        q: "What is the primary role of Sova in Valorant?",
        options: ["Duelist", "Controller", "Initiator", "Sentinel"],
        answer: 2
    },
    {
        q: "Which weapon deals a one-shot kill to the head against heavy armor at any range?",
        options: ["Phantom", "Vandal", "Spectre", "Bulldog"],
        answer: 1
    },
    {
        q: "What is the cost of a full Heavy Shield in Valorant?",
        options: ["400 Credits", "1000 Credits", "600 Credits", "800 Credits"],
        answer: 1
    },
    {
        q: "Which agent can deploy 'Dark Cover' smokes across the entire map?",
        options: ["Brimstone", "Viper", "Astra", "Omen"],
        answer: 3
    }
];

function initValorantQuiz() {
    const quizContainer = document.getElementById('valorantQuizContainer');
    if (!quizContainer) return;

    let currentQ = 0;
    let score = 0;

    function renderQuestion() {
        if (currentQ >= VALORANT_QUIZ_QUESTIONS.length) {
            quizContainer.innerHTML = `
                <div style="text-align:center; padding:2rem;">
                    <h3 style="font-size:1.8rem; color:#ff4655; margin-bottom:0.5rem;">Quiz Complete!</h3>
                    <p style="font-size:1.2rem; color:#ffffff; margin-bottom:1.5rem;">Final Score: ${score} / ${VALORANT_QUIZ_QUESTIONS.length}</p>
                    <button class="btn btn-primary" id="restartQuizBtn">Try Again</button>
                </div>
            `;
            updateStat('best_valorant_quiz', score, true);
            quizContainer.querySelector('#restartQuizBtn').onclick = () => {
                currentQ = 0; score = 0; renderQuestion();
            };
            return;
        }

        const data = VALORANT_QUIZ_QUESTIONS[currentQ];
        quizContainer.innerHTML = `
            <div class="game-card" style="border-color:#ff4655;">
                <div style="font-size:0.85rem; color:#ff4655; font-weight:700; text-transform:uppercase; margin-bottom:0.5rem;">
                    Question ${currentQ + 1} of ${VALORANT_QUIZ_QUESTIONS.length}
                </div>
                <h3 style="font-size:1.25rem; color:#fff; margin-bottom:1.25rem;">${data.q}</h3>
                <div style="display:flex; flex-direction:column; gap:0.75rem;">
                    ${data.options.map((opt, i) => `
                        <button class="btn btn-secondary quiz-opt-btn" data-idx="${i}" style="text-align:left; justify-content:flex-start;">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        quizContainer.querySelectorAll('.quiz-opt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selected = parseInt(e.currentTarget.dataset.idx, 10);
                if (selected === data.answer) {
                    score++;
                }
                currentQ++;
                renderQuestion();
            });
        });
    }

    renderQuestion();
}
