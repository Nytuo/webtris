export default class TetrisPiece {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.x = 0;
        this.y = 0;
    }

    moveDown() {
        this.y++;
    }

    moveLeft() {
        this.x--;
    }

    moveRight() {
        this.x++;
    }

    moveUp() {
        this.y--;
    }
}