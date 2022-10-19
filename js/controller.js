function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Controller {
    constructor() {
        this.gamePanel = document.getElementById("svg")
        this.drawer = new Drawer(this.gamePanel)

        this.level = null
        this.game = null

        this.status = 'off'
        this.running = false
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

        // document.addEventListener('visibilitychange', (e) => {
        //     console.log('visibilitychange')
        //     console.log(e)
        // })

        window.addEventListener("beforeunload", (e) => {
            // console.log(e)
            if (this.status === 'play' || this.status === 'pause') {
                e.preventDefault()
                confirm("Are you sure??")
            }
        })

        window.addEventListener('load', (e) => {
            this.status = 'off'
            document.getElementById("status").innerText = 'Status: ' + this.status
            this.pauseButton.disabled = true
        })

        this.newGameButton = document.getElementById("new-game")
        this.newGameButton.addEventListener('click', (e) => {
            this.newGame()
        })

        this.pauseButton = document.getElementById("pause")
        this.pauseButton.addEventListener('click', (e) => {
            this.pause()
        })

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

    newGame() {
        if (this.status === 'play') {
            if (!confirm("Are you sure? Current game will be lost"))
                return
        }
        else if (this.status === 'pause') {
            if (!confirm("Are you sure? Current game will be lost"))
                return
            this.pause()
        }

        // TODO read paramters menu
        // this.level = new LevelZero()
        this.level = new LevelClassic()

        this.game = new Game(15, 15, this.level, this.drawer)

        this.pauseButton.disabled = false
        this.status = 'play'
        this.accelerate = false
        if (!this.running) {
            this.run()
        }
    }

    pause() {
        if (this.status === 'play')
            this.status = 'pause'
        else if (this.status === 'pause')
            this.status = 'play'
        else
            return
        document.getElementById("status").innerText = 'Status: ' + this.status
        this.pauseButton.innerText = this.status === 'play' ? 'Pause' : 'Play'
        $(".game-box .pause").css('display', this.status === 'play' ? 'none' : 'inline')
    }

    // Perform 1 step of the game
    step() {
        let success = this.game.step()
        if (success < 0) {
            this.status = 'game over'
            this.pauseButton.disabled = true
        }
        this.updateInfo()
    }

    // Main game loop
    async run() {
        this.running = true
        console.log(this.running)
        while (1) {
            await sleep(this.game.timeInterval)
            if (this.status === 'play' && !this.accelerate) {
                this.step()
            }
            if (!(this.status === 'play' || this.status === 'pause')) {
                this.running = false
                console.log(this.running)
                break
            }
        }
    }

    // Acceleration loop
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