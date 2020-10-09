(function(){
    //获取URL参数
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURIComponent(r[2]); return null;
    }
    function setCookie(c_name, value, expiredays) {
        var exdate = new Date()
        exdate.setDate(exdate.getDate() + expiredays)
        document.cookie = c_name + "=" + encodeURI(value) +
        ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
    }
    function getCookie(t) {
        return document.cookie.length > 0 && (c_start = document.cookie.indexOf(t + "="), -1 != c_start) ? (c_start = c_start + t.length + 1, c_end = document.cookie.indexOf(";", c_start), -1 == c_end && (c_end = document.cookie.length), decodeURI(document.cookie.substring(c_start, c_end))) : ""
    }
    function delCookie(name)
    {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval=getCookie(name);
        if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
    }
    // 验证跳转页面实现发出登录请求和验证后信息保存功能:
    // 1.如果链接带有 【openid】 参数和 【frompage】 参数则保存用户openid信息
    // 2.尝试获取OPENID
    function init() {
        var _openid = getQueryString('openid');
        var _frompage = getQueryString("frompage");
        if (_openid && _frompage == "login_redirect") { //情况1：如果url参数带openid，记录登录的openid,跳转至活动页
            setCookie("openid", _openid, 365);
            var history_url = decodeURIComponent(getCookie("history_url"));
            if(history_url.indexOf("relogin")>-1){
                window.location.href = history_url.split("relogin")[0];
            }else{
                window.location.href = history_url;
            }
        } else { //情况2：获取OPENID
            window.openid = getOpenid();
        }
    }

    function getOpenid() {
        var _openid = null;
        _openid= getCookie("openid");
        if ( _openid && "null" != _openid && "0" != _openid) return _openid;
        login();
    }

    function login(){
        var isDebug = getQueryString("debug");
        if(isDebug == "debug"){
            setCookie("openid", "oWTTD58_muBAIZA_h-3XxapayMpU", 365);
            return;
        }
        setCookie("openid","",365);
        setCookie("history_url",encodeURIComponent(window.location.href),365);
        var appid = "wx967b49ce9e6eeaf1";
        var pathArr = location.pathname.split("/");
        var source = location.host;
        for(var i=0;i<pathArr.length-1;i++){
            source += (pathArr[i]+"/");
        }
        // source += location.search;
        var _protocol = "http";
        if(location.protocol == "https:"){
            _protocol = "https";
        }
        var redirectUrl = location.protocol + "//wx.szhhhd.com/public/login.php?http_type="+_protocol+"&source=" + encodeURIComponent(source);
        // console.log(location.protocol + "//open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid + "&redirect_uri=" 
        // + encodeURIComponent(redirectUrl) + "&response_type=code&scope=snsapi_userinfo&state=insight&#wechat_redirect");
        // return;
        window.location.href = location.protocol + "//open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid + "&redirect_uri=" 
        + encodeURIComponent(redirectUrl) + "&response_type=code&scope=snsapi_userinfo&state=insight&#wechat_redirect";
    }

    if(getQueryString("debug")=="relogin"){
        delCookie("openid");
        delCookie("history_url");
    }

    init();
})();