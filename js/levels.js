class Level {
    constructor(name, level=0) {
        this.name = name
        this.level = level
    }

    load(game) {
        // Load itself into the game
        let area = new Array(game.width) // W x H array of integers
        for (let i=0; i<game.width; ++i) {
            area[i] = new Array(game.height)
            for (let j=0; j<game.height; ++j) {
                area[i][j] = FREE
                game.drawer.add(new Pos(i, j), area[i][j])
            }
        }
        let i = Math.floor(game.width/2)
        let j = Math.floor(game.height/2-2)
        area[i][j] = APPLE
        game.drawer.add(new Pos(i, j), area[i][j])
        return area
    }

    step(game, success) {
        if (game.steps % 10 === 0)
            game.score -= 1
        if (success === APPLE) {
            game.apples += 1
            game.score += 10
            game.field.putObject(null, APPLE)
            if (game.steps > 10 && Math.random() < 0.02)
                game.field.putObject(null, GREEN_APPLE)
        }
        else if (success === GREEN_APPLE) {
            game.apples += 1
            game.score += 30
        }
    }
}

class LevelZero extends Level {
    constructor() {
        super('zero', 0);
    }

    load(game) {
        game.timeInterval = 500
        return super.load(game);
    }
}

class LevelClassic extends Level {
    constructor() {
        super('classic', 0)
    }

    _timeInterval(level) {
        return 50 + 5000 * (5+level) ** -1.2
    }

    _appleThreshold(level) {
        return Math.floor(10 + 10 * (level) ** 1.3)
    }

    load(game) {
        let area = super.load(game);
        game.timeInterval = this._timeInterval(this.level)
        return area
    }

    step(game, success) {
        if (game.apples >= this._appleThreshold(this.level)) {
            // Move to next stage
            this.level += 1
            game.timeInterval = this._timeInterval(this.level)
        }

        super.step(game, success);
    }
}
