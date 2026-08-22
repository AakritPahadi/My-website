/*
 * Daily Challenge & Piditverse Community JS Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    initDailyChallenge();
    initPiditverseModals();
});

// --- DAILY CHALLENGE ---
function initDailyChallenge() {
    const challengeContainer = document.getElementById('dailyChallengeContainer');
    if (!challengeContainer) return;

    const challenges = [
        { name: "Flappy Flier", desc: "Score 10+ points in Flappy Pahadi", target: "Flappy", icon: "🕊️" },
        { name: "Lightning Reflexes", desc: "Achieve under 250ms in Reaction Test", target: "Reaction", icon: "⚡" },
        { name: "RPS Champion", desc: "Win a Best of 5 match in Rock Paper Scissors", target: "RPS", icon: "✊" },
        { name: "Sharpshooter", desc: "Hit 20 targets in Aim Trainer", target: "Aim", icon: "🎯" }
    ];

    const todayIndex = new Date().getDate() % challenges.length;
    const todayChallenge = challenges[todayIndex];

    challengeContainer.innerHTML = `
        <div class="game-card" style="border-color:var(--accent-purple);">
            <div style="font-size:2.5rem; margin-bottom:0.5rem;">${todayChallenge.icon}</div>
            <h3 style="font-size:1.5rem; color:var(--text-heading); margin-bottom:0.5rem;">Today's Mission: ${todayChallenge.name}</h3>
            <p style="color:var(--text-muted); margin-bottom:1.5rem;">${todayChallenge.desc}</p>
            <a href="/gaming/arcade" class="btn btn-purple">Start Challenge Now</a>
        </div>
    `;
}

// --- PIDITVERSE COMMUNITY MODALS (DYNAMIC FOR ALL 14 MEMBERS) ---
function initPiditverseModals() {
    const memberModal = document.getElementById('memberProfileModal');
    const modalContent = document.getElementById('memberModalContent');

    document.querySelectorAll('[data-member]').forEach(card => {
        card.addEventListener('click', () => {
            const memberId = card.dataset.member;
            if (!memberModal || !modalContent) return;

            let infoHtml = "";
            if (memberId === 'pahadi') {
                infoHtml = `
                    <div style="text-align:center;">
                        <div class="member-avatar">P</div>
                        <h3 style="font-size:1.4rem; color:var(--text-heading); margin-bottom:0.25rem;">PAHADI</h3>
                        <p style="color:var(--accent-purple); font-weight:700; margin-bottom:1rem;">Gaming Enthusiast & Platform Owner</p>
                        <div style="background:var(--bg-surface); padding:1rem; border-radius:8px; text-align:left; line-height:1.8;">
                            <p><strong>Valorant ID:</strong> PAHADI#GMR</p>
                            <p><strong>Discord:</strong> pahadi_7</p>
                            <p><strong>Instagram:</strong> pahadiyt_77</p>
                            <p><strong>YouTube:</strong> PAHADI YT</p>
                        </div>
                    </div>
                `;
            } else if (memberId === 'vb6') {
                infoHtml = `
                    <div style="text-align:center;">
                        <div class="member-avatar" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#000;">V</div>
                        <h3 style="font-size:1.4rem; color:var(--text-heading); margin-bottom:0.25rem;">vb6</h3>
                        <p style="color:#f59e0b; font-weight:800; text-transform:uppercase; margin-bottom:1rem;">👑 OWNER</p>
                        <p style="color:var(--text-muted);">Server Owner of PahadiYT & Piditverse</p>
                    </div>
                `;
            } else if (memberId === 'windroid') {
                infoHtml = `
                    <div style="text-align:center;">
                        <div class="member-avatar" style="background:linear-gradient(135deg, #10b981, #059669);">W</div>
                        <h3 style="font-size:1.4rem; color:var(--text-heading); margin-bottom:0.25rem;">w-i-n-d-r-o-i-d</h3>
                        <p style="color:#10b981; font-weight:800; text-transform:uppercase; margin-bottom:1rem;">🛡️ Moderator</p>
                        <p style="color:var(--text-muted);">Community Moderator</p>
                    </div>
                `;
            } else if (memberId === 'anish') {
                infoHtml = `
                    <div style="text-align:center;">
                        <div class="member-avatar" style="background:linear-gradient(135deg, #3b82f6, #60a5fa);">A</div>
                        <h3 style="font-size:1.4rem; color:var(--text-heading); margin-bottom:0.25rem;">Anish_S</h3>
                        <p style="color:#3b82f6; font-weight:700; margin-bottom:1rem;">Brim Main in Valorant</p>
                        <p style="color:var(--text-muted);">Piditverse Member</p>
                    </div>
                `;
            } else {
                const username = card.dataset.username || 'Member';
                infoHtml = `
                    <div style="text-align:center;">
                        <div class="member-avatar" style="background:#262838;">${username.charAt(0).toUpperCase()}</div>
                        <h3 style="font-size:1.4rem; color:var(--text-heading); margin-bottom:0.25rem;">${username}</h3>
                        <p style="color:var(--text-muted); margin-top:0.5rem;">Piditverse Member</p>
                    </div>
                `;
            }

            modalContent.innerHTML = infoHtml;
            memberModal.classList.add('active');
        });
    });

    const closeBtn = document.getElementById('memberModalClose');
    if (closeBtn) closeBtn.addEventListener('click', () => memberModal.classList.remove('active'));
}
