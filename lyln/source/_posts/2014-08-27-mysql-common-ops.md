---
layout: post
title:  "MySQL常用操作"
categories: MySQL
tags: MySQL
date: 2014/08/27
---

以下常用命令适用于MySQL 5.6

多表更新
```
UPDATE s_chat c,s_room r
SET c.`anchor_user_id`=r.`user_id`WHERE c.`room_id`=r.`room_id`;
```
显示表中列名称
```
show columns from mysql.user;
```
<!--more-->
查看存储过程
```
show procedure status; 
show create procedure prc_name;
```
查看表分区信息
```
select TABLE_SCHEMA,TABLE_NAME,PARTITION_NAME from information_schema.PARTITIONS where TABLE_SCHEMA='zabbix' and TABLE_NAME='history';
```
查看数据库字符编码
```
status or \s;
SHOW CREATE DATABASE db_name;
SHOW VARIABLES LIKE '%char%';
```

查看数据表字符编码
```
SHOW CREATE TABLE table_name;
SHOW FULL COLUMNS FROM table_name;
```

创建数据库指定字符编码utf8
```
CREATE DATABASE 'db_name' DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
```

修改数据库字符编码
```
ALTER DATABASE db_name DEFAULT CHARSET SET character_name [COLLATE...]
```

修改表默认的字符集和所有字段
```
ALTER TABLE table_name CONVERT TO CHARACTER SET character_name [COLLATE...]
```
修改表默认字符集
```
ALTER TABLE table_name DEFAULT CHARACTER SET character_name [COLLATE...]
```
修改字段的字符集
```
ALTER TABLE table_name CHANGE columns_name CHARACTER SET character_name [COLLATE...]
```

设置mysql字符编码
```
[client]
default-character-set = utf8

[mysqld]
character-set-server = utf8
collation-server = utf8_general_ci
```
客户端执行脚本or语句
```
SET NAMES utf8;
等同于下面三条语句
SET character_set_client = utf8 用来设置客户端送给MySQL服务器的数据的 字符集
SET character_set_results = utf8 服务器返回查询结果时使用的字符集
SET character_set_connection = utf8
```

mysql设置密码,不用登陆修改
```
mysqladmin -uroot -p[oldpasswd] password newpasswd
```
登陆后修改
```
use mysql;
UPDATE user set password=PASSWORD("newpasswd") WHERE user='root';
flush privilges;
```
丢失root密码后操作
```
停止mysql服务
mysqld_safe --skip-grant-tables&
mysql -u root mysql  #指定登陆后直接进入mysql库
UPDATE user set password=PASSWORD("newpasswd") WHERE user='root';
flush privilges;
```
mysql数据库备份与还原
```
备份：(--default-character-set=utf8)
mysqldump -u uname -p db_name > /opt/db_name.sql
还原：
不用登陆还原
mysql -u uname -p db_name < db_name.sql
登陆还原
mysql -u uname -p
 source /opt/db_name.sql
```
导出查询结果到文件
```
select ip from server_ip  INTO OUTFILE '/tmp/ip_list.txt';
```
mysql权限管理
```
查看用户权限
select user,host,password from mysql.user;
show grants; #显示当前用户权限
show grants for user[username@host];
授予用户权限
grant all privileges on db_name.\* to 'username'@'%' identified by 'passwd';
# %代表所有机器

回收用户权限
revoke all privileges from db_name.\* to 'username'@'%';
删除用户
drop user ‘username'@'host';
切记：刷新权限
flush privileges;
```

查看所有表占用的空间和行数
```
select table_name, (data_length+index_length)/1024/1024 as total_mb, table_rows from information_schema.tables where table_schema='mha_test'; 
```
QPS(每秒Query量) 
```
基于Questions计算出QPS：
mysql> show global status like 'Questions';
mysql> show global status like 'Uptime';
QPS = Questions / Uptime
```
TPS(每秒事务量) 
```
基于Com_commit和Com_rollback计算出TPS：
mysql> show global status like 'Com_commit';
mysql> show global status like 'Com_rollback';
mysql> show global status like 'Uptime';
TPS = (Com_commit + Com_rollback) / Uptime
```
基于Com_select、Com_insert、Com_delete、Com_update计算出QPS
```
mysql> show global status where Variable_name in('com_select','com_insert','com_delete','com_update');
等待1秒再执行，获取间隔差值，第二次每个变量值减去第一次对应的变量值，就是QPS
计算TPS，就不算查询操作了，计算出插入、删除、更新四个值即可。
mysql> show global status where Variable_name in('com_insert','com_delete','com_update');
当数据库中myisam表比较多时，使用Questions计算比较准确。当数据库中innodb表比较多时，则以Com_*计算比较准确。
```
修改表的名称
```
RENAME TABLE tbl_name TO new_tbl_name
```

DATETIME与TIMESTAMP的区别
```
1、 时间范围不同
DATETIME 支持'1000-01-01 00:00:00' to '9999-12-31 23:59:59'.
TIMESTAMP 支持'1970-01-01 00:00:01' UTC to '2038-01-19 03:14:07' UTC.
2、TIMESTAMP可以有默认值，DATETIME没有
3、更新表时，可以设置TIMESTAMP类型的列自动更新为当前时间
date TIMESTAMP DEFAULT ON UPDATE CURRENT_TIMESTAMP
```
