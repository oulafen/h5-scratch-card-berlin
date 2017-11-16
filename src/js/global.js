// 将数据写入localstorage（兼容ios和android）
var setLocalStorage = function(key, item){
    window.localStorage && window.localStorage.setItem(key, item);
};

// 从localstorage中读取数据（兼容ios和android）
var getLocalStorage = function(key){
    return window.localStorage && window.localStorage.getItem(key);
};

var global = {
    browser: function(){
        var u = navigator.userAgent;
        return {
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端
            weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
            qq: u.match(/\sQQ/i) == " qq", //是否QQ
            lemon: u.indexOf('lemon') > -1, //是否柠檬app
            lemon_version: isNaN(parseFloat(u.substr(u.indexOf('version:') + 8, 5).replace('.', '')) / 10) ? 0 : (parseFloat(u.substr(u.indexOf('version:') + 8, 5).replace('.', '') / 10).toFixed(2) )
            /** 柠檬app的版本，结果为浮点型 x.x，获取不到时结果为0 **/
        }
    },
    /***
     * 获取用户信息
     * **/
    getUserInfo : function(){
        var self = this;
        var userInfo = {
            user_id: getParams('user_id'),
            token: getParams('token')
        };
        if(userInfo.user_id && userInfo.token){
            return userInfo;
        }

        var info = '';
        try{
            if (self.browser().lemon && self.browser().ios) {
                info = JSSwiftModel.getLemonUserInfo();
            } else if(self.browser().lemon && self.browser().android){
                info = window.control.getLemonUserInfo();
            }
        }catch (err){
            info = '';
            //$.alert && $.alert('呀！这都被你遇见了, 即将见证个未知错误, 快截图反馈吧, 说不定会有彩蛋哦~~~ 程序媛妹子正在寻找治愈系灵丹妙药的路上, 请稍后再试', '');
            //!$.alert && alert('呀！这都被你遇见了, 即将见证个未知错误, 快截图反馈吧, 说不定会有彩蛋哦~~~ 程序媛妹子正在寻找治愈系灵丹妙药的路上, 请稍后再试', '');
            //alert(err);
        }
        var user_info_str = info.replace(/\s+/g,""); //去掉字符串中的所有空格
        ///**
        // * 兼容android客户端1.2.0版本中回传的json字符串中 “token字符串没加引号” 的错误
        // * 判断依据：查看倒数第二个字符是不是引号
        // * **/
        //var is_normal_json_str = user_info_str.substr(-2, 1)  == '"' || user_info_str.substr(-2, 1)  == "'";
        //if(!is_normal_json_str){
        //    user_info_str = user_info_str.replace(/"token":/g, '"token":"').replace(/}/g, '"}');
        //}
        var user_info = user_info_str ? JSON.parse(user_info_str) : {user_id: 0, token: ''};

        return user_info;
    },
    /***
     * 调起app分享
     * **/
    callAppShare: function(info){
        //var info = {
        //    title: '分享标题',
        //    desc: '分享描述',
        //    imgUrl: 'https://share.runninglemon.com/statics_10k/images/activity/prize/170818-share-icon.jpg',
        //    link: 'https://share.runninglemon.com/home/activity/prize-index-170818',
        //    share_btn_is_hidden: false
        //};
        //var info = JSON.stringify(info);
        if (global.browser().ios && global.browser().lemon) {
            JSSwiftModel.webviewCallShare();
        } else if(global.browser().android && global.browser().lemon){
            window.control.webviewCallShare(info);
        }
    },
    /***
     * h5跳转到客户端的某页
     * app version 1.5+
     * @args: 1=>首页
     * **/
    webviewCallJump: function(num){
        if (global.browser().ios && global.browser().lemon) {
            JSSwiftModel.webviewCallJumpWithNumber(num);
        } else if(global.browser().android && global.browser().lemon){
            window.control.webviewCallJump(num);
        }
    },
    /***
     * app中加入跑房
     * **/
    callAddRoom: function (info_str){
        //var info = {
        //    room_name: '跑房名字',
        //    room_id: '跑房id'
        //};
        //var info_str = JSON.stringify(info);
        var self = this;
        if(self.browser().lemon_version < 1.3){
            $.alert('由于您柠檬跑步app版本过低，无法直接跳转进入，敬请更新最新版本或在app内查找相应跑房。', '温馨提示');
            return;
        }
        try {
            if(self.browser().lemon && self.browser().android){
                window.control.webviewCallAddRoom(info_str);
            }else if(self.browser().lemon && self.browser().ios){
                JSSwiftModel.webviewCallAddRoomWithJson(info_str);
            }
        }catch (err){
            alert(err);
            $.alert('遇到了未知错误, 程序媛妹子正在寻找治愈系灵丹妙药, 请稍后再试');
        }
    },
    /***
     * 在app中打开水印相机
     * **/
    setPhotosDownload: function(link){
        var browser = global.browser();
        if(browser.lemon && browser.lemon_version >= 1.4){
            if (browser.ios ) {
                JSSwiftModel.pushPhotosDownload();
            }else if(browser.android){
                window.control.webviewCallRacePhoto();
            }
        }else{
            location.href = link;
        }
    }
};

/** 获取链接中的参数
 * @params name: 参数名称, url: 链接/当前页面url
 * **/
function getParams(name, url) {
    url = url || window.location.href;
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    if (!results) {
        return '';
    }
    return results[1];
}