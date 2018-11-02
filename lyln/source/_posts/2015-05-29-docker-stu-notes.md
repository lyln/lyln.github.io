---
layout: post
title: "Docker笔记"
categories: Docker
tags: Docker
---

#### 安装 
在Ubuntu 14.04.2 LTS安装docker
```bash
sudo apt-get update
sudo apt-get install docker.io
依赖安装aufs-tools cgroup-lite git git-man liberror-perl
```
查看docker版本和系统信息
```bash
docker version
docker info
```
<!--more-->
#### 升级
docker 1.3后才支持docker exec命令。
```bash
apt-get install apt-transport-https
apt-get update
apt-get -u -y upgrade lxc-docker 或者<br>
curl -sSL https://get.docker.com/ | sh
```
#### docker镜像
docker中,images镜像更像是一张光盘，container容器是安装好的系统。
images常用命令
```bash
docker images 查看已有镜像
docker search "softname" 
docker pull "softname":"tags" 默认lastest
```

常见images镜像方法：
1. 编写Dockerfile文件
2. 现有容器commit

#### docker容器
```bash
docker run -it ubuntu:14.04 /bin/bash
-t 分配一个虚拟终端
-i 获取当前输入
--name 给容器命名
-e 设置变量

docker exec -it "IMAGE ID" /bin/bash 进入容器

docker ps -l 列出最近一次的容器
docker ps -a 列出所有的容器
docker ps 列出正在运行的容器

docker inspect --format='{{.NetworkSettings.IPAddress}}' "IMAGE ID" 获取容器ip
docker rm `docker ps -qa` 批量删除容器
```
docker run 进入终端后，退出后容器关闭，docker exec退出后不关闭。exec命令在docker1.3后才支持，升级方法见上文。

#### Dockerfile小实例
```bash
mkdir sshd_ubuntu
cd sshd_ubuntu && ls
authorized_keys  Dockerfile  run.sh

authorized_keys 将要登陆的公钥添加到此文件 

run.sh文件,创建启动运行sshd脚本
#!/bin/bash
/usr/sbin/sshd -D

Dockerfile 文件
FROM ubuntu:14.04
MAINTAINER ljdevops@gmail.com
RUN apt-get update

#install ssh server 
RUN apt-get install -y openssh-server
RUN mkdir -p /var/run/sshd
RUN mkdir -p /root/.ssh

ADD authorized_keys /root/.ssh/authorized_keys
ADD run.sh /run.sh
RUN chmod 755 /run.sh

EXPOSE 22

CMD ["/run.sh"]


docker build -t sshd:ubuntu .

docker images 查看创建的镜像
```


