/**
 * Aakrit Pahadi Portfolio - Main Interactive Frontend Script
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initNavigation();
    initContactForm();
    loadGitHubRepositories();
    initVisualizer();
    initTerminal();
    initPoll();
    initScrollTop();
});

/**
 * 1. Dark / Light Theme Toggle Switcher
 */
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('aakrit_theme') || 'light';

    if (savedTheme === 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            if (document.body.classList.contains('dark-theme')) {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
                localStorage.setItem('aakrit_theme', 'light');
            } else {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
                localStorage.setItem('aakrit_theme', 'dark');
            }
        });
    }
}

/**
 * 2. Navigation & Mobile Menu Handler
 */
function initNavigation() {
    const header = document.getElementById('site-header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        } else {
            header.style.boxShadow = 'none';
        }
    });

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    const sections = document.querySelectorAll('section[id]');
    const observerOptions = { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

/**
 * 3. Sorting Algorithm Visualizer Engine
 */
function initVisualizer() {
    const container = document.getElementById('visualizer-container');
    const algoSelect = document.getElementById('algo-select');
    const sizeInput = document.getElementById('array-size');
    const speedInput = document.getElementById('sort-speed');
    const btnGenerate = document.getElementById('btn-generate-array');
    const btnStart = document.getElementById('btn-start-sort');
    const statComparisons = document.getElementById('stat-comparisons');
    const statSwaps = document.getElementById('stat-swaps');
    const statStatus = document.getElementById('stat-status');

    if (!container || !btnGenerate) return;

    let array = [];
    let isSorting = false;
    let comparisons = 0;
    let swaps = 0;

    function generateArray() {
        if (isSorting) return;
        const size = parseInt(sizeInput.value, 10);
        array = [];
        container.innerHTML = '';
        comparisons = 0;
        swaps = 0;
        updateStats('Ready');

        for (let i = 0; i < size; i++) {
            const val = Math.floor(Math.random() * 200) + 20;
            array.push(val);

            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = `${val}px`;
            container.appendChild(bar);
        }
    }

    function updateStats(status) {
        if (statComparisons) statComparisons.textContent = comparisons;
        if (statSwaps) statSwaps.textContent = swaps;
        if (statStatus) statStatus.textContent = status;
    }

    async function startSorting() {
        if (isSorting) return;
        isSorting = true;
        btnStart.disabled = true;
        btnGenerate.disabled = true;
        updateStats('Sorting...');

        const algo = algoSelect.value;
        const bars = container.children;
        const delay = () => new Promise(r => setTimeout(r, 210 - parseInt(speedInput.value, 10)));

        if (algo === 'bubble') {
            for (let i = 0; i < array.length - 1; i++) {
                for (let j = 0; j < array.length - i - 1; j++) {
                    bars[j].classList.add('comparing');
                    bars[j + 1].classList.add('comparing');
                    comparisons++;
                    updateStats('Sorting...');

                    await delay();

                    if (array[j] > array[j + 1]) {
                        [array[j], array[j + 1]] = [array[j + 1], array[j]];
                        bars[j].style.height = `${array[j]}px`;
                        bars[j + 1].style.height = `${array[j + 1]}px`;
                        swaps++;
                    }

                    bars[j].classList.remove('comparing');
                    bars[j + 1].classList.remove('comparing');
                }
                bars[array.length - 1 - i].classList.add('sorted');
            }
            bars[0].classList.add('sorted');
        } else if (algo === 'selection') {
            for (let i = 0; i < array.length; i++) {
                let minIdx = i;
                bars[i].classList.add('comparing');

                for (let j = i + 1; j < array.length; j++) {
                    bars[j].classList.add('comparing');
                    comparisons++;
                    await delay();

                    if (array[j] < array[minIdx]) {
                        bars[minIdx].classList.remove('comparing');
                        minIdx = j;
                    } else {
                        bars[j].classList.remove('comparing');
                    }
                }

                if (minIdx !== i) {
                    [array[i], array[minIdx]] = [array[minIdx], array[i]];
                    bars[i].style.height = `${array[i]}px`;
                    bars[minIdx].style.height = `${array[minIdx]}px`;
                    swaps++;
                }

                bars[i].classList.remove('comparing');
                bars[i].classList.add('sorted');
            }
        } else {
            // Insertion Sort
            for (let i = 1; i < array.length; i++) {
                let key = array[i];
                let j = i - 1;
                bars[i].classList.add('comparing');
                await delay();

                while (j >= 0 && array[j] > key) {
                    comparisons++;
                    array[j + 1] = array[j];
                    bars[j + 1].style.height = `${array[j + 1]}px`;
                    j--;
                    swaps++;
                    await delay();
                }
                array[j + 1] = key;
                bars[j + 1].style.height = `${key}px`;
                bars[i].classList.remove('comparing');
            }
            for (let b of bars) b.classList.add('sorted');
        }

        isSorting = false;
        btnStart.disabled = false;
        btnGenerate.disabled = false;
        updateStats('Completed ✨');
    }

    btnGenerate.addEventListener('click', generateArray);
    btnStart.addEventListener('click', startSorting);
    sizeInput.addEventListener('input', generateArray);

    generateArray();
}

/**
 * 4. Interactive Developer CLI Terminal
 */
function initTerminal() {
    const termBody = document.getElementById('terminal-body');
    const termInput = document.getElementById('terminal-input');
    if (!termInput || !termBody) return;

    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = termInput.value.trim().toLowerCase();
            termInput.value = '';
            processCommand(cmd);
        }
    });

    function processCommand(cmd) {
        appendLine(`aakrit@portfolio:~$ ${cmd}`, 'cmd-echo');
        if (!cmd) return;

        switch (cmd) {
            case 'help':
                appendLine('Available commands:');
                appendLine('  about     - Learn about Aakrit Pahadi');
                appendLine('  skills    - View technical skills & languages');
                appendLine('  github    - View GitHub profile link');
                appendLine('  chess     - Jump to Aakrit Chess engine section');
                appendLine('  poll      - Jump to community poll');
                appendLine('  lab       - Jump to algorithm visualizer');
                appendLine('  contact   - Get contact info');
                appendLine('  date      - Print current system date');
                appendLine('  clear     - Clear terminal screen');
                appendLine('  hire      - Hire message');
                break;
            case 'about':
                appendLine('Aakrit Pahadi - Computer Engineering Student | AI Enthusiast | Web Developer.');
                appendLine('Address: Dudhauli-9, Sindhuli, Nepal');
                break;
            case 'skills':
                appendLine('Languages: Python, C++, Java, JavaScript, HTML, CSS, SQL');
                appendLine('Frameworks: Django, Flask, React');
                appendLine('AI & Tools: Artificial Intelligence, Machine Learning, Git');
                break;
            case 'github':
                appendLine('GitHub: https://github.com/AakritPahadi');
                break;
            case 'chess':
                appendLine('Navigating to Chess section...');
                window.location.hash = 'chess';
                break;
            case 'lab':
                window.location.hash = 'lab';
                break;
            case 'contact':
                appendLine('Email: pahadiaakrit777@gmail.com');
                appendLine('Phone: 97**********');
                break;
            case 'date':
                appendLine(new Date().toString());
                break;
            case 'clear':
                termBody.innerHTML = '';
                break;
            case 'hire':
                appendLine('Looking forward to collaborating on innovative AI & engineering projects!');
                break;
            default:
                appendLine(`Command not recognized: '${cmd}'. Type 'help' for available commands.`);
        }

        termBody.scrollTop = termBody.scrollHeight;
    }

    function appendLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `term-line ${className}`;
        line.textContent = text;
        termBody.appendChild(line);
    }
}

/**
 * 5. Visitor Community Poll Engine
 */
async function initPoll() {
    const pollOptions = document.getElementById('poll-options');
    const pollResults = document.getElementById('poll-results');

    if (!pollOptions || !pollResults) return;

    const labels = {
        'ai': '🤖 Artificial Intelligence & Machine Learning',
        'web': '🌐 Modern Web & Software Development',
        'embed': '🔌 Embedded Systems & Hardware',
        'algorithms': '⚡ Data Structures & Algorithms'
    };

    async function loadPollResults() {
        try {
            const res = await fetch('/api/poll');
            const data = await res.json();

            if (data.success) {
                renderResults(data.results, data.total);
            }
        } catch (e) {
            console.error('Failed to load poll results', e);
        }
    }

    function renderResults(results, total) {
        pollResults.innerHTML = Object.keys(labels).map(key => {
            const cnt = results[key] || 0;
            const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
            return `
                <div class="poll-result-item">
                    <div class="poll-label-row">
                        <span>${labels[key]}</span>
                        <span>${cnt} votes (${pct}%)</span>
                    </div>
                    <div class="poll-bar-bg">
                        <div class="poll-bar-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    pollOptions.addEventListener('click', async (e) => {
        const btn = e.target.closest('.poll-btn');
        if (!btn) return;
        const optionId = btn.getAttribute('data-id');

        try {
            const res = await fetch('/api/poll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ option_id: optionId })
            });

            const data = await res.json();
            if (data.success) {
                renderResults(data.results, data.total);
            }
        } catch (e) {
            console.error('Poll vote error', e);
        }
    });

    loadPollResults();
}

/**
 * 6. Dynamic GitHub Repositories & Search Filter
 */
async function loadGitHubRepositories() {
    const reposContainer = document.getElementById('repos-grid');
    const searchInput = document.getElementById('repo-search');
    if (!reposContainer) return;

    let allRepos = [];

    try {
        const res = await fetch('/api/github');
        if (!res.ok) throw new Error('GitHub API network error');

        const data = await res.json();
        allRepos = data.repos || [];
        renderRepos(allRepos);

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase().trim();
                const filtered = allRepos.filter(r => 
                    (r.name && r.name.toLowerCase().includes(q)) ||
                    (r.description && r.description.toLowerCase().includes(q)) ||
                    (r.language && r.language.toLowerCase().includes(q))
                );
                renderRepos(filtered);
            });
        }

    } catch (error) {
        reposContainer.innerHTML = `
            <div class="repo-placeholder">
                Visit <a href="https://github.com/AakritPahadi" target="_blank" rel="noopener">https://github.com/AakritPahadi</a> to explore all repositories.
            </div>
        `;
    }

    function renderRepos(repos) {
        if (repos.length === 0) {
            reposContainer.innerHTML = `<div class="repo-placeholder">No matching repositories found.</div>`;
            return;
        }

        reposContainer.innerHTML = repos.map(repo => `
            <div class="repo-card">
                <div>
                    <h4 class="repo-name">
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${escapeHTML(repo.name)}</a>
                    </h4>
                    <p class="repo-desc">${escapeHTML(repo.description)}</p>
                </div>
                <div class="repo-meta">
                    <span>⚡ ${escapeHTML(repo.language)}</span>
                    <span>⭐ ${repo.stargazers_count}</span>
                    <span>🍴 ${repo.forks_count}</span>
                </div>
            </div>
        `).join('');
    }
}

/**
 * 7. Scroll To Top Floating Button
 */
function initScrollTop() {
    const scrollBtn = document.getElementById('scroll-top-btn');
    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.style.display = 'block';
        } else {
            scrollBtn.style.display = 'none';
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * 8. Contact Form Handler
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('btn-submit');

    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            showFeedback('Please fill out all fields.', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                showFeedback(data.message, 'success');
                contactForm.reset();
            } else {
                showFeedback(data.error || 'Failed to send message.', 'error');
            }
        } catch (err) {
            showFeedback('An error occurred. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });

    function showFeedback(msg, type) {
        feedback.textContent = msg;
        feedback.className = `form-feedback ${type}`;
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
