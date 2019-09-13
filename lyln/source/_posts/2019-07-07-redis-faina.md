---
layout: post
title:  "redis性能分析工具redis-faina"
categories: Redis
tags: redis
date: 2019/07/07
---

redis-faina是一个通过解析redis的MONITOR命令，从而对redis实例进行性能诊断的工具。 
该工具使用虽然简单，但是功能还是很不错，对于定位线上redis性能问题，确实是一把利器。


### 通过redis MONITOR命令保存文件用于分析
```
redis-cli -h 192.168.1.110 -p 6700 monitor |head -n 5000 > redis-6700.txt
redis-cli -h 192.168.1.111 -p 6701 monitor |head -n 5000 > redis-6701.txt
```

<!--more-->
### redis-faina读取MONITOR日志进行分析：

```
./redis-faina.py ../redis_monitor_cmd/redis-6701.txt
Overall Stats
========================================
Lines Processed  	5000   --- 总命令数
Commands/Sec     	16348.00 --- QPS

Top Prefixes  ---前缀最多的数据
========================================
dailyreward      	873	(17.46%)
EXPEND_COIN_KEY  	483	(9.66%)
exclusivereward  	474	(9.48%)
user             	465	(9.30%)
u                	217	(4.34%)
redPackFeed      	206	(4.12%)
vouchers         	131	(2.62%)
newhandtask      	122	(2.44%)

Top Keys ---使用最多的key
========================================
welfareRead                                    	1566	(31.32%)
dailyreward:xx:xx  	72  	(1.44%)
dailyreward:xx:xx  	72  	(1.44%)
dailyreward:xx:xx  	72  	(1.44%)
dailyreward:xx:xx  	64  	(1.28%)
dailyreward:xx:xx   62  	(1.24%)
dailyreward:xx:xx  	60  	(1.20%)
dailyreward:xx:xx   59  	(1.18%)

Top Commands ---使用的最多的命令
========================================
HGET      	4035	(80.70%)
EXPIREAT  	416 	(8.32%)
PING      	137 	(2.74%)
HMGET     	115 	(2.30%)
HINCRBY   	61  	(1.22%)
LRANGE    	39  	(0.78%)
EXPIRE    	35  	(0.70%)
HSET      	30  	(0.60%)

Command Time (microsecs) ---请求的响应时间分布
========================================
Median  	39.0
75%     	77.0
90%     	136.25
99%     	326.0

Heaviest Commands (microsecs) ---总体耗时最多的命令
========================================
HGET      	245469.75
EXPIREAT  	25063.5
PING      	9035.25
HMGET     	8282.0
HINCRBY   	4135.25
EXPIRE    	2172.75
LRANGE    	2000.75
HSET      	1749.5

Slowest Calls  --- 慢请求列表
========================================
620.0   	"HGET" "welfareRead" "3"
571.75  	"HGET" "welfareRead" "3"
531.5   	"HGET" "x"
494.75  	"HGET" "x"
489.0   	"EXPIREAT" "x"
477.0   	"HGET" "x"
471.0   	"HGET" "x"
470.25  	"HMGET" "x"
```

### notes:
由于redis MONITOR输出的只有请求开始的时间，所以在一个非常繁忙的redis实例中，根据该请求的开始时间以及下一个请求的开始时间，可以大概估算出一个请求的执行时间。由此可以看出，redis-faina统计的时间并不是十分精确的，尤其在分析一个非常闲的redis实例时，分析的结果可能差的很多。