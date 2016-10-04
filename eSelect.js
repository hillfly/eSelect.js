/**
 *	@file eSelect.js
 *	@author _Hill3
 *	@date 2016/09/16
 *	@version 0.1 beta
 */

;
(function(window, $, store) {
    "use strict";
    var esConfig = {
        userConfig: {
            _esContextExp: '',
            _esLoadImmediatlyFlag: false, //是否立即加载数据标志
            _esContextCde: '', //系统标识，作为缓存key前缀
            _esAjaxUrl: '', //缓存远程获取接口地址
            _eleProperty: 'name',
        },
        _esAjaxConfig: {
            dataType: 'JSON',
            type: 'GET'
        },
        _esContxt: '',
        _eleLoadedFlag: 'es-loaded',
        _esCacheKey: ''
    };

    //方法抽象，用户可自定义
    var esFuncInterface = {
        /**
         *	getElements 筛选返回目标元素
         */
        getElements: function() {
            return esConfig._esContxt.find('select[es-autoload][' + esConfig.userConfig._eleProperty + ']').not(':hidden, :disabled');
        },
        /**
         *	ajaxSuccessFn 远程获取数据成功后回调函数
         */
        ajaxSuccessFn: function($ele, opts) {},
        /**
         *	createOptions 创建并返回下拉项Option
         *	@param opt 单条选项数据, e.g:
        	{
        		text: "测试test",
        		value: "测试value"
        	}
         */
        createOptions: function(opt) {
            return "<option value=" + opt["value"] + ">" + opt["text"] + "</option>";
        },
        /**
         *	getRemoteReqParam 获取请求后台的请求参数
         */
        getRemoteReqParam: function($ele) {
            var reqParam = {};
            reqParam.name = $ele.attr(esConfig.userConfig._eleProperty);
            return reqParam;
        }
    };

    //向外暴露的方法
    var esFunc = {
        /**
         *	init 初始化eSelect
         *	@param param 初始化参数
         */
        init: function(param) {
            param && param.userConfig && $.extend(esConfig.userConfig, param.userConfig);
            param && param.funcImp && $.extend(esFuncInterface, param.funcImp);
            if (isEmpty(esConfig.userConfig._esContextExp)) esConfig._esContxt = $(document);
            else esConfig._esContxt = $(esConfig.userConfig._esContextExp);
            try {
                esCore.initConfig();
            } catch (e) {
                console.error("init failed, " + e);
                return;
            }
            var $elements = esFuncInterface.getElements();
            esCore.bindEvent($elements);
        },
        /**
         *	setOptions 加载本地数据
         *	@param $ele 加载数据的元素Jquery对象
         *	@param opts 加载的数据
         *
         */
        setOptions: function($ele, opts) {
            if (isSelectEle($ele)) {
                try {
                    esCore.setCache($ele.attr(esConfig.userConfig._eleProperty), opts);
                } catch (e) {
                    console.error("setOptions failed, " + e);
                    return;
                }
                esCore.fillElement($ele, opts);
            } else {
                console.warn("setOptions failed, $ele is not a normal SELECT element");
            }
        },
        /**
         *	reload 重加载数据
         *	@param $ele 需要重新请求远程加载数据的元素Jquery对象
         */
        reloadElement: function($ele) {
            if (isSelectEle($ele)) {
                $ele.removeProp(esConfig._eleLoadedFlag);
                esFunc.clearEleCache($ele);
                $ele.trigger("esLoad");
            }
        },
        /**
         *	clearEleCache 清除指定元素的缓存
         */
        clearEleCache: function($ele) {
            try {
                esCore.clearCache($ele.attr(esConfig.userConfig._eleProperty));
            } catch (e) {
                console.error("clearEleCache failed, " + e);
                return;
            }
            $ele.removeProp(esConfig._eleLoadedFlag);
        },
        /**
         *	clearAllEleCache 清除所有缓存
         */
        clearAllEleCache: function() {
            esCore.clearAllCache();
            esFuncInterface.getElements().removeProp(esConfig._eleLoadedFlag);
        },
        /**
         *	getConfig 获取用户配置信息
         */
        getConfig: function() {
            return esConfig.userConfig;
        }
    };

    var esCore = {
        initConfig: function() {
            esCore.checkConfig();
            var prefix = esCore.getCacheKeyPrefix();
            if (isNotEmpty(prefix)) {
                esConfig._esCacheKey = prefix + '-'; //init CacheKey
            }
        },
        checkConfig: function() {
            if (isEmpty(esConfig.userConfig._esContextCde)) throw "_esContextCde is empty, Please init [_esContextCde]";
        },
        /**
         *	bindEvent 绑定监听事件
         */
        bindEvent: function($elements) {
            if ($elements) {
                var eleSize;
                for (var i = 0, eleSize = $elements.length; i < eleSize; i++) {
                    var $ele = $($elements[i]),
                        eleProperty = $ele.attr(esConfig.userConfig._eleProperty),
                        isLoadImmediatly = (esConfig.userConfig._esLoadImmediatlyFlag && true === esConfig.userConfig._esLoadImmediatlyFlag);
                    if (isNotEmpty(eleProperty) && isSelectEle($ele)) {
                        $ele.on("click esLoad", function(event) {
                            esCore.dispatchEvent(event);
                        });
                        //load data immediately
                        if (isLoadImmediatly) {
                            $ele.trigger("esLoad");
                        }
                    }
                }
            }
        },
        /**
         *	dispatchEvent 事件触发
         */
        dispatchEvent: function(event) {
            var $ele = $(event.currentTarget),
                eleProperty = $ele.attr(esConfig.userConfig._eleProperty),
                eleLoadedFlag = $ele.prop(esConfig._eleLoadedFlag),
                eleOptionsLen = $ele[0].options.length,
                chacheOpts = esCore.getCache(eleProperty);
            if (eleLoadedFlag && eleOptionsLen > 0) {
                return;
            }
            if (!eleLoadedFlag) {
                if (chacheOpts && chacheOpts.length > 0) esCore.fillElement($ele, chacheOpts);
                else {
                    try {
                        esCore.remote($ele);
                    } catch (e) {
                        console.error("dispatchEvent failed, " + e);
                        return;
                    }
                }
            }
        },
        /**
         *	remote 远程ajax获取option数据
         */
        remote: function($ele) {
            if (isEmpty(esConfig.userConfig._esAjaxUrl)) {
                throw "_esAjaxUrl is empty! Please init [_esAjaxUrl]";
            } else {
                var reqParam = esFuncInterface.getRemoteReqParam($ele);
                $.ajax({
                    type: esConfig._esAjaxConfig.type,
                    dataType: esConfig._esAjaxConfig.dataType,
                    url: esConfig.userConfig._esAjaxUrl,
                    data: reqParam,
                    success: function(opts) {
                        if ($.isArray(opts) && opts.length > 0) {
                            esCore.setCache($ele.attr(esConfig.userConfig._eleProperty), opts);
                            esCore.fillElement($ele, opts);
                            if (esFuncInterface.ajaxSuccessFn) {
                                esFuncInterface.ajaxSuccessFn($ele, opts);
                            }
                        } else {
                            throw "the return value of (remote) is empty || is not an array, requestData:" + reqParam;
                        }
                    }
                });
            }
        },
        /**
         *	fillElement 填充Select
         */
        fillElement: function($ele, opts) {
            $ele.empty(); //clear the options
            $(opts).each(function() {
                $ele.append(esFuncInterface.createOptions(this));
            });
            //当选项值不为空时，设置已加载标识
            //当选项值为空时，移除已加载标识
            if (opts.length > 0) $ele.prop(esConfig._eleLoadedFlag, true);
            else {
                $ele.removeProp(esConfig._eleLoadedFlag);
            };
        },
        /**
         *	getCacheKeyPrefix 获取缓存Key前缀
         */
        getCacheKeyPrefix: function() {
            if (isEmpty(esConfig.userConfig._esContextCde)) return '';
            return esConfig.userConfig._esContextCde;
        },
        /**
         *	getCacheKey 获取缓存Key
         */
        getCacheKey: function(key) {
            if (isEmpty(key)) throw "getCacheKey error! key is null";
            else return (esConfig._esCacheKey + key);
        },
        /**
         *	setData 设置缓存
         */
        setCache: function(key, value, isAppend) {
            var cacheKey = esCore.getCacheKey(key),
                opts = store.get(cacheKey);
            if ($.isArray(value)) {
                isAppend && $.isArray(opts) && opts.length > 0 && value.length > 0 && (value = opts.concat(value));
                store.set(cacheKey, value);
            } else {
                throw "setCache error, value is not an array";
            }
        },
        /**
         *	getData 获取缓存
         */
        getCache: function(key) {
            return store.get(esCore.getCacheKey(key));
        },
        getAllCachesKey: function() {
            var _caches = [],
                prefix = esCore.getCacheKeyPrefix();
            store.forEach(function(key, val) {
                if (startWith(key, prefix)) {
                    _caches.push(key);
                }
            });
            return _caches;
        },
        /**
         *	clearCache 清除指定缓存
         */
        clearCache: function(key) {
            store.remove(esCore.getCacheKey(key));
        },
        /**
         *	clearAllCache 清除所有缓存
         */
        clearAllCache: function() {
            var _cachesKey = esCore.getAllCachesKey(),
                cachesLen = _cachesKey.length;
            for (var i = 0; i < cachesLen; i++) {
                store.remove(_cachesKey[i]);
            }
        }
    };

    /********  JQuery *********/
    $.fn.extend({
        eSelect: function(param) {
            var $this = $(this),
                defaultFuncImp = {
                    ajaxSuccessFn: function($ele, opts) { //远程获取数据成功后回调函数
                        return opts;
                    }
                };
            param && param.funcImp && $.extend(defaultFuncImp, param.funcImp);
            param.funcImp = defaultFuncImp;
            esFunc.init(param);
            return $this;
        },
        /**
         *	setOptions 加载本地数据
         *	@param $ele 加载数据的元素Jquery对象
         *	@param opts 加载的数据
         *
         */
        setOptions: function(opts) {
            var $this = $(this);
            esFunc.setOptions($this, opts);
            return $this;
        },
        /**
         *	reload 重加载数据
         *	@param $ele 需要重新请求远程加载数据的元素Jquery对象
         */
        reloadElement: function() {
            var $this = $(this);
            esFunc.reloadElement($this);
            return $this;
        },
        /**
         *	clearEleCache 清除指定元素的缓存
         */
        clearEleCache: function() {
            var $this = $(this);
            esFunc.reloadElement($this);
            return $this;
        }
    });


    /********  UTILS *********/
    function isEmpty(str) {
        return !isNotEmpty(str);
    }

    function isNotEmpty(str) {
        return (str && $.trim(str).length > 0);
    }

    function startWith(eleStr, str) {
        return (eleStr && str && eleStr.substr(0, str.length) == str);
    }
    /**
     *	isSelectEle 判断Jquery对象是否为Select元素
     */
    function isSelectEle($ele) {
        return ($ele && $ele[0] && 'SELECT' == $ele[0].tagName);
    }

    //暴露方法给外部调用
    window.eSelect = esFunc;

})(window, jQuery, store);
