function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Controller {
    constructor() {
        this.gamePanel = document.getElementById("svg")
        this.drawer = new Drawer(this.gamePanel)

        // TODO tmp until menu
        // this.level = new LevelZero()
        this.level = new LevelClassic()

        this.game = new Game(15, 15, this.level, this.drawer)

        this.status = 'play'
        this.accelerate = false

        // Add keys listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p')
                this.pause()
            else if (new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']).has(e.key))
                this.game.action('turn', e.key)
            else if (e.key === 'Shift') {
                this.accelerate = true
                this.fastRun()
            }
        })

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Shift')
                this.accelerate = false
        })

        this.run()
    }

    updateInfo() {
        let bestScore = localStorage.getItem('bestScore')
        if (this.game.score > bestScore)
            localStorage.setItem('bestScore', this.game.score)

        document.getElementById("mode").innerText = 'Mode: ' + this.level.name
        document.getElementById("level").innerText = 'Level: ' + this.level.level
        document.getElementById("status").innerText = 'Status: ' + this.status
        document.getElementById("steps").innerText = 'Steps: ' + this.game.steps
        document.getElementById("apples").innerText = 'Apples: ' + this.game.apples
        document.getElementById("score").innerText = 'Score: ' + this.game.score
        document.getElementById("best").innerText = 'Best score: ' + localStorage.getItem('bestScore')
    }

    pause() {
        console.log('pause')
        this.status = this.status === 'play' ? 'pause' : 'play'
        document.getElementById("status").innerText = 'Status: ' + this.status
        $(".game-box .pause").css('display', this.status === 'play' ? 'none' : 'inline')
    }

    step() {
        let success = this.game.step()
        if (success < 0) {
            this.status = 'game over'
        }
        this.updateInfo()
    }

    async run() {
        while (1) {
            await sleep(this.game.timeInterval)
            if (this.status !== 'play' || this.accelerate)
                continue
            this.step()
        }
    }

    async fastRun() {
        while (1) {
            await sleep(40)
            if (this.accelerate)
                this.step()
            else
                break
        }
    }

}