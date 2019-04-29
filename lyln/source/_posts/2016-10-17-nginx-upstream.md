---
layout: post
title: "nginx 负载均衡配置"
categories: Linux
tags: nginx
date: 2016/10/17
---

环境介绍
```
nginx version: nginx/1.10.1
负载机器：192.168.1.168 80
upstream机器：192.168.1.169:81
192.168.1.170:81
```
nginx安装
```
wget http://nginx.org/keys/nginx_signing.key
apt-key add nginx_signing.key
#For Ubuntu 14.04 replace codename to trusty
deb http://nginx.org/packages/ubuntu/ trusty nginx
deb-src http://nginx.org/packages/ubuntu/ trusty nginx
apt-get update
apt-get install nginx
```
<!--more-->
nginx负载配置
```
upstream haha {
   server  192.168.1.169:81;
   server  192.168.1.170:81;
}
server {
    listen       80;
    server_name  www.haha.com;
    location / {
       proxy_pass        http://haha;
       proxy_set_header   Host             $host;
       proxy_set_header   X-Real-IP        $remote_addr;
       proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
       access_log  /data1/logs/nginx/haha.log;
    }
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```
后端server配置
```
server{
        server_name 192.168.1.169;
        listen 81;
        root /web/haha/;
        index index.html index.htm;
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
                root   /usr/share/nginx/html;
        }
        #location ~ /\.ht {
        #deny  all;
        #}
}
```
测试
在后端server /web/haha/下分别写多个测试页面。
