# Personal Portfolio Website — Aakrit Pahadi

A clean, responsive, dark-themed personal portfolio website built for **Aakrit Pahadi** (`aakritpahadi.com.np`).

Developed using **Python 3**, **Flask**, **HTML5**, **CSS3**, **Vanilla JavaScript**, **SQLite**, and **`python-chess`**.

---

## Features

- **Natural, Authentic Design**: Dark charcoal palette (`#0f172a`), restrained muted blue accents (`#38bdf8`), clean typography, and zero AI template clichés (no fake percentage bars or excessive glowing effects).
- **Exact Personal Details**: Personal bio, education, birth date (`2062/09/20 BS`), address (`Dudhauli-9, Sindhuli, Nepal`), email (`pahadiaakrit777@gmail.com`), phone (`97**********`), and GitHub link.
- **Playable Aakrit Chess (`♟ Aakrit Chess`)**:
  - Interactive Human vs AI chess engine powered by `python-chess` and Minimax with Alpha-Beta Pruning.
  - Three difficulty levels: **Easy**, **Medium**, **Hard**.
  - Board controls: **New Game**, **Undo Move**, **Flip Board**, **Reset Game**.
  - Visual legal move highlights, captured piece tracking, and checkmate/stalemate detection.
- **GitHub Integration**: Dynamically loads real public repositories and profile stats from the GitHub API (`AakritPahadi`).
- **Flask Contact Form**: AJAX-based form submission storing messages in a local SQLite database (`database.db`).
- **Fully Responsive**: Optimized for Desktop, Laptop, Tablet, and Mobile devices with a vanilla JS hamburger menu.

---

## Tech Stack

- **Backend**: Python 3, Flask, SQLite3, `python-chess`
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6 Vanilla)

---

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Application
```bash
python app.py
```

Open your browser and navigate to: `http://localhost:5000`
