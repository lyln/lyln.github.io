---
layout: post
title:  "Linux常用查看命令"
categories: Linux
tags: Linux
date: 2014/08/15
---

#### 查看外网ip
```
curl ifconfig.me
curl ifconfig.sh
curl ifconfig.co
```

#### 查看编译参数
1、nginx编译参数
```
/usr/local/nginx/sbin/nginx -V
```
2、apache编译参数
```
cat /usr/local/apache2/build/config.nice
```
<!--more-->
3、php编译参数
```
/usr/local/php/bin/php -i |grep config
/usr/local/php/sbin/php-config |grep config
```
4、mysql编译参数
```
cat "usr/local/mysql/bin/mysqlbug" |grep configure
```
#### 查看版本号
1、查看linux版本、系统信息
```
uname -a
cat /proc/version
cat /etc/issue
cat /etc/redhat-release
```
2、apache版本
```
httpd -v
```
3、php版本
```
php -v
```
4、mysql版本
```
mysql -V
mysql --help |grep Distrib
```