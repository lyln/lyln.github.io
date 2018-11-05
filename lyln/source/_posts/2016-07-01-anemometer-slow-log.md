---
layout: post
title:  "Anemometer 展示示MySQL慢查询日志"
categories: MySQL
tags: MySQL
---

安装部署
nginx,mysql,php环境可参考博客其他文章
Anemometer部署过程参考官网Quickstart

问题小结
```bash
配置多个数据源，只是指定不同db即可。

$conf['datasources']['192.168.1.87'] = array(
        'host'  => '192.168.1.87',
        'port'  => 3306,
        'db'    => 'slow_query_log',
        'user'  => 'ljd',
        'password' => 'root123',
        'tables' => array(
                'global_query_review' => 'fact',
                'global_query_review_history' => 'dimension'
        ),
        'source_type' => 'slow_query_log'
);
$conf['datasources']['online'] = array(
        'host'  => '192.168.1.87',
        'port'  => 3306,
        'db'    => 'slow_online',
        'user'  => 'ljd',
        'password' => 'root123',
        'tables' => array(
                'global_query_review' => 'fact',
                'global_query_review_history' => 'dimension'
        ),
        'source_type' => 'slow_query_log'
);
```
<!--more-->
将数据插入库各种不成功
```bash
global_query_review does not exist or is not readable at /usr/local/bin/pt-query-digest line 11265.
global_query_review_history does not exist or is not readable at /usr/local/bin/pt-query-digest line 11265.
困惑+郁闷许久。
pt-query-digest --user=anemometer --password=superSecurePass \
                  --review h=db.example.com,D=slow_query_log,t=global_query_review \
                  --history h=db.example.com,D=slow_query_log,t=global_query_review_history \
                  --no-report --limit=0% \ 
                  --filter=" \$event->{Bytes} = length(\$event->{arg}) and \$event->{hostname}=\"$HOSTNAME\"" \ 
                  /var/lib/mysql/db.example.com-slow.log
```
原因竟是因为在–review or –review-history后面h=192.168.1.87, D=slow_query_log, h与D直接不能有空格，不能有空格，不能有空格重要的事情说三遍。

### Anemometer慢查询结果展示
![Anemometer慢查询结果展示](http://lyln.oss-cn-beijing.aliyuncs.com/wiredtiger/201611/anemometer.jpg)


####  links:
<https://github.com/box/Anemometer/blob/master/README.md>
