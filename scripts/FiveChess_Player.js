function Player() {
    //玩家是否执黑棋
    this.isBlack = true;
    //玩家是否下棋
    this.isPlayer = true;

    //玩家下棋
    this.putChess = function (canvas, plate, location) {
        var chess = new Chess();
        chess.isBlack = this.isBlack ? true : false;
        chess.Location.X = location.X;
        chess.Location.Y = location.Y;
        plate.nextTemp = [];
        if (plate.Chesses[chess.Location.X][chess.Location.Y] == 0) {
            plate.putChess(canvas, chess);
            return plate.hasWin();
        }
        //该点已有棋子，返回-2
        return -2;
    }
}