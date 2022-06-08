---
layout: post
title:  "elastic 迁移"
categories: ELK
tags: elk
date: 2019/04/22
---

### es迁移测试工具对比

| 测试工具	 | 是否成功 | 环境搭建 | 迁移版本是否支持 | 工具地址 |
| ------ | ------ | ------ |------ | ------ | 
| Elasticsearch Migration | 是 | 简单，二进制下载即可用 | 5.0->5.0 | https://github.com/medcl/esm-abandoned
| logstash迁移 | 是 | 更新和es对应版本 | 支持跨版本,logstash5.0| |
| Elasticsearch-Exporter | 否 | node环境依赖，复杂 | https://github.com/mallocator/Elasticsearch-Exporter |

小结：对比选择使用esm，logstash辅助。

<!--more-->
esm迁移脚本
```
#!/bin/sh 

dir="/data/apps/opt"
cd $dir

esindex=`curl -s 'http://127.0.0.1:9200/_cat/indices' | grep -e logstash-09* | awk '{print $3}'`

#echo $esindex 

for i in $esindex;

do
	./esm  -s http://127.0.0.1:9200 -x $i  -d http://192.168.1.100:9200 -x $i  -w=5 -b=10 -c 10000

done
```

es保留30的数据
```
#!/bin/bash
DATE=`date +%Y.%m.%d.%I`
DATA1=`date +%Y.%m.%d -d'-30 day'`
DATA2=`date +%Y.%m.%d -d'-30 day'`

#关闭索引
curl -XPOST "http://localhost:9200/logstash*${DATA1}*/_close?pretty"
#删除索引
curl -XDELETE "http://localhost:9200/logstash*${DATA2}*?pretty
```