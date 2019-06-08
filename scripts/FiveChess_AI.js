function ComputerAI() {

    //打分表
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


    //是否使用AI
    this.isPlayer = true;
    //是否执黑
    this.isBlack = false;
    //棋步记录器
    this.steps;
    //对手棋步记录器
    this.hSteps;
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
        var point = this.tryToGo(plate);
        var chess = new Chess();
        chess.Location.X = point.X;
        chess.Location.Y = point.Y;
        chess.isBlack = this.isBlack;
        plate.putChess(canvas, chess);
        var win = plate.hasWin();
        return win;
    }


    //
    this.tryToGo = function (plate) {

        /*
        * 思路分析

        * 1.获取我下一步最佳落子点的集合
        * 2.获取对手下一步最佳落子点的集合
        * 3.比较此时双方局势分数
            * 1---- 如果我的分数大于等于对手分数
            *       1.我的分数大于等于800000 （有活三）
            *           则可以选择先进攻
            *       2.我的分数小于800000
            *           比较我的下一最佳落子点，与对手下一落子点 落子后的局势分数 ，
            *           若对手分数高，则选择堵截，如果我高则选择进攻
            * 2---- 如果我的分数小于对手分数
            *       1.对手分数大于等于 800000
            *           则必须采取防守
            *       2.对手分数小于 800000
            *           比较我的下一最佳落子点，与对手下一落子点 落子后的局势分数 ，
            *           若我的分数较高，则选择进攻，否则选择防守
        * 4.返回最佳落子点中的一个随机点
        *
        *
        * */

        /*
        * 多步搜索 思路分析
        *
        * 1.找出当前最佳点集合
        * 2.遍历当前最佳点集合，并落子入棋盘副本中，找出对手最佳集合，遍历对手最佳点集合，让对手落子入棋盘副本中，
        *       调用递归。
        * 3.当搜索深度到底，返回当前局面分数
        *
        *
        * */
        var myType = this.isBlack ? 1 : -1;
        var hisType = -myType;

        var myMark = this.getPlateInfo(plate, myType);
        var hisMark = this.getPlateInfo(plate, hisType);

        var index = -1;

        var nextPoints = this.getNextChessPoint(plate, myType);
        var myPoints = nextPoints[0];
        var hisPoints = nextPoints[1];

        //创建推演棋盘
        var plateT = this.getVirtualPlate(plate);

        if (myMark >= hisMark) {

            if (myMark < MARK[4] && hisPoints.length > 0) {
                plateT.Chesses[myPoints[0].X][myPoints[0].Y] = myType;
                var myMarkT = this.getPlateInfo(plateT, myType);
                plateT.Chesses[myPoints[0].X][myPoints[0].Y] = 0;
                plateT.Chesses[hisPoints[0].X][hisPoints[0].Y] = hisType;
                var hisMarkT = this.getPlateInfo(plateT, hisType);
                plateT.Chesses[hisPoints[0].X][hisPoints[0].Y] = 0;
                if (myMarkT >= hisMarkT) {
                    //进攻
                    index = getRandom(0, myPoints.length);
                    return myPoints[index];

                } else {
                    //防守
                    index = getRandom(0, hisPoints.length);
                    return hisPoints[index];
                }
            } else {
                /*进攻*/
                index = getRandom(0, myPoints.length);
                return myPoints[index];
            }
        } else {
            if (hisMark < MARK[4] && hisPoints.length > 0) {
                plateT.Chesses[myPoints[0].X][myPoints[0].Y] = myType;
                var myMarkT = this.getPlateInfo(plateT, myType);
                plateT.Chesses[myPoints[0].X][myPoints[0].Y] = 0;
                plateT.Chesses[hisPoints[0].X][hisPoints[0].Y] = hisType;
                var hisMarkT = this.getPlateInfo(plateT, hisType);
                plateT.Chesses[hisPoints[0].X][hisPoints[0].Y] = 0;
                if (myMarkT >= hisMarkT) {
                    //进攻
                    index = getRandom(0, myPoints.length);
                    return myPoints[index];

                } else {
                    //防守
                    index = getRandom(0, hisPoints.length);
                    return hisPoints[index];
                }
            } else {
                /*防守*/
                index = getRandom(0, hisPoints.length);
                return hisPoints[index];
            }
        }

        return null;

    }

    this.DFSgo = function (plate, myType, hisType, depth) {
        if (!depth) {
            return this.getPlateInfo(plate, myType);
        } else {


        }
    }
    //获取一个用于AI推演的棋盘数组
    this.getVirtualPlate = function (plate) {
        //复制plate对象到tryToPut
        var tryToPut = new Plate();
        for (var i = 0; i < plate.Chesses.length; i++) {
            tryToPut.Chesses[i] = plate.Chesses[i].slice();
        }
        tryToPut.blackPlay = plate.blackPlay;
        tryToPut.blackPlay = plate.blackPlay;
        return tryToPut;
    }

    //获取下一组最佳落子点 :
    /*
    * 返回值： 【最佳落子点，对手最佳落子点】
    * */

    this.getNextChessPoint = function (plate, myType) {
        var hisType = -myType;
        var points = [];
        var hPoints = [];

        //游戏进行中，使用AI算法下棋
        if (plate.isStart) {
            //AI执白棋且AI第一次落子
            if (plate.chessCount == 1) {
                var rt = this.putFirstWhiteChess(plate);
                var point = new Location();
                point.X = rt.X;
                point.Y = rt.Y;
                points.push(point);
                this.hSteps = this.getAllStepsInfo(plate, hisType, myType);
                hPoints = this.getNextPoints(this.hSteps);
            }
            //棋盘中至少已经有两颗棋
            else {
                //获取所有可行步的信息,并储存到this.steps中
                this.steps = this.getAllStepsInfo(plate, myType, hisType);
                this.hSteps = this.getAllStepsInfo(plate, hisType, myType);
                //获取最佳落子位置集合
                points = this.getNextPoints(this.steps);
                //获取对手最佳落子位置集合
                hPoints = this.getNextPoints(this.hSteps);

            }
        }
        //AI 先走,直接在棋盘中间下棋
        else {
            var point = new Location();
            point.X = plate.BLOCKS / 2;
            point.Y = plate.BLOCKS / 2;
            points.push(point);
        }
        return [points, hPoints];
    }
    //获取一步棋的所有可行点的分数信息
    this.getAllStepsInfo = function (plate, myType, hisType) {

        //将step初始化为二维数组
        var steps = [];
        for (var i = 0; i <= plate.BLOCKS; i++) {
            steps[i] = [];
        }

        //重新复制一张用于推演的棋盘
        var tryToPut = this.getVirtualPlate(plate);

        //遍历所有步骤
        for (var i = 0; i <= plate.BLOCKS; i++) {
            for (var j = 0; j <= plate.BLOCKS; j++) {
                steps[i][j] = this.getStepInfo(tryToPut, myType, hisType, i, j);
            }
        }
        return steps;
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
    // //随机获取下一个最佳下棋点
    // this.getNextPointByRandom = function (nextStep) {
    //     var result = this.getNextPoints(nextStep);
    //     var index = getRandom(0, result.length);
    //     return result[index];
    // }
    //获取下一组最佳落子位置
    this.getNextPoints = function (nextStep) {
        var maxScore = -1000000000000;

        var temp = [];

        var row = nextStep.length;
        var col = nextStep[0].length;

        //初步筛选出使我方分数最高的点
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


        var reg = [];
        //1.成5
        reg[0] = [/aaaaa/g];
        //2.活4
        reg[1] = [/_aaaa_/g];
        //3.冲4
        reg[2] = [/^aaaa_/g, /aa_aa/g, /a_aaa/g, /aaa_a/g, /_aaaa$/g, /baaaa_/g, /_aaaab/g];
        //4.活3
        reg[3] = [/_aaa__/g, /__aaa_/g];
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
                if (i == 3) count /= 2;//消除活三重复登记
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


