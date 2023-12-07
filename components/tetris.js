import EColors from "./EColors";
import EPieces from "./EPieces";
import TetrisPiece from "./piece";

export default class Tetris {

    constructor() {
        this.grid = [];
        this.currentPiece = null;
        this.speed = 500;
        this.score = 0;
    }

    init() {
        this.grid = this.createGrid();
        if (!this.grid) {
            throw new Error("Cannot create a grid!");
        }
        this.currentPiece = this.createPiece();
        if (!this.currentPiece) {
            throw new Error("Cannot create a piece!");
        }

        document.addEventListener("keydown", event => {
            this.userInteraction(event);
        });
        this.gameLoop();
    }

    deleteOldPiece(posX, posY) {
        const grid = this.grid;
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                const cell = this.currentPiece.shape[y][x];
                if (!cell) {
                    continue;
                }
                const newX = posX + x;
                const newY = posY + y;
                grid[newY][newX] = 0;
            }
        }
    }

    move(direction) {
        let oldPosition = { x: this.currentPiece.x, y: this.currentPiece.y }
        switch (direction) {
            case "left":
                this.currentPiece.moveLeft();
                break;
            case "right":
                this.currentPiece.moveRight();
                break;
            case "down":
                this.currentPiece.moveDown();
                break;
            default:
                break;
        }
        if (this._isValidMove(this.currentPiece)) {
            this.deleteOldPiece(oldPosition.x, oldPosition.y);
            this._addPieceToGrid();
        } else {
            this.currentPiece.x = oldPosition.x;
            this.currentPiece.y = oldPosition.y;
            this.currentPiece = this.createPiece();
        }
    }

    userInteraction(event) {
        switch (event.key) {
            case "ArrowLeft":
                this.move("left");
                break;
            case "ArrowRight":
                this.move("right");
                break;
            case "ArrowDown":
                this.move("down");
                break;
            case "ArrowUp":
                this.rotate();
                break;
            case " ":
                this.drop();
                break;
            default:
                break;
        }
    }

    rotate() {
        this.deleteOldPiece(this.currentPiece.x, this.currentPiece.y);
        let transposed = this.currentPiece.shape[0].map((col, i) => this.currentPiece.shape.map(row => row[i]));
        let rotated = transposed.map(row => row.reverse());
        this.currentPiece.shape = rotated;
    }

    _getRandomPiece() {
        const randomShape = Math.floor(Math.random() * 7);
        const shape = [];
        let shapeLetter = "";
        const eShapes = Object.values(EPieces);

        eShapes.forEach((element, index) => {
            if (index === randomShape) {
                shape.push(element);
                shapeLetter = Object.keys(EPieces)[index];
            }
        });

        let color = EColors[shapeLetter];
        return { shape, color };
    }

    createGrid() {
        const rows = 20;
        const columns = 10;
        const grid = [];

        for (let row = 0; row < rows; row++) {
            grid.push([]);

            for (let column = 0; column < columns; column++) {
                grid[row].push(0);
            }
        }

        const topRow = new Array(columns).fill(-1);
        grid.unshift(topRow);
        grid.push(topRow);

        grid.forEach(row => {
            row.unshift(-1);
            row.push(-1);
            return row;
        });

        return grid;
    }

    _isValidMove(piece) {
        const grid = this.grid;

        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                const cell = piece.shape[y][x];
                if (!cell) {
                    continue;
                }
                const newX = piece.x + x;
                const newY = piece.y + y;
                if (newX < 0 || newX >= grid[0].length || newY >= grid.length) {
                    return false;
                }
                try {
                    if (grid[newY][newX] !== this.currentPiece.color && grid[newY][newX] !== 0) {
                        return false;
                    }
                } catch (error) {
                    console.log("THIS IS NOT A BUG, THIS IS A FEATURE #1 : " + error);
                }

            }
        }

        return true;
    }

    createPiece() {
        const { shape, color } = this._getRandomPiece();
        const piece = new TetrisPiece(shape[0], color);

        piece.x = Math.floor((this.grid[0].length - piece.shape[0].length) / 2);
        piece.y = 1;

        if (!this._isValidMove(piece)) {
            this._gameOver();
            return;
        }
        return piece;
    }

    drop() {
        this.score += 5;
        this.speed -= 5;
        let oldPosition = { x: this.currentPiece.x, y: this.currentPiece.y }
        while (this._isValidMove(this.currentPiece)) {
            this.currentPiece.moveDown();
        }
        this.currentPiece.moveUp();
        this.deleteOldPiece(oldPosition.x, oldPosition.y);
        this._addPieceToGrid();
        this.currentPiece = this.createPiece();
    }

    gameLoop() {
        this.move("down");

        if (this._isGameOver()) {
            this._gameOver();
            return;
        }

        this.render();

        this._checkForCompletedLines();

        document.querySelector("#score").innerHTML = `Score: ${this.score}`;

        setTimeout(() => this.gameLoop(), this.speed);
    }

    _isGameOver() {
        const grid = this.grid;

        for (let x = 0; x < grid[0].length; x++) {
            if (grid[0][x] !== 0 && grid[0][x] !== -1) {
                return true;
            }
        }

        return false;
    }

    _gameOver() {
        const main = document.querySelector("#game");

        main.innerHTML = `<div class='game-over'><h1>Game Over!</h1><button onclick='window.location.reload()'>Restart</button></div>`;

        throw new Error("Game Over! (This is not a bug, this is a feature)");
    }

    render() {
        const main = document.querySelector("#game");

        main.innerHTML = "";
        this.grid.forEach(row => {
            const rowElement = document.createElement("div");
            rowElement.className = "row";
            row.forEach(cell => {
                const cellElement = document.createElement("div");

                switch (cell) {
                    case -1:
                        cellElement.className = "cell border";
                        break;
                    case 0:
                        cellElement.className = "cell";
                        break;
                    case 1:
                        cellElement.className = "cell blue";
                        break;
                    case 2:
                        cellElement.className = "cell pink";
                        break;
                    case 3:
                        cellElement.className = "cell purple";
                        break;
                    case 4:
                        cellElement.className = "cell yellow";
                        break;
                    case 5:
                        cellElement.className = "cell green";
                        break;
                    case 6:
                        cellElement.className = "cell purple";
                        break;
                    case 7:
                        cellElement.className = "cell red";
                        break;
                    default:
                        cellElement.className = "cell border";
                        break;
                }

                rowElement.appendChild(cellElement);
            });
            main.appendChild(rowElement);
        });
    }

    _collisionDetector(newX, newY) {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; y <

                this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x] !== 0) {
                    let gridX = this.currentPiece.x + x + newX;
                    let gridY = this.currentPiece.y + y + newY;

                    if (gridX < 0 || gridX >= this.grid[0].length || gridY >= this.grid.length) {
                        return true;
                    }

                    if (this.grid[gridY][gridX] !== 0) {
                        return true;
                    }
                }
            }
        }

        return false;
    }


    _addPieceToGrid() {
        const grid = this.grid;

        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                const cell = this.currentPiece.shape[y][x];
                if (!cell) {
                    continue;
                }
                const newX = this.currentPiece.x + x;
                const newY = this.currentPiece.y + y;

                grid[newY][newX] = this.currentPiece.color;
            }
        }
    }

    _deleteRows(rowsToDelete) {
        rowsToDelete.forEach(rowIndex => {
            for (let x = 0; x < this.grid[rowIndex].length; x++) {
                if (this.grid[rowIndex][x] !== -1) {
                    this.grid[rowIndex][x] = 0;
                }
            }
        });

        for (let y = rowsToDelete[0] - 1; y > 0; y--) {
            for (let x = 0; x < this.grid[y].length; x++) {
                this.grid[y + rowsToDelete.length][x] = this.grid[y][x];
            }
        }

        this.score += rowsToDelete.length * 10;
        this.speed -= rowsToDelete.length * 10;
        this.render();
    }

    _checkForCompletedLines() {
        const grid = this.grid;
        const linesToDelete = [];

        grid.forEach((row, index) => {
            if (index === 0 || index === grid.length - 1) {
                return;
            }

            let isCompleted = true;

            row.forEach(cell => {
                if (cell === 0) {
                    isCompleted = false;
                }
            });

            if (isCompleted) {
                linesToDelete.push(index);
            }
        });

        if (linesToDelete.length > 0) {
            this._deleteRows(linesToDelete);
        }
    }
}
