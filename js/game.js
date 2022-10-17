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


WALL = -2
SNAKE = -1
FREE = 0
APPLE = 1
GREEN_APPLE = 2

class Field {
    constructor(area, snake, drawer) {
        this.area = area // W x H array of integers
        this.width = area.length
        this.height = area[0].length
        this.snake = snake
        this.drawer = drawer
    }

    // Changing cell content
    add(pos, value) {
        this.area[pos.x][pos.y] = value
        this.drawer.add(pos, value)
    }

    move(posFrom, posTo, onFree=FREE) {
        this.area[posTo.x][posTo.y] = this.area[posFrom.x][posFrom.y]
        this.area[posFrom.x][posFrom.y] = onFree
        this.drawer.move('field', posFrom, posTo)
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

    putObject(pos, value) {
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
        this.add(pos, value)
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

        if (a === APPLE || a === GREEN_APPLE)
            this.free(pos)

        let [free, busy] = this.snake.step(a)
        for (const p of free)
            this.area[p.x][p.y] = FREE
        for (const p of busy)
            this.area[p.x][p.y] = SNAKE

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
            if (a >= 0) { // no crash
                this.speed = speed
                this.drawer.moveSnakeHead(this.headPos, this.speed)
            }
        }
        else {
            this.speed = speed
            this.drawer.moveSnakeHead(this.headPos, this.speed)
        }
    }

    step(a) {
        this.headPos = this.nextPos
        this.body.push(this.headPos)

        this.drawer.moveSnakeHead(this.nextPos, this.speed)

        let free = [] // new Positions freed by snake
        let busy = [this.headPos] // new Positions taken by snake
        if (a === APPLE) {
            this.drawer.add(this.headPos, SNAKE)
        }
        else if (a === GREEN_APPLE) {
            // Remove a part of body
            let cutIndex = Math.floor(this.body.length * 0.3)
            for (let i=0; i<cutIndex; ++i) {
                free.push(this.body[i])
                this.drawer.del('snake', this.body[i])
            }
            this.body = this.body.slice(cutIndex)
            this.drawer.add(this.headPos, SNAKE)
        }
        else { // move tail to head
            free.push(this.body[0])
            this.drawer.move('snake', this.body[0], this.headPos)
            this.body.shift()
        }
        return [free, busy]
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
