/*
* 棋盘类
* 实现走棋，悔棋，撤销悔棋，判断输赢，绘制棋盘，绘制棋子
* */
function Plate() {
    //开始游戏
    this.Init = function () {
        //清空棋子
        this.chessCount = 0;
        this.isStart = false;
        this.Chesses.length = 0;
        this.lastTemp.length = 0;
        this.nextTemp.length = 0;
        this.blackPlay = true;
        for (var i = 0; i <= this.BLOCKS; i++) {
            this.Chesses[i] = [];
            for (var j = 0; j <= this.BLOCKS; j++) {
                this.Chesses[i][j] = 0;
            }
        }

    }
    //画网格线
    this.drawLine = function (canvas) {
        var context = canvas.getContext("2d");
        context.strokeStyle = "#000000";
        for (var i = 0; i <= this.BLOCKS; i++) {
            context.moveTo(this.LEFTX + i * this.PERSIZE, this.LEFTY);//画竖线
            context.lineTo(this.LEFTX + i * this.PERSIZE, this.LEFTY + this.BLOCKS * this.PERSIZE);
            context.stroke();
            context.moveTo(this.LEFTX, this.LEFTY + i * this.PERSIZE);//画横线
            context.lineTo(this.LEFTX + this.BLOCKS * this.PERSIZE, this.LEFTY + i * this.PERSIZE);
            context.stroke();

            //画横标
            context.font = "20px bold 黑体";
            context.fillStyle = "#000000";
            context.fillText((this.BLOCKS - i + 1).toString(), this.LEFTX - 40, this.LEFTY + i * this.PERSIZE);
        }

        var str = "ABCDEFGHIJKLMNO";
        for (var i = 0; i <= this.BLOCKS; i++) {
            //画纵标
            context.font = "20px bold 黑体";
            context.fillStyle = "#000000";
            context.fillText((str[i]), this.LEFTX + this.PERSIZE * i - 10, this.LEFTY + this.PERSIZE * this.BLOCKS + 40);
        }
        //绘制五子棋棋盘的五个星
        var star = [
            [this.LEFTX + this.PERSIZE * 3, this.LEFTY + this.PERSIZE * 3],
            [this.LEFTX + this.PERSIZE * 11, this.LEFTY + this.PERSIZE * 3],
            [this.LEFTX + this.PERSIZE * 7, this.LEFTY + this.PERSIZE * 7],
            [this.LEFTX + this.PERSIZE * 3, this.LEFTY + this.PERSIZE * 11],
            [this.LEFTX + this.PERSIZE * 11, this.LEFTY + this.PERSIZE * 11]
        ];
        var context = canvas.getContext("2d");
        for (var i = 0; i < 5; i++) {
            context.beginPath();
            context.arc(star[i][0], star[i][1], 6, 0, 2 * Math.PI);
            context.closePath();
            context.fillStyle = "#000000";
            context.fill();
        }
    }
    //下棋
    this.putChess = function (canvas, chess) {
        this.isStart = true;
        //棋子位置没有越界
        if (chess.Location.X <= this.BLOCKS && chess.Location.Y <= this.BLOCKS && chess.Location.X >= 0 && chess.Location.Y >= 0) {
            //向棋盘中加入这颗棋子
            this.Chesses[chess.Location.X][chess.Location.Y] = chess.isBlack ? 1 : -1;
            //给恢复上一步的记忆数组中加入这颗棋子
            this.lastTemp.push(chess);

            this.justChesss = this.lastTemp[this.lastTemp.length - 2];
        } else return;

        var context = canvas.getContext("2d");
        //设置圆的位置
        var gradient = context.createRadialGradient(this.LEFTX + chess.Location.X * this.PERSIZE + 2, this.LEFTY + chess.Location.Y * this.PERSIZE - 2,
            chess.Radius - 2, this.LEFTX + chess.Location.X * this.PERSIZE + 2, this.LEFTY + chess.Location.Y * this.PERSIZE - 2, 0);
        if (chess.isBlack == true) {
            gradient.addColorStop(0, '#0a0a0a');
            gradient.addColorStop(1, '#636766');
        } else {
            gradient.addColorStop(0, '#d1d1d1');
            gradient.addColorStop(1, '#f9f9f9');
        }
        this.chessCount++;
        this.showChess(canvas, chess, gradient);
        this.blackPlay = !this.blackPlay;
    }
    //在canvas中绘制刚走的棋子
    this.showChess = function (canvas, chess, gradient) {
        var context = canvas.getContext("2d");
        context.beginPath();
        context.arc(this.LEFTX + chess.Location.X * this.PERSIZE, this.LEFTY + chess.Location.Y * this.PERSIZE, chess.Radius, 0, 2 * Math.PI);
        context.closePath();
        context.fillStyle = gradient;
        context.fill();

        if(this.canShowOrder){
            //绘制数字
            context.font = "12px bold 黑体";
            context.fillStyle = chess.isBlack ? "#ffffff" : "#000000";
            context.fillText(this.chessCount.toString(), this.LEFTX + chess.Location.X * this.PERSIZE - 2, this.LEFTY + chess.Location.Y * this.PERSIZE);
        }
    }

    //在canvas中绘制上一步棋子
    this.showJustChess = function (canvas, chess, gradient) {
        var context = canvas.getContext("2d");
        context.beginPath();
        context.arc(this.LEFTX + chess.Location.X * this.PERSIZE, this.LEFTY + chess.Location.Y * this.PERSIZE, chess.Radius, 0, 2 * Math.PI);
        context.closePath();
        context.fillStyle = gradient;
        context.fill();
    }
    //拿掉一颗棋子
    this.clearChess = function (canvas, chess) {
        var context = canvas.getContext("2d");
        context.clearRect(chess.Location.X * this.PERSIZE + this.LEFTX - this.PERSIZE / 2,
            chess.Location.Y * this.PERSIZE + this.LEFTY - this.PERSIZE / 2,
            this.PERSIZE, this.PERSIZE);

        //棋子数减少
        this.chessCount--;
        //重画周围的格子
        context.strokeStyle = "#000000";
        context.beginPath();
        context.moveTo(chess.Location.X * this.PERSIZE + this.LEFTX,
            chess.Location.Y * this.PERSIZE + this.LEFTY - this.PERSIZE / 2);
        context.lineTo(chess.Location.X * this.PERSIZE + this.LEFTX,
            chess.Location.Y * this.PERSIZE + this.LEFTY + this.PERSIZE / 2);
        context.stroke();
        context.moveTo(chess.Location.X * this.PERSIZE + this.LEFTX - this.PERSIZE / 2,
            chess.Location.Y * this.PERSIZE + this.LEFTY);
        context.lineTo(chess.Location.X * this.PERSIZE + this.LEFTX + this.PERSIZE / 2,
            chess.Location.Y * this.PERSIZE + this.LEFTY);
        context.stroke();
    }


    //正则表达式查找是否有五子连珠
    this.hasWin = function () {
        if (this.chessCount == (this.BLOCKS + 1) * (this.BLOCKS + 1)) return -100;
        //1.横向查找
        for (var i = 0; i <= this.BLOCKS; i++) {
            var crt_line = [];
            for (var j = 0; j <= this.BLOCKS; j++) {
                crt_line.push(this.Chesses[j][i]);
            }
            var chessStr = this.chessToStr(crt_line);
            //查找结果
            var result = this.checkFiveChess(chessStr);
            if (result != 0) return result;
        }
        //2.纵向查找
        for (var i = 0; i <= this.BLOCKS; i++) {
            var crt_line = [];
            crt_line = this.Chesses[i];
            var chessStr = this.chessToStr(crt_line);
            //查找结果
            var result = this.checkFiveChess(chessStr);
            if (result != 0) return result;
        }

        //3.正斜向查找上半
        for (var i = 0; i <= this.BLOCKS; i++) {
            var crt_line = [];
            for (var j = 0; i + j <= this.BLOCKS; j++) {
                crt_line.push(this.Chesses[i + j][j]);
            }
            var chessStr = this.chessToStr(crt_line);
            //查找结果
            var result = this.checkFiveChess(chessStr);
            if (result != 0) return result;
        }
        //4.正斜向查找下半
        for (var i = 0; i <= this.BLOCKS; i++) {
            var crt_line = [];
            for (var j = 0; j + i <= this.BLOCKS; j++) {
                crt_line.push(this.Chesses[j][i + j]);
            }
            var chessStr = this.chessToStr(crt_line);
            //查找结果
            var result = this.checkFiveChess(chessStr);
            if (result != 0) return result;
        }
        //5.反斜向查找上半
        for (var i = 0; i <= this.BLOCKS; i++) {
            var crt_line = [];
            for (var j = 0; i - j >= 0; j++) {
                crt_line.push(this.Chesses[j][i - j]);
            }
            var chessStr = this.chessToStr(crt_line);
            //查找结果
            var result = this.checkFiveChess(chessStr);
            if (result != 0) return result;
        }
        //6.反斜向查找下半
        for (var i = 1; i <= this.BLOCKS; i++) {
            var crt_line = [];
            for (var j = 0; j <= this.BLOCKS && i + j <= this.BLOCKS; j++) {
                crt_line.push(this.Chesses[this.BLOCKS - j][i + j]);
            }
            var chessStr = this.chessToStr(crt_line);
            //查找结果
            var result = this.checkFiveChess(chessStr);
            if (result != 0) return result;
        }

        //均没有找到
        return 0;
    }
    //棋子集合转化为字符串
    this.chessToStr = function (chesses) {
        var result = "";

        for (var i = 0; i < chesses.length; i++) {
            switch (chesses[i]) {
                case 1: {
                    result += "a";
                    break;
                }
                case -1: {
                    result += "b";
                    break;
                }
                case 0: {
                    result += "_";
                    break;
                }
            }
        }
        return result;
    }
    //检查字符串中是否有 五子连珠
    this.checkFiveChess = function (chessStr) {
        var whiteWin = /bbbbb/g;
        var blackWin = /aaaaa/g;
        if (whiteWin.test(chessStr)) {
            return -1;
        } else if (blackWin.test(chessStr)) {
            return 1;
        } else return 0;
    }
    //背景颜色
    this.backgroundColor = "#eec254";
    //上一步的存档
    this.lastTemp = [];
    //恢复到上一步后下一步的存档
    this.nextTemp = [];
    //是否轮黑棋走棋
    this.blackPlay = true;
    //棋子集合
    this.Chesses = [];
    //单向格数
    this.BLOCKS = 14;
    //格子宽度
    this.PERSIZE = 42;
    //左上角横坐标
    this.LEFTX = 40;
    //左上角纵坐标
    this.LEFTY = 30;
    //游戏是否开始
    this.isStart = false;
    //上一颗棋子
    this.justChesss = new Chess();
    //棋子个数
    this.chessCount = 0;
    //是否显示棋子数字
    this.canShowOrder = true;
}
