---
layout: post
title: etcd部署及数据迁移
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/etcd.jpg
tags: etcd
date: 2020-11-21
---

### 环境概况

```
etcdctl version 2.3.7
```
最近迁移没人维护的老项目，涉及etcd2 服务的迁移，项目代码没人维护，所以只能平迁到etcd2版本。本来很简单的问题，结果快被整崩溃了。
遂记录下迁移过程。

问题：

```
 etcd[7663]: request cluster ID mismatch (got 75dea77f7702 want bfa24343767ba2e5)

```
迁移顺序不对就如上错误。

![etcd_error](https://inshub.oss-cn-beijing.aliyuncs.com/blog/etcd_error.jpg)

### 部署etcd
部署使用原来k8s 安装etcd服务的ansible脚本，直接部署成功。
下面操作需要注意顺序～～～
停止集群所有节点etcd服务，清空data-dir目录数据待用。

### 备份旧版本数据
```
./etcdctl backup --data-dir /data/apps/data/etcd -backup-dir /tmp/etcd_backup
```
备份成功的数据同步到新部署集群的etcd1节点data-dir数据目录

使用 -–force-new-cluster 参数启动Etcd服务。这个参数会重置集群ID和集群的所有成员信息。
```
# -initial-cluster
INITIAL_CLUSTER='-initial-cluster etcd1=http://192.168.1.101:2380'
# -initial-cluster-state
INITIAL_CLUSTER_STATE='-initial-cluster-state existing'
# -data-dir
DATA_DIR='-data-dir /data/apps/data/etcd'
# other parameters
ETCD_OPTS='--force-new-cluster='true''
#ETCD_OPTS=''
```

由于etcdctl不具备修改成员节点参数的功能，使用API操作要来完成。
```
./bin/etcdctl --endpoints http://localhost:2379 member list

curl http://127.0.0.1:2379/v2/members/xxx_id -XPUT \
 -H "Content-Type:application/json" -d '{"peerURLs":["http://192.168.1.101:2380"]}'
```
启动etcd1节点。

### etcd添加节点
etcd添加新节点顺序，首先添加etcd2节点到集群，然后再重启服务。
```
etcd1执行，添加新节点操作
./bin/etcdctl --endpoints http://localhost:2379 member add etcd2 http://192.168.1.102:2380
```

修改etcd2配置
```
# -initial-cluster
INITIAL_CLUSTER='-initial-cluster etcd1=192.168.1.101:2380,etcd2=http://192.168.1.102:2380'
# -initial-cluster-state
INITIAL_CLUSTER_STATE='-initial-cluster-state existing'
```
etcd2启动成功，etcd3同上，区别完善下INITIAL_CLUSTER 节点列表。


将各节点etcd.conf配置文件的变量ETCD_INITIAL_CLUSTER添加新节点信息，然后依次重启。

### 常用命令
```
./bin/etcdctl --endpoints http://localhost:2379 cluster-health
./bin/etcdctl --endpoints http://localhost:2379 member list
./bin/etcdctl --endpoints http://localhost:2379 member add etcd2 http://192.168.1.102:2380
./bin/etcdctl --endpoints http://localhost:2379 member remove cluster_id

```

参考地址：
<https://jusene.github.io/2017/11/12/etcd-cluster/>
<https://www.cnblogs.com/ilifeilong/p/11625151.html>


