---
layout: post
title: "Centos 升级mysql5.1到5.6"
categories: MySQL
tags: MySQL
date: 2015/06/05
---

系统：CentOS release 6.5 <br>
升级前mysql版本：5.1.73-log <br> 
升级后mysql版本：5.6.25 <br>

#### 升级原因
MySQL 5.1.x不支持四个字节的utf-8编码，只有5.5.x以后才支持

#### 准备
```bash
mkdir /data/update_mysql
备份my.cnf、/etc/init.d/mysqld
备份整个数据库
mysqldump -uroot -p -q --all-databases > alldatabases.sql
备份数据目录
tar -zxvf datadir.tar.gz /var/lib/mysql
```

<!--more-->
#### 停止mysql
```bash
/etc/init.d/mysqld stop
```

#### 升级mysql
```bash
卸载原来的mysql
yum remove mysql mysql-*  
查看是否有残余
yum list installed | grep mysql 
如果有，清除
yum remove mysql-libs

安装mysql
mysql5.6的yum源
http://dev.mysql.com/downloads/repo/yum/
rpm -ivh http://repo.mysql.com/mysql-community-release-el6-5.noarch.rpm

yum install mysql mysql-community-server.x86_64
修改my.cnf
basedir=/var/lib/mysql

检查和更新数据表
mysql_update
mysql_update 详情参见 <http://dev.mysql.com/doc/refman/5.6/en/mysql-upgrade.html>
```

#### notes:
```bash
* mysql备份导入时，报
ERROR 1005 (HY000) at line 15607: Can't create table 'dbname.tablename' (errno: 150)
解决方法：
备份时，设置FOREIGN_KEY_CHECKS=0。 FOREIGN_KEY_CHECKS会影响表的删除和修改。

* 修改sql_mode为空
my.cnf添加sql_mode=''
常用sql_mode的值有空、ANSI、STRICT_TRANS_TABLES、TRANDITIONAL，后两种通常称为严格模式。严格模式在存储引擎不支持事务，可能造成数据不一致。比如两条语句，第一条ok，第二条可能执行不成功。
具体参考：<https://dev.mysql.com/doc/refman/5.0/en/sql-mode.html>
```
