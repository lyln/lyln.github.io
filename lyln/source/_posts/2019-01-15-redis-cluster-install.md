---
layout: post
title:  "Redis Cluster集群搭建"
categories: Redis
tags: Redis
date: 2019/01/15
---

### redis cluster集群构建
10.16.76.144 6000
10.16.76.144 6001
10.16.76.144 6002

集群密码：abcdefg

### 配置主节点
```
10.16.76.144 6000
cluster meet 10.16.76.144 6001
cluster meet 10.16.76.144 6002

cluster nodes
cluster info

```
### 分配槽位
node1分配：0~5461
node2分配：5462~10922
node3分配：10923~16383

<!--more-->
分配脚本addslots.sh
```
#!/bin/bash
REDIS_CLI=`which redis-cli`
REDIS_PASS=''

#node1
n=0
for ((i=n;i<=5461;i++))
do
   $REDIS-CLI -h 10.16.76.144 -p 6000 -a $REDIS_PASS CLUSTER ADDSLOTS $i
done

#node2
n=5462
for ((i=n;i<=10922;i++))
do
   $REDIS-CLI -h 10.16.76.144 -p 6001 -a $REDIS_PASS CLUSTER ADDSLOTS $i
done

#node3
#!/bin/bash
n=10923
for ((i=n;i<=16383;i++))
do
   $REDIS-CLI -h 10.16.76.144 -p 6002 -a $REDIS_PASS CLUSTER ADDSLOTS $i
done

```

### redis集群动态添加密码
```
config rewrite 写入配置

for i in {6000..6002}; do echo $i;done

for i in {6000..6002};  do echo $i; redis-cli -c -h 10.16.76.144 -p $i config set requirepass abcdefg ;done
```

### redis cluster常用命令
```
查看key所在slot
cluster keyslot key_name
```