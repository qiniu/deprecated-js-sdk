---
title: js SDK
---


此 js SDK 适用于除<=MSIE 9.0 的所有浏览器，基于 [七牛云存储官方API](http://docs.qiniu.com/) 构建。具有如下的特点：

1.通过网页上传任意大小的文件
2.支持上进度提示
3.Ajax无刷新


目录
----
- [1. 安装](#install)
- [2. 初始化](#setup)
	- [2.1 配置密钥](#setup-key)
- [3. 上传文件](#io-api)
- [4. 贡献代码](#contribution)
- [5. 许可证](#license)
----

<a name=install></a>
## 1. 安装
下载:

	git clone http://github.com/qiniu/js-sdk

引用:
	
	在Html 文件中引入`jquery-1.9.1.min.js`,`jquery.base64.min.js`,`qiniu.uploader.js` 三个文件。

示例：

``` html
	<script type="text/javascript" src="jquery-1.9.1.min.js"></script><!-- * -->
    <script type="text/javascript" src="jquery.base64.min.js"></script> <!-- * -->
    <script type="text/javascript" src="qiniu.uploader.js?id=3"></script>
```

<a name=setup-key></a>
### 2.1 获取上传凭证

1. 设置`Qiniu.signUrl`
2. 设置 Qiniu.onBefor回调函数，通过在此函数中设置提交至`Qiniu.signUrl`的参数

示例：

假设您的业务服务器地址为http://www.example.com，服务器端语言为php，并采用七牛提供的php-sdk。
假设PutPolicy.php为您颁发客户端上传Token的页面

http://www.example.com/PutPolicy.php

``` php
	<?php
	require_once("php-sdk/qiniu/rs.php");
		$bucket = "phpsdk";
		$accessKey = '6Ua-pviUhl0k75Juee5wOxb4LxXC_iGUxJQFBtzf';
		$secretKey = 'L_KNbmmO2nKPLlJOG1TxHvP4q56F3-lx_PhEs4zL';
		$bucket = "icattlecoder3";
		Qiniu_SetKeys($accessKey, $secretKey);
		$mac = new Qiniu_Mac($accessKey,$secretKey);
		if($_POST["extra"]){
			$extra = json_decode($_POST["extra"]);
			$scope = $bucket.":".$extra["key"];
			$policy = new Qiniu_RS_PutPolicy($scope);
			echo $policy->token($mac);
		}
	?>
```

html页面

``` html
    <script type="text/javascript">

            Qiniu.signUrl = "http://www.example.com/PutPolicy.php";
            
            //可以在此回调中添加提交至服务端的额外参数,用于生成上传token
            //此函数会在上传前被调用
            Qiniu.onBeforeUp = function(){
                extra = new Object();
                extra.key = "qiniuTest";
                Qiniu.putExtra = JSON.stringify(extra);
            };
    </script>
```


<a name=io-api></a>
## 3. 上传文件

js sdk提供以下三个事件用于通知用户上传结果

1. onPutFailure //上传失败回调
2. onProgress //上传进度回调
3. onPutFinished //上传完成回调

``` html
   		 <script type="text/javascript">
 			//上传失败回调
            Qiniu.onPutFailure = function(msg) {
                alert(msg);
            };

            //上传进度回调
            // p:0~100
            Qiniu.onProgress = function(p) {
                progressbar.progressbar({
                    value: p
                });
                progressLabel.text(progressbar.progressbar("value") + "%");
            };

            //上传完成回调
            //fsize:文件大小(MB)
            //res:上传返回结果，默认为{hash:<hash>,key:<key>}
            Qiniu.onPutFinished = function(fsize, res) {
                progressLabel.text('上传成功!文件大小:' + Qiniu.fileSize(fsize));
            };
        </script>
```
在html页面中添加input type="file"控件，并将此控件的id设置给qiniu的js sdk
完成的html页面源码如下：

``` html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh-cn" dir="ltr">
<head>
    <meta charset="UTF-8" />
    <title>七牛云存储 | HTML5 大文件上传</title>
    <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" />
    <style type="text/css">
    .wrap {
        width:800px;
    }
    #progressbar {
        float: left;
        width:350px;
        height: 20px;
    }
    </style>
</head>

<body>
    <header>
        <h1>七牛云存储 | HTML5 大文件上传</h1>
        <ol>
            <li>支持 > 2GB文件上传</li>
            <li>支持断点上传</li>
        </ol>
    </header>
    <section>
        <div class="wrap">
            <form id="filelist_sample" name="filelist_sample">
                <label for="selectFiles">请选择文件：</label>
                <input type="file" name="selectFiles" id="selectFiles" multiple="multiple" />
                <button type="button" id="upladBtn" name="uploadBtn">上传文件</button>
                <div id="progressbar">
                </div>
                <span class="progress-label"></span>
            </form>
        </div>
    </section>
    <footer>
        <div id="console"></div>
    </footer>
    <script type="text/javascript" src="jquery-1.9.1.min.js"></script><!-- * -->
    <script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
    <script type="text/javascript" src="jquery.base64.min.js"></script> <!-- * -->
    <script type="text/javascript" src="qiniu.uploader.js?id=3"></script>
    <script type="text/javascript">
    //“显示文件信息”按钮的click事件代码
    $(function() {
        $("#upladBtn").click(function(event) {
            Qiniu.signUrl = "http://www.example.com/PutPolicy.php";
            var progressbar = $("#progressbar");
            var progressLabel = $(".progress-label");
            //可以在此回调中添加提交至服务端的额外参数,用于生成上传token
            //putExtra会
            Qiniu.onBeforeUp = function(){
                extra = new Object();
                extra.key = "qiniuTest";
                Qiniu.putExtra = JSON.stringify(extra);
            };
            //上传失败回调
            Qiniu.onPutFailure = function(msg) {
                alert(msg);
            };
            //上传进度回调
            // p:0~100
            Qiniu.onProgress = function(p) {
                progressbar.progressbar({
                    value: p
                });
                progressLabel.text(progressbar.progressbar("value") + "%");
            };
            //上传完成回调
            //fsize:文件大小(MB)
            //res:上传返回结果，默认为{hash:<hash>,key:<key>}
            Qiniu.onPutFinished = function(fsize, res) {
                progressLabel.text('上传成功!文件大小:' + Qiniu.fileSize(fsize));
            };

            //指定上传文件的控件id
            // <input type="file" name="selectFiles" id="selectFiles" multiple="multiple" />
            Qiniu.fileInput("#selectFiles");
            Qiniu.Upload("icattlecoder3:sssss");
            return;
        });
    });
    </script>
</body>

</html>

```


<a name=contribution></a>
## 4. 贡献代码

1. Fork
2. 创建您的特性分支 (`git checkout -b my-new-feature`)
3. 提交您的改动 (`git commit -am 'Added some feature'`)
4. 将您的修改记录提交到远程 `git` 仓库 (`git push origin my-new-feature`)
5. 然后到 github 网站的该 `git` 远程仓库的 `my-new-feature` 分支下发起 Pull Request

<a name=license></a>
## 5. 许可证

Copyright (c) 2013 qiniu.com

基于 MIT 协议发布:

* [www.opensource.org/licenses/MIT](http://www.opensource.org/licenses/MIT)