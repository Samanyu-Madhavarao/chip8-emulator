import init, * as wasm from "./wasm.js"

//constants and basic setup
const WIDTH = 64
const HEIGHT = 32
const SCALE = 15
const TICKS_PER_FRAME = 10
let anim_frame = 0

const canvas = document.getElementById("canvas")
canvas.width = WIDTH * SCALE
canvas.height = HEIGHT * SCALE

const ctx = canvas.getContext("2d");
ctx.fillStyle = "black"
ctx.fillRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE)

const input = document.getElementById("fileinput")

//load EmuWasm and handle main emulation
async function run() {
    await init()
    let chip8 = new wasm.EmuWasm()

    document.addEventListener("keydown", function(evt) {
        chip8.keypress(evt, true)
    }) 

    document.addEventListener("keyup", function(evt) {
        chip8.keypress(evt, false)
    })

    input.addEventListener("change", function(evt) {

    }, false)
}

run().catch(console.error)

//loading file when button press
input.addEventListener("change", function(evt) {
    //prevents new game from rendering if one is already rendered
    if (anim_frame != 0) {
        window.cancelAnimationFrame(anim_frame)
    }

    let file = evt.target.files[0]
    if(!file) {
        alert("Failed to read file")
        return
    }

    //Load in game as Uint8Arry and send to Wasm
    let fr = new FileReader()
    fr.onload = function(e) {
        let buffer = fr.result
        const rom = new Uint8Array(buffer)
        chip8.reset()
        chip8.load_game(rom)
        mainloop(chip8)
    }
    fr.readAsArrayBuffer(file)
}, false)

//main emulation loop
function mainloop(chip8) {
    for(let i = 0; i < TICKS_PER_FRAME; i++) {
        chip8.tick()
    }
    chip8.tick_timers()

    //Clear canvas
    ctx.fillStyle = "red"
    ctx.fillRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE)
    ctx.fillStyle = "white"
    chip8.draw_screen(SCALE)

    anim_frame = window.requestAnimationFrame(() => {
        mainloop(chip8)
    })
}