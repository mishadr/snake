function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class Pos {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    add(pos) {
        this.x += pos.x
        this.y += pos.y
        return this
    }

    eq(pos) {
        return pos.x === this.x && pos.y === this.y
    }

    static add(pos1, pos2) {
        return new Pos(pos1.x + pos2.x, pos1.y + pos2.y)
    }

    static sub(pos1, pos2) {
        return new Pos(pos1.x - pos2.x, pos1.y - pos2.y)
    }

}


FREE = 0
SNAKE = 1
APPLE = 2
WALL = -1

class Field {
    constructor(area, snake, drawer) {
        this.area = area // W x H array of integers
        this.width = area.length
        this.height = area[0].length
        this.snake = snake
        this.drawer = drawer

        // TODO
        this.add(new Pos(5, 4), APPLE)
    }

    // Changing cell content
    add(pos, value) {
        this.area[pos.x][pos.y] = value
        this.drawer.add(pos, value)
    }

    move(posFrom, posTo, onFree=FREE) {
        this.area[posTo.x][posTo.y] = this.area[posFrom.x][posFrom.y]
        this.area[posFrom.x][posFrom.y] = onFree
        this.drawer.move('snake', posFrom, posTo)
    }

    free(pos, value=FREE) {
        this.area[pos.x][pos.y] = value
        this.drawer.del('object', pos)
    }

    putSnake() {
        this.snake.place(Math.round(this.width/2 - 1), Math.round(this.height / 2))
        // TODO what if it intersects wall?
        for (const pos of this.snake.body) {
            this.add(pos, SNAKE)
        }
        this.drawer.addSnakeHead(this.snake.body[this.snake.body.length-1], this.snake.speed)
    }

    putApple(pos) {
        if (pos == null) {
            while (1) {
                let i = Math.floor(Math.random()*this.width)
                let j = Math.floor(Math.random()*this.height)
                if (this.area[i][j] === FREE) {
                    pos = new Pos(i, j)
                    break
                }
            }
        }
        this.add(pos, APPLE)
    }

    computeSnakeNextPos(speed) {
        let curPos = this.snake.head
        let nextPos = this.snake.computeNextPos(speed)

        // Circular borders
        let x = nextPos.x
        if (x >= this.width)
            x -= this.width
        else if (x < 0)
            x += this.width
        let y = nextPos.y
        if (y >= this.height)
            y -= this.height
        else if (y < 0)
            y += this.height
        let pos = new Pos(x, y)

        return pos
    }

    step() {
        let pos = this.computeSnakeNextPos()
        this.snake.nextPos = pos
        let a = this.area[pos.x][pos.y]
        if (a === WALL || a === SNAKE) {
            console.log('game over!')
            return -1
        }
        let eat = a === APPLE
        let tail = this.snake.body[0]
        if (eat) {
            this.free(pos)
            this.add(pos, SNAKE)
        }
        else
            this.move(tail, pos)
        this.drawer.moveSnakeHead(pos, this.snake.speed)
        this.snake.step(eat)
        return a
    }

}


class Snake {
    constructor(drawer, length=1) {
        this.drawer = drawer
        this.headPos = null // head position
        this.body = []
        this.speed = new Pos(1, 0)
        this.nextPos = null
    }

    isInBody(pos) {
        console.log(this.body, pos)
        for (const p of this.body)
            if (p.eq(pos)) return true
        return false
    }

    place(x, y) {
        this.headPos = new Pos(x, y)
        this.body.push(this.headPos)
    }

    computeNextPos(speed) {
        return Pos.add(this.headPos, speed != null ? speed : this.speed)
    }

    turn(key, field) {
        let speed = new Pos(0, 0)
        switch (key) {
            case 'ArrowUp':
                speed.x = 0
                speed.y = -1
                break
            case 'ArrowDown':
                speed.x = 0
                speed.y = 1
                break
            case 'ArrowLeft':
                speed.x = -1
                speed.y = 0
                break
            case 'ArrowRight':
                speed.x = 1
                speed.y = 0
                break
        }
        // Check if turn leads to crash
        if (this.body.length > 1) {
            let next = field.computeSnakeNextPos(speed)
            let a = field.area[next.x][next.y]
            // if (!this.isInBody(next)) { // Body
            if (a === FREE || a === APPLE) { // no crash
                this.speed = speed
                this.drawer.moveSnakeHead(this.headPos, this.speed)
            }
        }
        else {
            this.speed = speed
            this.drawer.moveSnakeHead(this.headPos, this.speed)
        }
    }

    step(eat=false) {
        this.headPos = this.nextPos
        this.body.push(this.headPos)
        if (!eat) {
            this.body.shift()
        }
    }
}


class Game {
    constructor(width, height, level=0, drawer) {
        this.width = width
        this.height = height

        this.level = level
        this.steps = 0
        this.apples = 0
        this.score = 0
        this.timeInterval = 500

        this.drawer = drawer
        this.drawer.init(this.width, this.height)

        this.snake = new Snake(this.drawer)

        let area = this.level.load(this)
        this.field = new Field(area, this.snake, this.drawer)
        this.field.putSnake()
    }

    action(a, key) {
        if (a === 'turn') {
            this.snake.turn(key, this.field)
        }
    }

    step() {
        let success = this.field.step()
        if (success >= 0) {
            this.steps += 1
            this.level.step(this, success)
        }
        return success
    }
}


class Controller {
    constructor() {
        // localStorage.setItem('a', 2);
        let a = localStorage.getItem('a')
        console.log(a)

        this.gamePanel = document.getElementById("svg")
        this.drawer = new Drawer(this.gamePanel)

        this.game = null
        // TODO tmp until menu
        // this.level = new LevelZero()
        this.level = new LevelClassic()

        this.game = new Game(15, 15, this.level, this.drawer)

        this.isPaused = 'play'

        // Add keys listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p')
                this.pause()
            else if (new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']).has(e.key))
                this.game.action('turn', e.key)

        })

        this.start()
    }

    updateInfo() {
        let bestScore = localStorage.getItem('bestScore')
        if (this.game.score > bestScore)
            localStorage.setItem('bestScore', this.game.score)

        document.getElementById("mode").innerText = 'Mode: ' + this.level.name
        document.getElementById("level").innerText = 'Level: ' + this.level.level
        document.getElementById("status").innerText = 'Status: ' + this.isPaused
        document.getElementById("steps").innerText = 'Steps: ' + this.game.steps
        document.getElementById("apples").innerText = 'Apples: ' + this.game.apples
        document.getElementById("score").innerText = 'Score: ' + this.game.score
        document.getElementById("best").innerText = 'Best score: ' + localStorage.getItem('bestScore')
    }

    pause() {
        console.log('pause')
        this.isPaused = this.isPaused === 'play' ? 'pause': 'play'
        document.getElementById("status").innerText = 'Status: ' + this.isPaused
    }

    async start() {
        while (1) {
            await sleep(this.game.timeInterval)
            if (this.isPaused !== 'play')
                continue
            let success = this.game.step()
            if (success < 0) {
                this.isPaused = 'game over'
            }
            this.updateInfo()
        }
    }

}