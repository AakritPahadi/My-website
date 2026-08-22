/*
 * Aakrit Pahadi & PAHADI Gaming - Core JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initEasterEgg();
    initStats();
});

// --- NAVIGATION & MOBILE DRAWER ---
function initNavigation() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');

    if (hamburgerBtn && mobileDrawer && drawerOverlay) {
        function toggleDrawer() {
            mobileDrawer.classList.toggle('open');
            drawerOverlay.classList.toggle('active');
        }

        hamburgerBtn.addEventListener('click', toggleDrawer);
        drawerOverlay.addEventListener('click', toggleDrawer);
    }
}

// --- 7-CLICK LOGO EASTER EGG ---
function initEasterEgg() {
    const brandLogo = document.getElementById('brandLogo');
    let clickCount = 0;
    let clickTimer = null;

    if (brandLogo) {
        brandLogo.addEventListener('click', (e) => {
            clickCount++;
            clearTimeout(clickTimer);

            if (clickCount >= 7) {
                clickCount = 0;
                triggerSecretPahadiMode();
            } else {
                clickTimer = setTimeout(() => { clickCount = 0; }, 2500);
            }
        });
    }
}

function triggerSecretPahadiMode() {
    document.body.classList.add('secret-pahadi-mode');
    unlockAchievement('PAHADI_LEGEND', 'SECRET PAHADI MODE UNLOCKED! 👁️👁️', '👑');
    
    // Ambient sound / screen pulse effect
    const pulse = document.createElement('div');
    pulse.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(139,92,246,0.3) 100%);
        pointer-events: none; z-index: 9999; animation: fadeOut 2s forwards;
    `;
    document.body.appendChild(pulse);
    setTimeout(() => pulse.remove(), 2000);
}

// --- ACHIEVEMENTS SYSTEM ---
const ACHIEVEMENTS = {
    FIRST_WIN: { id: 'FIRST_WIN', title: 'First Win', desc: 'Won your first game', icon: '🏆' },
    AIM_MASTER: { id: 'AIM_MASTER', title: 'Aim Master', desc: 'Score 500+ in Aim Lab', icon: '🎯' },
    QUICK_REACTION: { id: 'QUICK_REACTION', title: 'Quick Reaction', desc: 'Sub 250ms reaction time', icon: '⚡' },
    SNAKE_CHAMPION: { id: 'SNAKE_CHAMPION', title: 'Snake Champion', desc: 'Score 15+ in Snake', icon: '🐍' },
    PUZZLE_MASTER: { id: 'PUZZLE_MASTER', title: 'Puzzle Master', desc: 'Completed Sudoku or 2048', icon: '🧩' },
    SPEED_TYPER: { id: 'SPEED_TYPER', title: 'Speed Typer', desc: 'Achieved 60+ WPM', icon: '⌨️' },
    ARCADE_LEGEND: { id: 'ARCADE_LEGEND', title: 'Arcade Legend', desc: 'Played 5 different arcade games', icon: '🕹️' },
    GAME_EXPLORER: { id: 'GAME_EXPLORER', title: 'Game Explorer', desc: 'Visited all gaming areas', icon: '🎮' },
    DAILY_CHALLENGER: { id: 'DAILY_CHALLENGER', title: 'Daily Challenger', desc: 'Completed today\'s challenge', icon: '🎖️' },
    PAHADI_LEGEND: { id: 'PAHADI_LEGEND', title: 'Pahadi Legend', desc: 'Unlocked Secret Pahadi Mode', icon: '👑' }
};

function unlockAchievement(id, customTitle, customIcon) {
    let unlocked = JSON.parse(localStorage.getItem('pahadi_achievements') || '[]');
    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem('pahadi_achievements', JSON.stringify(unlocked));
        
        // Update stats counter
        updateStat('achievements_unlocked', unlocked.length);

        // Show Toast
        showAchievementToast(
            customTitle || (ACHIEVEMENTS[id] ? ACHIEVEMENTS[id].title : 'Achievement Unlocked!'),
            customIcon || (ACHIEVEMENTS[id] ? ACHIEVEMENTS[id].icon : '🏆')
        );
    }
}

function showAchievementToast(title, icon) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <div class="achievement-icon">${icon}</div>
        <div class="achievement-info">
            <h4>Achievement Unlocked!</h4>
            <p>${title}</p>
        </div>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// --- LOCAL STORAGE STATS HELPERS ---
function getStats() {
    const defaultStats = {
        games_played: 0,
        games_won: 0,
        best_arcade_score: 0,
        best_reaction_ms: 0,
        best_wpm: 0,
        best_aim_score: 0,
        best_valorant_quiz: 0,
        achievements_unlocked: 0
    };
    const saved = localStorage.getItem('pahadi_stats');
    return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
}

function updateStat(key, value, isHighscore = false) {
    const stats = getStats();
    if (isHighscore) {
        if (!stats[key] || value > stats[key] || (key === 'best_reaction_ms' && (stats[key] === 0 || value < stats[key]))) {
            stats[key] = value;
        }
    } else {
        stats[key] = value;
    }
    localStorage.setItem('pahadi_stats', JSON.stringify(stats));
}

function incrementStat(key) {
    const stats = getStats();
    stats[key] = (stats[key] || 0) + 1;
    localStorage.setItem('pahadi_stats', JSON.stringify(stats));
}

function initStats() {
    const unlocked = JSON.parse(localStorage.getItem('pahadi_achievements') || '[]');
    updateStat('achievements_unlocked', unlocked.length);
}

// --- INSTAGRAM QR MODAL ---
function openQrModal() {
    const modal = document.getElementById('qrModal');
    if (modal) modal.classList.add('active');
}

function closeQrModal() {
    const modal = document.getElementById('qrModal');
    if (modal) modal.classList.remove('active');
}
