---
layout: post
title:  "Discuz! X3.2 安装问题小记"
categories: Linux
tags: Linux
---

Discuz 安装本来很简单，但是由于不熟悉和本身代码的问题，花了快一天才解决。现在将问题罗列如下：

#### Can’t connect to local MySQL server through socket
```bash
mysqli_connect() 不支持 advice_mysqli_connect
Discuz 安装完成后，后台打开Ucenter出现404
头像上传不能成功
Can’t connect to local MySQL server through socket
指定host使用的socket，格式如下：
$dbhost = ‘localhost:/temp/mysql.sock’;
```
<!--more-->
#### mysqli_connect() 不支持 advice_mysqli_connect
```bash
除了安装php5 php5-fpm php5-cli外，还需安装
apt-get install  php5-mysql
```

#### Discuz 安装完成后，后台打开Ucenter出现404，头像上传失败。
```bash
进入uc_server目录，分别编辑admin.php、avatar.php、index.php
注释下面一行代码、重新定义UC_API地址。

//define('UC_API', strtolower((isset($_SERVER) && $_SERVER == 'on' ? 'https' : 'http').'://'.$_SERVER.substr($_SERVER, 0, strrpos($_SERVER, '/'))));
define('UC_API', 'http://domain.com/uc_server');
```