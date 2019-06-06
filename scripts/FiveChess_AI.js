function ComputerAI() {
    //是否使用AI
    this.isPlayer = true;
    //是否执黑
    this.isBlack = false;
    //棋步记录器
    this.step;
    //计算机走棋
    this.Init = function () {
        this.isBlack = false;
    }
    this.putChess = function (canvas, plate) {
        var point = this.getNextChess(plate);
        var chess = new Chess();
        chess.Location.X = point.X;
        chess.Location.Y = point.Y;
        chess.isBlack = this.isBlack;
        plate.putChess(canvas, chess);
        var win = plate.hasWin();
        return win;
    }
    this.getNextChess = function (plate) {
        var white = -1;
        var black = 1;
        var myType = white;
        var hisType = black;
        var points = [];

        if (this.isBlack) {
            myType = black;
            hisType = white;
        }

        //游戏进行中，使用AI算法下棋
        if (plate.isStart) {
            var myMark = this.getPlateInfo(plate, myType);
            var hisMark = this.getPlateInfo(plate, hisType);
            //我方分数大于对方分数，进攻
            if (myMark > hisMark) {
                this.step = [];
                for (var i = 0; i <= plate.BLOCKS; i++) {
                    this.step[i] = [];
                }
                //试探性放下下一颗棋子
                var tryToPut = new Plate();
                tryToPut.Chesses = plate.Chesses;
                tryToPut.blackPlay = plate.blackPlay;

                for (var i = 0; i <= plate.BLOCKS; i++) {
                    for (var j = 0; j <= plate.BLOCKS; j++) {

                        if (tryToPut.Chesses[i][j] != 0) {
                            //此处有棋子，此处分数设为
                            this.step[i][j] = -10000;
                            continue;
                        } else {
                            tryToPut.Chesses[i][j] = myType;
                            //将棋子放在此处的分数
                            this.step[i][j] = this.getPlateInfo(tryToPut, myType);
                            tryToPut.Chesses[i][j] = 0;
                        }
                    }
                }
                points = this.getNextPoint(this.step);
            }
            //我方分数小于对方分数，防守
            else {
                this.step = [];
                for (var i = 0; i <= plate.BLOCKS; i++) {
                    this.step[i] = [];
                }
                //试探性放下下一颗棋子

                var tryToPut = new Plate();
                tryToPut.Chesses = plate.Chesses;
                tryToPut.blackPlay = plate.blackPlay;


                for (var i = 0; i <= plate.BLOCKS; i++) {
                    for (var j = 0; j <= plate.BLOCKS; j++) {

                        if (tryToPut.Chesses[i][j] != 0) {
                            //此处有棋子，此处分数设为
                            this.step[i][j] = -1000000000;
                            continue;
                        } else {
                            tryToPut.Chesses[i][j] = hisType;
                            //将棋子放在此处的分数
                            this.step[i][j] = this.getPlateInfo(tryToPut, hisType);
                            tryToPut.Chesses[i][j] = 0;
                        }
                    }
                }
                points = this.getNextPoint(this.step);
            }
        }
        //AI 先走,直接在棋盘中间下棋
        else {
            for (var i = 4; i < 12; i++) {
                for (var j = 4; j < 12; j++) {
                    points.push(new Location(i, j));
                }
            }
        }
        var index = getRandom(0, points.length);
        return points[index];
    }
    //获取下一个最佳下棋点  maxOrMinFlag: true 最大值 ，false 最小值
    this.getNextPoint = function (nextStep) {

        var maxScore = -1000000000000;

        var result = [];

        var row = nextStep.length;
        var col = nextStep[0].length;
        for (var i = 0; i < row; i++) {
            for (var j = 0; j < col; j++) {
                if (maxScore < nextStep[i][j]) {
                    maxScore = nextStep[i][j];
                    result = [];
                    result.push(new Location(i, j));
                } else if (maxScore == nextStep[i][j]) {
                    result.push(new Location(i, j));
                }
            }
        }
        return result;
    }
    //获取棋盘信息,返回类型为 myType 的棋型分数
    this.getPlateInfo = function (plate, myType) {
        var myMark = 0;
        //判断黑棋(假设myType = 1, 黑棋）
        //1.横向查找
        for (var i = 0; i <= plate.BLOCKS; i++) {
            var crt_line = [];
            for (var j = 0; j <= plate.BLOCKS; j++) {
                crt_line.push(plate.Chesses[j][i]);
            }
            var lineStr = plate.chessToStr(crt_line);
            myMark += this.getOneLineMark(lineStr, myType);
        }
        //2.纵向查找
        for (var i = 0; i <= plate.BLOCKS; i++) {
            var crt_line = [];
            crt_line = plate.Chesses[i];
            var lineStr = plate.chessToStr(crt_line);
            myMark += this.getOneLineMark(lineStr, myType);
        }

        //3.正斜向查找上半
        for (var i = 0; i <= plate.BLOCKS; i++) {
            var crt_line = [];
            for (var j = 0; i + j <= plate.BLOCKS; j++) {
                crt_line.push(plate.Chesses[i + j][j]);
            }
            var lineStr = plate.chessToStr(crt_line);
            myMark += this.getOneLineMark(lineStr, myType);
        }
        //4.正斜向查找下半
        for (var i = 1; i <= plate.BLOCKS; i++) {
            var crt_line = [];
            for (var j = 0; j + i <= plate.BLOCKS; j++) {
                crt_line.push(plate.Chesses[j][i + j]);
            }
            var lineStr = plate.chessToStr(crt_line);
            myMark += this.getOneLineMark(lineStr, myType);
        }
        //5.反斜向查找上半
        for (var i = 0; i <= plate.BLOCKS; i++) {
            var crt_line = [];
            for (var j = 0; i - j >= 0; j++) {
                crt_line.push(plate.Chesses[j][i - j]);
            }
            var lineStr = plate.chessToStr(crt_line);
            myMark += this.getOneLineMark(lineStr, myType);
        }
        //6.反斜向查找下半
        for (var i = 1; i <= plate.BLOCKS; i++) {
            var crt_line = [];
            for (var j = 0; j <= plate.BLOCKS && i + j < plate.BLOCKS; j++) {
                crt_line.push(plate.Chesses[plate.BLOCKS - j][i + j]);
            }
            var lineStr = plate.chessToStr(crt_line);
            myMark += this.getOneLineMark(lineStr, myType);
        }
        return myMark;
    }
    //给一组棋打分
    this.getOneLineMark = function (lineStr, type) {
        var myMark = 0;

        //如果是白棋则将字符串中a 换成 b， b 换成 a
        if (type == -1) {
            lineStr = this.exchangeAB(lineStr);
        }


        var MARK = [];
        MARK[0] = 100000000000;//成5
        MARK[1] = 1000000000;//活4
        MARK[2] = 10000000;//冲4
        MARK[3] = 1000000;//活3
        MARK[4] = 800000;//跳活3
        MARK[5] = 10000;//眠3
        MARK[6] = 1000;//活2
        MARK[7] = 100;//眠2
        MARK[8] = 1;//单子

        var reg = [];
        //1.成5
        reg[0] = [/aaaaa/g];
        //2.活4
        reg[1] = [/_aaaa_/g];
        //3.冲4
        reg[2] = [/^aaaa_/g, /aa_aa/g, /a_aaa/g, /aaa_a/g, /_aaaa$/g, /baaaa_/g, /_aaaab/g];
        //4.活3
        reg[3] = [/_aaa__/g, /__aaa_/g]
        //5.跳活3
        reg[4] = [/_aa_a_/g, /_a_aa_/g];
        //6.眠3
        reg[5] = [/aaa__/g, /__aaa/g, /aa_a_/g, /a_aa_/g, /aa__a/g, /a_a_a/g, /_aaa_/g, /_a_aa/g, /_aa_a/g, /a__aa/g];
        //7.活2
        reg[6] = [/__aa__/g, /_a_a_/g, /_a__a_/g];
        //8.眠2
        reg[7] = [/___aab/g, /___aa$/g, /^aa___/g, /baa___/g, /ba_a__/g, /__a_ab/g, /^a_a__/g, /__a_a$/g,
            /ba__a_/g, /^a__a_/g, /_a__ab/g, /_a__a$/g, /a___a/g];
        //9.单子
        reg[8] = [/a/g];
        for (var i = 0; i < reg.length; i++) {
            for (var j = 0; j < reg[i].length; j++) {
                //符合条件的棋型个数
                var count = 0;
                var result = lineStr.match(reg[i][j]);
                count = result == null ? 0 : result.length;
                myMark += MARK[i] * count;
            }
        }
        return myMark;
    }
    //交换字符串中的黑棋和白棋
    this.exchangeAB = function (lineStr) {
        lineStr = lineStr.replace(/a/g, 'c');
        lineStr = lineStr.replace(/b/g, 'a');
        lineStr = lineStr.replace(/c/g, 'b');
        return lineStr;
    }
}

//产生begin到end（不包含end）之间的随机数
function getRandom(begin, end) {
    var rd = Math.random() * (end - begin);
    rd = Math.floor(rd);
    rd += begin;
    return rd;
}


