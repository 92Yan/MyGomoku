console.log("made by wbn/ts1208/92 yan/ts sonic,\n bye");

window.onload = function (ev) {
    //DOM 组件
    //画布
    var canvas = document.getElementById("plate");
    //div 盒子
    var div_choose_box = document.getElementById("choose-box");
    var div_game_over = document.getElementById("game-over-box");
    var div_black_marks = document.getElementById("black-marks");
    var div_white_marks = document.getElementById("white-marks");
    //按钮
    var btn_new = document.getElementById("btn-new");
    var btn_last = document.getElementById("btn-last");
    var btn_next = document.getElementById("btn-next");
    var btn_choose_black = document.getElementById("choose-black");
    var btn_choose_white = document.getElementById("choose-white");
    var btn_choose_none = document.getElementById("choose-none");
    var btn_choose_all = document.getElementById("choose-all");
    var btn_replay = document.getElementById("replay");
    var btn_ok = document.getElementById("ok");

    //游戏状态标识
    var blackWin = 1;
    var whiteWin = -1;
    var gameContinue = 0;
    var noWin = -100;
    var playerGo = -2;

    //游戏开始组件
    var AI = new ComputerAI();

    var player = new Player();
    var plate = new Plate();
    //初始化棋盘
    plate.Init();
    plate.drawLine(canvas);

    //按钮显示状态
    btnStatusControl(plate);

    //新游戏
    btn_new.onclick = function () {
        //清空画布
        canvas.height = canvas.height;

        //分数显示器初始化
        div_white_marks.innerHTML = "";
        div_black_marks.innerHTML = "";

        div_choose_box.style.display = "block";

        //创建新游戏
        plate.Init();
        //重画棋盘
        plate.drawLine(canvas);

        //点击棋盘
        canvas.onclick = function (event) {
            //如果不轮玩家走
            if (plate.blackPlay != player.isBlack) return;
            //点击在棋盘上的坐标
            var location = new Location();
            //将鼠标点击坐标转化为棋盘坐标
            location.X = Math.floor((event.offsetX - plate.LEFTX + plate.PERSIZE / 2) / plate.PERSIZE);
            location.Y = Math.floor((event.offsetY - plate.LEFTY + plate.PERSIZE / 2) / plate.PERSIZE);
            //放置棋子后的结果
            var result = player.putChess(canvas, plate, location);
            if (!AI.isPlayer) {
                player.isBlack = !player.isBlack;
            }

            //设置定时器，防止游戏结果在棋子显示之前显示
            setTimeout(function () {
                //显示游戏结果
                getGameResult(result);
            }, 10);

            btnStatusControl(plate);
        }

        btnStatusControl(plate);
    }
    //上一步
    btn_last.onclick = function () {
        plate.blackPlay = !plate.blackPlay;
        div_game_over.style.display = "none";
        //移除这颗已经从棋盘上收回的棋子
        var lastChess = plate.lastTemp.pop();
        //放入下一步的记忆数组中
        plate.nextTemp.push(lastChess);
        //从棋盘上拿除棋子
        plate.Chesses[lastChess.Location.X][lastChess.Location.Y] = 0;
        //从画布上清除棋子
        plate.clearChess(canvas, lastChess);
        // //移除这颗已经从棋盘上收回的棋子
        // lastChess = plate.lastTemp.pop();
        // //放入下一步的记忆数组中
        // plate.nextTemp.push(lastChess);
        // //从棋盘上拿除棋子
        // plate.Chesses[lastChess.Location.X][lastChess.Location.Y] = 0;
        // //从画布上清除棋子
        // plate.clearChess(canvas, lastChess);
        //重设按钮显示状态
        btnStatusControl(plate);
    }
    //下一步
    btn_next.onclick = function () {
        /*人机对战*/
        //移除这颗已经放到棋盘上的棋子
        var nextChess = plate.nextTemp.pop();
        plate.blackPlay = !plate.blackPlay;
        plate.Chesses[nextChess.Location.X][nextChess.Location.Y] = nextChess.isBlack ? blackWin : whiteWin;
        plate.lastTemp.push(nextChess);
        plate.putChess(canvas, nextChess);
        // //移除这颗已经放到棋盘上的棋子
        // nextChess = plate.nextTemp.pop();
        // plate.Chesses[nextChess.Location.X][nextChess.Location.Y] = nextChess.isBlack ? blackWin : whiteWin;
        // plate.lastTemp.push(nextChess);
        // plate.putChess(canvas, nextChess);

        var win = plate.hasWin();
        showGameResult(win);
        btnStatusControl(plate);
    }
    //点击 执黑棋
    btn_choose_black.onclick = function () {
        player.isPlayer = true;
        //AI 是玩家
        AI.isPlayer = true;
        AI.isBlack = true;
        player.isBlack = false;
        setTimeout(function () {
            AI.putChess(canvas, plate);
        }, 500);
        div_choose_box.style.display = "none";
        btnStatusControl(plate);
    }
    //点击执白棋
    btn_choose_white.onclick = function () {
        player.isPlayer = true;
        AI.isPlayer = true;
        AI.isBlack = false;
        player.isBlack = true;
        div_choose_box.style.display = "none";
    }
    //点击不用电脑
    btn_choose_none.onclick = function () {
        player.isPlayer = true;
        AI.isPlayer = false;
        div_choose_box.style.display = "none";
        player.isBlack = true;
    }

    //点击全用电脑
    btn_choose_all.onclick = function () {
        player.isPlayer = false;
        AI.isPlayer = true;
        AI.isBlack = true;
        div_choose_box.style.display = "none"


        //设置800ms后开始下棋
        setTimeout(function () {
            var win = playerGo;
            win = AI.putChess(canvas, plate);
            AI.isBlack = !AI.isBlack;
            getGameResult(win);
            btnStatusControl(plate);
        }, 400);
    }
    //再来一局
    btn_replay.onclick = function () {
        //隐藏信息窗口
        div_game_over.style.display = "none";
        var f = btn_new.onclick;
        f();
    }

    btn_ok.onclick = function () {
        div_game_over.style.display = "none";
    }

    //游戏结果处理
    function getGameResult(msg) {
        //获取黑白棋的分数
        var black_marks = AI.getPlateInfo(plate, 1);
        var white_marks = AI.getPlateInfo(plate, -1);

        //显示分数
        div_black_marks.innerHTML = "黑棋分数<br/>" + black_marks.toString();
        div_white_marks.innerHTML = "白棋分数<br/>" + white_marks.toString();

        if (msg == playerGo) return;
        if (msg == gameContinue) {
            if (AI.isPlayer == true && plate.blackPlay == AI.isBlack) {
                var result = AI.putChess(canvas, plate);
                if (!player.isPlayer) AI.isBlack = !AI.isBlack;
                //设置定时器，防止游戏结果在棋子显示之前显示
                setTimeout(function () {
                    //显示游戏结果
                    getGameResult(result);
                }, 10);
            }
        } else {
            showGameResult(msg);
        }
    }

    //显示游戏结果
    function showGameResult(msg) {
        if (msg !== blackWin && msg !== whiteWin && msg != noWin) return;
        div_game_over.style.display = "block";
        var game_result = div_game_over.children[0];
        game_result.style.fontSize = "32px";
        switch (msg) {
            case blackWin:
                game_result.innerHTML = "黑棋赢";
                break;
            case whiteWin:
                game_result.innerHTML = "白棋赢";
                break;
            case noWin:
                game_result.innerHTML = "和棋";
                break;
        }
    }

    //控制三个按钮显示状态
    function btnStatusControl(plate) {
        if (plate.lastTemp.length > 0) {
            //显示按钮
            btn_last.style.display = "inline";
        } else {
            //隐藏按钮
            btn_last.style.display = "none";
        }
        if (plate.nextTemp.length > 0) {
            btn_next.style.display = "inline";
        } else {
            btn_next.style.display = "none";
        }
    }
}



