const STATE_RUNNING = 1;
const STATE_LOSING = 2;
var puntos = -1,
    min = 0,
    sec = 0,
    record = 0,
    recordTm = 0,
    recordTs = 0;
var TICK = 130,
    SQUARE_SIZE = 10,
    BOARD_WIDTH = 40,
    BOARD_HEIGHT = 40,
    GROW_SCALE = 10,
    DIRECTIONS_MAP = {
        'A': [-1, 0],
        'D': [1, 0],
        'S': [0, 1],
        'W': [0, -1],
        'a': [-1, 0],
        'd': [1, 0],
        's': [0, 1],
        'w': [0, -1],
        'ArrowLeft': [-1, 0],
        'ArrowRight': [1, 0],
        'ArrowDown': [0, 1],
        'ArrowUp': [0, -1],
        'left': [-1, 0],
        'right': [1, 0],
        'down': [0, 1],
        'up': [0, -1]
    };
    //dificultad
    document.querySelector('#fa').addEventListener('click', () => {
        document.querySelector('#fa').classList.add('activo');
        document.querySelector('#no').classList.remove('activo');
        document.querySelector('#di').classList.remove('activo');
        TICK = 240;
    });
    document.querySelector('#no').addEventListener('click', () => {
        document.querySelector('#fa').classList.remove('activo');
        document.querySelector('#no').classList.add('activo');
        document.querySelector('#di').classList.remove('activo');
        TICK = 130;
    });
    document.querySelector('#di').addEventListener('click', () => {
        document.querySelector('#fa').classList.remove('activo');
        document.querySelector('#no').classList.remove('activo');
        document.querySelector('#di').classList.add('activo');
        TICK = 60;
    });

let state = {
    canvas: null,
    context: null,
    snake: [{
        x: 0,
        y: 0
    }],
    direction: {
        x: 1,
        y: 0
    },
    prey: {
        x: 0,
        y: 0
    },
    growing: 0,
    runState: STATE_RUNNING
};

//numeros al asar
function randomXY() {
    return {
        x: parseInt(Math.random() * BOARD_WIDTH),
        y: parseInt(Math.random() * BOARD_HEIGHT)
    };
}

//acciones de la serpiente
function tick() {
    const head = state.snake[0];
    const dx = state.direction.x;
    const dy = state.direction.y;
    const highestIndex = state.snake.length - 1;
    let tail = {};
    let interval = TICK;

    //guardar tamaño de la serpiente
    Object.assign(tail,
        state.snake[state.snake.length - 1]);

    let didScore = (
        head.x === state.prey.x &&
        head.y === state.prey.y
    );

    //ejecutar movimiento de la serpiente
    if (state.runState === STATE_RUNNING) {
        for (let idx = highestIndex; idx > -1; idx--) {
            const sq = state.snake[idx];
            if (idx === 0) {
                sq.x += dx;
                sq.y += dy
            } else {
                sq.x = state.snake[idx - 1].x;
                sq.y = state.snake[idx - 1].y;
            }
        } //la serpiente muere
    } else if (state.runState === STATE_LOSING) {
        interval = 10;
        if (state.snake.length > 0) {
            state.snake.splice(0, 1);
            document.getElementById('puntos').innerHTML = puntos;
            document.getElementById('min').innerHTML = min;
            document.getElementById('sec').innerHTML = sec;
            if (puntos > record) {
                record = puntos;
                document.getElementById('record').innerHTML = ' / ' + puntos;
            } else {
                puntos = 0;
                document.getElementById('puntos').innerHTML = puntos;
            }
            if (sec > recordTs || min > recordTm) {
                recordTm = min;
                recordTs = sec;
                document.getElementById('recordTm').innerHTML = ' / ' + min;
                document.getElementById('recordTs').innerHTML = ':' + sec;
            }else{
                min = 0;
                sec = 0;
            }
        } //reposicionar serpiente y comida
        if (state.snake.length === 0) {
            state.runState = STATE_RUNNING;
            state.snake.push(randomXY());
            state.prey = randomXY();
        }
    }

    //ejecutar colision y evitar crecimiento
    if (detectCollision()) {
        state.runState = STATE_LOSING;
        state.growing = 0;
    }

    //la serpiente come y sumar cola
    if (didScore) {
        state.growing += GROW_SCALE;
        state.prey = randomXY();
        puntos++;
        document.getElementById('puntos').innerHTML = puntos;
    }

    //aumenta la cola de la serpiente
    if (state.growing > 0) {
        state.snake.push(tail);
        state.growing -= 1;
    }

    //animacion de la serpiente y velozidad de movimiento (TICK = 130)
    requestAnimationFrame(draw);
    setTimeout(tick, interval);
}

//detectar colision serpiente-barrera/cola
function detectCollision() {
    const head = state.snake[0];

    if (head.x < 0 || head.x >= BOARD_WIDTH || head.y >= BOARD_HEIGHT || head.y < 0) {
        return true;
    }

    for (var idx = 1; idx < state.snake.length; idx++) {
        const sq = state.snake[idx];
        if (sq.x === head.x && sq.y === head.y) {
            return true;
        }
    }
    return false;
}

//estilos de la serpiente
function drawPixel(color, x, y) {
    state.context.fillStyle = color;
    state.context.fillRect(
        x * SQUARE_SIZE,
        y * SQUARE_SIZE,
        SQUARE_SIZE,
        SQUARE_SIZE
    );
}

//estilos de serpiente y comida
function draw() {
    state.context.clearRect(0, 0, 400, 400);

    for (var idx = 0; idx < state.snake.length; idx++) {
        const {
            x,
            y
        } = state.snake[idx];
        drawPixel('#22dd22', x, y);
    }

    const {
        x,
        y
    } = state.prey;
    drawPixel('yellow', x, y)
}

// movimiento de la serpiente
window.onload = function () {
    state.canvas = document.querySelector('canvas');
    state.context = state.canvas.getContext('2d');

    window.onkeydown = function (e) {
        const direction = DIRECTIONS_MAP[e.key];
        if (direction) {
            const [x, y] = direction;
            if (-x !== state.direction.x && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    }
    //evento para los botones
    document.querySelector('#left').addEventListener('click', () => {
        document.querySelector('#left').classList.add('click');
        setTimeout(() => {
            document.querySelector('#left').classList.remove('click');
        }, 200)
        const direction = DIRECTIONS_MAP['left'];
        if (direction) {
            const [x, y] = direction;
            if (-x !== state.direction.x && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    });
    document.querySelector('#up').addEventListener('click', () => {
        document.querySelector('#up').classList.add('click');
        setTimeout(() => {
            document.querySelector('#up').classList.remove('click');
        }, 200)
        const direction = DIRECTIONS_MAP['up'];
        if (direction) {
            const [x, y] = direction;
            if (-x !== state.direction.x && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    });
    document.querySelector('#down').addEventListener('click', () => {
        document.querySelector('#down').classList.add('click');
        setTimeout(() => {
            document.querySelector('#down').classList.remove('click');
        }, 200)
        const direction = DIRECTIONS_MAP['down'];
        if (direction) {
            const [x, y] = direction;
            if (-x !== state.direction.x && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    });
    document.querySelector('#right').addEventListener('click', () => {
        document.querySelector('#right').classList.add('click');
        setTimeout(() => {
            document.querySelector('#right').classList.remove('click');
        }, 200)
        const direction = DIRECTIONS_MAP['right'];
        if (direction) {
            const [x, y] = direction;
            if (-x !== state.direction.x && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    });

    tick();
}
setInterval(() => {
    if (sec >= 59) {
        min++;
        document.getElementById('min').innerHTML = min;
        sec = 0
    }
    sec++;
    document.getElementById('sec').innerHTML = sec;
}, 1000);