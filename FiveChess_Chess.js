/*棋子类*/
function Chess() {
    //棋子半径大小
    this.Radius = 17;
    //棋子颜色
    this.isBlack = true;
    //棋子位置
    this.Location = new Location();
}
/*坐标*/
function Location(x, y) {
    this.X = x;
    this.Y = y;
}