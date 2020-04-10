---
layout: post
title:  "Redis 迁移工具"
categories: Redis
tags: rmt RedisShake
date: 2019/03/21
---

### rmt安装
Redis-Migrate-Tool集群迁移工具，基于redis复制，快速，稳定。

[github地址](https://github.com/vipshop/redis-migrate-tool)

```
cd redis-migrate-tool
autoreconf -fvi
./configure
make
src/redis-migrate-tool -h
```
<!--more-->
### 迁移

单实例迁移到单实例
```
执行迁移
src/redis-migrate-tool -c single2single.conf -o single2single.log -d

single2single.conf

[source]
type: single
servers:
 - 192.168.1.100:6379
redis_auth: 123456

[target]
type: single
servers:
 - 192.168.1.111:6379
redis_auth: abcdef

[common]
listen: 0.0.0.0:8888
threads: 4
step: 2
mbuf_size: 1024
source_safe: true
```

单实例迁移到集群
```
执行迁移
src/redis-migrate-tool -c single2cluster.conf -o single2cluster.log -d

single2cluster.conf

[source]
type: single
servers:
 - 192.168.1.100:6379
redis_auth: 123456

[target]
type: redis cluster
servers:
 - 192.168.1.111:6379
redis_auth: abcdef

[common]
listen: 0.0.0.0:9999
threads: 4
step: 2
mbuf_size: 1024
source_safe: true
```


### RedisShake
redis-shake是阿里云Redis&MongoDB团队开源的用于redis数据同步的工具。[RedisShake地址](https://github.com/alibaba/RedisShake/releases)

下载解压即可食用

集群版cluster到集群版cluster配置举例
```
source.type: cluster
source.address: 10.1.1.1:20441;10.1.1.1:20443;10.1.1.1:20445
source.password_raw: 12345
target.type: cluster
target.address: 10.1.1.1:20551;10.1.1.1:20553;10.1.1.1:20555
target.password_raw: 12345
```

对于source.address或者target.address，需要配置源端的所有集群中db节点列表以及目的端集群所有db节点列表，用户也可以启用自动发现机制，地址以'@'开头，redis-shake将会根据cluster nodes命令自动去探测有几个节点。对于source.address，用户可以在'@'前面配置master（默认）或者slave表示分表从master或者slave进行拉取；对于target.address，只能是master或者不配置：
```
source.address: master@10.1.1.1:20441 # 将会自动探测到10.1.1.1:20441集群下的所有节点，并从所有master进行拉取。
target.address: @10.1.1.1:20551 # 将会自动探测到10.1.1.1:20551集群下的所有节点，并写入所有master。
```
可以手动写所有节点，也可以@写一个自动探测。

### 启动停止
```
/data/apps/opt/redis-shake
/start.sh redis-shake.conf rsync
/stop.sh redis-shake.pid

```

### redis-shake 迁移监控
用户可以通过我们提供的restful拉取metric来对redis-shake进行实时监控：curl 127.0.0.1:9320/metric

校验使用redis-migrate-tool 随机校验或者使用show_redis_map.sh脚本看下大概key总量。


### 迁移校验
src/redis-migrate-tool -c single2single.conf -o log -C redis_check
src/redis-migrate-tool -c single2single.conf -o log -C "redis_check 200000"

### notes
<https://github.com/vipshop/redis-migrate-tool>
<https://github.com/alibaba/RedisShake>
