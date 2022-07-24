const Line = '/static/imgs/Line.png'
const TConnect = '/static/imgs/TConnect.png'
const Blank = '/static/imgs/Blank.png'
const Corner = '/static/imgs/Corner.png'
const Room1 = '/static/imgs/Room1.png'
const Room2 = '/static/imgs/Room2.png'
const Room3 = '/static/imgs/Room3.png'
const Room4 = '/static/imgs/Room4.png'

const canvas1 = document.getElementById('canvas1')
const drawButton = document.getElementById('drawButton')
const resetButton = document.getElementById('resetButton')
const DEBUG_BUTTON = document.getElementById('DEBUG_BUTTON')
const CW_Input = document.getElementById('field_width')
const CH_Input = document.getElementById('field_height')
const GW_Input = document.getElementById('gird_width')
const GH_Input = document.getElementById('gird_height')

let GRIDW = GW_Input.value
let GRIDH = GH_Input.value
let CW = CW_Input.value
let CH = CH_Input.value
let IMGW = CW/GRIDW
let IMGH = CH/GRIDH
let ctx = canvas1.getContext('2d')

const clearCanvas = () => {
    ctx.clearRect(0,0,CW, CH)
}

const resetCanvas = () => {
    GRIDW = GW_Input.value
    GRIDH = GH_Input.value
    CW = CW_Input.value
    CH = CH_Input.value
    IMGW = CW/GRIDW
    IMGH = CH/GRIDH
    canvas1.width = CW
    canvas1.height = CH
    canvas1.style.backgroundColor = 'black'
    ctx = canvas1.getContext('2d')
    clearCanvas()
}
resetCanvas()


const drawIMG = ( _img, x, y, rot) => {
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.drawImage(_img,-IMGW/2,-IMGH/2,IMGW, IMGH);
    ctx.rotate(-rot);
    ctx.translate(-x, -y);
}

const getImg = (img_url) => {
    const result = new Image()
    result.src = img_url
    return result
}


const LineImg = getImg(Line)
const TConnectImg = getImg(TConnect)
const BlankImg = getImg(Blank)
const CornerImg = getImg(Corner)
const Room1Img = getImg(Room1)
const Room2Img = getImg(Room2)
const Room3Img = getImg(Room3)
const Room4Img = getImg(Room4)

const paint = () => {
    
    drawIMG()
}

class Tile{
    constructor(img, rot, sockets){
        this.img = img
        this.sockets = sockets
        this.rotation = rot
        this.validNaighbours = [[],[],[],[]]
    }

    setImage(img) {
        this.img = img
    }

    draw(x, y){
        drawIMG(this.img, (IMGW/2) + (x*IMGW), (IMGH/2) + (y*IMGH), ((Math.PI*2)/4)*this.rotation)
    }

    reversed(s){
        return [...s].reverse().join("")
    }

    checkValidNaighbours(n){
        for(let i = 0; i < n.length; ++i){
                if(this.sockets[0] == this.reversed(n[i].sockets[2])){
                    this.validNaighbours[0].push(i)
                }
                if(this.sockets[1] == this.reversed(n[i].sockets[3])){
                    this.validNaighbours[1].push(i)
                }
                if(this.sockets[2] == this.reversed(n[i].sockets[0])){
                    this.validNaighbours[2].push(i)
                }
                if(this.sockets[3] == this.reversed(n[i].sockets[1])){
                    this.validNaighbours[3].push(i)
                }
        }
    }

}

let tiles = [
    new Tile(BlankImg, 0, ["AAA", "AAA", "AAA", "AAA"]),
    new Tile(LineImg, 0, ["AAA", "ABA", "AAA", "ABA"]),
    new Tile(LineImg, 1, ["ABA", "AAA", "ABA", "AAA"]),
    new Tile(TConnectImg, 0, ["ABA", "ABA", "AAA", "ABA"]),
    new Tile(TConnectImg, 1, ["ABA", "ABA", "ABA", "AAA"]),
    new Tile(TConnectImg, 2, ["AAA", "ABA", "ABA", "ABA"]),
    new Tile(TConnectImg, 3, ["ABA", "AAA", "ABA", "ABA"]),
    new Tile(CornerImg, 0, ["ABA", "ABA", "AAA", "AAA"]),
    new Tile(CornerImg, 1, ["AAA", "ABA", "ABA", "AAA"]),
    new Tile(CornerImg, 2, ["AAA", "AAA", "ABA", "ABA"]),
    new Tile(CornerImg, 3, ["ABA", "AAA", "AAA", "ABA"]),
    new Tile(Room1Img, 0, ["CCA", "AAA", "ABA", "AEE"]),
    new Tile(Room2Img, 0, ["AAA", "AAA", "ACC", "FFA"]),
    new Tile(Room3Img, 0, ["AAA", "AFF", "QQA", "AAA"]),
    new Tile(Room4Img, 0, ["AQQ", "EEA", "AAA", "AAA"])
]

class Cell{
    constructor(x,y, entropy, values){
        this.collapsed = false
        this.tile = undefined
        this.entropy = entropy
        this.values = values
        this.x = x
        this.y = y
    }

    setValues(v){
        let vn = []
        for(let i = 0; i < this.values.length; ++i){
            if(v.includes(this.values[i]) && !vn.includes(this.values[i])) vn.push(this.values[i])
        }

        this.values = v
        this.entropy = v.length
    }

    collapse(){
        this.tile = tiles[this.values[Math.floor(Math.random()*this.values.length)]]
        this.entropy = 0
        this.collapsed = true
    }

    reset(grid){
        this.tile = undefined
        this.collapsed = false
        this.calcEntropy(grid)
    }

    calcEntropy(grid){
        if(this.collapsed) return

        let left = grid.get(this.x-1, this.y)
        let top = grid.get(this.x, this.y-1)
        let right = grid.get(this.x+1, this.y)
        let bottom = grid.get(this.x, this.y+1)
        let pvalues = []
        if(left && left.collapsed) pvalues.push(left.tile.validNaighbours[1])
        if(top && top.collapsed) pvalues.push(top.tile.validNaighbours[2])
        if(right && right.collapsed) pvalues.push(right.tile.validNaighbours[3])
        if(bottom && bottom.collapsed) pvalues.push(bottom.tile.validNaighbours[0])
        let validTiles = []
        for(let j = 0; j < tiles.length; ++j){
            let jvalid = true
            for(let i = 0; i < pvalues.length; ++i){
                jvalid &= pvalues[i].includes(j)
            }
            if(jvalid) validTiles.push(j)
        }

        this.values = validTiles
        this.entropy = validTiles.length

    }

}

class Grid{
    constructor(width, height, start_entropy){
        this.width = width;
        this.height = height;
        this.cells = [];
        let startV = [];
        for(let i = 0; i < tiles.length; ++i){startV.push(i)}
        for(let j = 0; j < height; ++j){
            for(let i = 0; i < width; ++i){
                this.cells.push(new Cell(i,j,start_entropy, startV));
            }
        }

        for(let i = 0; i < width; ++i){
            this.cells[this.idx(i,0,width)].collapsed = true
            this.cells[this.idx(i,0,width)].entropy = 0
            this.cells[this.idx(i,0,width)].tile = tiles[0]
            
            this.cells[this.idx(i,height-1,width)].collapsed = true
            this.cells[this.idx(i,height-1,width)].entropy = 0
            this.cells[this.idx(i,height-1,width)].tile = tiles[0]
        }

        for(let i = 0; i < height; ++i){
            this.cells[this.idx(0,i,width)].collapsed = true
            this.cells[this.idx(0,i,width)].entropy = 0
            this.cells[this.idx(0,i,width)].tile = tiles[0]
            
            this.cells[this.idx(width-1,i,width)].collapsed = true
            this.cells[this.idx(width-1,i,width)].entropy = 0
            this.cells[this.idx(width-1,i,width)].tile = tiles[0]
        }

        for(let i = 0; i< this.cells.length; ++i){
            this.cells[i].calcEntropy(this)
        }

    }

    idx(x,y, w){
        return x + y * w
    }

    get(x,y) {
        if(x < 0 || x > this.width || y < 0 || y > this.height) return false
        return this.cells[this.idx(x,y,this.width)]
    }

    set(x,y,cell) {
        this.cells[this.idx(x,y,this.width)] = cell
    }

    getCellsWithLowestEntropy(){
        let en = 999999
        for(let i = 0; i < this.cells.length; ++i){
            if(this.cells[i].entropy < en && !this.cells[i].collapsed){
                en = this.cells[i].entropy
            }
        }

        let result = []
        for(let i = 0; i < this.cells.length; ++i){
            if(this.cells[i].entropy == en && !this.cells[i].collapsed){
                result.push(this.cells[i])
            }
        }
        return result
    }

    drawGrid(){
        ctx.fillStyle = "#fff"
        ctx.font = '10px serif'
        for(let i = 0; i < GRIDW; ++i){
            for(let j = 0; j < GRIDH; ++j){
                let cell = this.cells[this.idx(i,j,GRIDW)]
                if(cell.collapsed && cell.tile){
                    cell.tile.draw(i,j)
                }else{
                    ctx.fillText(`E:${cell.entropy}:(${cell.x},${cell.y})`,(i*IMGW),(j*IMGH)+20)
                }
            }
        }
    }

    WFC(tiles){
        let lowest = grid.getCellsWithLowestEntropy()
        if(lowest == undefined || lowest.length == 0){
            grid.drawGrid()
            for(let i = 0; i < grid.cells.length; ++i){
                if(!grid.cells[i].collapsed) return false
            }
            return true
        }

        let pick = lowest[Math.floor(Math.random()*lowest.length)]
        if(pick == undefined || pick.collapsed || pick.entropy <= 0){
            for(let i = 0; i < grid.cells.length; ++i){
                if(!grid.cells[i].collapsed) return false
            }
            grid.drawGrid()

            return true
        }

        pick.collapse()
        let nextToCollapsed = []
        for(let i = 0; i < this.cells.length; ++i){
            let c = this.cells[i]
            let x = c.x
            let y = c.y
            if(c.collapsed){
                if(x-1 >= 0 && !this.get(x-1, y).collapsed) nextToCollapsed.push(this.get(x-1, y))
                if(x+1 < GRIDW && !this.get(x+1,y).collapsed) nextToCollapsed.push(this.get(x+1,y))
                if(y-1 >= 0 && !this.get(x,y-1).collapsed) nextToCollapsed.push(this.get(x,y-1))
                if(y+1 < GRIDH && !this.get(x,y+1).collapsed) nextToCollapsed.push(this.get(x,y+1))
            }
        }
        for(let i = 0; i < nextToCollapsed.length; ++i){
            let cn = nextToCollapsed[i]
            cn.calcEntropy(this)
        }

        return pick

    }

    allCollapsed(){
        let result = true
        for(let i = 0; i < this.cells.length; ++i){
            result &= this.cells[i].collapsed
        }
        return result
    }

}

let grid = new Grid(GRIDW, GRIDH,tiles.length)

for(let n = 0; n < tiles.length; ++n){
    tiles[n].checkValidNaighbours(tiles)
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

function WFC(){
    resetCanvas()
    //grid = new Grid(GRIDW, GRIDH,tiles.length)

    let last_pick = grid.WFC(tiles)

    let lowest = grid.getCellsWithLowestEntropy()
    if(lowest.length > 0 && lowest[0].entropy == 0) {
        last_pick.reset(grid)
        for(let i = 0; i < grid.cells.length; ++i){
            grid.cells[i].calcEntropy(grid)
        }
    }

    grid.drawGrid()
}

drawButton.onclick = () => {
    let a = async() => {
        while(!grid.allCollapsed()){
            WFC()
            await sleep(1)
        }
    }
    a()
}

resetButton.onclick = () => {
    resetCanvas()
    grid = new Grid(GRIDW, GRIDH,tiles.length)
}

DEBUG_BUTTON.onclick = () => {
    let c = 0
    let j = 0
    ctx.font = '20px serif';
    ctx.fillStyle = '#FFA500';
    for(let n = 0; n < tiles.length; ++n){
        if(n == 5) {c += 1; j=0}
        drawIMG(tiles[n].img,(IMGW/2) + (j*IMGW), (IMGH/2)+(c*IMGH), ((Math.PI*2)/4)*tiles[n].rotation)
        ctx.fillText(`${n}`, j*IMGW,(c*IMGH)+ 20)
        
        j = j + 1
    }
}
