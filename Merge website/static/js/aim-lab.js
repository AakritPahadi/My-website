/*
 * PAHADI AIM LAB - 5 Training Modes & WASM/JS Analytics Engine
 */

class PahadiAimLab {
    constructor() {
        this.canvas = document.getElementById('aimCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.mode = 'reaction';
        this.isRunning = false;
        this.targetsHit = 0;
        this.misses = 0;
        this.reactionTimes = [];
        this.startTime = 0;
        this.currentTarget = null;
        this.score = 0;
        
        this.initDOM();
        this.resizeCanvas();
    }

    initDOM() {
        window.addEventListener('resize', () => this.resizeCanvas());

        document.querySelectorAll('.btn-aim-mode').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-aim-mode').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setMode(e.target.dataset.mode);
            });
        });

        const startBtn = document.getElementById('startAimBtn');
        if (startBtn) startBtn.addEventListener('click', () => this.startSession());

        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.drawEmptyState();
    }

    setMode(newMode) {
        this.mode = newMode;
        this.resetStats();
        this.drawEmptyState();
    }

    resetStats() {
        this.targetsHit = 0;
        this.misses = 0;
        this.reactionTimes = [];
        this.score = 0;
        this.isRunning = false;
        this.updateHUD();
    }

    startSession() {
        this.resetStats();
        this.isRunning = true;
        this.spawnTarget();
    }

    spawnTarget() {
        if (!this.isRunning) return;

        const padding = 50;
        const w = this.canvas.width;
        const h = this.canvas.height;
        let radius = 24;

        if (this.mode === 'precision') radius = 12;
        if (this.mode === 'speed') radius = 20;

        this.currentTarget = {
            x: Math.random() * (w - padding * 2) + padding,
            y: Math.random() * (h - padding * 2) + padding,
            radius: radius,
            spawnTime: Date.now()
        };

        this.drawCanvas();
    }

    drawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid Background lines
        this.ctx.strokeStyle = '#1e1f2e';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.canvas.height); this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.canvas.width, y); this.ctx.stroke();
        }

        if (this.currentTarget) {
            // Target Outer Ring
            this.ctx.fillStyle = '#8b5cf6';
            this.ctx.beginPath();
            this.ctx.arc(this.currentTarget.x, this.currentTarget.y, this.currentTarget.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner Bullseye
            this.ctx.fillStyle = '#ec4899';
            this.ctx.beginPath();
            this.ctx.arc(this.currentTarget.x, this.currentTarget.y, this.currentTarget.radius * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    handleCanvasClick(e) {
        if (!this.isRunning || !this.currentTarget) return;

        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const dx = clickX - this.currentTarget.x;
        const dy = clickY - this.currentTarget.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= this.currentTarget.radius) {
            // Hit!
            const reaction = Date.now() - this.currentTarget.spawnTime;
            this.reactionTimes.push(reaction);
            this.targetsHit++;
            this.score += Math.max(10, 1000 - reaction);

            if (this.targetsHit >= 20) {
                this.finishSession();
            } else {
                this.spawnTarget();
            }
        } else {
            // Miss
            this.misses++;
        }

        this.updateHUD();
    }

    updateHUD() {
        const totalAttempts = this.targetsHit + this.misses;
        const acc = totalAttempts > 0 ? Math.round((this.targetsHit / totalAttempts) * 100) : 100;
        const avgReaction = this.reactionTimes.length > 0 ? Math.round(this.reactionTimes.reduce((a,b)=>a+b, 0) / this.reactionTimes.length) : 0;

        const scoreEl = document.getElementById('aimScore');
        const accEl = document.getElementById('aimAccuracy');
        const reactEl = document.getElementById('aimReaction');
        const ratingEl = document.getElementById('aimRating');

        if (scoreEl) scoreEl.textContent = this.score;
        if (accEl) accEl.textContent = `${acc}%`;
        if (reactEl) reactEl.textContent = `${avgReaction}ms`;
        if (ratingEl) ratingEl.textContent = this.calculateRatingBadge(acc, avgReaction);
    }

    calculateRatingBadge(acc, reaction) {
        if (this.targetsHit === 0) return 'Unranked';
        if (reaction < 240 && acc > 90) return 'SHARP SHOOTER';
        if (reaction < 280 && acc > 80) return 'AIM GOD';
        if (reaction < 340) return 'DIAMOND AIM';
        return 'GOLD AIM';
    }

    finishSession() {
        this.isRunning = false;
        this.currentTarget = null;
        this.drawEmptyState();

        updateStat('best_aim_score', this.score, true);
        if (this.score >= 500) unlockAchievement('AIM_MASTER');

        alert(`Session Complete!\nFinal Score: ${this.score}\nHits: ${this.targetsHit}\nRating: ${this.calculateRatingBadge(this.targetsHit/(this.targetsHit+this.misses)*100, 250)}`);
    }

    drawEmptyState() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '16px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Click "Start Aim Training" to begin session', this.canvas.width / 2, this.canvas.height / 2);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('aimCanvas')) {
        window.pahadiAimLab = new PahadiAimLab();
    }
});
