---
layout: post
title:  "Redis 迁移工具"
categories: Redis
tags: rmt
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

### 迁移校验
src/redis-migrate-tool -c single2single.conf -o log -C redis_check
src/redis-migrate-tool -c single2single.conf -o log -C "redis_check 200000"

### notes
<https://github.com/vipshop/redis-migrate-tool>
