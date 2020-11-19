---
layout: post
title: nginx实现四层代理
categories: Linux
index_img: https://wx2.sinaimg.cn/large/005yWAylly1gkfh5x58bsj311y0lcwfe.jpg
tags: Nginx
date: 2020-03-14
---


Nginx 从1.9.0开始发布ngx_stream_core_module模块，该模块支持tcp代理及负载均衡。

在编译时通过指定--with-stream参数来激活这个模块。

Nginx编译后参数如下
```
-prefix=/usr/local/nginx --with-http_stub_status_module --with-http_ssl_module --with-http_realip_module --with-pcre --with-stream --with-http_perl_module --with-http_secure_link_module --with-http_auth_request_module --with-http_sub_module --with-http_gzip_static_module --add-module=../nginx-module-vts --add-module=../nginx-upsync-module
```
<!--more-->

### 实现SSH转发
stream代码块与http代码块同级别
```
stream {  
    upstream ssh_proxy {
        hash $remote_addr consistent;
        server 10.16.76.116:22;
        server 10.16.76.119:22;
    }
    server {
        listen 2222;
        proxy_connect_timeout 1s;
        proxy_timeout 300s;
        proxy_pass ssh_proxy;
        
    }
}
```

### MYSQL负载均衡
```
stream {
    upstream mysql_proxy {
#hash $remote_addr consistent;
        server 10.18.70.70:3307;
    }

    server {
        listen 3333;
        proxy_connect_timeout 1s;
        proxy_timeout 300s;
        proxy_pass mysql_proxy;
    }
}

```


### 测试验证
```
ssh -p 2222  root@nginx_ip

mysql -P 3333  -h nginx_ip -u mysql_user -p

```


### notes
stream日志模块 nginx 1.11.4之后版本才支持。
