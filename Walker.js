/**
 * Created by Administrator on 2016/9/22.
 */
Walker = {
    //兼容所有浏览器的，添加事件方法
    addEvent: function (dom, type, fn) {

        if (dom.addEventListener) {
            dom.addEventListener(type, fn, false);
        } else if (dom.attachEvent) {
            dom.attachEvent('on' + type, fn);
        } else {
            dom['on' + type] = fn;
        }

    },

    //兼容获取事件对象
    getEvent : function (event){
        //标准浏览器返回event,IE下window.event
        return event || window.event;
    },

    //获取元素
    getTarget : function (event) {
        var event = Walker.getEvent(event);
        //标准浏览器下event.target,IE下event.srcElement
        return event.target || event.srcElement;
    },

    //阻止默认行为
    preventDefault : function (event) {
        var event = Walker.getEvent(event);

        //标准浏览器
        if(event.preventDefault){
            event.preventDefault();
        }else{//非IE
            event.returnValue = false;
        }
    },

    //数组随机排序
    arrayRandomSort : function (array) {

        for(let i =0;i<10;i++) {
            array.sort(function (a, b) {
                return Math.floor(Math.random() * 2);
            });
        }

        return array;
    },

    //数组去重
    arrayNoRepeat : function (array) {
        var array = array;
        var obj ={};
        for(var i=0;i<array.length;i++){
            obj[array[i]]=i;
        }
        return Object.keys(obj);
    },

    /**
     * 将json对象转为json形式的字符串。
     */
    parseJsonData : function(data){
        var str = '';

        //1.遍历（循环） json数据

        for(var i in data) {

            //2.将属性名与值连接起来  属性名=属性值&
            str += i + '=' + data[i] + '&';
        }

        //3.去除最后一个多余的&符号

        str = str.replace(/&+$/, '');

        //4.将处理好的数据返回出去

        return str;
    },

    /**
     *  将用户给的json对象转为能够处理的标准格式
     */

    parseJsonStandard : function(ini){
        //2.配置默认选项
        var config = {
            type: "get",
            url: "",
            async: true,
            cache: false,
            data: {},
            success: function() {},
            beforeSend: function() {},
            complete: function() {}
        };
        //2.1创建一个变量不给值，这就是undefined 用于比较属性是否是undefined
        var z;
        //2.2如果没有传递参数 让默认参数为空对象

        ini = ini || {};
        //3.遍历默认选项，即使传进来的是选项中没遥属性也不会被添加进来

        for(var i in config){
            //4.i就是配置属性名，从ini中找这个对应的数据，有就覆盖当前配置，没有就不管了
            config[i] = ini[i]===z ? config[i]: ini[i];
        }
        //5.返回合并结果

        return config;
    },

    /**
     * ajax请求
     * 1.执行ajax时需要6项配置
     *  type: 请求类型
     *  url: url地址
     *  data: 数据
     *  async: 是否异步
     *  cache: 是否缓存
     *  success||error 成功与失败的回调函数
     * 2.需要将json数据转换成get参数格式
     * 3.判断是否是请求的类型
     * 4.参数可以设置为默认值，没有传递这个参数也可以正常运行。
     */
    ajax : function(config){
        //1.将config转为为能够处理的标准格式
        config = Walker.parseJsonStandard(config);

        //2.创建ajax对象并解决兼容问题
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('microsoft.XMLHTTP');

        //3.判断是否post请求
        var isPost = /post/i.test(config.type);

        //4.无论是get还是post都要把json数据转化成get参数类型
        config.data = Walker.parseJsonData(config.data);

        //5.如果是get方式需要判断是否需要缓存，为了解决IE的缓存问题，需要加上时间戳。向地址上夹时间的时候要判断之前是否有？号。

        if(!isPost){
            config.url += (config.url.indexOf('?')>-1 ? '' : '?')+(config.cache ? '' : new Date().getTime() + '=1') + ('&'+config.data);
        }

        //6.打开地址
        xhr.open(config.type,config.url,config.async);

        //7.如果是post请求
        if(isPost){
            //8.添加请求头
            xhr.setRequestHeader('content-type','application/x-www-form-urlencoded');
        }

        //9.执行发送之前的回调函数 要执行回调函数一定要先判断它是不是函数！！！！

        if(typeof config.beforeSend == 'function') {
            config.beforeSend();
        }

        //10.发送数据
        xhr.send(config.data);

        //11.添加监听事件

        xhr.onreadystatechange = function(){

            //12.判断是否请求完成

            if(xhr.readyState == 4){
                //13.如果请求完成，并且有回调函数就执行，不管是否成功
                if(typeof config.complete == 'function'){
                    //13.1 为了方便以后的调试把访问状态也传给回调函数，最好把xhr对象也也传给它。
                    config.complete(xhr.status,xhr);
                }

                //14.如果请求成功就执行success函数
                if(typeof config.success == 'function') {

                    config.success(xhr.responseText,xhr);
                }
            }
        }
    },
    /**
     * 自定义函数获取元素到页面的距离
     * element:这个元素为要计算到页面的距离
     * 函数名：offset
     */
    offset: function(element){
        //搞一个对象出来存储，元素到页面的左右距离
        var pos = {left:0,top:0};

        //先加上到元素到父元素的距离
        pos.left+=element.offsetLeft;
        pos.top+=element.offsetTop;

        //获取元素有定位的父级的元素
        var parents = element.offsetParent;

        //循环依次找到有定位的父元素并且加上相对父元素的位置
        while(parents && !/html|body/i.test(parents.tagName)){

            pos.left+=parents.offsetLeft;
            pos.top+=parents.offsetTop;

            //在找到上一个父元素
            parents = parents.offsetParent;
        }

        //返回记录位置的对象
        return pos;
    },

    /**
     * 获取滚动条到页面的距离
     * 兼容IE
     */
    getScrollTop : function(){
        return document.documentElement.scrollTop || document.body.scrollTop;
    },

    /**
     * cookie对象
     * 包括添加，删除，查询方法
     */
     cookie :  {

        //根据key值获取对应的cookie
        get:function(key){

            //获取cookie
            var data = document.cookie;
            //获取key第一次出现的位置    pwd=
            var startIndex = data.indexOf(key+'=');
            //  name=123;pwd=abc
            //如果开始索引值大于0表示有cookie
            if(startIndex>-1) {

                //key的起始位置等于出现的位置加key的长度+1
                startIndex = startIndex+key.length+1;

                //结束位置等于从key开始的位置之后第一次;号所出现的位置

                var endIndex = data.indexOf(';',startIndex);

                //如果未找到结尾位置则结尾位置等于cookie长度，之后的内容全部获取
                endIndex = endIndex<0 ? data.length:endIndex;

                return decodeURIComponent(data.substring(startIndex,endIndex));

            }else {
                return '';
            }

        },

        set:function(key,value,time){
            //默认保存时间
            var time = time;
            //获取当前时间
            var cur = new Date();

            var undefined;

            //设置指定时间
            cur.setTime(cur.getTime()+time*24*3600*1000);

            //创建cookie  并且设置生存周期为GMT时间
            document.cookie = key+'='+encodeURIComponent(value)+';expires='+(time===undefined?'':cur.toGMTString());

        },

        del:function(key){

            //获取cookie
            var data = this.get(key);

            //如果获取到cookie则重新设置cookie的生存周期为过去时间
            if(data!==false){

                this.set(key,data,-1);

            }

        }

    },
    /**
     * 获取兼容的URL对象
     */
    getURL : function () {
        return window.URL || webkitURL;
    }
}
