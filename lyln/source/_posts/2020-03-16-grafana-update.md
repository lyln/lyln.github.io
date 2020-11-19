---
layout: post
title: Grafana的版本升级和数据迁移
categories: Linux
index_img: https://grafana.com/static/img/grafana/redesign-dashboard_home.png
tags: 监控
date: 2020-03-16 
---

下载最新的grafana版本
[官网下载地址](https://grafana.com/grafana/download)

```
wget https://dl.grafana.com/oss/release/grafana-6.7.4.linux-amd64.tar.gz
tar -zxvf grafana-6.7.4.linux-amd64.tar.gz
```
<!-- more -->

修改
/etc/systemd/system/grafana-server.service
```
[Unit]
Description=Grafana 6.7
Documentation=http://docs.grafana.org
Wants=network-online.target
After=network-online.target

[Service]
Type=notify
Restart=on-failure
WorkingDirectory=/data/apps/opt/grafana
RuntimeDirectory=grafana
RuntimeDirectoryMode=0750
ExecStart=/data/apps/opt/grafana/bin/grafana-server --config=/data/apps/opt/grafana/conf/defaults.ini

LimitNOFILE=10000
TimeoutStopSec=20

[Install]
WantedBy=multi-user.target
```

迁移之前grafana下的数据到data目录下，完成数据迁移。

配置文件
```
域名转发根目录跳转
# The full public facing url
#root_url = %(protocol)s://%(domain)s:%(http_port)s/
root_url = http://xxx./grafana


开启匿名登陆
#################################### Anonymous Auth ######################
[auth.anonymous]
# enable anonymous access
enabled = true
```

部署好新的grafna后，修改nginx代理解析即可。

