---
layout: post
title: "mysql表分区基础"
categories: MySQL
tags: MySQL
---

##### 表结构文件

```bash
.frm  表结构文件
.par  partition申明一个分区表
.ibd  数据索引文件   innodb引擎表

.MYD  数据文件       myisam表数据文件
.MYI  索引文件       myisam表索引文件

Myisam 存储引擎，它默认使用独立表空间
InnoDB 存储引擎，默认使用共享表空间,默认存到ibdata1

查看表空间设置 
SHOW VARIABLES LIKE '%innodb_file_per_table%';
修改表空间设置(/ect/my.cnf)
innodb_file_per_table=1

查看mysql是否支持分区
show plugins;
or
show variables like '%part%';
```
<!--more-->
##### 分区类型

```bash
RANGE: 基于一个连续的区间范围，将数据分配到不同的分区。<br>
LIST：基于枚举出的值列表分区。<br>
HASH: 基于给定的分区数，将数据分配到不同的分区。<br>
KEY： 类似于HASH分区，但不允许用户自定义表达式。
```

##### RANGE分区

```bash
CREATE TABLE USER(
id INT NOT NULL,
NAME VARCHAR(20)
)
PARTITION BY RANGE(id)(
PARTITION p1 VALUES LESS THAN (3),
PARTITION p2 VALUES LESS THAN (6),
PARTITION p3 VALUES LESS THAN (9),
PARTITION p4 VALUES LESS THAN MAXVALUE
);
insert into user values (1,'aaa'),(2,'bbb'),(3,'ccc'),(4,'ddd'),(5,'eee'),(6,'fff'),(7,'ggg'),(8,'hhh'),(9,'iii'),(10,'jjj'),(11,'kkk'),(12,'lll')

查看表结构
show create table user;
查看查询是否使用partition分区过滤
EXPLAIN PARTITIONS SELECT id,NAME FROM user where id =8 \G
```

list分区

```bash
CREATE TABLE listname(
id INT NOT NULL,
NAME VARCHAR(20)
)PARTITION BY LIST (id)(
PARTITION p1 VALUES IN (1,3,5),
PARTITION p2 VALUES IN (2,4,6)
);

INSERT INTO listname VALUES (1,'111'),(2,'222'),(3,'333'),(4,'444')
EXPLAIN PARTITIONS SELECT * FROM listname WHERE id=2;
```

hash分区

```bash
CREATE TABLE hash_part(
id INT NOT NULL,
NAME VARCHAR(20)
)PARTITION BY hash (id)(
PARTITIONS 3
);
INSERT INTO hash_part VALUES (1,'111'),(2,'222'),(3,'333'),(4,'444')
EXPLAIN PARTITIONS SELECT * FROM hash_part WHERE id=2;
ls /var/lib/mysql/ceshi/
```

key分区

```bash
CREATE TABLE key_part(
id INT NOT NULL,
NAME VARCHAR(20)
)PARTITION BY LINEAR KEY (id)
PARTITIONS 3;

INSERT INTO key_part VALUES (1,'111'),(2,'222'),(3,'333'),(4,'444')
EXPLAIN PARTITIONS SELECT * FROM key_part WHERE id=2;
ls /var/lib/mysql/ceshi/
```

##### 分区管理

```bash
删除分区
alter table tbl_name DROP PARTITION partition_names;

新增分区
range添加
alter table USER add partition (partition p4 values less than MAXVALUE);
list添加
alter table listname add partition (partition p3 values in (7,8,9));
hash重新分区
alter table hash_part add partition partitions  6;
key重新分区
alter table key_part add partition partitions  6;
```
