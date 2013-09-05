---
title: js SDK
---

此 js SDK 适用于除<=MSIE 9.0 的所有浏览器，基于 [七牛云存储官方API](http://docs.qiniu.com/) 构建。具有如下的特点：

1. 通过网页上传任意大小的文件
2. 支持进度提示,实时速度提示
3. Ajax无刷新
4. 暂停,继续
5. 历史记录，可在上传过程中关闭网页，下次打开网续传

目录
----
- [1. 安装](#install)
- [2. 初始化](#setup)
	- [2.1 配置密钥](#setup-key)
- [3. 上传文件](#io-api)
- [4. 接口说明](#api)
- [5. 在线示例](#onlineDemo)
- [6. 贡献代码](#contribution)
- [7. 许可证](#license)
----

<a name=install></a>
## 1. 安装
下载:

	git clone http://github.com/qiniu/js-sdk

引用:
	
	在Html 文件中引入`jquery-1.9.1.min.js`,`qiniu.uploader.js` 三个文件。

示例：

``` html
	<script type="text/javascript" src="jquery-1.9.1.min.js"></script><!-- * -->
    <script type="text/javascript" src="qiniu.uploader.js"></script>
```

<a name=setup-key></a>
### 2.1 获取上传凭证

1. 设置`signUrl`
2. 设置 onBefor回调函数，通过在此函数中设置提交至`signUrl`页面的参数

示例：

假设您的业务服务器地址为http://www.example.com，服务器端语言为php，并采用七牛提供的php-sdk。
假设PutPolicy.php为您颁发客户端上传Token的页面

http://www.example.com/PutPolicy.php

``` php
	<?php
    require_once("php-sdk/qiniu/rs.php");
    //七牛测试帐号，此帐号空间下的所有文件为临时文件，我们会进行定期的删除
    //请不要上传您的重要数据至此空间
    $accessKey = 'iN7NgwM31j4-BZacMjPrOQBs34UG1maYCAQmhdCV';
    $secretKey = '6QTOr2Jg1gcZEWDQXKOGZh5PziC2MCV5KsntT70j';
    $bucket = "qtestbucket";
    Qiniu_SetKeys($accessKey, $secretKey);
    $mac = new Qiniu_Mac($accessKey,$secretKey);
    if($_POST["putExtra"]){
        $extra = json_decode($_POST["putExtra"]);
        if($extra){
            $scope = $bucket.":".$extra->{'key'};
            $policy = new Qiniu_RS_PutPolicy($scope);
            $policy->Expires = 3600*24*30;
            echo $policy->token($mac);
        }
    }
    ?>
```

html页面

``` html
<script type="text/javascript">

    //设置颁发token的Url,该Url返回的token用于后续的文件上传
    Q.SignUrl("http://www.example.com/PutPolicy.php");
            
    //可以在此回调中添加提交至服务端的额外参数,用于生成上传token
    //此函数会在上传前被调用
    Q.addEvent("beforeUp", function() {
        extra = new Object();
        extra.key = Q.files()[0].name;
        Q.SetPutExtra(JSON.stringify(extra));
    });

</script>
```


<a name=io-api></a>
## 3. 上传文件

js sdk提供以下三个事件用于通知用户上传结果

1. beforeUp //上传之前调用事件
3. progress //上传进度事件
2. putFailure //上传失败事件
4. putFinished //上传完成事件
5. historyFound //发现待发上传的文件是未完成的事件

``` html
<script type="text/javascript">

    //可以在此回调中添加提交至服务端的额外参数,用于生成上传token
    Q.addEvent("beforeUp", function() {});

    //上传进度回调
    //@p, 0~100
    //@s, 已格式化的速度
    Q.addEvent("progress", function(p, s) {});

    //上传完成回调

    //上传失败回调
    //@msg, 失败消息 
    Q.addEvent("putFailure", function(msg) {});

    //@fsize, 文件大小(MB)
    //@res, 上传返回结果，默认为{hash:<hash>,key:<key>}
    //@taking, 上传使用的时间
    Q.addEvent("putFinished", function(fsize, res, taking) {});

    //发现待发上传的文件是未完成的事件
    //@his,文件名
     Q.addEvent("historyFound", function(his) {});
</script>
```

在html页面中添加input type="file"控件，并将此控件的id设置给qiniu的js sdk,html页面源码如下：

``` html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh-cn" dir="ltr">
<head>
    <title>七牛云存储 | HTML5 大文件上传</title>
</head>
<body>
    <input type="file" name="selectFiles" id="selectFiles" multiple="multiple" />
    <button type="button" id="upladBtn" name="uploadBtn">上传文件</button>
    <script type="text/javascript" src="jquery-1.9.1.min.js"></script><!-- * -->
    <script type="text/javascript" src="qiniu.uploader.js?id=3"></script>
    <script type="text/javascript">
     $("#upladBtn").click(function(event) {
        //在调用 Upload之前，设置所有的事件
        Q.fileInput("#selectFiles");
        //上传文件 
        Q.Upload("key");
    }
    </script>
</body>
</html>
```

<a name=api></a>
## 4. 接口说明
函数原型 | 说明
------------|---------
Upload(key)  | 上传文件,key指定七牛云空间中的key
Pasue()  | 暂停上传 
Resumble()  | 继续上传 
ResumbleHistory()  | 续传历史文件
SignUrl(url)  | 设置获取Token的Url
SetFileInput()  | 设置上传文件控件ID，如<input id="selectFiles"/>
SignUrl(url)  | 设置获取Token的Url
Bucket(name)  | 设置上传至Qiniu云存储空间名
addEvent(type,fn)  | 回调事件,参考[上传文件](#api-io)
files  | 已选择的文件
setPutExtra(extra)  | 设置获取token的额外参数
Histroy(his)  | his=true,启用上传文件记录，当网页关闭再次上传同一个文件时，会触发historyFound事件
ClearHistory(name)  | 清楚上传文件记录

<a name=onlineDemo></a>
## 5. 在线示例
[js-sdk在线演示示例](http://7niu.sinaapp.com)

<a name=contribution></a>
## 6. 贡献代码

1. Fork
2. 创建您的特性分支 (`git checkout -b my-new-feature`)
3. 提交您的改动 (`git commit -am 'Added some feature'`)
4. 将您的修改记录提交到远程 `git` 仓库 (`git push origin my-new-feature`)
5. 然后到 github 网站的该 `git` 远程仓库的 `my-new-feature` 分支下发起 Pull Request

<a name=license></a>
## 7. 许可证

Copyright (c) 2013 qiniu.com

基于 MIT 协议发布:

* [www.opensource.org/licenses/MIT](http://www.opensource.org/licenses/MIT)
