class Drawer {
    constructor(element) {
        this.element = element

        this.size = null
        this.left = null
        this.top = null

        this.width = this.element.clientWidth
        this.height = this.element.clientHeight
    }

    // Compute coordinates transform
    init(w, h) {
        this.element.innerHTML = ''
        this.size = Math.min(this.width / w, this.height / h)
        this.left = (this.width - this.size * w) / 2
        this.top = (this.height - this.size * h) / 2
    }

    getX(i) {
        return this.left + this.size * i
    }

    getY(j) {
        return this.top + this.size * j
    }

    id(pos) {
        return `${pos.x}-${pos.y}`
    }

    // Add primitives to cell (i, j) according to its value
    add(pos, value) {
        switch (value) {
            case FREE:
                this.addFree(pos)
                break
            case WALL:
                this.addWall(pos)
                break
            case SNAKE:
                this.addSnake(pos)
                break
            case APPLE:
                this.addApple(pos)
                break
            default:
                alert("ERROR")
        }
    }

    // Move primitives of class=type primitives from cell at posFrom to cell at posTo
    move(type, posFrom, posTo) {
        let objs = $(`.${type}.cell-${this.id(posFrom)}`)
        for (const obj of objs) {
            let cx = parseFloat(obj.getAttribute('cx'))
            let cy = parseFloat(obj.getAttribute('cy'))
            obj.setAttribute('cx', cx + (posTo.x - posFrom.x) * this.size)
            obj.setAttribute('cy', cy + (posTo.y - posFrom.y) * this.size)
            obj.setAttribute('class', `${type} cell-${this.id(posTo)}`)
        }
    }

    moveSnakeHead(pos, dir) {
        let x1 = this.getX(pos.x + 0.5 + 0.2 * dir.x + 0.12 * dir.y)
        let y1 = this.getY(pos.y + 0.5 + 0.2 * dir.y - 0.12 * dir.x)
        let x2 = this.getX(pos.x + 0.5 + 0.2 * dir.x - 0.12 * dir.y)
        let y2 = this.getY(pos.y + 0.5 + 0.2 * dir.y + 0.12 * dir.x)
        let eye1 = $(".snake-eye1")
        let eye2 = $(".snake-eye2")
        eye1.attr('cx', x1)
        eye1.attr('cy', y1)
        eye2.attr('cx', x2)
        eye2.attr('cy', y2)
    }

    // Delete primitives of class=type from cell at pos
    del(type, pos) {
        let objs = $(`.${type}.cell-${this.id(pos)}`)
        for (const obj of objs) {
            obj.outerHTML = ''
        }
    }

    addFree(pos) {
        let x = this.getX(pos.x)
        let y = this.getY(pos.y)
        let box = document.createElementNS("http://www.w3.org/2000/svg", "path")
        box.setAttribute('d', `M${x + 1},${y + this.size / 2} L${x + this.size - 1},${y + this.size / 2}`)
        box.setAttribute('stroke', '#d7d7d7')
        box.setAttribute('stroke-width', this.size - 2)
        box.setAttribute('class', `field cell-${this.id(pos)}`)
        this.element.appendChild(box)
    }

    addWall(pos) {
        let x = this.getX(pos.x)
        let y = this.getY(pos.y)
        let box = document.createElementNS("http://www.w3.org/2000/svg", "path")
        box.setAttribute('d', `M${x},${y + this.size / 2} L${x + this.size},${y + this.size / 2}`)
        box.setAttribute('stroke', '#864206')
        box.setAttribute('stroke-width', this.size)
        box.setAttribute('class', `field cell-${this.id(pos)}`)
        this.element.appendChild(box)
    }

    addSnake(pos) {
        let x = this.getX(pos.x + 0.5)
        let y = this.getY(pos.y + 0.5)
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        circle.setAttribute('cx', x)
        circle.setAttribute('cy', y)
        circle.setAttribute('r', this.size / 2 - 2)
        circle.setAttribute('fill', '#000000')
        circle.setAttribute('class', `snake cell-${this.id(pos)}`)

        let eye1 = document.getElementsByClassName("snake-eye1")[0]
        this.element.insertBefore(circle, eye1)
    }

    addSnakeHead(pos, dir) {
        let x1 = this.getX(pos.x + 0.5 + 0.2 * dir.x + 0.12 * dir.y)
        let y1 = this.getY(pos.y + 0.5 + 0.2 * dir.y - 0.12 * dir.x)
        let x2 = this.getX(pos.x + 0.5 + 0.2 * dir.x - 0.12 * dir.y)
        let y2 = this.getY(pos.y + 0.5 + 0.2 * dir.y + 0.12 * dir.x)
        let eye1 = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        eye1.setAttribute('cx', x1)
        eye1.setAttribute('cy', y1)
        eye1.setAttribute('r', Math.max(2, this.size / 15))
        eye1.setAttribute('fill', '#ffffff')
        eye1.setAttribute('class', `snake-eye1 cell-${this.id(pos)}`)
        this.element.appendChild(eye1)
        let eye2 = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        eye2.setAttribute('cx', x2)
        eye2.setAttribute('cy', y2)
        eye2.setAttribute('r', Math.max(2, this.size / 15))
        eye2.setAttribute('fill', '#ffffff')
        eye2.setAttribute('class', `snake-eye2 cell-${this.id(pos)}`)
        this.element.appendChild(eye2)
    }

    addApple(pos) {
        let x = this.getX(pos.x + 0.5)
        let y = this.getY(pos.y + 0.5)
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        circle.setAttribute('cx', x)
        circle.setAttribute('cy', y)
        circle.setAttribute('r', this.size / 2 - 2)
        circle.setAttribute('fill', '#ff0000')
        circle.setAttribute('class', `object cell-${this.id(pos)}`)
        this.element.appendChild(circle)
    }

}