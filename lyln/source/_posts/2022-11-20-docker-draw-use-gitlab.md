---
layout: post
title: 搭建draw.io并配置gitlab作为存储
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/image-20221121144835974.png
tags: draw gitlab
date: 2022-11-20
---

#### 搭建draw.io
```
docker run -d --rm --name=draw \
-p 9080:8080 -p 9443:8443 \
-v /data/apps/draw-io/index.html:/usr/local/tomcat/webapps/draw/index.html \
-e DRAWIO_GITLAB_URL=http://gitlab_url \
-e DRAWIO_GITLAB_ID=gitlab_id \
fjudith/draw.io
```

`DRAWIO_GITLAB_URL`:  gitlab地址

`DRAWIO_GITLAB_ID`：gitlab管理中心申请新的应用ID

-v 挂载项可选

访问：http://host_ip:9080/

参考地址：
https://hub.docker.com/r/fjudith/draw.io



#### drawio和gitlab整合

**gitlab申请application_id**

管理中心-应用-New application
Redirect URI http://draw_url:9080/gitlab.html	
Trusted

获得**应用程序ID**	

**draw配置**

draw.io版本中增加了PreConfig.js，
可以在启动docker容器时，配置DRAWIO_GITLAB_URL 和 DRAWIO_GITLAB_ID

参数参考：https://github.com/fjudith/docker-draw.io/blob/master/docker-compose.yml

删除重新创建draw容器，增加DRAWIO_GITLAB_URL和 DRAWIO_GITLAB_ID环境变量。

#### drawio使用

新建drawio-file gitlab项目，打开draw_url:9080选择使用gitlab存储。（ps：认证过程忽略～）

![image-20221121144200293](https://inshub.oss-cn-beijing.aliyuncs.com/blog/image-20221121144200293.png)

修改显示语言，设置样式，使用google自定义字体（ZCOOL KuaiLe）等

![image-20221121144835974](https://inshub.oss-cn-beijing.aliyuncs.com/blog/image-20221121144835974.png)

参考地址：

https://juejin.cn/post/6995873463684562974

#### drawio xml转为png

使用jeknins将giltab存储的项目转换成png图上传到oss供查看。

实现可以参考https://github.com/b1f6c1c4/draw.io-export 

docker 挂载可以转换成功，指定转发方式可修改convert.sh脚本

```
docker run --rm \
         -v /data/apps/draw-io/drawio-file:/files \
         b1f6c1c4/draw.io-export
```

npm 安装并没有转换成功～

npm安装错误提示解决。

```
error while loading shared libraries: libatk-bridge-2.0.so.0: cannot open shared object file: No such file or directory
error while loading shared libraries: libxkbcommon.so.0: cannot open shared objec

yum install -y libxkbcommon
yum install -y at-spi2-atk 

```

