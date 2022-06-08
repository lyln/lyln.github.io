---
layout: post
title: 轻量日志系统Loki初试
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/loki.jpg
tags: Loki
date: 2020-12-20 
---

### Loki架构

![loki](https://inshub.oss-cn-beijing.aliyuncs.com/blog/loki.jpg)

### Loki部署

```
$ curl -O -L "wget https://github.91chifun.workers.dev//https://github.com/grafana/loki/releases/download/v2.0.0/loki-linux-amd64.zip"
# extract the binary
$ unzip "loki-linux-amd64.zip"
# make sure it is executable
$ chmod a+x "loki-linux-amd64"

loki-local-config.yml

auth_enabled: false
server:
  http_listen_port: 3100 # 监听端口

ingester:
  lifecycler:
    address: 0.0.0.0 # 监听地址
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s
  max_transfer_retries: 0

schema_config:
  configs:
    - from: 2018-04-15
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 144h  #  每张表的时间范围 6天
      chunks:
        period: 144h

storage_config:
#  流文件存储地址
  boltdb:
    directory: /data/apps/opt/loki/index
#  索引存储地址
  filesystem:
    directory: /data/apps/opt/loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 144h

chunk_store_config:
  max_look_back_period: 2160h  # 最大可查询历史日期 90天

table_manager:   # 表的保留期90天
  retention_deletes_enabled: true
  retention_period: 2160h


nohup ./loki-linux-amd64 -config.file=./loki-local-config.yml > loki.log 2>&1 &

```



### promtail部署

```
wget https://github.91chifun.workers.dev//https://github.com/grafana/loki/releases/download/v2.0.0/promtail-linux-amd64.zip
unzip promtail-linux-amd64.zip

promtail-local-config.yaml

server:
  http_listen_port: 9080
  grpc_listen_port: 0
  
positions:
  filename: /etc/promtail/positions.yaml   # 游标记录上一次同步位置
  sync_period: 10s #10秒钟同步一次

clients:
  - url: http://localhost:3100/loki/api/v1/push # loki服务地址
 
scrape_configs:
- job_name: system
  static_configs:
  - targets:
      - localhost
    labels:
      job: nginx-logs # labels名称
      __path__: /data/wwwlogs/access.log # 采集日志的路径
      
启动   
nohup ./promtail-linux-amd64 -config.file promtail-local-config.yaml > promtai.log 2>&1 &   
```

![loki](https://inshub.oss-cn-beijing.aliyuncs.com/blog/loki-nginx-log.jpg)

### LogQL语法（Loki）

**日志流选择器**（log stream selector）

对于查询表达式的标签部分，将其包装在花括号中`{}`

- =等于
- !=不相等
- =~正则表达式匹配
- !~不匹配正则表达式

```
{job="nginx-error-logs"} 
```

**过滤器表达式**（filter expression）

编写日志流选择器后，您可以通过编写搜索表达式来进一步过滤结果。

```
{job="nginx-error-logs"} |= "ss.sohu.com"
```

已实现以下过滤器类型：

- |= 行包含字符串。
- != 行不包含字符串。
- |~ 行匹配正则表达式。
- !~ 行与正则表达式不匹配。

**日志度量**

LogQL同样也支持有限的`区间向量`度量语句，使用方式也和PromQL类似，常用函数主要是如下4个：

- rate: 计算每秒的日志条目
- count_over_time: 对指定范围内的每个日志流的条目进行计数
- bytes_rate: 计算日志流每秒的字节数
- bytes_over_time: 对指定范围内的每个日志流的使用的字节数

**日志统计**

- rate: calculate the number of entries per second

  ```
  rate(({job="nginx-error-logs"} |= "abc.com"[60s]))
  ```

- Get the count of logs during the last five minutes, grouping by level:

  ```
  sum(count_over_time({job="mysql"}[5m])) by (level)
  ```

- Get the top 10 applications by the highest log throughput:

  ```
  topk(10,sum(rate({region="us-east1"}[5m])) by (name))
  ```

- Get the rate of HTTP GET requests from NGINX logs:

  ```
  avg(rate(({job="nginx"} |= "GET")[10s])) by (region)
  ```

  

**聚合函数**

- sum: Calculate sum over labels
- min: Select minimum over labels
- max: Select maximum over labels
- avg: Calculate the average over labels
- stddev: Calculate the population standard deviation over labels
- stdvar: Calculate the population standard variance over labels
- count: Count number of elements in the vector
- bottomk: Select smallest k elements by sample value
- topk: Select largest k elements by sample value

### 问题汇总

问题描述：

```
error="server returned HTTP status 429 Too Many Requests (429): Ingestion rate limit exceeded (limit: 4194304 bytes/sec) while attempting to ingest '2494' lines totaling '1048456' bytes, reduce log volume or contact your Loki administrator to see if the limit can be increased"
```

问题解决：

修改loki的配置文件,在limits_config中添加

```
limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
  ingestion_rate_mb: 15 # 增加配置
```

### 参考链接

<https://lian.st/4114.html>

<https://happywzy.top/ri-zhi-ju-he-gong-ju-loki-shi-yong-logql/>

<https://github.com/grafana/loki/blob/v1.5.0/docs/logql.md>

<https://grafana.com/docs/loki/latest/clients/promtail/pipelines/>

<https://promcon.io/2019-munich/slides/lt1-08_logql-in-5-minutes.pdf>