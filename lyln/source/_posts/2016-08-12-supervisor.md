---
layout: post
title: "Supervisor进程管理"
categories: Linux
tags: supervisor
date: 2016/08/12
---

Supervisor (http://supervisord.org) 是一个用 Python 写的进程管理工具，可以很方便的用来启动、重启、关闭进程。
#### Supervisor安装
```
apt-get install supervisor
```

#### Supervisor配置文件

默认配置文件/etc/supervisor/supervisord.conf
如过没有,生成默认配置文件
```
echo_supervisord_conf > /etc/supervisor/supervisord.conf
[supervisord] #supervisord本身的日志配置
logfile=/var/log/supervisor/supervisord.log ;
pidfile=/var/run/supervisord.pid ;
```
添加管理的java进程
```
hello.conf
[program:showchat]
directory = /home/ljd/hello
command = /usr/local/jdk/bin/java -Xmx512M -Xms512M -classpath hello.jar com.ljd.Hello
autostart = true #子进程随supervisord启动而启动
startsecs = 5 #进程启动后跑了几秒，才被认定为成功启动。默认1
autorestart = true #子进程挂掉将被无条件重启
numprocs=1 #启动线程数目
user = rgbvr  #指定运行用户
environment=CHAT_SETTING_HOME=/opt/hello/config #指定程序环境变量 
stdout_logfile_maxbytes = 20MB
stdout_logfile_backups = 20
redirect_stderr = true
stdout_logfile = /home/ljd/hello.log
```