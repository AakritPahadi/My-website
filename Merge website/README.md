# Aakrit Pahadi Personal Portfolio & PAHADI Gaming Platform

A unified, full-stack, production-ready web application combining **Aakrit Pahadi's Personal Portfolio** and the **PAHADI Gaming Platform** into ONE cohesive brand experience.

Operating under domain: `aakritpahadi.com.np`

---

## Stack & Technologies

- **Backend**: Python 3, Flask
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: SQLite (`database.db`)
- **Chess Engine**: Custom Minimax AI built with `python-chess`
- **WASM Engine**: C++ Aim Lab calculator source (`cpp/optional-wasm-code/aim_calculator.cpp`) with JS fallback
- **Dependencies**: Zero heavy JS frameworks (No React, Next.js, Vue, Angular, TypeScript, Tailwind, Node.js)

---

## Features Overview

### 1. Personal Portfolio Side
- **Hero Section**: Introduce Aakrit Pahadi (Computer Engineering Student | AI Enthusiast | Web Developer). Uses official uploaded profile photo (`/static/images/profile.jpg`).
- **About Me (`/about`)**: Detailed bio, Date of Birth (2062/09/20 BS), Address (Dudhauli-9, Sindhuli, Nepal), Education, Email (`pahadiaakrit777@gmail.com`), and career goal.
- **Skills (`/skills`)**: Categorized tech tags (Python, C++, Java, Django, Flask, React, HTML, CSS, JS, SQL, Git, AI/ML).
- **Projects (`/projects`)**: Expandable project showcase cards.
- **GitHub (`/github`)**: Official profile details (`AakritPahadi`).
- **Aakrit Chess (`/chess`)**: Playable Human vs AI chess with Minimax move evaluation, Easy/Medium/Hard difficulties, Undo, Flip Board, Reset, and Captured pieces display.
- **Contact (`/contact`)**: Unified contact details & Instagram QR scanner modal.

### 2. PAHADI Gaming Platform (`/gaming`)
- **Homepage**: Hero featuring official uploaded artwork (`/static/images/pahadi-logo.jpg`), tagline *"Play. Compete. Learn. Connect."*, and 5 Quick-Access Cards.
- **PAHADI Arcade (`/gaming/arcade`)**: 12 complete, fully playable browser games:
  1. Tic Tac Toe (PvP, PvAI Easy/Medium)
  2. Sudoku (Logic 9x9 grid with validation)
  3. Snake (Canvas arcade with mobile touch controls)
  4. 2048 (4x4 tile sliding game)
  5. Rock Paper Scissors (Best-of-5 match mode)
  6. Memory Match (Card flipping game)
  7. Reaction Test (Millisecond reflex timing)
  8. Number Guessing (Higher/Lower hint game)
  9. Typing Speed Test (Live WPM & accuracy)
  10. Minesweeper (Mine clearing logic)
  11. Flappy Pahadi (Physics bird arcade)
  12. Aim Trainer (Target clicking)
- **PAHADI Aim Lab (`/gaming/aim-lab`)**: 5 training modes (Reaction Shot, Flick, Precision, Speed, Target Tracking), live HUD, score rating badges.
- **Valorant Hub (`/gaming/valorant`)**:
  - PAHADI profile card with 1-click Copy Valorant ID (`PAHADI#GMR`).
  - Expandable Tactical Guides (Crosshair placement, Counter-strafing, Peeking, Economy).
  - Agent Guides (Jett, Sova, Omen, Killjoy).
  - Lineup Lab & Map Lab.
  - Weapon Guide.
  - Interactive Valorant Knowledge Quiz.
- **Piditverse Community (`/gaming/piditverse`)**: Member cards & profile modals for PAHADI, Anish_S, and members.
- **Gaming Moments (`/gaming/moments`)**: Upload system with secure Flask file validation, MIME checking, XSS protection, and SQLite storage.
- **Meme Zone (`/gaming/memes`)**: Humor gallery.
- **Gamification & Easter Egg**:
  - Local Storage Stats ("Saved locally on this device").
  - 10 Dynamic Achievement Unlock Toasts.
  - Date-seeded Daily Challenge missions.
  - 7-Click Logo Easter Egg ("SECRET PAHADI MODE UNLOCKED 👁️👁️").

---

## How to Run

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the application:
   ```bash
   python app.py
   ```

3. Open your browser at `http://127.0.0.1:5000`
