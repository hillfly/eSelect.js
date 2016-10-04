# 欢迎使用 eSelect.js

------

eSelect.js是一个基于JQuery制作的简单高效的HTML SELECT数据自动加载插件，eSelect.js支持以下功能：

- [x] 从远程后台加载数据
- [x] 从本地加载数据
- [x] SELECT选项数据本地缓存
- [x] 兼容IE8、IE9、IE10、IE11、Edge、Chrome、Firefox等浏览器

<b />
eSelect.js 基于以下第三方组件开发：
> * JQuery 1.7.1
> * store.js 1.3.20

**zip包下载地址：[http://hillfly.com/eSelect/release/eSelectjs.0.1beta.zip][1]**

------

## 开始使用eSelect.js

### 1. 引入JS文件
```html
<script type="text/javascript" src="demo/jquery-1.7.1.js"></script>
<script type="text/javascript" src="demo/store.min.js"></script>
<script type="text/javascript" src="eSelect.js"></script>
```

### 2. 标记需要自动加载的select控件
eSelect仅识别含有**es-autoload**属性的**Select**控件，非Select控件会自动被过滤。为了避免事件冲突，请勿在标识了es-autoload属性的Select控件中设置click监听。
```html
<html>
	<head>
		<meta charset="utf-8">
		<script type="text/javascript" src="demo/jquery-1.7.1.js"></script>
		<script type="text/javascript" src="demo/store.min.js"></script>
		<script type="text/javascript" src="eSelect.js"></script>
	</head>
	<body>
		<form id="es-form">
			<select id="select1" name="select1" es-autoload></select>
			<select id="select2" name="select2"></select>
		</form>
		<script></script>
	</body>
</html>
```

### 3. 初始化eSelect.js基础参数
##### 初始化方法一
```JavaScript 
eSelect.init({
	userConfig: {
		_esContextExp: '#es-form', //控件监听域
		_esLoadImmediatlyFlag: false, //是否立即加载数据标志
		_esContextCde: 'test', //系统标识，作为缓存key前缀
		_esAjaxUrl: 'http://127.0.0.1/getOpts', //缓存远程获取接口地址
		_eleProperty: 'name', //缓存key属性
	}
});
```

##### 初始化方法二
```JavaScript 
$('#es-form').eSelect({
	userConfig: {
		_esLoadImmediatlyFlag: false, //是否立即加载数据标志
		_esContextCde: 'test', //系统标识，作为缓存key前缀
		_esAjaxUrl: 'http://127.0.0.1/getOpts', //缓存远程获取接口地址
		_eleProperty: 'name', //缓存key属性
	}
});
```

 - _esContextExp [非必传]
 > 控件监听域，eSelect.js将监听此域内的Select控件。**默认为document**，即监听整个页面所有Select控件。亦可赋值为'.es-form'，即使用class选择器确定监听域，考虑性能的话，推荐使用id。

 - _eleProperty [非必传]
 > 缓存key属性名，**默认为name**，eSelect.js将会读取控件的该属性值作为缓存key。当Select控件对应的_eleProperty属性值为空或不存在时，该控件将会被过滤，不会触发自动加载。

 - _esLoadImmediatlyFlag [非必传]
  > 是否立即加载数据标志，**默认为false**，即为懒加载模式，只有点击Select控件触发监听事件时，eSelect.js才会初始化Select控件数据。若为true，初始化方法执行完毕后eSelect.js将会立刻加载Select控件数据。

 - _esAjaxUrl [必传]
  > 选项数据远程获取接口地址，必须为完整的网址，包含http://

 - _esContextCde [必传]
 > 系统标识，作为缓存key前缀。因为eSelect.js本地缓存使用的是localStorage，其作用域是限定在文档源级别的，文档源通过协议、主机名以及端口三者来确定，即同一站点的不同页面读写的是同一作用域的localStorage。若不同的页面中存在同_eleProperty值的Select控件，则可能存在缓存key重名导致缓存覆盖的问题，为了避免这个问题，需要给每个key加个前缀，每个页面的eSelect可赋予不同的_esContextCde来避免key重复问题。

### 4. 服务端数据接收与返回
##### AJAX请求
eSelect.js请求远程服务获取选项数据的Ajax请求基本参数如下：
> url: _esAjaxUrl
data: { key: _eleProperty}
type: "GET"
dataType: "JSON"
>
例如:
> url: "http://127.0.0.1/get"
data: { key: "select1"}
type: "GET"
dataType: "JSON"

##### AJAX返回
返回数据格式：JSON，具体形式为JSON数组。若无选项数据，则返回[]，例如:
``` json
[{
	text: "test1",
	value: "value1"
}, {
	text: "tes2",
	value: "value2"
}, {
	text: "tes3",
	value: "value3"
}]
```

## 方法API
### 1. 加载本地数据到Select控件
可将指定的options数据加载到控件中，eSelect.js会自动刷新localStorage中的缓存数据。
``` Javascript
eSelect.setOptions($('#select1'), [{
	text: "test1",
	value: "value1"
}, {
	text: "tes2",
	value: "value2"
}, {
	text: "tes3",
	value: "value3"
}]);
```
或者
``` Javascript
$('#select1').setOptions([{
	text: "test1",
	value: "value1"
}, {
	text: "tes2",
	value: "value2"
}, {
	text: "tes3",
	value: "value3"
}]);
```

### 2. 重新加载Select控件数据
该操作将会清空指定Select控件的Option项，清空localStorage中该控件的缓存数据，然后eSelect从远程重新获取并加载控件数据。
``` Javascript
eSelect.reloadElement($('#select1'));
```
或者
``` Javascript
$('#select1').reloadElement();
```

### 3. 清除指定控件的localStorage缓存
``` Javascript
eSelect.clearEleCache($('#select1'));
```
或者
``` Javascript
$('#select1').clearEleCache();
```

### 4. 清除所有控件的localStorage缓存
``` Javascript
eSelect.clearAllEleCache();
```

### 5. 获取eSelect.js配置信息
``` Javascript
eSelect.getConfig();
```
返回值：
``` Javascript
userConfig: {
	_esContextExp: '#es-context',
	_esLoadImmediatlyFlag: false,
	_esSysFlag: 'test',
	_esAjaxUrl: 'http://127.0.0.1/get', 
	_eleProperty: 'id',
}
```

## 用户自定义
### 1. 自定义筛选需要监听的Select控件

 eSelect.js默认的元素筛选逻辑为： 
 
 - 在_esContextExp域内
 - 为Select控件
 - 含有es-autoload属性
 - _eleProperty属性值不为空
 - 控件非hidden、非disabled

实际使用中用户可覆盖默认筛选逻辑进行自定义：

> 方法：getElements(){}
参数：无参
返回值：返回筛选元素的**JQuery对象**

``` Javascript
{
	userConfig: {
		_esContextExp: '#es-form',
		_esLoadImmediatlyFlag: false,
		_esContextCde: 'test',
		_esAjaxUrl: 'http://127.0.0.1/getOpts',
		_eleProperty: 'name',
	},
	funcImp: {
		getElements: function() {
		    return $('#select1');
		}
	}
}
```

### 2. 自定义远程请求数据内容
eSelect.js默认的远程请求数据内容为：{ key: _eleProperty}，比如：{ key: "select1"}，用户可以自定义请求的内容：

> 方法：getRemoteReqParam: function($ele) {}
参数：
>
- 参数1, $ele：触发加载的select控件的JQuery对象
>
返回值：返回筛选元素的**JQuery对象**

``` Javascript
{
	userConfig: {
		_esContextExp: '#es-form',
		_esLoadImmediatlyFlag: false,
		_esContextCde: 'test',
		_esAjaxUrl: 'http://127.0.0.1/getOpts',
		_eleProperty: 'name',
	},
	funcImp: {
		getRemoteReqParam: function($ele) {
            return {reqId: $ele.prop("id")};
		}
	}
}
```

### 3. 设置远程获取数据成功后回调事件
用户可以自定义回调方法，自定义远程获取数据成功后需要执行的操作：

> 方法：ajaxSuccessFn: function($ele, opts) {}
参数：
>
  - 参数1, $ele：触发加载的select控件的JQuery对象
  - 参数2, opts：远程请求返回的数据
>
返回值：无

``` Javascript
{
	userConfig: {
		_esContextExp: '#es-form',
		_esLoadImmediatlyFlag: false,
		_esContextCde: 'test',
		_esAjaxUrl: 'http://127.0.0.1/getOpts',
		_eleProperty: 'name',
	},
	funcImp: {
		ajaxSuccessFn: function($ele, opts) {
            //your code  ^ ^
		}
	}
}
```

### 4. 自定义Option项创建
默认创建的Option项为：`<option value="0">男</option>` ，用户可以自定义Option：

> 方法：createOptions: function(opt) {}
参数：
>
  - 参数1, opt：单条option选项数据的JSON对象
>  例如： `{text: "男", value: "0"}`
>
返回值：拼接完毕的Option字符串, `"<option></option>"`

``` Javascript
{
	userConfig: {
		_esContextExp: '#es-form',
		_esLoadImmediatlyFlag: false,
		_esContextCde: 'test',
		_esAjaxUrl: 'http://127.0.0.1/getOpts',
		_eleProperty: 'name',
	},
	funcImp: {
		createOptions: function(opt) {
            return "<option value=" + opt["value"] + " selected=" + opt["selected"] + ">" + opt["text"] + "</option>";
		}
	}
}
```


------

再一次感谢您花费时间阅读这份使用说明，祝您工作顺利、生活愉快！

作者 [@_Hill3][2]
2016年 9月16日


  [1]: http://hillfly.com/eSelect/release/eSelectjs.0.1beta.zip
  [2]: http://weibo.com/hillfly