---
layout: post
title: "从日志恢复数据"
categories: MySQL
tags: shell
date: 2016/11/07
---

循环遍历日志
```
stat.txt
2016-11-09 00:00:23 "deviceId":"F9D4F729-7EE7-467F-BF3F-7D9D008EAB" "userId":"20048603"
2016-11-09 00:00:29 "deviceId":"c96996784f99e106c32138940da2987c" "osSystem":"Android6.0" "userId":"20066192"
```
过滤出无用字段(类似循环处理)
```
grep -i -v "osSystem" stat1.txt >> stat11.txt
grep -i  "osSystem" stat1.txt >> stat12.txt
```
<!--more-->
处理成mysql可以load的格式
```
vi 列编辑处理失败。
2016-11-08 23:38:53 ,777b102b6c5cdd1ca087b269e8930be2,20066135
2016-11-08 23:38:56 ,54bac2b7794f7567b1e254bf805e3f7a,
awk -F'"' '{OFS=","; print $1,$4,$8}'
过滤user_id为空的字段
awk -F','  '{if($3>0) {OFS=","; print $1,$2,$3}}' test1.txt
```
创建表并load数据。
```
CREATE TABLE user_device(
`create_time` DATETIME NOT NULL,
`user_id` BIGINT(20) NOT NULL,
 `device_id` VARCHAR(40) DEFAULT NULL
 );
load data infile '/home/res2.txt' into table user_device  FIELDS TERMINATED BY ',';
```