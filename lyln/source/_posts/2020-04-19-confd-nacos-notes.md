---
layout: post
title: 使用confd+nacos以无侵入方式管理nginx
categories: Nginx
index_img: https://nacos.io/img/nacosMap.jpg
tags: confd nacos
date: 2020-04-19 
---

### confd部署

```
mkdir -p $GOPATH/src/github.com/kelseyhightower
wget https://github.com/nacos-group/nacos-confd/archive/v0.19.2.tar.gz
tar -xvf v0.19.2.tar.gz -C $GOPATH/src/github.com/kelseyhightower

cd $GOPATH/src/github.com/kelseyhightower/nacos-confd-0.19.1
make
sudo cp bin/confd /usr/local/bin

./confd -version
confd 0.17.0-dev (Git SHA: , Go Version: go1.14.2)

```
<!-- more -->
### confd的配置
confd.toml为confd服务本身的配置文件，主要记录了使用的存储后端、协议、confdir等参数。
/etc/confd/confd.toml by default
存储后端nacos配置：
```
backend = "nacos"
confdir = "/etc/confd"
#log-level = "debug"
interval = 5
nodes = [
  "http://192.168.1.101:8848",
]
scheme = "http"
watch = true
```

### 创建confdir
confdir底下包含两个目录:

conf.d:confd的配置文件，主要包含配置的生成逻辑，例如模板源，后端存储对应的keys，命令执行等。
templates:配置模板Template，即基于不同组件的配置，修改为符合 Golang text templates的模板文件。

参数说明：

必要参数
dest (string) - The target file.
keys (array of strings) - An array of keys.
src (string) - The relative path of a configuration template.

可选参数
gid (int) - The gid that should own the file. Defaults to the effective gid.
mode (string) - The permission mode of the file.
uid (int) - The uid that should own the file. Defaults to the effective uid.
reload_cmd (string) - The command to reload config.
check_cmd (string) - The command to check config. Use `` to reference the rendered source template.
prefix (string) - The string to prefix to keys.
```
mkdir -p /etc/confd/{conf.d,templates}
cd conf.d 
---
newsinfo.toml

[template]
src = "newsinfo.conf.tmpl"
dest = "/tmp/newsinfo.conf"
#prefix = "/nginx/newsinfo"
keys = [
    "/nginx/newsinfo/dev/newsinfo/conf",
]
#check_cmd = "/usr/local/nginx/sbin/nginx -t -c {{.src}}"
#reload_cmd = "/usr/local/nginx/sbin/nginx -s reload"
---
newsinfo.conf.tmpl

{{$data := json (getv "/nginx/newsinfo/dev/newsinfo/conf")}}
{{$locations := $data.location}}

{{range $locations }}
upstream {{ $data.usage_prefix }}{{ .interface }} {
     {{ range .upstream.backend }}
     server {{ .}}; {{end}}
}
{{ end }}
server {

    listen       80;
    server_name  {{ $data.server_name }}

    location / {
        root   html;
        index  index.html index.htm;
        proxy_connect_timeout    30s;
        proxy_set_header Host $host:$server_port;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass     http://debug_ready_sohuzixun;
    }

    {{range $locations }}
    location ^~ /{{ .interface }} {
        proxy_pass  http://{{ $data.usage_prefix }}{{ .interface }};
        proxy_connect_timeout   30s;
        proxy_set_header Host $host:$server_port;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    {{ end }}
}
```

### confd启动
confd支持以daemon或者onetime两种模式运行
```
/usr/local/bin/confd -config-file /etc/confd/conf/confd.toml
nohup /usr/local/bin/confd -config-file /etc/confd/conf/confd.toml > confd.log 2>&1 &
```


### nacos部署


### 问题汇总
问题描述：
 -bash: .confd/: 无法执行二进制文件
问题解决：
同步到服务器上，make


links:
<https://github.com/kelseyhightower/confd/tree/master/docs>