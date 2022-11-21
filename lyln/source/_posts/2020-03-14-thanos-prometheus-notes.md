---
layout: post
title: prometheus集群模式thanos部署
categories: Linux
tags: 监控 thanos prometheus
index_img: https://prometheus.io/assets/architecture.png
date: 2020-03-13 
---

#### 检查prometheus.yml配置是否有效
如果配置错误，prometheus将无法重新加载，但如果启动时没有启动，则无法启动。
因此，在通过持续集成或类似机制检查配置之前检查配置是否合适是明智的。
```
./promtool check config prometheus.yml 
```

#### prometheus 大内存问题

随着规模变大，prometheus需要的cpu和内存都会升高，内存一般先达到瓶颈，这个时候要么加内存，要么集群分片减少单机指标。
原因：
1、prometheus 的内存消耗主要是因为每隔2小时做一个 block 数据落盘，落盘之前所有数据都在内存里面，因此和采集量有关。
2、加载历史数据时，是从磁盘到内存的，查询范围越大，内存越大。这里面有一定的优化空间
3、一些不合理的查询条件也会加大内存，如 group、大范围rate

sample 数量超过了 200 万，就不要单实例了，做下分片，
然后通过victoriametrics，thanos，trickster等方案合并数据,选择使用thanos方案。

<!-- more -->
磁盘预估方法

Bytes per Sample
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1d])/rate(prometheus_tsdb_compaction_chunk_samples_sum[1d])


每秒获取的样本数
rate(prometheus_tsdb_head_samples_appended_total[1h])

磁盘容量预估
磁盘大小 = 保留时间 * 每秒获取样本数 * 样本大小

2h * 51935.72524407252 * 1.5 Bytes

2*60*60*1.6*51935=570M


### prometheus 内存 磁盘预估

查看多少台node_exporter
count(node_exporter_build_info)

908 台机器 - 180 商业

node_export
curl -s http://localhost:9100/metrics | grep -v "#"|grep "node_" |wc -l
2448

测量点(即样本数量)

指标统计

Promethues 压缩样本使用磁盘大小公式为 :
compact_data_disk_usage = (romethues 压缩样本使用磁盘大小公式为 :
compact_data_disk_usage = 2448/prometheus.node.exporter.scrape_interval * nodeNum * prometheus.storage.retention.time (in seconds) * 单个样本平均大小(1-2 bytes)

2448/15*908*(24*60*60)*2=23.84789G

WAL 文件大小取决于Prometheus 留存于内存的活跃样本的大小. 而留存于内存的活跃样本的大小又取决于每秒获取样本数和活跃样本留存内存时间.
记录活跃样本信息的 WAL 文件都是 raw data, 故大小比经过编码之后的样本大得多. 
Prometheus 官方文档中说明至少会保存3个 write-ahead log files(每一个最大为128M), 如果实际使用中留存内存的样本数量非常大, 
那么用来记录样本的 WAL 文件可能需要不止三个

计算 wal file 之前需要计算留存于内存的活跃样本占用内存大小
active_data_mem_uage = (534 / prometheus.node.exporter.scrape_interval + 481 / prometheus.tdh.exporter.scrape_interval) * nodeNum * prometheus.max-block-duration(in seconds) * 单个样本平均大小(1-2 bytes)

active_data_mem_uage = 2448/15 * 908 * (24 * 60 * 60) * 2 = 25606471680 bytes = 23.84789G
Prometheus 编码之后的样本平均大小为1~2 bytes, 而未编码的 double类型数据为 8 bytes, 故raw data最大可为编码之后的样本数据的八倍. 可以粗略的认为 WAL file 大小和 样本 raw data近似相等, 故可以得出公式:
wal_file_disk_usage = active_data_mem_uage * (8 / 1) = 190G

综上所述, total_disk_usage = compact_data_disk_usage + wal_file_disk_usage, 考虑集群的扩展性，建议预留磁盘空间为 total_disk_usage * 5.

### thanos部署
thanos version 2.13.0 版本

**prometheus部署**
/etc/systemd/system/prometheus.service

```
[Unit]
Description=prometheus_media
After=network.target
[Service]
Type=simple
User=root
ExecStart=/data/apps/prometheus/prometheus --config.file=/data/apps/prometheus/prometheus.yml --storage.tsdb.path=/data/apps/prometheus/data --storage.tsdb.retention.time=1d --web.enable-admin-api --web.enable-lifecycle --web.listen-address=:9090
Restart=on-failure
[Install]
WantedBy=multi-user.target
```

**thanos启动**

```
sidecar启动命令：
nohup ./thanos sidecar --tsdb.path /data/apps/prometheus/media --prometheus.url http://localhost:9090 --http-address 0.0.0.0:19191 --grpc-address 0.0.0.0:19091 > sd_media.log 2>&1 &
nohup ./thanos sidecar --tsdb.path /data/apps/prometheus/shipin --prometheus.url http://localhost:9092 --http-address 0.0.0.0:19192 --grpc-address 0.0.0.0:19092 > sd_shipin.log 2>&1 &
nohup ./thanos sidecar --tsdb.path /data/apps/prometheus/zixun --prometheus.url http://localhost:9095 --http-address 0.0.0.0:19193 --grpc-address 0.0.0.0:19093 > sd_zixun.log 2>&1 &
query启动命令：
nohup ./thanos query --http-address 0.0.0.0:29090 --grpc-address 0.0.0.0:29091 --query.replica-label monitor --store 192.168.1.111:19091 --store 192.168.1.111:19092 --store 192.168.1.112:19093 > qu_media.log 2>&1 &
nohup ./thanos query --http-address 0.0.0.0:29092 --grpc-address 0.0.0.0:29093 --query.replica-label monitor --store 192.168.1.111:19091 --store 192.168.1.111:19092 --store 192.168.1.112:19093 > qu_shipin.log 2>&1 &
nohup ./thanos query --http-address 0.0.0.0:29094 --grpc-address 0.0.0.0:29095 --query.replica-label monitor --store 192.168.1.111:19091 --store 192.168.1.111:19092 --store 192.168.1.112:19093 > qu_zixun.log 2>&1 &

```
nginx负载均衡查询端
```
upstream thanos {
    server 192.168.1.111:29094 max_fails=2 fail_timeout=15s;
    server 192.168.1.112:29090 max_fails=2 fail_timeout=15s;
    server 192.168.1.113:29092 max_fails=2 fail_timeout=15s;
}
server {
    listen       80;
    server_name  xxx;

    #charset koi8-r;

    access_log  /data/logs/nginx/thanos.log;


    location / {
        proxy_connect_timeout    30s;
        proxy_set_header Host $host:$server_port;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        access_log    /data/logs/nginx/thanso.log;
        proxy_pass http://thanos;
    }
}
```

### 常用运维命令
```
./tsdb ls custom_all
BLOCK ULID                  MIN TIME       MAX TIME       NUM SAMPLES  NUM CHUNKS  NUM SERIES
01E4JAJCEZZRTTQ56CM1C1VKW1  1585447200000  1585454400000  373837607    3112298     783085
01E4JHE3EKB5252S5060RS88GF  1585454400000  1585461600000  373910606    3114077     783026
```

### 参考地址：
https://prometheus.io/docs/prometheus/latest/getting_started/
