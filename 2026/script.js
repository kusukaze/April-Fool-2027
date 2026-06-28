// 游戏状态
let currentQuestionIndex = 0;
let health = 100;
let difficulty = null;
let role = null;
let questions = null;

// 角色图片配置
const roleImages = {
    kusukaze: {
        normal: 'https://notes.sjtu.edu.cn/uploads/upload_6b22f9f37cd9fdd0c5c9bf93cde07731.jpg',
        critical: 'https://notes.sjtu.edu.cn/uploads/upload_ad6c2f063dbd667f7e9050af7cd1f968.jpg'
    },
    kokome: {
        normal: 'https://notes.sjtu.edu.cn/uploads/upload_a72ae557c222182d713d8e09ec9e2db1.jpg',
        critical: 'https://notes.sjtu.edu.cn/uploads/upload_7950eb70131431e336f3afe6a5c6456a.jpg'
    },
    hikari: {
        normal: 'https://notes.sjtu.edu.cn/uploads/upload_0d0013917f6a77ec37ddee491bf336b8.jpg',
        critical: 'https://notes.sjtu.edu.cn/uploads/upload_17b0cc80cd31fa92b8e81f802b6774b6.jpg'
    }
};

// 角色台词
const finalSentence = {
    kusukaze: {
        failure: '对不起，是我拖了后腿……下次我会更努力的。',
        successLow: '诶？居然通过了……但我还是做得不够好',
        successMedium: '真的吗？我们做到了？我有点不敢相信……',
        successHigh: '哇，这个分数……是我能做到的吗？',
        successVeryHigh: '太、太好了！我竟然也能有这样的表现……',
        perfect: '天哪，我是不是在做梦？这真的是我参与的结果吗？'
    },
    kokome: {
        failure: '没关系，下次我们一起努力吧！',
        successLow: '虽然有点难，但我们做到了呢！',
        successMedium: '已经很棒了，继续加油哦！',
        successHigh: '真开心，我们的努力有回报了呢！',
        successVeryHigh: '太厉害了，你总是让我惊喜！',
        perfect: '完美！和你一起真是太幸福了！'
    },
    hikari: {
        failure: '哇哦，失败了！不过没关系，下次一定赢！',
        successLow: '耶！勉强过关，但已经超开心啦！',
        successMedium: '不错不错，继续冲鸭！',
        successHigh: '太棒啦！我们简直就是最强组合！',
        successVeryHigh: '哇塞！简直无敌了，超厉害！',
        perfect: '完美无缺！今天是最棒的一天！'
    }
}

// 常数
const initScore = 180;
const passScore = 100;
let questionNumber = null;
let basicPoint = null;

// 计时器相关变量
let timerInterval;
const timeLimit = 60; // 每题限时60秒
// 音效：时钟滴答声
const tickSound = new Audio('sound/th_timeout.mp3');

// 获取元素
const mainPage = document.getElementById('main-page');
const difficultyPage = document.getElementById('difficulty-page');
const difficultyText = document.getElementById('difficulty-text');
const difficultyTextSuccess = document.getElementById('difficulty-text-success');
const difficultyTextFailure = document.getElementById('difficulty-text-failure');
const rolePage = document.getElementById('role-page');
const quizPage = document.getElementById('quiz-page');
const gameOverPage = document.getElementById('game-over-page');
const successPage = document.getElementById('success-page');
const healthValue = document.getElementById('health-value');
const healthBar = document.getElementById('health-bar');
const roleThumbnail = document.getElementById('role-thumbnail');
const successRoleThumbnail = document.getElementById('success-role-thumbnail');
const failureRoleThumbnail = document.getElementById('failure-role-thumbnail');
const questionElement = document.getElementById('question');
const currentQuestionElement = document.getElementById('current-question');
const timeLeftElement = document.getElementById('time-left');
const options = document.querySelectorAll('.option');
const clickSound = document.getElementById('click-sound');
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const winSound = document.getElementById('win-sound');
const loseSound = document.getElementById('lose-sound');

// 初始化角色缩略图片
function initRoleThumbnail() {
    roleThumbnail.src = roleImages[role].normal;
}

// 设定难度
function setDifficulty() {
    let color = null;
    let text = null;
    if(difficulty == 1) {
        questions = allQuestions.slice(0,20);
        color = "#66ccaa";
        text = "EASY";
    }
    else if(difficulty == 2) {
        questions = allQuestions.slice(10,30);
        color = "#66ccff";
        text = "NORMAL";
    }
    else if(difficulty == 3) {
        questions = allQuestions.slice(10,40);
        color = "#ff99ff";
        text = "HARD";
    }
    difficultyText.style.color = color;
    difficultyText.textContent = text;
    difficultyTextSuccess.style.color = color;
    difficultyTextSuccess.textContent = text;
    difficultyTextFailure.style.color = color;
    difficultyTextFailure.textContent = text;
    questionNumber = questions.length;
    // 基础扣分，错三分之一卡线及格
    basicPoint = (initScore - passScore) / questionNumber * 3;
}

// 技能
function useSkill(damage) {
    if(role == 'kusukaze') { // E = 0.7875
        if(damage > basicPoint) {
            damage = Math.floor(0.9 * basicPoint);
        }
        damage = Math.min(damage,basicPoint);
    }
    else if(role == 'kokome') { // E = 0.8
        damage = basicPoint;
        let randomNumber = Math.random();
        if(randomNumber < 0.1) {
            damage *= 2;
        }
        else if(randomNumber < 0.3) {
            damage *= 1.5
        }
        else if(randomNumber >= 0.8) {
            damage = 0;
        }
        else if(randomNumber >= 0.4) {
            damage /= 2;
        }
    }
    else if(role == 'hikari') { // E = 0.8
        if(Math.random() < 0.2) {
            damage = 0;
        }
    }
    return Math.floor(damage + 0.5);
}

// 更新血量
function updateHealth() {
    let damage = basicPoint;
    let randomNumber = Math.random();
    // E = 1.025
    if(randomNumber < 0.1) {
        damage *= 2;
    }
    else if(randomNumber < 0.3) {
        damage *= 1.5
    }
    else if(randomNumber >= 0.95) {
        damage = 0;
    }
    else if(randomNumber >= 0.7) {
        damage /= 2;
    }
    damage = useSkill(damage);
    health -= damage;
    let healthPercent = (health-passScore) / (initScore-passScore) * 100
    healthValue.textContent = health;
    healthBar.style.width = `${Math.max(0,0.3*healthPercent)}%`;

    // 血量低于20时，血条变为红色，角色图片切换为濒死状态
    if (healthPercent <= 25) {
        healthBar.classList.add('low-health');
        roleThumbnail.src = roleImages[role].critical;
    } else {
        healthBar.classList.remove('low-health');
        roleThumbnail.src = roleImages[role].normal;
    }

    // 血量低于0时，游戏结束
    if (health < passScore) {
        loseSound.play();
    }
}

// 获取最终台词
function getFinalSentence() {
    if (health < passScore) {
        return finalSentence[role].failure;
    }
    let healthPercent = (health-passScore) / (initScore-passScore) * 100;
    if (healthPercent < 25) {
        return finalSentence[role].successLow;
    }
    if (healthPercent < 50) {
        return finalSentence[role].successMedium;
    }
    if (healthPercent < 75) {
        return finalSentence[role].successHigh;
    }
    if (healthPercent < 100) {
        return finalSentence[role].successVeryHigh;
    }
    return finalSentence[role].perfect;
}

// 启动计时器
function startTimer() {
    let timeLeft = timeLimit;
    timeLeftElement.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftElement.textContent = timeLeft;

        // 剩余时间小于等于5秒时，样式变红并播放时钟音效
        if (timeLeft <= 5) {
            document.getElementById('timer').classList.add('low-time');
            if (timeLeft > 0) {
                tickSound.play();
            }
        }

        // 超时处理
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

// 停止计时器
function stopTimer() {
    clearInterval(timerInterval);
}

// 超时处理
function handleTimeout() {
    // 禁用所有选项
    options.forEach(option => {
        option.disabled = true;
    });

    // 播放答错音效
    wrongSound.play();

    // 扣除血量
    updateHealth();

    // 3秒后进入下一题或结束游戏
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length && health >= passScore) {
            loadQuestion();
        } else if (health >= passScore) {
            showSuccessPage();
        }
    }, 3000);
}

// 加载题目
function loadQuestion() {
    const question = questions[currentQuestionIndex];
    questionElement.textContent = question.question;
    currentQuestionElement.textContent = currentQuestionIndex + 1 + ' / ' + questionNumber; // 更新题号
    options.forEach((option, index) => {
        option.textContent = question.options[index];
        option.classList.remove('correct', 'wrong', 'disabled');
        option.disabled = false; // 启用所有选项
    });

    // 重置计时器样式
    document.getElementById('timer').classList.remove('low-time');

    // 启动计时器
    startTimer();
}

// 处理选项点击
function handleOptionClick(index) {
    // 停止计时器
    stopTimer();

    const question = questions[currentQuestionIndex];

    // 禁用所有选项
    options.forEach(option => {
        option.disabled = true;
    });

    // 判断用户选择是否正确
    if (index === question.answer) {
        options[index].classList.add('correct');
        correctSound.play();
    } else {
        options[index].classList.add('wrong');
        wrongSound.play();
        updateHealth();
    }

    // 将其他选项置灰
    options.forEach((option, i) => {
        if (i !== index) {
            option.classList.add('disabled');
        }
    });

    // 3秒后进入下一题或结束游戏
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length && health >= passScore) {
            loadQuestion();
        } else if (health >= passScore) {
            showSuccessPage();
        } else {
            showGameOverPage(); // 血量低于0时，等待3秒后显示游戏结束页面
        }
    }, 3000);
}

// 显示主页面
function showMainPage() {
    hideAllPages();
    mainPage.classList.remove('hidden');
}

// 显示难度选择页面
function showDifficultyPage() {
    hideAllPages();
    difficultyPage.classList.remove('hidden');
}

// 显示角色选择页面
function showRolePage() {
    setDifficulty();
    hideAllPages();
    rolePage.classList.remove('hidden');
}

// 显示答题页面
function showQuizPage() {
    hideAllPages();
    quizPage.classList.remove('hidden');
    loadQuestion();
}

// 显示游戏结束页面
function showGameOverPage() {
    hideAllPages();
    failureRoleThumbnail.src = roleImages[role].critical;
    document.getElementById('final-progress').textContent = currentQuestionIndex + ' / ' + questionNumber;
    document.getElementById('failure-sentence').textContent = getFinalSentence();
    gameOverPage.classList.remove('hidden');
    stopTimer();
}

// 显示挑战成功页面
function showSuccessPage() {
    hideAllPages();
    successRoleThumbnail.src = roleImages[role].normal;
    successPage.classList.remove('hidden');
    document.getElementById('final-score').textContent = health;
    document.getElementById('success-sentence').textContent = getFinalSentence();
    stopTimer();
    winSound.play();
}

// 隐藏所有页面
function hideAllPages() {
    mainPage.classList.add('hidden');
    difficultyPage.classList.add('hidden');
    rolePage.classList.add('hidden');
    quizPage.classList.add('hidden');
    gameOverPage.classList.add('hidden');
    successPage.classList.add('hidden');
}

// 初始化游戏
function initGame() {
    currentQuestionIndex = 0;
    health = initScore;
    healthValue.textContent = health;
    healthBar.style.width = '30%';
    healthBar.classList.remove('low-health');
    initRoleThumbnail();
}

// 事件监听
document.getElementById('start-game').addEventListener('click', () => {
    clickSound.play();
    showDifficultyPage();
});

document.getElementById('difficulty-easy').addEventListener('click', () => {
    difficulty = 1;
    clickSound.play();
    showRolePage();
});

document.getElementById('difficulty-normal').addEventListener('click', () => {
    difficulty = 2;
    clickSound.play();
    showRolePage();
});

document.getElementById('difficulty-hard').addEventListener('click', () => {
    difficulty = 3;
    clickSound.play();
    showRolePage();
});

document.querySelectorAll('.role').forEach(roleButton => {
    roleButton.addEventListener('click', () => {
        clickSound.play();
        role = roleButton.dataset.role;
        initGame(); // 初始化游戏状态
        showQuizPage();
    });
});

options.forEach(option => {
    option.addEventListener('click', () => {
        clickSound.play();
        handleOptionClick(parseInt(option.dataset.index));
    });
});

document.getElementById('confirm-end').addEventListener('click', () => {
    clickSound.play();
    resetGame();
    showMainPage();
});

document.getElementById('confirm-success').addEventListener('click', () => {
    clickSound.play();
    resetGame();
    showMainPage();
});

// 重置游戏
function resetGame() {
    currentQuestionIndex = 0;
    health = initScore;
    healthValue.textContent = health;
    healthBar.style.width = '100%';
    healthBar.classList.remove('low-health');
}

// 初始化
showMainPage();