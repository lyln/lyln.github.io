---
layout: post
title: "PostgreSQL笔记--初识PostgreSQL"
tags: PostgreSQL
date: 2015/06/04
---

#### PostgreSQL安装

```bash
./configure --prefix   安装路径
--with-pgport=NUMBER  设置默认端口（5432）
--with-segsize=SEGSIZE 段大小（单位gb）
--with-blocksize=BLOCKSIZW 块大小（单位kb）
--with-wal-segsize=SEGSIZE wal日志(单位mb)
--with-wal-blocksize=BLOCKSIZE wal日志块大小(单位kb)

gmake
gmake install
useradd postgres

initdb -D /opt/pgsql/data --locale=C --encoding=UTF8 初始化数据库
or pg_ctl -D /opt/pgsql/data initdb
使用D参数或设置环境变量PGDATA

postgres -D /opt/pgsql/data > logfile 2>&1 &启动数据库
or pg_ctl start -l logfile
```
<!--more-->
notes: 
```bash
./configure时报下面错误
configure: error: readline library not found
apt-get install libreadline-dev
configure: error: zlib library not found
apt-get install zlib1g-dev
```

#### PostgreSQL物理文件布局
psql
\h 帮助 
修改pager，增加环境变量PAGER=less

```bash
./psql --help
-a echo all input from script
-f execute commands from file, then exit
-c run only single command (SQL or internal) and exit

-A, --no-align           unaligned table output mode
-F, --field-separator=STRING
-L filename  输出结果到文件
-o filename  也可以试下-L的功能，但是输出简练写。
```

./psql登录后
```bash 
\! 执行终端command
\d               list tables, views, and sequences
\d NAME           describe table, view, sequence, or index
\conninfo  显示连接方式
```

#### data下的目录

PG_VERSION  版本 
postmaster.opts 启动命令路径 
postmaster.pid 文件
```bash 
15497  进程id
/opt/pgsql/data 数据目录
1433075640   时间戳
5432  端口
/tmp  socket存放位置
localhost  监听地址
  5432001   1179651  共享内存
```

pg_hba.conf文件
```bash 
TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
METHOD字段
认证方式    描述
trust   无条件地允许连接，而不需要口令。
reject  无条件地拒绝连接。常用于从一个组中”过滤”某些主机。
md5 要求客户端提供一个 MD5 加密的口令进行认证。
password    要求客户端提供一个未加密的口令进行认证。
krb5    用 Kerberos V5 认证用户。只有在进行 TCP/IP 连接的时候才能用。
ident   获取客户的操作系统名然后检查该用户是否允许以要求的数据库用户进行连接，方法是参照在 ident 关键字后面声明的映射。对于 TCP/IP 连接，用户的身份是通过与运行在客户端上的 ident 服务器连接进行判断的，对于本地连接，它是从操作系统获取的。
ldap    使用 LDAP 进行认证。
pam 使用操作系统提供的可插入认证模块服务(PAM)来认证。
```

#### base目录
默认表空间
select datname,oid from pg_database ;

#### global目录
集群环境的表空间

#### pg_clog
提交事务的状态数据

#### pg_stat_tmp
统计信息
 
#### pg_tblspc
新表空间的链接存放地址

#### pg_xlog
select pg_xlogfile_name(pg_current_xlog_localtion());
select pg_switch_xlog(); 切换日志

#### pg_subtrans
包含子事务 

#### pg_multixact
包含多事务

#### pg_twophase
包含两节段事务

#### 数据库管理
数据库创建默认拷贝模板数据库template1，
templat0为更加纯净的模板数据库
select datname,datistemplate from pg_database;

#### 内存相关的参数设置
postgresql.conf
shared_buffers(integer)共享内存数量，设置为系统内存的25%
work_mem(integer)大小决定结果集是否拆分
maintence_work_mem(integer)制定维护性操作中使用的最大内存数

#### 其他命令
select to_timestamp(时间戳);
ipcs 查看共享内存 
oid2name 命令查看oid
