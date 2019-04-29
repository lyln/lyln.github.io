---
layout: post
title: "Percona Toolkit使用小结"
categories: MySQL
tags: Percona Toolkit
date: 2016/09/18
---

Percona Toolkit安装
1、[下载包](https://www.percona.com/downloads/percona-toolkit/)
2、安装
```
perl Makefile.PL
make
make test
make install
```
### pt-online-schema-change 在线修改表结构
**修改表结构前，切记备份！！!**
pt-osc原理：
1、创建一个和要执行 alter 操作的表一样的新的空表结构(是alter之前的结构)
2、在新表执行alter table 语句（速度应该很快）
3、在原表中创建触发器3个触发器分别对应insert,update,delete操作
4、以一定块大小从原表拷贝数据到临时表，拷贝过程中通过原表上的触发器在原表进行的写操作都会更新到新建的临时表
5、Rename 原表到old表中，在把临时表Rename为原表
6、如果有参考该表的外键，根据alter-foreign-keys-method参数的值，检测外键相关的表，做相应设置的处理
7、默认最后将旧原表删除
<!--more-->
#### 添加列
```
pt-online-schema-change h=192.168.1.87,u=ljd,D=mytest,t=a --ask-pass \
--alter "add column c varchar(10)" --print --dry-run
pt-online-schema-change h=192.168.1.87,u=ljd,D=mytest,t=a --ask-pass \
--alter "add column c varchar(10)" --print --execute
```

#### 删除索引
```
pt-online-schema-change h=192.168.1.87,u=rgbvr,D=mytest,t=s_event_notice --ask-pass \
--alter "DROP INDEX notice_id_UNIQUE" \
--print --execute
为什么要去除重复的索引
1、多余的索引占用磁盘空间，会引起不必要的磁盘IO
2、多余的索引会导致数据库在进行索引选择的时候变慢，
尤其是索引越多的时候越突出（主要是相关联的索引才会影响索引选择）
3、重复的索引会导致表的更新变慢
```

### pt-duplicate-key-checker 检测MySQL冗余和重复索引
```
pt-duplicate-key-checker h=192.168.1.87,u=ljd -d mytest --ask-pass --nocluster
```

### pt-kill 杀掉进程
由于空闲连接较多导致超过最大连接数或者某个有问题的sql导致mysql负载很高时，可以使用pk-kill杀掉进程。
例如：每10秒检查一次,杀死指定用户超过100秒的查询
```
pt-kill --no-version-check h=192.168.1.87,u=ljd,P=3306,p=root123 \
--match-user root --victims all --busy-time 10 \
--interval 10 --kill --print 
```
参数说明：
match-command
指定杀死的查询类型
match-user
指定杀死的用户名,即杀死该用户的查询
busy-time
指定杀死超过多少秒的查询
kill
执行kill命令
victims
表示从匹配的结果中选择,类似SQL中的where部分,all是全部的查询
interal
每隔多少秒检查一次

#### notes：
1、使用–ask-pass 提示错误Can’t locate Term/ReadKey.pm in @INC
```
apt-get install libterm-readkey-perl
```
