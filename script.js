const gameArea = document.getElementById('game-area');
const paddle = document.getElementById('paddle');
const ball = document.getElementById('ball');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const winMessage = document.getElementById('win-message'); // Элемент для сообщения о победе
let score = 0;
let startTime = 0; // Время начала игры
let timerInterval; // Интервал для таймера
let gameActive = false; // Флаг активности игры

let paddleX = gameArea.offsetWidth / 2 - 50; // Начальная позиция платформы (центр)
let ballX = gameArea.offsetWidth / 2 - 10;   // Начальная позиция шарика (центр)
let ballY = gameArea.offsetHeight / 2 - 10;
let ballSpeedX = 0; // Скорость шарика (изначально 0)
let ballSpeedY = 0;

// Определение мобильного устройства
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

// Настройка параметров блоков в зависимости от устройства
const blockRows = isMobileDevice() ? 3 : 3; // Количество строк блоков
const blockCols = isMobileDevice() ? 6 : 10; // Количество столбцов блоков
const blockWidth = isMobileDevice() ? 30 : 50; // Ширина блоков
const blockHeight = isMobileDevice() ? 15 : 20; // Высота блоков
const blockPadding = isMobileDevice() ? 5 : 10; // Отступы между блоками

// Массив для хранения блоков
const blocks = [];

// Создание блоков
function createBlocks() {
    for (let row = 0; row < blockRows; row++) {
        for (let col = 0; col < blockCols; col++) {
            const block = document.createElement('div');
            block.classList.add('block');
            block.style.width = `${blockWidth}px`;
            block.style.height = `${blockHeight}px`;
            block.style.left = `${col * (blockWidth + blockPadding)}px`;
            block.style.top = `${row * (blockHeight + blockPadding) + 70}px`; // Сдвигаем блоки ниже
            gameArea.appendChild(block);
            blocks.push(block);
        }
    }
}

// Управление платформой
if (isMobileDevice()) {
    // Управление для мобильных устройств
    document.addEventListener('touchmove', (e) => {
        if (gameActive) {
            const rect = gameArea.getBoundingClientRect();
            paddleX = e.touches[0].clientX - rect.left - paddle.offsetWidth / 2;

            // Ограничиваем движение платформы
            const borderRadius = 10;
            if (paddleX < borderRadius) paddleX = borderRadius;
            if (paddleX > gameArea.offsetWidth - paddle.offsetWidth - borderRadius) {
                paddleX = gameArea.offsetWidth - paddle.offsetWidth - borderRadius;
            }

            paddle.style.left = `${paddleX}px`;
        }
    });

    ballSpeedX = 4; // Увеличиваем скорость шара по горизонтали
    ballSpeedY = -4; // Увеличиваем скорость шара по вертикали
} else {
    // Управление для ПК
    document.addEventListener('mousemove', (e) => {
        if (gameActive) {
            const rect = gameArea.getBoundingClientRect();
            paddleX = e.clientX - rect.left - paddle.offsetWidth / 2;

            // Ограничиваем движение платформы
            const borderRadius = 10;
            if (paddleX < borderRadius) paddleX = borderRadius;
            if (paddleX > gameArea.offsetWidth - paddle.offsetWidth - borderRadius) {
                paddleX = gameArea.offsetWidth - paddle.offsetWidth - borderRadius;
            }

            paddle.style.left = `${paddleX}px`;
        }
    });

    ballSpeedX = 3; // Скорость шара по горизонтали для ПК
    ballSpeedY = -3; // Скорость шара по вертикали для ПК
}

// Обновление игры
function update() {
    if (!gameActive) return;

    // Движение шарика
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;

    // Отскок от стен
    if (ballX <= 0 || ballX >= gameArea.offsetWidth - ball.offsetWidth) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY <= 0) {
        ballSpeedY = -ballSpeedY;
    }

    // Проверка на проигрыш (шарик упал вниз)
    if (ballY >= gameArea.offsetHeight - ball.offsetHeight) {
        clearInterval(timerInterval); // Остановка таймера
        const elapsedTime = (Date.now() - startTime) / 1000; // Время в секундах
        alert(`Игра окончена! Ваш счет: ${score}. Время: ${elapsedTime.toFixed(3)} сек.`);
        resetGame();
    }

    // Проверка столкновения с платформой
    const paddleRect = paddle.getBoundingClientRect();
    const ballRect = ball.getBoundingClientRect();

    if (
        ballRect.bottom >= paddleRect.top &&
        ballRect.top <= paddleRect.bottom &&
        ballRect.right >= paddleRect.left &&
        ballRect.left <= paddleRect.right
    ) {
        ballSpeedY = -ballSpeedY; // Отскок
    }

    // Проверка столкновения с блоками
    blocks.forEach((block, index) => {
        const blockRect = block.getBoundingClientRect();
        if (
            ballRect.bottom >= blockRect.top &&
            ballRect.top <= blockRect.bottom &&
            ballRect.right >= blockRect.left &&
            ballRect.left <= blockRect.right
        ) {
            ballSpeedY = -ballSpeedY; // Отскок
            gameArea.removeChild(block); // Удаление блока
            blocks.splice(index, 1); // Удаление из массива
            score += 10; // Увеличение счета
            scoreDisplay.textContent = `Счет: ${score}`;

            // Проверка на победу
            if (blocks.length === 0) {
                clearInterval(timerInterval); // Остановка таймера
                const elapsedTime = (Date.now() - startTime) / 1000; // Время в секундах
                winMessage.classList.add('visible'); // Показываем сообщение о победе
                setTimeout(() => {
                    winMessage.classList.remove('visible'); // Скрываем сообщение через 3 секунды
                    alert(`Поздравляю с победой! 🎉 Ваш счет: ${score}. Время: ${elapsedTime.toFixed(3)} сек.`);
                }, 3000); // Сообщение показывается 3 секунды
                resetGame();
            }
        }
    });

    requestAnimationFrame(update);
}

// Сброс игры
function resetGame() {
    gameActive = false;
    startButton.style.display = 'block'; // Показываем кнопку "Старт"
    ballX = gameArea.offsetWidth / 2 - 10; // Центрируем шарик
    ballY = gameArea.offsetHeight / 2 - 10;
    ballSpeedX = 0; // Останавливаем шарик
    ballSpeedY = 0;
    score = 0;
    scoreDisplay.textContent = `Счет: ${score}`;
    timerDisplay.textContent = `Время: 0.000`;

    // Удаление всех блоков
    blocks.forEach(block => gameArea.removeChild(block));
    blocks.length = 0;

    // Создание новых блоков
    createBlocks();

    // Сбрасываем время начала игры
    startTime = Date.now();
}

// Начало игры
startButton.addEventListener('click', () => {
    gameActive = true;
    startButton.style.display = 'none'; // Скрываем кнопку "Старт"
    startTime = Date.now(); // Фиксируем время начала игры
    ballSpeedX = 3; // Запускаем шарик
    ballSpeedY = -3; // Шарик летит вверх
    timerInterval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000; // Время в секундах
        timerDisplay.textContent = `Время: ${elapsedTime.toFixed(3)}`; // Отображаем с миллисекундами
    }, 10); // Обновляем каждые 10 миллисекунд
    update();
});

// Инициализация игры
resetGame();