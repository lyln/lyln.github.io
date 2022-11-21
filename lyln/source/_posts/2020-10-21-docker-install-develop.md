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
持久化数据库
-v /opt/mysql/data:/var/lib/mysql 
配置文件挂载
-v /opt/data/my.cnf:/etc/my.cnf
docker logs mysql1 2>&1 | grep GENERATED
GENERATED ROOT PASSWORD: Axegh3kAJyDLaRuBemecis&EShOs
docker exec -it my-db mysql -uroot -p
> ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
> create user admin@'%' identified by 'admin';
> grant all privileges on *.* to admin@'%’;
查看创建用户
> select user,host,authentication_string from mysql.user;

重置密码
1.修改mysql skip-grant-tables
2.重启docker restart my-db
3.登陆修改 
update mysql.user set authentication_string = password("12121") where user="root";

```

参考地址：

<https://hub.docker.com/r/mysql/mysql-server/>

#### PostgreSQL开发环境

```
docker run -d \
--privileged \
--name postgres \
-e POSTGRES_USER='postgres' \
-e POSTGRES_PASSWORD='admin' \
-e PGDATA=/var/lib/postgresql/data/pgdata \
-v /data/apps/postgresql/data:/var/lib/postgresql/data \
-p 5432:5432 \
postgres:14

#登录数据库
psql -U postgres -W
select version();
```

参考地址：

https://hub.docker.com/_/postgres

#### RabbitMQ开发环境

```
注意：latest版本没有管理界面，需要管理界面请选择management版本。
docker run -d \
--name=my-rabbitmq \
-p 5672:5672 \
-p 15672:15672  \
-e RABBITMQ_DEFAULT_USER=admin \
-e RABBITMQ_DEFAULT_PASS=pass  \
-v /data/apps/rabbitmq:/var/lib/rabbitmq \
rabbitmq:3.6.14-management

说明：15672是管理界面端口，5672是服务端口。25672是集群端口

```

参考地址：

https://hub.docker.com/_/rabbitmq

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
#开放映射ip段
-p 8081-8091:8081-8091

```

参考地址：

<https://hub.docker.com/_/nginx>

#### OpenResty开发环境

```

docker run -d --name my-openresty -v /root/nginx/openresty:/etc/nginx/conf.d -p 8092-8099:8092-8099 openresty/openresty:1.21.4.1-centos7
#开放映射ip段
-p 8092-8099:8092-8099

```

参考地址：

https://hub.docker.com/r/openresty/openresty

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
