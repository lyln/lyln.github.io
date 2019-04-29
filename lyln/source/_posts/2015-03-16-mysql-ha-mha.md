---
layout: post
title:  "MySQL MHA高可用方案"
categories: MySQL
tags: MySQL
date: 2015/03/16
---

### 概述
mha是用perl写的一套MySql故障切换方案，保证数据库系统的高可用。支持在线切换，从当前运行master到新master只需很短时间（0.5-2s内），此时仅仅阻塞写操作，并不影响读操作。

### 环境部署

MHA要求一个复制集群中必须至少三台数据库

实验环境（RHEL release 5.9）

| 服务器 | IP           | 备注           |
| -------- | ------------ | ---------------- |
| 主服务器 | 10.16.34.208 |                  |
| 从服务器 | 10.16.34.201 | 主备份、管理节点 |
| 从服务器 | 10.16.34.194 |                  |

<!--more-->
### 安装mysql
```
（略）
```
### 安装mha node节点
三台机器都安装mha node节点,所需安装包在packages文件夹中。
```
shell> rpm -ivh  mha4mysql-node-0.56-0.el5.noarch.rpm
```

### 主从复制
```
1、在master上授权
 grant replication slave on _._ to 'repl'@'10.16.34.%' identified by '1234';
flush privileges;
查看权限
show grants for 'repl'@'10.16.34.%';
```

#### tips
授权必须_._ ,luck.\* 报错ERROR 1221 (HY000): Incorrect usage of DB GRANT and GLOBAL PRIVILEGES


2、修改my.cnf(三台同时修改)
```
binlog-do-db=luck
binlog-ignore-db=mysql
server-id = 1 从库自增

show master status \G;
File: mysql-bin.000004
      Position: 107
```

3、在slave上
```
change master to
     master_host='10.16.34.208',
     master_user='repl',
     master_password='1234',
     master_log_file='mysql-bin.000004',
     master_log_pos=107;
start slave ;
show slave status \G;
如果
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
说明主从ok
```

#### tips
如果Slave_SQL_Running为NO，说明很可能是从库与主库的数据不一致。


### 安装管理节点
1、安装manager
```
shell> rpm -ivh perl-DBD-MySQL
shell> rpm -ivh perl-Config-Tiny
shell> rpm -ivh perl-Log-Dispatch
shell> rpm -ivh perl-Parallel-ForkManager
shell> rpm -ivh mha4mysql-manager-0.56-0.el5.noarch.rpm
```
2、修改/etc/masterha_app.cnf
```
[server default]
user=root
password=12345678
ssh_user=root
manager_workdir=/var/log/masterha/application
manager_log=/var/log/masterha/application/app.log
remote_workdir=/var/log/masterha/application
master_binlog_dir=/opt/mysql-5.5.17/data/ mysqlbinlog的日志目录
check_repl_delay=0
[server_master]
hostname=10.16.34.208
candidate_master=1
[server_slave1]
hostname=10.16.34.201
candidate_master=1
[server_slave2]
hostname=10.16.34.194
no_master=1
3、设置从为只读
set global read_only=1;
show variables like 'read_only';
4、设置主机和其他从机位relay_log_purge：
set global relay_log_purge=0;
show variables like 'relay_log_purge';

```
### MHA常用命令
启动mha
```
masterha_manager --conf=/etc/masterha_app.cnf
nohup masterha_manager --conf=/etc/masterha_app.cnf  > /var/log/masterha/master.log 2&1
```
查看mha状态
masterha_check_ssh --conf=/etc/masterha_app.cnf
![check_ssh](https://cloud.githubusercontent.com/assets/5628396/6664313/830f3b30-cc09-11e4-9c78-44a14d49ecda.png)

masterha_check_repl --conf=/etc/masterha_app.cnf
![check_repl](https://cloud.githubusercontent.com/assets/5628396/6664319/9187ce8e-cc09-11e4-83e3-5b3696475c34.png)

masterha_check_status --conf=/etc/masterha_app.cnf
![check_status](https://cloud.githubusercontent.com/assets/5628396/6664324/9b866166-cc09-11e4-9294-ec90cf3560f5.png)

masterha_app is stopped(2:NOT_RUNNING). #没有启动成功
masterha_app (pid:23141) is running(0:PING_OK), master:10.16.34.208 。 good nice!!!
停止mha
```
masterha_stop --conf=/etc/masterha_app.cnf
```

#### tips
1、rpm -ivh perl-DBD-MySQL-4.014-1.el5.rfx.x86_64.rpm
```
libmysqlclient.so.15()(64bit) is needed by perl-DBD-MySQL-4.022-1.el5.rfx.x86_64
```
2、MySQL Replication Health is NOT OK!
```
grant all privileges  on _._ to 'root'@'10.16.34.201' identified by '12345678'; 这样权限会有问题
这样ok。
grant all privileges  on _._ to *\* 'root'@'10.16.34.%' *\* identified by '12345678';
flush privileges;
查看权限
select user,host,password from mysql.user;
```
3、Can't exec "mysqlbinlog":没有那个文件或目录 at /usr/share/perl5/vendor_perl/MHA/BinlogManager.pm line 106.
mysqlbinlog version command failed with rc 1:0, please verify PATH, LD_LIBRARY_PATH, and client options
at /usr/bin/apply_diff_relay_logs line 493
处理办法：
在所有节点上执行
```
which mysqlbinlog;    --/mysql/bin/mysqlbinlog
ln -s /mysql/bin/mysqlbinlog /usr/bin/mysqlbinlog
```
