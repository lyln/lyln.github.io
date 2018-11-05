---
layout: post
title: "Smokeping nginx 安装小记"
categories: Linux
tags: Smokeping
---

### nginx支持cgi
```
aptitude install fcgiwrap
```
nginx配置
```
smokeping.conf

server {
    listen      80;
    server_name 192.168.1.158;
    #charset koi8-r;
    access_log  /data/log/nginx/smokeping_access.log ;
    error_log  /data/log/nginx/smokeping_error.log;
    root  /opt/smokeping;
    index index.html index.htm index.php portal.php default.php;
    #error_page  404              /404.html;
    # redirect server error pages to the static page /50x.html
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
    # Include this file on your nginx.conf to support debian cgi-bin scripts using
    # fcgiwrap
    location ~ .*\.fcgi$ { 
	# Disable gzip (it makes scripts feel slower since they have to complete
	# before getting gzipped)
	gzip off;
	# Set the root to /usr/lib (inside this location this means that we are
	# giving access to the files under /usr/lib/cgi-bin)
	root  /opt/smokeping/htdocs;
	# Fastcgi socket
	fastcgi_pass  unix:/var/run/fcgiwrap.socket;
	# Fastcgi parameters, include the standard ones
	include /etc/nginx/fastcgi_params;
	# Adjust non standard parameters (SCRIPT_FILENAME)
	#fastcgi_param SCRIPT_FILENAME  /usr/lib$fastcgi_script_name;
	fastcgi_param   SCRIPT_FILENAME /opt/smokeping/htdocs$fastcgi_script_name;
    }
    # deny access to .htaccess files, if Apache's document root
    location ~ /\.ht {
        deny  all;
    }
}
```
<!--more-->
添加测试的cgi页面
```
helloworld.cgi

#!/usr/bin/perl  
print "Content-type: text/html\n\n";  
print "Hello, world.";
```

#### smokeping安装
1、编译安装
```
./configure --prefix=/opt/smokeping
make -j4
make install
cd /opt/smokeping
mkdir cache data var
然后修改etc/config文件
chmod 400 /opt/smokeping/etc/smokeping_secrets.dist
```
2、smokeping启动
```
./bin/smokeping --config=/opt/smokeping/etc/config #启动
./bin/smokeping --config=/opt/smokeping/etc/config --debug
./bin/smokeping --config=/opt/smokeping/etc/config --logfile=smoke.log
```
3、中文显示
```
aptitude install  fonts-wqy-zenhei

配置etc/config文件

*** Presentation ***
charset = utf-8  #中文显示
*** Targets ***
probe = FPing
menu = Top
title = Network Latency Grapher
remark = Welcome to the SmokePing website of xxx Company. \
         Here you will learn all about the latency of our network.
+ Network
menu= Targets
title= network status
#parents = owner:/Test/James location:/
++Lyln
menu = alldevices
title = network status
host = /Network/status1 /Network/status2  
++status1
menu = status1
title = status1
host = www.baidu.com
++status2
menu = status2
title = status2
host = www.163.com
```

[参考地址](https://oss.oetiker.ch/smokeping/doc/smokeping_install.en.html)
[配置文件](https://raw.githubusercontent.com/lyln/Shell/master/config-files/smokeping/config)

#### notes:
smokeping踩坑记录：
有图没数据处纠结很久，原因是因为配置的ip地址禁ping了。