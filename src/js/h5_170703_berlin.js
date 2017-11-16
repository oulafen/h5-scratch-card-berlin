$(function () {
    operation.init();
});

var operation = {
    userInfo: {},
    activityStatus: 1,
    init: function () {
        var self = this;
        self.initEvents();

        /**
         * 静态测试用
         * **/
        self.initWinnersList();
        indexVue.userStatus = 2;
        self.updatePrizeShow(indexVue.userInfo);
        setTimeout(function(){
            scratchCard.init();
        }, 100);
        /**
         * 静态测试用
         * **/
    },
    initEvents: function () {
        var self = this;

        $('[data-action]').click(function () {
            var $_this = $(this),
                action = $(this).data('action');
            switch (action) {
                case 'scratchAgain':
                    self.scratchAgain();
                    break;
                case 'goSign':
                    self.goSign();
                    break;
                case 'goAppHome':
                    self.goAppHome();
                    break;
                case 'goMyPrize':
                    self.goMyPrize($_this);
                    break;
                case 'goReceiveCoupon':
                    self.goReceiveCoupon();
                    break;
                case 'receiveCoupon':
                    self.receiveCoupon($_this);
                    break;
                case 'goVerifyShoe':
                    self.goVerifyShoe();
                    break;
                case 'closeBoxy':
                    self.closeBoxy();
                    break;
                case 'searchStore':
                    self.searchStore();
                    break;
            }
        });
    },
    getUserInfo: function () {
        var userInfo = {
            user_id: page.getParams('user_id'),
            token: page.getParams('token')
        };
        if (!userInfo.user_id) {
            userInfo = operation.userInfo;
        }
        if (!userInfo.user_id) {
            try{
                userInfo = global.getUserInfo();
                //console.log('user-->', userInfo)
                operation.userInfo = userInfo;
            }catch (err){
                alert(err);
                userInfo = {};
            }
        }
        //userInfo = {
        //    user_id: 1065,
        //    token: '8c6b50b54e080c7e6ceefcde0c962b807c2af5e531c858ad4d46354c2e03c1c6'
        //};
        return userInfo;
    },
    scratchAgain: function () {
        scratchCard.init();
    },
    goSign: function () {
        var self = this;
        var userInfo = self.getUserInfo();
        if(!global.browser().lemon){
            location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.lemon.running';
            return;
        }
        if (!userInfo.user_id) {
            page.warn('没有获取到您的用户信息, 请重试');
            return;
        }
        location.href = '/home/activity/170703-berlin-sign?user_id=' + userInfo.user_id + '&token=' + userInfo.token;
    },
    goAppHome: function () {
        var self = this;
        if (global.browser().lemon_version > 1.5) {
            global.webviewCallJump(1);
        } else {
            page.warn('请更新到最新版本');
        }
    },
    goMyPrize: function () {
        var self = this;
        var link = location.href;
        if((link.indexOf('berlin-index')!=-1 || link.indexOf('berlin-ios-index')!=-1) && !indexVue.userInfo.is_win){
            //在首页时做判断
            page.warn('暂无奖品哦，继续加油吧！');
            return;
        }

        var userInfo = self.getUserInfo();
        if (!userInfo.user_id) {
            page.warn('没有获取到您的用户信息, 请重试');
            return;
        }
        location.href = '/home/activity/170703-berlin-my-prize?user_id=' + userInfo.user_id + '&token=' + userInfo.token;
    },
    goReceiveCoupon: function () {
        var self = this;
        var userInfo = self.getUserInfo();
        if (!userInfo.user_id) {
            page.warn('没有获取到您的用户信息, 请重试');
            return;
        }
        location.href = '/home/activity/170703-berlin-receive-coupon?user_id=' + userInfo.user_id + '&token=' + userInfo.token;
    },
    receiveCoupon: function($_this){
        var self = this;
        var userInfo = self.getUserInfo();
        var coupon_type = $_this.data('type');
        self.ajaxRequestApi({
            data: {
                user_id: userInfo.user_id,
                token: userInfo.token,
                interface: '/api/v1/berlin/coupon/recv',
                type: coupon_type,
                server: page.isDev(parseInt(userInfo.user_id)) ? 'dev' : 'product',
                api_type: 'POST'
            },
            success: function (res) {
                //console.log('receiveCoupon-res--->', res);
                if (res.error_code == 0) {
                    $('#cardDesc').html(coupon_type == 1 ? '官网' : '店铺');
                    $('#successTip').show();
                }else if( res.error_code == 12011){
                    page.warn('还未报名');
                }else if( res.error_code == 12010){
                    page.warn('跑鞋还未绑定');
                }else{
                    page.warn(res.msg);
                }
                $('.loading').hide();
            }
        })
    },
    goSignSuccess: function () {
        var self = this;
        var userInfo = self.getUserInfo();
        if (!userInfo.user_id) {
            page.warn('没有获取到您的用户信息, 请重试');
            return;
        }
        location.href = '/home/activity/170703-berlin-sign-success?user_id=' + userInfo.user_id + '&token=' + userInfo.token;
    },
    goVerifyShoe: function () {
        var self = this;
        var userInfo = self.getUserInfo();
        if (!userInfo.user_id) {
            page.warn('没有获取到您的用户信息, 请重试');
            return;
        }
        location.href = '/home/activity/170703-berlin-verify-shoe?user_id=' + userInfo.user_id + '&token=' + userInfo.token;
    },
    initWinnersList: function (speed) {
        var self = this;
        clearInterval(self.myMarInterval);

        var speed = speed ? speed : 30;//控制速度
        var $_lists = $("#winnerLists");
        var box_w = $_lists.parent().width();
        $_lists.css('margin-left', box_w + 'px');

        function Marquee() {
            var marginLeft = parseInt($_lists.css('margin-left'));
            if (parseInt($_lists.width()) + marginLeft <= 0)
                $_lists.css('margin-left', box_w + 'px');
            else {
                $_lists.css('margin-left', (marginLeft - 1) + 'px');
            }
        }

        //定时器
        self.myMarInterval = setInterval(Marquee, speed);
    },
    initIndexData: function (activity_status) {
        var self = this;
        var userInfo = {
            user_id: 100,
            token: 'aaa'
        };
        self.activityStatus = activity_status ? activity_status : 1;
        if (!global.browser().lemon) {
            //非app中打开
            indexVue.userStatus = 0;
        }else{
            try{
                userInfo = self.getUserInfo();
                self.getUserChance(userInfo);
            }catch(err) {
                alert(err)
            }

        }
        self.getWinners(userInfo);
    },
    /**获得所有获奖用户**/
    getWinners: function (userInfo) {
        var self = this;
        self.ajaxRequestApi({
            data: {
                user_id: userInfo.user_id,
                token: userInfo.token,
                interface: '/api/v1/berlin/winning/records',
                server: page.isDev(parseInt(userInfo.user_id)) ? 'dev' : 'product',
                api_type: 'GET'
            },
            success: function (res) {
                //console.log(res);
                if (res.error_code || res.code) {
                    page.warn(res.msg);
                } else {
                    var recordsLists = res.data.records;
                    var winnerStr = '';
                    var prizeMap = {
                        1: '一等奖',
                        2: '二等奖',
                        3: '幸运奖'
                    };
                    for (var i = 0, len = recordsLists.length; i < len; i++) {
                        var record = recordsLists[i];
                        winnerStr += prizeMap[record.rank] + ':' + record.name + '；';
                    }
                    if(winnerStr.length){
                        indexVue.winnerStr = winnerStr;
                        setTimeout(function(){
                            operation.initWinnersList();
                        }, 100);
                    }else{
                        //获取抽奖用户
                        self.getWinnersRecordsList();
                    }
                    //self.getWinnersRecordsList();
                }
                $('.loading').hide();
            }
        })
    },
    /**获得未获奖用户记录**/
    getWinnersRecordsList: function(){
        var winnerStr = '';
        $.ajax({
            type: 'GET',
            url: '/home/activity/berlin-records-list',
            success: function(res){
                if(res.code == 0){
                    var records = res.data;
                    for(var i = 0, len = records.length; i < len; i++){
                        var name = records[i];
                        winnerStr += name + ' 获得一次抽奖机会，但是啥都没中；';
                    }
                    indexVue.winnerStr = winnerStr;
                    setTimeout(function(){
                        operation.initWinnersList();
                    }, 100);
                }
            },
            error: function(err){
                page.warn(err.responseText);
            }
        })
    },
    /**
     * 获取用户抽奖机会
     * **/
    getUserChance: function (userInfo) {
        var self = this;
        self.ajaxRequestApi({
            data: {
                user_id: userInfo.user_id,
                token: userInfo.token,
                interface: '/api/v1/berlin/lottery/chances',
                server: page.isDev(parseInt(userInfo.user_id)) ? 'dev' : 'product',
                api_type: 'GET'
            },
            success: function (res) {
                //console.log(res);
                if (res.error_code == 12011) {
                    //未报名
                    indexVue.userStatus = 0;
                } else if (res.error_code == 12010) {
                    //跑鞋未绑定
                    indexVue.userStatus = 1;
                    indexVue.userInfo = res.data;
                    scratchCard.prize = operation.activityStatus == 1 ? 5 : 6;
                    setTimeout(function(){
                        scratchCard.init();
                    }, 100);
                } else if (res.error_code == 0) {
                    //可以获得抽奖机会
                    indexVue.userStatus = 2;
                    indexVue.userInfo = res.data;
                    self.updatePrizeShow(res.data);
                    setTimeout(function(){
                        scratchCard.init();
                    }, 100);
                } else {
                    page.warn(res.msg);
                }
                $('.loading').hide();
            }
        })
    },
    /**
     * 更新中奖信息
     * **/
    lotteryUpdate: function () {
        var self = this;
        var userInfo = self.getUserInfo();
        self.ajaxRequestApi({
            data: {
                user_id: userInfo.user_id,
                token: userInfo.token,
                interface: '/api/v1/berlin/lottery/update',
                server: page.isDev(parseInt(userInfo.user_id)) ? 'dev' : 'product',
                api_type: 'POST'
            },
            success: function (res) {
                //console.log('lotteryUpdate-res--->', res);
                if (res.error_code == 0) {
                    self.updatePrizeShow(res.data);
                } else {
                    page.warn(res.msg);
                }
                $('.loading').hide();
            }
        })
    },
    /***
     * 更新奖品展示
     * **/
    updatePrizeShow: function(data){
        var rank = data.rank;
        if(operation.activityStatus == 2){
            //活动已结束
            indexVue.userInfo.chances = 0;
            scratchCard.prize = 6;
            return;
        }

        var chances = data.chances > 0 && operation.activityStatus == 1 ? data.chances : 0;
        indexVue.userInfo.chances = chances;

        if(chances > 0){
            if(rank == 4){
                scratchCard.prize = chances == 1 ? '4_2' : '4_1';
            }else{
                scratchCard.prize = isInArray([1,2,3], rank) ? rank : '4_2';
            }
        }
        if(chances == 0){
            //没有抽奖机会
            if(data.is_draw){
                if(data.is_got_today){
                    //今日已得过奖
                    scratchCard.prize = '0_2';
                }else{
                    //往日的机会已用完, 今日还未获得机会
                    scratchCard.prize = '0_1';
                }
            }else{
                scratchCard.prize = 0;
            }
        }
    },
    /** 获取我的中奖信息 **/
    getMyPrize: function(){
        var self = this;
        var userInfo = self.getUserInfo();
        self.ajaxRequestApi({
            data: {
                user_id: userInfo.user_id,
                token: userInfo.token,
                interface: '/api/v1/berlin/coupon/detail',
                server: page.isDev(parseInt(userInfo.user_id)) ? 'dev' : 'product',
                api_type: 'GET'
            },
            success: function (res) {
                //console.log('lotteryUpdate-res--->', res);
                if (res.error_code == 0) {
                    var rank = res.data.rank;
                    var coupon_type = res.data.coupon_type; //是否已领取
                    var $_prizeBox = $('#prizeBox');
                    $_prizeBox.find('.prize').removeClass('current');
                    if( isInArray([1,2,3], rank) ){
                        $_prizeBox.find('.prize-' + rank).addClass('current');
                        $_prizeBox.find('.J-coupon-type').hide();
                        $_prizeBox.find('.J-coupon-type.type-' + coupon_type).show();
                        if(rank < 3){
                            $('.more-desc').addClass('current');
                        }
                        if(isInArray([1,2], coupon_type) ){
                            $_prizeBox.find('[data-target=couponCode]').html(res.data.coupon_code);
                            $_prizeBox.find('[data-target=startDate]').html(res.data.start_date);
                            $_prizeBox.find('[data-target=endDate]').html(res.data.end_date);
                        }
                    }else{
                        $_prizeBox.find('.prize-4').addClass('current');
                    }
                }else{
                    page.warn(res.msg);
                }
                $('.loading').hide();
            }
        })
    },
    /**
     * 向python后台请求数据, 通过php后台中转
     * @args : {
     *      data: {
     *          user_id: int,
     *          token: str,
     *          interface: str, //向python请求的接口
     *          server: dev/product,  //所选服务器
     *          api_type: GET/POST
     *      },
     *      success: func(res)
     *  }
     * **/
    'ajaxRequestApi': function (args) {
        var self = this;
        $.ajax({
            type: "GET",
            cache: false,
            url: "/home/activity/request-api",
            data: args.data,
            dataType: "json",
            success: function (res) {
                args.success(res);
                $('.loading').hide();
            },
            error: function (err) {
                $('.loading').hide();
                page.warn(err.responseText);
            }
        });
    },
    closeBoxy: function(){
        $('.boxy').hide();
    },
    searchStore: function(){
        var self = this;
        var userInfo = self.getUserInfo();
        var address = $('#city-picker').val().split(' ');
        //var address = ['北京', '北京市'];
        var data = {
            interface: '/api/v1/berlin/stores',
            server: page.isDev(parseInt(userInfo.user_id)) ? 'dev' : 'product',
            api_type: 'GET',
            user_id: userInfo.user_id,
            token: userInfo.token,
            province: address[0] ? address[0] : '',
            city: address[1] ? address[1] : '',
            district: ''
        };
        if(!address.length){
            return;
        }
        self.ajaxRequestApi({
            data: data,
            success: function (res) {
                //console.log('lotteryUpdate-res--->', res);
                if (res.error_code == 0) {
                    var stores = res.data.stores;
                    var store_num = stores instanceof Array ? stores.length : 0;
                    var listTemplate = '<li> <p class="store-list-title">#name#</p> <p>#address#</p> <p>#contact#</p> </li>';
                    var $_storeLists = $('#storeLists');
                    $('.search-result').show();
                    $_storeLists.html('');
                    $('#storeNum').html(store_num + '家');
                    if(store_num > 0 ){
                        var lists = '';
                        for(var i = 0, len = stores.length; i < len; i++){
                            var list = stores[i];
                            lists += listTemplate.replace('#name#', list.name).replace('#address#', list.address).replace('#contact#', list.contact);
                        }
                        $_storeLists.html(lists);
                    }
                }else{
                    page.warn(res.msg);
                }
                $('.loading').hide();
            }
        })
    }
};

var scratchCard = {
    /**
     * prizeMap:
     * 0 => 未中奖, 1=> 一等奖, 2=>二等奖, 3=>幸运奖, '4_1'=>没中且还有机会, '4_2'=>没中且无机会, 5=>未验证跑鞋, 6=>活动已结束
     * **/
    'prize': -1,
    'canvas': document.getElementById("canvas"),       //画布
    'ctx': this.canvas && this.canvas.getContext("2d"),          //画笔
    'ismousedown': '',  //标志用户是否按下鼠标或开始触摸
    'isOk': 0,          //标志用户是否已经刮开了三分之一以上
    'pen_r': parseInt(window.getComputedStyle(document.documentElement, null)["font-size"]), //这是为了不同分辨率上配合@media自动调节刮的宽度
    'init': function () {
        indexVue.btnActive = 0;
        scratchCard.isOk = 0;
        var canvas = document.getElementById("canvas");
        scratchCard.canvas = canvas;
        scratchCard.ctx = canvas.getContext("2d");
        this.initCanvasEvent();
        this.initCanvas();
        this.showPrize(this.prize);
    },
    'initCanvas': function () {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.ctx.globalCompositeOperation = "source-over";

        var bgImg = document.getElementById('scratchBg');
        this.ctx.drawImage(bgImg, 0, 0, this.canvas.width, this.canvas.height);
        //把这个属性设为这个就可以做出圆形橡皮擦的效果
        //有些老的手机自带浏览器不支持destination-out,下面的代码中有修复的方法
        this.ctx.globalCompositeOperation = 'destination-out';
    },
    'initCanvasEvent': function () {
        var self = this;
        //PC端的处理
        this.canvas.addEventListener("mousemove", self.eventMove, false);
        this.canvas.addEventListener("mousedown", self.eventDown, false);
        this.canvas.addEventListener("mouseup", self.eventUp, false);

        //移动端的处理
        this.canvas.addEventListener('touchstart', self.eventDown, false);
        this.canvas.addEventListener('touchend', self.eventUp, false);
        this.canvas.addEventListener('touchmove', self.eventMove, false);
    },
    'eventDown': function (e) {
        e.preventDefault();
        scratchCard.ismousedown = true;
    },
    'eventUp': function (e) {
        e.preventDefault();
        //得到canvas的全部数据
        var canvasData = scratchCard.ctx.getImageData(0, 0, scratchCard.canvas.width, scratchCard.canvas.height).data;
        var hasScratched = 0;
        for (var i = 3; i < canvasData.length; i += 4) {
            if (canvasData[i] == 0) {
                hasScratched++;
            }
        }
        //当被刮开的区域等于三分之一时，则可以开始处理结果
        if (hasScratched >= canvasData.length / 12) {
            scratchCard.isOk = 1;
        }
        scratchCard.ismousedown = false;

        if (scratchCard.isOk) {
            //已刮出
            var isDisable = $('#prize').data('disable') == 'true';
            if (isDisable) {
                return;
            }
            $('#prize').data('disable', 'true');

            scratchCard.updateTimes();
            indexVue.btnActive = 1;
        }
    },
    'eventMove': function (e) {
        e.preventDefault();
        if (scratchCard.ismousedown) {
            if (e.changedTouches) {
                e = e.changedTouches[e.changedTouches.length - 1];
            }
            var topX = document.getElementById("scratchCard").offsetLeft;
            var topY = document.getElementById("scratchCard").offsetTop;
            var oX = canvas.offsetLeft + topX,
                oY = canvas.offsetTop + topY;

            var x = (e.clientX + document.body.scrollLeft || e.pageX) - oX || 0,
                y = (e.clientY + document.body.scrollTop || e.pageY) - oY || 0;

            //画360度的弧线，就是一个圆，因为设置了ctx.globalCompositeOperation = 'destination-out';
            //画出来是透明的
            scratchCard.ctx.beginPath();
            scratchCard.ctx.arc(x, y, scratchCard.pen_r, 0, Math.PI * 2, true);

            //下面3行代码是为了修复部分手机浏览器不支持destination-out
            scratchCard.canvas.style.display = 'none';
            scratchCard.canvas.offsetHeight;
            scratchCard.canvas.style.display = 'inherit';

            scratchCard.ctx.fill();
        }
    },
    updateTimes: function () {
        indexVue.userInfo.chances = indexVue.userInfo.chances > 0 ? indexVue.userInfo.chances - 1 : 0;
        if(isInArray([1, 2, 3, '4_1', '4_2'], scratchCard.prize) ){
            if(isInArray([1, 2, 3], scratchCard.prize)){
                //已中奖
                indexVue.userInfo.is_win = 1;
            }
            // operation.lotteryUpdate();
        }
    },
    showPrize: function (sel) {
        var $_prize = $('#prize');
        $_prize.data('disable', 'false');
        $_prize.find('.prize').removeClass('current');
        $_prize.find('[data-target=' + sel + ']').addClass('current');
    }
};

var signPage = {
    'init': function () {
        var self = this;
        self.initEvent();

    },
    'initEvent': function () {
        var self = this;
        $('[data-action]').click(function () {
            var $_this = $(this);
            var action = $_this.data('action');
            switch (action) {
                case 'signSubmit':
                    self.signSubmit();
                    break;
                case 'sureSubmit':
                    self.sureSubmit();
                    break;
            }
        })
    },
    'signSubmit': function () {
        var self = this;
        var $_form = $('#signForm');
        var sexValue = $('#sex-picker').val();
        if(sexValue == '男'){
            $('[name="gender"]').val(1);
        }
        if(sexValue == '女'){
            $('[name="gender"]').val(0);
        }
        $('[name="birthdate"]').val($('#datetime-picker').val() + ' 00:00:00');
        if(self.validateForm($_form)){
            $('#confirmSubmit').show();
        }
    },
    'sureSubmit': function () {
        $('.loading').show();
        var self = this;
        var $_form = $('#signForm');
        var userInfo = operation.getUserInfo();
        $_form.ajaxSubmit({
            'type': 'POST',
            'url': '/home/activity/request-api',
            'dataType': "json",
            'data': {
                'user_id': userInfo.user_id,
                "token": userInfo.token,
                'interface': '/api/v1/berlin/account',
                'api_type': 'POST',
                'server': page.isDev(parseInt(userInfo.user_id)) ? 'dev' : 'product',
            },
            'success': function (res) {
                //console.log('res-->', res);
                operation.closeBoxy();
                if (res.error_code == 0) {
                    location.href = '/home/activity/170703-berlin-sign-success';
                } else {
                    page.warn(res.msg);
                }
                $('.loading').hide();
            },
            'error': function (err) {
                operation.closeBoxy();
                $('.loading').hide();
                page.warn('网络出错');
            }
        })
    },
    'validateForm': function ($_form) {
        var self = this;
        var requires = $_form.find('[required]');
        for (var i = 0, len = requires.length; i < len; i++) {
            var $_this = requires.eq(i);
            var name = $_this.attr('name');
            var value = page.trim($_this.val());
            var tip = {
                'default': '请将报名信息填写完整',
                'gender': '请选择男女',
                'name': '请输入您的姓名',
                'phone': '请输入手机号码',
                'tel': '请填写正确的手机号码',
                'birthdate': '请选择出生年月',
                'address': '请选择现居住址'
            };
            var warn_info = tip[name] ? tip[name] : tip['default'];
            var check = $_this.data('check');
            if (!value) {
                page.warn(warn_info);
                //$_this.focus();
                $('.loading').hide();
                return false;
            }
            if ((check && !page.regValidate[check](value))) {
                page.warn(tip['tel']);
                //$_this.focus();
                $('.loading').hide();
                return false;
            }

        }
        return true;
    }
};

var verifyShoe = {
    'init': function () {
        var self = this;
        self.initEvent();
    },
    'initEvent': function () {
        var self = this;
        $('[data-action]').click(function () {
            var $_this = $(this);
            var action = $_this.data('action');
            switch (action) {
                case'verifyShoeCode':
                    self.verifyShoeCode();
                    break;
                case 'setAppLink':
                    var link = $(this).data('link');
                    page.setAppLink(link);
                    break;

                case 'showBoxy':
                    $('#boxySucess').show();
                    break;
            }
        })
    },
    'verifyShoeCode': function () {
        var indentiFilerVal = $('#identifier').val();
        if(!indentiFilerVal){
            page.warn('请填写跑鞋编号!');
            return;
        }
        if(indentiFilerVal.length!==12){
            page.warn('请填写12位跑鞋编号!');
            return;
        }
        var getUserInfo = operation.getUserInfo();
        $('.loading').show();
        operation.ajaxRequestApi({
            data: {
                'identifier':indentiFilerVal,
                'user_id': getUserInfo.user_id,
                "token": getUserInfo.token,
                'interface': '/api/v1/berlin/runningshoes/verify',
                'api_type': 'POST',
                'server': page.isDev(parseInt(getUserInfo.user_id)) ? 'dev' : 'product'
            },
            success: function(res){
                $('.loading').hide();
                if(res.error_code == 0){
                    $('#boxySucess').show();
                }else if(res.error_code == 12017){
                    //跑鞋被锁定
                    $('#shoeLocked').show();
                }else if(res.error_code == 12018){
                    //已验证过
                    $('#shoeChecked').show();
                }else{
                    //验证失败
                    $('#boxyFailed').show();
                }
            }
        });
    }
};

function getRandomNum(lbound, ubound) {
    return (Math.floor(Math.random() * (ubound - lbound)) + lbound);
}

/** 判断元素是否在数组中 **/
function isInArray(arr, value) {
    if (arr.indexOf && typeof(arr.indexOf) == 'function') {
        var index = arr.indexOf(value);
        if (index >= 0) {
            return true;
        }
    }
    return false;
}