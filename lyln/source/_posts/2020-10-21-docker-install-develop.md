---
layout: post
title: Docker快速构建测试环境
categories: Docker
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/docker.png
tags: docker mysql redis
date: 2020-10-21
---

**快速构建各种开发测试环境汇总**

#### MySQL5.7开发环境

```shell
docker run --name=my-db -p3306:3306 -d mysql/mysql-server:5.7
获取临时密码
docker logs mysql1 2>&1 | grep GENERATED
GENERATED ROOT PASSWORD: Axegh3kAJyDLaRuBemecis&EShOs
docker exec -it my-db mysql -uroot -p
> ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
> create user admin@'%' identified by 'admin123';
> grant all privileges on *.* to admin@'%’;
查看创建用户
> select user,host,authentication_string from mysql.user;
```

参考地址：

<https://hub.docker.com/r/mysql/mysql-server/>

#### Redis开发环境

```shell
docker run --name my-redis -p6379:6379 -d redis

--requirepass 'xxx' 
```

参考地址：

<https://hub.docker.com/_/redis>



#### Nacos开发环境

```shell
docker run -e MODE=standalone -e PREFER_HOST_MODE=hostname --name my-nacos -p 8848:8848 -d nacos/nacos-server:1.2.1

```

参考地址：

<https://github.com/nacos-group/nacos-docker>



#### Nginx开发环境

```
docker run --name my-nginx -d -p 9090:80 nginx

nginx映射配置
/etc/nginx/conf.d
docker run --name my-nginx -v /root/confd_nginx:/etc/nginx/conf.d -d -p 9090:80 nginx
```

参考地址：

<https://hub.docker.com/_/nginx>



#### Grafana开发环境

```shell
docker run -d --name=my-grafana -p 7000:3000 grafana/grafana:7.3.4

```

参考地址：

<https://hub.docker.com/r/grafana/grafana>



### Prometheus开发环境

```
bind-mount the directory containing prometheus.yml onto /etc/prometheus by running:

docker run -d --name=my-prometheus \
    -p 9090:9090 \
    -v /data/apps/opt/prometheus:/etc/prometheus \
    prom/prometheus
```

参考地址：

<https://prometheus.io/docs/prometheus/latest/installation/>



### MinIO 对象存储服务

MinIO 是一个基于Apache License v2.0开源协议的对象存储服务。它兼容亚马逊S3云存储服务接口，非常适合于存储大容量非结构化的数据，例如图片、视频、日志文件、备份数据和容器/虚拟机镜像等，而一个对象文件可以是任意大小，从几kb到最大5T不等。

MinIO是一个非常轻量的服务,可以很简单的和其他应用的结合，类似 NodeJS, Redis 或者 MySQL。

```
docker run --name=my-minio -d -p 9000:9000 \
  -e "MINIO_ACCESS_KEY=admin" \
  -e "MINIO_SECRET_KEY=admin123" \
  -v /data/apps/data/:/data \
  minio/minio server /data 
```

参考地址：

<https://docs.min.io/cn/minio-quickstart-guide.html>
