function ComputerAI() {
    //是否使用AI
    this.isPlayer = true;
    //是否执黑
    this.isBlack = false;
    //棋步记录器
    this.steps;
    //搜索深度
    this.depth = 1;
    //初始化AI状态
    this.Init = function () {
        this.isPlayer = true;
        this.isBlack = false;
        this.steps = [];
    }
    //计算机走棋
    this.putChess = function (canvas, plate) {
        var point = this.getNextChessPoint(plate);
        var chess = new Chess();
        chess.Location.X = point.X;
        chess.Location.Y = point.Y;
        chess.isBlack = this.isBlack;
        plate.putChess(canvas, chess);
        var win = plate.hasWin();
        return win;
    }

    //获取下一步棋
    this.getNextChessPoint = function (plate) {
        var white = -1;
        var black = 1;
        var myType = white;
        var hisType = black;
        var point = new Location();

        if (this.isBlack) {
            myType = black;
            hisType = white;
        }

        //游戏进行中，使用AI算法下棋
        if (plate.isStart) {
            //棋盘只有一颗黑棋，并且轮AI下棋
            if (plate.chessCount == 1) {
                var rt = this.putFirstWhiteChess(plate);
                point.X = rt.X;
                point.Y = rt.Y;
            }
            //棋盘中至少已经有两颗棋
            else {
                //获取所有可行步的信息
                this.getAllStepsInfo(plate, myType, hisType);
                point = this.getNextPointByRandom(this.steps);
            }
        }
        //AI 先走,直接在棋盘中间下棋
        else {
            point.X = plate.BLOCKS / 2;
            point.Y = plate.BLOCKS / 2;
        }
        return point;
    }

    //获取一步棋的所有可行点的分数信息
    this.getAllStepsInfo = function (plate, myType, hisType) {
        var myMark = this.getPlateInfo(plate, myType);
        var hisMark = this.getPlateInfo(plate, hisType);

        //将step初始化为二维数组
        this.steps = [];
        for (var i = 0; i <= plate.BLOCKS; i++) {
            this.steps[i] = [];
        }

        //复制plate对象到tryToPut
        var tryToPut = new Plate();
        for (var i = 0; i < plate.Chesses.length; i++) {
            tryToPut.Chesses[i] = plate.Chesses[i].slice();
        }
        tryToPut.blackPlay = plate.blackPlay;
        tryToPut.blackPlay = plate.blackPlay;

        //我方分数低，则防守，则计算对方最好的一步棋，我方下在那里
        if (myMark < hisMark) {
            myType = -myType;
            hisType = -hisType;
        }
        //遍历所有步骤
        for (var i = 0; i <= plate.BLOCKS; i++) {
            for (var j = 0; j <= plate.BLOCKS; j++) {
                this.steps[i][j] = this.getStepInfo(tryToPut, myType, hisType, i, j);
            }
        }
    }

    //获取单步分值信息
    this.getStepInfo = function (tryToPut, myType, hisType, stepX, stepY) {
        var step = new Object();
        if (tryToPut.Chesses[stepX][stepY] != 0) {
            //此处有棋子，此处分数设为
            step.hisMark = -1000000000;
            step.myMark = 0;
        } else {
            //试探性放下一颗棋子
            tryToPut.Chesses[stepX][stepY] = myType;
            //将棋子放在此处的分数
            step.myMark = this.getPlateInfo(tryToPut, myType);
            step.hisMark = this.getPlateInfo(tryToPut, hisType);
            tryToPut.Chesses[stepX][stepY] = 0;
        }
        return step;
    }

    //AI下第一颗白棋
    this.putFirstWhiteChess = function (plate) {
        var point = new Location();
        var theChess = plate.lastTemp[0];
        var X = theChess.Location.X;
        var Y = theChess.Location.Y;

        //八个止点
        var points = [
            [X - 1, Y - 1],
            [X, Y - 1],
            [X + 1, Y - 1],
            [X - 1, Y],
            [X + 1, Y],
            [X - 1, Y + 1],
            [X, Y + 1],
            [X + 1, Y + 1]
        ];
        //获取随机一个索引
        var index = getRandom(0, 8);
        point.X = points[index][0];
        point.Y = points[index][1];
        return point;
    }
    //随机获取下一个最佳下棋点  maxOrMinFlag: true 最大值 ，false 最小值
    this.getNextPointByRandom = function (nextStep) {
        var result = this.getNextPoints(nextStep);
        var index = getRandom(0, result.length);
        return result[index];
    }
    //获取下一组最佳落子位置
    this.getNextPoints = function (nextStep) {
        var maxScore = -1000000000000;

        var temp = [];

        var row = nextStep.length;
        var col = nextStep[0].length;

        for (var i = 0; i < row; i++) {
            for (var j = 0; j < col; j++) {
                //创建点
                var point = new Location();
                point.X = i;
                point.Y = j;

                if (maxScore < nextStep[i][j].myMark) {
                    maxScore = nextStep[i][j].myMark;
                    temp = [];
                    temp.push(point);
                } else if (maxScore == nextStep[i][j].myMark) {
                    temp.push(point);
                }
            }
        }
        var minScore = 1000000000000;
        //筛选最终结果
        var result = [];
        for (var i = 0; i < temp.length; i++) {
            var X = temp[i].X;
            var Y = temp[i].Y;

            if (minScore > nextStep[X][Y].hisMark) {
                //清空result
                result = [];
                result.push(temp[i]);
                minScore = nextStep[X][Y].hisMark;
            } else if (minScore == nextStep[X][Y].hisMark) {
                result.push(temp[i]);
            }
        }

        return result;
    }
    //模拟对弈
    this.tryToGo = function (plate, myType) {

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
            for (var j = 0; j <= plate.BLOCKS && i + j <= plate.BLOCKS; j++) {
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


