---
layout: post
title: "Redis Cluster搭建、扩容、缩容"
categories: Redis
tags: Redis
date: 2019/10/27
---



#### 集群机器列表
redis版本 redis-cli 3.2.11
```
10.16.76.116
10.16.76.117
10.16.76.119

集群安装跑ansible脚本

master 
10.16.76.116:6000  	
10.16.76.117:6000  
10.16.76.119:6000    

slave
10.16.76.116:7000
10.16.76.117:7000
10.16.76.119:7000
```
<!--more-->
#### 初始化集群
配置主节点

方法1:
redis-trib.rb 直接初始化机器。

方法2:

a. 添加节点： cluster meet ip port
CLUSTER nodes
CLUSTER info

b. 分配槽点 16384
5462+5461+5461

sh addslots.sh分配槽点

cluster addslots {0...5461}
cluster addslots {5462...10922}
cluster addslots {10923...16384}


以上cluste就完成了，是单点的。
c.保证各个节点的高可用，给每个主节点添加一个从节点。
cluster meet ip port

slave节点上关联,必须在对应的从节点上执行
cluster replicate node_id 

```
3d401353114a1fd6359e51859f022dfdc5861bc9 10.16.76.116:6000 myself,master - 0 0 1 connected 0-5461
ec1e5df312f947c540cc64fac3cfe3aa8df1799a 10.16.76.117:6000 master - 0 1571987989678 0 connected 5462-10922
0af9d4868039dfe5c9dd212d75695a2607ada12f 10.16.76.119:6000 master - 0 1571987994688 2 connected 10923-16383

```

### 测试数据
set a,b,c分别hash到不同节点
```
get a
-> Redirected to slot [15495] located at 10.16.76.119:6000
"1"
10.16.76.119:6000> get b
-> Redirected to slot [3300] located at 10.16.76.116:6000
"2"
10.16.76.116:6000> get c
-> Redirected to slot [7365] located at 10.16.76.117:6000
"3"
```


### Redis Cluster常用命令
```
CLUSTER info：打印集群的信息。
CLUSTER nodes：列出集群当前已知的所有节点（node）的相关信息。

CLUSTER meet <ip> <port>：将ip和port所指定的节点添加到集群当中。
CLUSTER replicate <node_id>：将当前节点设置为指定节点的从节点。
CLUSTER saveconfig：手动执行命令保存保存集群的配置文件，集群默认在配置修改的时候会自动保存配置文件。

CLUSTER failover：手动进行故障转移，在slave上执行。

CLUSTER keyslot <key>：列出key被放置在哪个槽上。
CLUSTER countkeysinslot <slot>：返回槽目前包含的键值对数量。
CLUSTER getkeysinslot <slot> <count>：返回count个槽中的键。

迁移槽和数据相关命令
CLUSTER setslot <slot> importing <node_id> 从 node_id (sourceNodeId)指定的节点中导入槽 slot 到本节点
CLUSTER setslot <slot> migrating <node_id> 将本节点的槽迁移到指定的节点node_id (targetNodeId)中。
CLUSTER getkeysinslot <slot> <count>：源节点循环执行，获取count个属于槽{slot}的键。
在源节点迁移槽位中的key到目标节点：MIGRATE host port key destination-db timeout [COPY] [REPLACE]
逐个迁移：migrate 10.16.76.116 8000 key:test:x1 0 5000 replace
批量迁移：migrate 10.16.76.116 8000 "" 0 5000 keys key:test:x1 key:test:x2 key:test:x3
CLUSTER setslot <slot> node <node_id> :通知槽分配给目标节点，node_id (targetNodeId)
```


### 集群扩容
```
10.16.76.116:8000
10.16.76.117:8000
10.16.76.119:8000

原集群槽点5461-5460-5460
4096-4096-4096-4096

3d401353114a1fd6359e51859f022dfdc5861bc9 10.16.76.116:6000 master - 0 1572246866662 8 connected 0-5461
f9fb5268c416b82dc4ea7d4948895454be4186a0 10.16.76.116:8000 master - 0 1572246863153 0 connected
0af9d4868039dfe5c9dd212d75695a2607ada12f 10.16.76.119:6000 master - 0 1572246869667 2 connected 10923-16383
ec1e5df312f947c540cc64fac3cfe3aa8df1799a 10.16.76.117:6000 master - 0 1572246864657 9 connected 5462-10922
```


### 迁移数据流程
```
目的节点：
CLUSTER setslot 4096 importing 3d401353114a1fd6359e51859f022dfdc5861bc9

源节点：
CLUSTER setslot 4096 migrating f9fb5268c416b82dc4ea7d4948895454be4186a0

获取count属于槽slot的键:
CLUSTER getkeysinslot 4096 100

迁移数据到目的节点：
migrate 10.16.76.116 8000 key:test:5028 0 5000 replace
migrate 10.16.76.116 8000 "" 0 5000 keys key:test:68253 key:test:79212 

遍历所有主节点执行：
CLUSTER setslot 4096 node f9fb5268c416b82dc4ea7d4948895454be4186a0
```

### 集群收缩
```
redis-trib.rb reshard 10.16.76.116:6000

下线节点槽点迁出完成后，剩剩下的步骤需要让集群忘记该节点。
线上操场不建议直接使用cluster forget下线节点
建议使用redis-trib.rb del-node {host:port} {downNodeId}

从节点
redis-trib.rb del-node 10.16.76.117:8000 75202671eb18e504357ea8761ab6dc729b8526a2
主节点
redis-trib.rb del-node 10.16.76.116:8000 f9fb5268c416b82dc4ea7d4948895454be4186a0
```


### 故障转移

主观下线： 指某个节点认为另一个节点不可用，即下线状态。


客观下线： 集群内多个节点都认为该节点不可用。

### 集群倾斜

数据倾斜

redis-trib.rb info 查看节点槽点不均的情况。
hash数据分别，导致集群qps差距很大。


### 问题汇总
问题描述：
Moving slot 4096 from 10.16.76.116:8000 to 10.16.76.116:6000:
[ERR] Calling MIGRATE: ERR Syntax error, try CLIENT (LIST | KILL | GETNAME | SETNAME | PAUSE | REPLY)

问题解决：
1、ruby gem安装的redis库，版本不能使用最新的4.0，否则redis-trib.rb reshard 127.0.0.1:7000 重新分片时会报语法错误。
   卸载最新redis库，gem uninstall redis
   安装3.x版本，gem install redis -v 3.3.5 测试3.2.1到3.3.5都可以，4.x以上的分片报错
2、使用fix来进行修复，具体命令如下：
   redis-trib.rb fix 10.16.76.116:6000


### redis参数

//connectionTimeout 连接超时（默认2000ms）
//soTimeout 响应超时（默认2000ms）
