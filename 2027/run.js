let currentQuestionIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 120;
let answered = false;

function startTimer() {
    clearInterval(timer);
    timeLeft = 120;
    updateTimerDisplay();
    answered = false;
    timer = setInterval(() => {
        if (answered) return;
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            handleTimeout();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('timer');
    timerEl.textContent = timeLeft;
    if (timeLeft < 30) {
        timerEl.classList.add('warning');
    } else {
        timerEl.classList.remove('warning');
    }
}

function showMainScreen() {
    document.getElementById('main-screen').classList.add('active');
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('result-screen').classList.remove('active');
}

function showGameScreen() {
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    document.getElementById('result-screen').classList.remove('active');
    loadQuestion();
}

function showResultScreen() {
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');

    document.getElementById('score').textContent = score;
    document.getElementById('total').textContent = questions.length;

    const grade = grades.find(g => score >= g.min && score <= g.max);

    const titleEl = document.getElementById('grade-title');
    const descEl = document.getElementById('grade-desc');

    titleEl.textContent = grade.title;
    descEl.textContent = grade.desc;
    titleEl.style.color = grade.color;
}

function loadQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById('current-q').textContent = currentQuestionIndex + 1;
    document.getElementById('total-q').textContent = questions.length;
    document.getElementById('question').textContent = q.question;

    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('div');
        btn.className = 'option';
        btn.textContent = opt;
        btn.onclick = () => selectOption(idx);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('explanation').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';

    startTimer();
}

function selectOption(selectedIndex) {
    if (answered) return;
    answered = true;
    clearInterval(timer);

    const q = questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option');
    options.forEach((opt, idx) => {
        opt.classList.add('disabled');
        if (idx === q.answer) {
            opt.classList.add('correct');
        } else if (idx === selectedIndex) {
            opt.classList.add('incorrect');
        }
    });

    if (selectedIndex === q.answer) {
        score++;
    }

    // 自动显示解析
    document.getElementById('explanation').textContent = q.explanation;
    document.getElementById('explanation').style.display = 'block';

    // 判断是否最后一题
    const isLast = (currentQuestionIndex === questions.length - 1);
    const nextBtn = document.getElementById('next-btn');
    nextBtn.textContent = isLast ? '查看结果' : '下一题';
    nextBtn.style.display = 'inline-block';
    nextBtn.onclick = () => {
        if (isLast) {
            showResultScreen();
        } else {
            currentQuestionIndex++;
            loadQuestion();
        }
    };
}

function handleTimeout() {
    if (answered) return;
    answered = true;
    clearInterval(timer);

    const q = questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option');
    options.forEach((opt, idx) => {
        opt.classList.add('disabled');
        if (idx === q.answer) {
            opt.classList.add('correct');
        } else {
            opt.classList.add('incorrect');
        }
    });

    document.getElementById('explanation').textContent = q.explanation;
    document.getElementById('explanation').style.display = 'block';

    const isLast = (currentQuestionIndex === questions.length - 1);
    const nextBtn = document.getElementById('next-btn');
    nextBtn.textContent = isLast ? '查看结果' : '下一题';
    nextBtn.style.display = 'inline-block';
    nextBtn.onclick = () => {
        if (isLast) {
            showResultScreen();
        } else {
            currentQuestionIndex++;
            loadQuestion();
        }
    };
}

document.getElementById('start-btn').onclick = () => {
    currentQuestionIndex = 0;
    score = 0;
    showGameScreen();
};

document.getElementById('restart-btn').onclick = showMainScreen;