// JavaScript Document

var page = {
    is_warning: false,
    warn: function (str, time) {
        if (!str) {
            return;
        }
        if(page.is_warning){
            return;
        }
        page.is_warning = true;
        var warnObj = $('.warning');
        warnObj.html(str).addClass('animated slideInUpWarning').show();
        if (!time) {
            var time = 1300;
        }
        setTimeout(function () {
            //warnObj.removeClass('animated slideInUpWarning');
            warnObj.addClass('animated fadeOut');
            setTimeout(function () {
                warnObj.removeClass('animated fadeOut slideInUpWarning').hide();
                page.is_warning = false;
            }, 200)
        }, time);
    },
    /**
     * 重置验证码
     * */
    resetCaptcha: function (sel) {
        var $_captchaBtn = $('[data-action="captchaBtn"]');
        if (sel) {
            $_captchaBtn = $(sel);
        }
        var src = $_captchaBtn.data('src');
        $_captchaBtn.find('img').attr('src', src + '?m=' + Math.random());
    },
    /**
     * 生成二维码
     * */
    "genQrcode": function (id, qr_info_str, size) {
        if (!id) {
            alert('请设置要生成二维码的位置id');
            return;
        }
        var qrcode = new QRCode(document.getElementById(id), {
            width: size ? size : 170,
            height: size ? size : 170,
            useSVG: true
        });
        if (!qr_info_str) {
            qr_info_str = 'lemonRunning';
        }
        qrcode.makeCode(qr_info_str);
    },
    /** 初始化倒计时 **/
    'targetDate': '1488384000000',
    'initCountDown': function (callback) {
        var self = this;
        self.targetDate = parseInt($('.count-down-box').data('target_date'));
        self.setCountDown(callback);
        self.intervalCdObj = window.setInterval(function () {
            self.setCountDown(callback);
        }, 1000);
    },
    "setCountDown": function (callback) {
        var self = page;
        var now = Date.parse(new Date());
        var last_seconds = (self.targetDate - now) / 1000;
        var day = '00', hour = '00', min = '00', second = '00';
        if (last_seconds > 0) {
            second = Math.floor(last_seconds % 60).toString();             // 计算秒
            min = Math.floor((last_seconds / 60) % 60).toString();      //计算分
            hour = Math.floor((last_seconds / 3600) % 24).toString();      //计算小时
            day = Math.floor((last_seconds / 3600) / 24).toString();        //计算天

            second = second.length == 1 ? '0' + second : second;
            min = min.length == 1 ? '0' + min : min;
            hour = hour.length == 1 ? '0' + hour : hour;
            day = day.length == 1 ? '0' + day : day;
        } else {
            window.clearInterval(self.intervalCdObj);
            callback && callback(); //到了deadline之后的方法
        }

        $('#countdownDay').html(day);
        $('#countdownHour').html(hour);
        $('#countdownMin').html(min);
        $('#countdownSecond').html(second);
    },
    'trim': function (str) {
        //去掉所有空格
        return str.replace(/(^\s+)|(\s+$)/g, "");
    },
    /** 获取链接中的参数
     * @params name: 参数名称, url: 链接/当前页面url
     * **/
    'getParams': function (name, url) {
        url = url || window.location.href;
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
        if (!results) {
            return '';
        }
        return results[1];
    },
    'closeAd': function () {
        $('#adFrame .close-btn').click(function () {
            $('#adFrame').hide();
        })
    },
    'isDev': function (user_id) {
        var userIdDivideLine = 100000; // 测试用户与正式用户id 分割点
        var userIdDivideLineBellow = 500; // 临时添加 测试用户与正式用户id 分割点下线
        return user_id >= userIdDivideLineBellow && user_id <= userIdDivideLine;

    },
    'httpToHttps': function (link) {
        return link.replace('http://', 'https://');
    },
    "regValidate": {
        'tel': function (num) {
            var reg = /^1[3|4|5|7|8][0-9]{9}$/;
            return reg.test(num);
        },
        'email': function (str) {
            var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            return reg.test(str);
        },
        'name': function (str) {
            return str.length > 1
        },
        'not_blank': function (str) {
            return str.replace(/(^\s+)|(\s+$)/g, "").length;
        },
        'select': function (str) {
            return str.replace(/(^\s+)|(\s+$)/g, "").length;
        },
        'captcha': function (str) {
            var s = str.replace(/(^\s+)|(\s+$)/g, "");
            return s.length && !isNaN(s);
        }
    },
    "setAppLink":function(url) {
        var u = navigator.userAgent;
        var is_ios = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        var is_android = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
        var is_lemon_app = u.indexOf('lemon') > -1;

        if (!url.split('/')[0]) {
            if (location.port.length) {
                url = 'http://' + location.hostname + ':' + location.port + url;
            } else {
                url = 'http://' + location.hostname + url;
            }
        }
        if (is_ios && is_lemon_app) {
            JSSwiftModel.pushToLinkWithUrl(url);
        } else if (is_android && is_lemon_app) {
            window.control.turnToWebActivity(url);
        } else {
            location.href = url;
        }
    }
};

var tabNav = {
    'init': function () {
        var self = this;
        self.initActionEvents();
    },
    'initActionEvents': function () {
        var self = this;

        //导航事件
        $('.J-nav').click(function () {
            var $_this = $(this);
            var target = $_this.data('target');

            $('.J-nav-box .J-nav').removeClass('current');
            $_this.addClass('current');

            $('.J-nav-target-box .station_item').removeClass('current');
            $('.J-nav-target-box .station_item[data-id=' + target + ']').addClass('current');

            $('.J-more-nav-box').hide(); //更多收起
            $('.J-more-nav').removeClass('active');

            page.resetCaptcha();
        });

        //更多导航
        $('.J-more-nav').click(function () {
            var $_this = $(this);
            var is_active = $_this.hasClass('active');
            if (is_active) {
                $('.J-more-nav-box').hide();
                $_this.removeClass('active');
            }
            if (!is_active) {
                $('.J-more-nav-box').slideDown();
                $_this.addClass('active');
            }
        })
    }
};

$(function () {
    initLazyload();
});

function initLazyload() {
    $(".lazy").lazy && $(".lazy").lazy({
        effect: 'fadeIn',
        effectTime: 300
    });
}

