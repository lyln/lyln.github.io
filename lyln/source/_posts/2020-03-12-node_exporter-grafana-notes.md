---
layout: post
title: node_exporter部署及grafana配置
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/image-20221121210822346.png
tags: grafana node_exporter
date: 2020-03-12
---

![image-20221121210822346](https://inshub.oss-cn-beijing.aliyuncs.com/blog/image-20221121210822346.png)

#### node_exporter部署

其他各种node_exporter部署类似。

下载对应的node_exporter版本
https://github.com/prometheus/node_exporter/releases

```
/etc/systemd/system/node_exporter.service
[Unit]
Description=node_exporter
After=network.target
[Service]
Type=simple
User=root
ExecStart=/data/apps/node_exporter/node_exporter
Restart=on-failure
[Install]
WantedBy=multi-user.target
```

#### 修改prometheus配置文件
```
#增加
  - job_name: 'node-exporter-online'
    static_configs:
      - targets: ["192.168.1.121:9010"]
        labels:
          service: nginx

#校验配置
./promtool check config prometheus.yml 
```

#### grafana配置

```
job label_values(node_uname_info, job)	
instance label_values(node_uname_info{job=~"$job"},instance)

{} 过滤时间序列数据
[] 范围样本区间

过滤instance .*instance="(.*?)".*
```

#### Grafana设置免密登录

```
[auth.anonymous]
enabled = true
org_name = Main Org.
org_role = Viewer
```

#### Grafana alter详解

Name & Evaluation interval
在这里，您可以指定警报规则的名称，以及调度器应该多长时间对警报规则进行评估。

Evaluate every是检查告警的周期，检查到异常会变黄，如果在For配置的时间内还没有恢复就会变红，然后触发告警了。

Conditions
目前唯一存在的条件类型是一个查询条件，允许您指定查询字母（metric里查询语句的字母，代表哪个查询语句）、时间范围和聚合函数。

```
avg() OF query(A, 5m, now) IS BELOW 1:

avg() ：控制如何将每个serie 值降低到一个可以与阈值比较的值。 点击该功能可以选择另一个聚合函数。
query(A, 5m, now) ：字母A代表从Metrics页签查询A查询条件语句。第二个参数定义了时间范围, 5m, now 意思从现在到现在的5分钟。这是有用的，如果你想忽略最后2分钟的数据。
IS BELOW 1：定义的阈值和阈值的类型。你可以点击IS BELOW 改变阈值的类型

```

No Data / Null values
下面的条件，你可以配置返回没有数据或空数据，规则评估引擎应该如何处理查询。
No Data Option：If no data or all values are nul

NoData：设置警报规则状态为空
Alerting：将警报规则状态设置为报警
keep Last state:保持当前的警报规则状态。

Execution errors or timeouts
下面的选项，如果处理超时错误：If execution error or timeout
Alerting：将警报规则状态设置为报警
keep Last state:保持当前的警报规则状态。
如果一个不可靠的 time series存储，当查询超时或随机失败时，您可以设置这个选项Keep Last State基本上忽略它们。

Notifications
在警告选项卡中，还可以指定警报规则通知，以及关于警报规则的详细信息。



#### 参考地址
https://prometheus.io/docs/guides/node-exporter/