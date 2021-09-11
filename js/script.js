//las constantes determinan si el juego esta corriendo o esta en fase de perdiendo respectivamente
const STATE_RUNNING = 1;
const STATE_LOSING = 2;

var puntos = -1,
    min = 0,
    sec = 0,
    record = 0,
    recordTm = 0,
    recordTs = 0;

var TICK = 130, //velozidad ms
    SQUARE_SIZE = 10, //tamaño de los cuadros px
    BOARD_WIDTH = 40, //numero de cuadros de largo
    BOARD_HEIGHT = 40, //numero de cuadros de  alto
    GROW_SCALE = 5, //tamaño de cola cuando se come
    //mapa de tetlas de tetlado que determina hacian donde se movera
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
        //estas son de botones
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

    //variable que tiene que ver con la logica del juego
let state = {
    canvas: null, //el elemento html
    context: null, //derivado de canvas
    //posiciones de todos los cuadors de la serpiente
    snake: [{
        x: 0,
        y: 0
    }],
    //saber la direccion
    direction: {
        x: 1,
        y: 0
    },
    //posiciones de los cuadros de comida
    prey: {
        x: 0,
        y: 0
    },
    //determina cuantos cuadros estan pendiantes en crecer en cada tick (funcion)
    growing: 0,
    //obtiene unos de los balores de las constantes de juego en corriendo. default: STATE_RUNNING
    runState: STATE_RUNNING
};

//numeros al asar
function randomXY() {
    return {
        x: parseInt(Math.random() * BOARD_WIDTH), //valor x al asar
        y: parseInt(Math.random() * BOARD_HEIGHT) //valor y al asar
    };
}

//acciones de la serpiente //funcion principal
function tick() {
    
    const head = state.snake[0]; //cabesa de la serpiente
    const dx = state.direction.x; //su movimiento en x (0/1/-1)
    const dy = state.direction.y; //su movimiento en y (0/1/-1)
    const highestIndex = state.snake.length - 1; //el numero de cola
    let tail = {}; // ubicacion de la serpiente (cabesa)
    let interval = TICK; //velozidad de movimiento

    //guardar tamaño de la serpiente para cuando come
    Object.assign(tail,
        state.snake[state.snake.length - 1]);

    //saber cuando su cabesa toca la comida
    let didScore = (
        head.x === state.prey.x &&
        head.y === state.prey.y
    );
    //ejecutar movimiento de la serpiente
    if (state.runState === STATE_RUNNING) {
        for (let idx = highestIndex; idx > -1; idx--) {
            const sq = state.snake[idx]; //direccion de la cabesa con x / y
            //comparacion si el idx es igual al numero de cola
            if (idx === 0) {
                //si es 0 su direccion, en y e x sera la misma que tiene mas su movimiento (0/1/-1)
                sq.x += dx;
                sq.y += dy;
            } else {
                //si no es 0 su direccion, en y e x sera igual 
                sq.x = state.snake[idx - 1].x;
                sq.y = state.snake[idx - 1].y;
            }
        } 
        //la serpiente muere
    } else if (state.runState === STATE_LOSING) {
        interval = 10;
        //compara si el tamaño de la serpiente es mayor a 0
        if (state.snake.length > 0) {
            state.snake.splice(0, 1); //da la posicion de la serpiente
            document.getElementById('puntos').innerHTML = puntos;
            document.getElementById('min').innerHTML = min;
            document.getElementById('sec').innerHTML = sec;
            //verificacion de record de puntos
            if (puntos > record) {
                record = puntos;
                document.getElementById('record').innerHTML = ' / ' + puntos;
            } else {
                puntos = 0;
                document.getElementById('puntos').innerHTML = puntos;
            }
            //verificacion de record de tiempo
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
        document.querySelector('.sound').innerHTML += `
        <video id="sonidoM" width="1" height="1" autoplay>
            <source src="sound/muerte.ogg" type="video/ogg">
        </video>
        `;
        setTimeout(()=>{
            document.querySelector('.sound').innerHTML = '';
        },1100);
    }

    //la serpiente come y sumar cola
    if (didScore) {
        document.querySelector('.sound').innerHTML += `
        <video id="sonidoM" width="1" height="1" autoplay>
            <source src="sound/comer.ogg" type="video/ogg">
        </video>
        `;
        setTimeout(()=>{
            document.querySelector('.sound').innerHTML = '';
        },1000);
        state.growing += GROW_SCALE;
        state.prey = randomXY();
        puntos++;
        document.getElementById('puntos').innerHTML = puntos;
    }

    //aumenta la cola de la serpiente cuando come y le sa un valor de GROW_SCALE (aumento de cola al comer)
    if (state.growing > 0) {
        state.snake.push(tail); //añade la cantidad de cola
        state.growing -= 1; //resta la cantidad de cola por llenar cuando come (tiempo de llenado)
    }

    //animacion de la serpiente y velozidad de movimiento (TICK = 130)
    requestAnimationFrame(draw);//llama a la funcion de dibujado
    setTimeout(tick, interval); // velozidad a la que se ejecuta esta funcion (afecta a la velozidad de la serpiente)
}

//detectar colision serpiente-barrera/cola
function detectCollision() {
    const head = state.snake[0]; //cabesa de la serpiente (ubicacion)

    //si choca con los border del canvas
    if (head.x < 0 || head.x >= BOARD_WIDTH || head.y >= BOARD_HEIGHT || head.y < 0) {
        return true;
    }

    //si choca con sigo misma
    for (var idx = 1; idx < state.snake.length; idx++) {
        const sq = state.snake[idx];
        //comparacion si la cabesa toca la cola
        if (sq.x === head.x && sq.y === head.y) {
            return true;
        }
    }
    return false;
}

//dibujar los cuadros de serpiente y comida
function drawPixel(color, x, y) {
    state.context.fillStyle = color;
    state.context.fillRect(
        x * SQUARE_SIZE,
        y * SQUARE_SIZE,
        SQUARE_SIZE,
        SQUARE_SIZE
    );
}

//funcion principal de dibujado
function draw() {
    //limpia los cuadros, borrar el contexto
    state.context.clearRect(0, 0, 400, 400);
    //recorrido por donde pasa la serpiente
    for (var idx = 0; idx < state.snake.length; idx++) {
        const {
            x,
            y
        } = state.snake[idx];
        drawPixel('#00ee00', x, y); //color y posicion serpiente
    }
    //estilos a la comida por donde esta
    const {
        x,
        y
    } = state.prey;
    drawPixel('yellow', x, y); //color y posicion comida

}

// movimiento de la serpiente
window.onload = function () {
    //llamado al canvas y el contexto
    state.canvas = document.querySelector('canvas');
    state.context = state.canvas.getContext('2d');

    //se ejcuta al precionar una tetla
    window.onkeydown = function (e) {
        const direction = DIRECTIONS_MAP[e.key]; //avisa asia que direccion se deve girar la serpiente por el evento
        if (direction) {
            const [x, y] = direction; //declara una constante para la direccion
            if (-x !== state.direction.x && -y !== state.direction.y) {
                state.direction.x = x; //cambia la direccion en x (0, 1, -1)
                state.direction.y = y; //cambia la direccion en y (0, 1, -1)
            }
        }
    }
    //evento para los botones
    //>>>>solo en el primer evento se comenta, ya que los 4 botones solo cabian en el id<<<<
    document.querySelector('#left').addEventListener('click', () => {
        //añade la clase 'click' (ejecuta un color al boton, y se lo quta despues de 200ms)
        document.querySelector('#left').classList.add('click');
        setTimeout(() => {
            document.querySelector('#left').classList.remove('click');
        }, 200)
        const direction = DIRECTIONS_MAP['left']; //le da la direccion hacia donde girar
        if (direction) {
            const [x, y] = direction; //declara una constante para la direccion
            if (-x !== state.direction.x && -y !== state.direction.y) {
                state.direction.x = x; //cambia la direccion en x (0, 1, -1)
                state.direction.y = y; //cambia la direccion en y (0, 1, -1)
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

//vvelozida del tiempo xSegundo
setInterval(() => {
    if (sec >= 59) {
        min++;
        document.getElementById('min').innerHTML = min;
        sec = 0
    }
    sec++;
    document.getElementById('sec').innerHTML = sec;
}, 1000);