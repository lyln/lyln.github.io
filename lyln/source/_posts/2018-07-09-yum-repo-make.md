---
layout: post
title:  "YUM源制作"
categories: Linux
tags: yum
date: 2018/07/09
---

### 安装createrepo
```
yum install createrepo

创建本地仓库
createrepo /data/repo/RPMS
添加rpm包，更新本地仓库
createrepo --update /data/repo/RPMS

此命令只能下载主机未安装的包
yum install 包名 --downloadonly --downloaddir=/data/repo

如果本机器已经安装，下载相关包
yum reinstall 包名 --downloadonly --downloaddir=/data/repo

指定仓库安装
yum  --disablerepo=openstack-kilo,openstack-liberty,openstack-mitaka,7ASU3-updates  --enablerepo=appserver  localinstall -y —nogpgcheck monit 
```
<!--more-->
### nginx配置

```
cat repo.conf
server {
    listen       8080;
    server_name  0.0.0.0;


    access_log  logs/repo.access.log  main;

    root /data/repo/RPMS;
    autoindex on;
    location / {
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   html;
    }
}

```

### 使用自建repo源
```
 cat /etc/yum.repos.d/appserver.repo
[appserver]
name=Extra Packages for appserver - $basearch
baseurl=http://10.16.76.135:8080
gpgcheck=0
enabled=1
```