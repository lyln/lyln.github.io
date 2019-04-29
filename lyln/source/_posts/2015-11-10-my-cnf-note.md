---
layout: post
title: "my.cnf配置文件注释"
categories: MySQL
tags: MySQL
date: 2015/11/10
---

#### MySQL 5.6 & 5.7最优配置文件模板
<http://www.innomysql.net/article/21730.html>

#### my.cnf配置文件注释
```bash
[client]
user=root
password=root
default-character-set=utf8mb4

[mysqld]
########basic settings########
server-id = 11 
port = 3306
user = mysql
bind_address = 10.166.224.32
autocommit = 0
character_set_server=utf8mb4
skip_name_resolve = 1
max_connections = 800
max_connect_errors = 1000
datadir = /data/mysql_data
transaction_isolation = READ-COMMITTED
explicit_defaults_for_timestamp = 1
join_buffer_size = 134217728
sort_buffer_size = 33554432
tmp_table_size = 67108864
tmpdir = /tmp
max_allowed_packet = 16777216
sql_mode = "STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER"
interactive_timeout = 1800
wait_timeout = 1800
read_buffer_size = 16777216
read_rnd_buffer_size = 33554432
########log settings########
log_error = error.log
slow_query_log = 1
slow_query_log_file = slow.log
log_queries_not_using_indexes = 1
log_slow_admin_statements = 1
log_slow_slave_statements = 1
log_throttle_queries_not_using_indexes = 10
expire_logs_days = 90
long_query_time = 2
min_examined_row_limit = 100
########replication settings########
master_info_repository = TABLE
relay_log_info_repository = TABLE
log_bin = bin.log
sync_binlog = 1
gtid_mode = on
enforce_gtid_consistency = 1
log_slave_updates
binlog_format = row 
relay_log = relay.log
relay_log_recovery = 1
binlog_gtid_simple_recovery = 1
slave_skip_errors = ddl_exist_errors
########innodb settings########
innodb_page_size = 8192
innodb_buffer_pool_size = 6G
innodb_buffer_pool_instances = 8
innodb_buffer_pool_load_at_startup = 1
innodb_buffer_pool_dump_at_shutdown = 1
innodb_lru_scan_depth = 2000
innodb_lock_wait_timeout = 5
innodb_io_capacity = 4000
innodb_io_capacity_max = 8000
innodb_flush_method = O_DIRECT
innodb_file_format = Barracuda
innodb_file_format_max = Barracuda
innodb_log_group_home_dir = /redolog/
innodb_undo_directory = /undolog/
innodb_undo_logs = 128
innodb_undo_tablespaces = 3
innodb_flush_neighbors = 1
innodb_log_file_size = 4G
innodb_log_buffer_size = 16777216
innodb_purge_threads = 4
innodb_large_prefix = 1
innodb_thread_concurrency = 64
innodb_print_all_deadlocks = 1
innodb_strict_mode = 1
innodb_sort_buffer_size = 67108864 
########semi sync replication settings########
plugin_dir=/usr/local/mysql/lib/plugin
plugin_load = "rpl_semi_sync_master=semisync_master.so;rpl_semi_sync_slave=semisync_slave.so"
loose_rpl_semi_sync_master_enabled = 1
loose_rpl_semi_sync_slave_enabled = 1
loose_rpl_semi_sync_master_timeout = 5000

[mysqld-5.7]
innodb_buffer_pool_dump_pct = 40
innodb_page_cleaners = 4
innodb_undo_log_truncate = 1
innodb_max_undo_log_size = 2G
innodb_purge_rseg_truncate_frequency = 128
binlog_gtid_simple_recovery=1
log_timestamps=system
transaction_write_set_extraction=MURMUR32
show_compatibility_56=on
```
<!--more-->
#### 注释：
1、server-id = n  给服务器分配一个独一无二的ID编号;n的取值范围是1~2的32次方。<br>
<http://blogread.cn/it/article/2354>
<http://www.mysqlsystems.com/2010/06/dba-job-experience-two.html>

2、autocommit = 0  如果设置成0，你必须commit去提交事务。
<http://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_autocommit>

3、字符设定
```bash
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_general_ci
[clent]
default-character-set=utf8mb4
```

4、skip_name_resolve=1
禁止MySQL对外部连接进行DNS解析，使用这一选项可以消除MySQL进行DNS解析的时间。但需要注意，如果开启该选项，
则所有远程主机连接授权都要使用IP地址方式，否则MySQL将无法正常处理连接请求。

5、max_connections
一般设置800-100，max_used_connections一般不做设置。
max_used_connections / max_connections * 100% （理想值≈ 85%） 

6、max_connect_errors = 1000
max_connect_errors是一个MySQL中与安全有关的计数器值，它负责阻止过多尝试失败的客户端以防止暴力破解密码的情况。max_connect_errors的值与性能并无太大关系。<br>
<http://www.bootf.com/514.html>

7、transaction_isolation = READ-COMMITTED
<http://www.cnblogs.com/zemliu/archive/2012/06/17/2552301.html>

8、explicit_defaults_for_timestamp = 1
修改TIMESTAMP的默认行为。
<http://www.williamsang.com/archives/818.html>

9、tmp_table_size = 67108864（67M）
规定内部内存临时表的最大值
max_heap_table_size(为什么不设置这个值？)此定义用户可以创建的内存表的大小。<br>
max_heap_table_size与tmp_table_size一起限制了内部内存表的大小。建议不超过128M。

10、max_allowed_packet = 16777216（16M）mysql允许你发送的最大数据包的请求。<br>
<http://www.cnblogs.com/yeahgis/archive/2012/03/16/2399985.html>

11、sql_mode = 
"STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE,
ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER"<br>
sql_mode常用的三个， ANSI，STRICT_TRANS_TABLES，TRADITIONAL。<br>
NO_ENGINE_SUBSTITUTION 如果需要的存储引擎被禁用或未编译，可以防止自动替换存储引擎。<br>
STRICT_TRANS_TABLES 启用了对所有事务表的严格模式。<br>
STRICT_ALL_TABLES启用了对所有表的严格模式。<br>
ERROR_FOR_DIVISION_BY_ZERO  除0插入NULL并产生警告。<br>
NO_AUTO_CREATE_USER 授权用户时必须知道制定用户密码。<br>
<http://www.cnblogs.com/ainiaa/archive/2010/12/31/1923002.html>

12、interactive_timeout = 1800（30分） 服务器关闭交互式连接前等待活动的秒数。
wait_timeout = 1800（30分）服务器关闭非交互连接之前等待活动的秒数。

13、read_buffer_size = 16777216 （16M）
是MySql读入缓冲区大小。对表进行顺序扫描的请求将分配一个读入缓冲区，MySql会为它分配一段内存缓冲区。<br>
read_rnd_buffer_size = 33554432 (32M)
是MySql的随机读缓冲区大小。当按任意顺序读取行时(例如，按照排序顺序)，将分配一个随机读缓存区。<br>
join_buffer_size = 134217728 (134M) 联合查询操作所能使用的缓冲区大小 <br>
sort_buffer_size = 33554432(33M) 每个需要进行排序的线程分配该大小的一个缓冲区。
增加这值加速ORDER BY或GROUP BY操作。

14、log_queries_not_using_indexes=1 如果log_queries_not_using_indexes为ON的话，当执行一个sql语句的时候，如果一个表没有索引就会把这个信息记录在慢查询文件中。<br>
log_throttle_queries_not_using_indexes 限制每分钟写入慢查询日志中不使用索引的查询语句的数量，
默认值为0,表示无限制<br>
min_examined_row_limit = 100 扫描记录少于该值的sql不记录到慢查询日志中，前提是必须满足long_query_time
和log_queries_not_using_indexes约束。

15、log_slow_admin_statements = 1
指定执行过慢的DDL语句写入慢日志，包含：ALTER TABLE, ANALYZE TABLE, CHECK TABLE, CREATE INDEX, DROP INDEX,
OPTIMIZE TABLE及REPAIR TABLE。 <br>
log_slow_slave_statements = 1 备库将复制查询语句写入慢日志，默认不会写入

16、innodb_page_size = 8192(8K) 设置Innodb数据页大小，默认为16K <br>
<http://mysqllover.com/?p=1329>

17、innodb_buffer_pool_size = 6G
分配足够 innodb_buffer_pool_size,来将整个InnoDB 文件加载到内存,减少从磁盘上读。
内存的70-80%  innodb对缓冲更为敏感。Innodb引擎会把数据和索引都缓存起来。无需给操作系统留太多的内存。
如果数据量比较小，则无需把innodb_buffer_pool_size设置的过大。

18、innodb_buffer_pool_instances = 8
 innodb_buffer_pool_instances的值主要用于将innodb buffer pool进行划分，通过划分innodb buffer pool为多个实例，可以提高并发能力，并且减少了不同线程读写造成的缓冲页。每一页从其中一个buffer pool中使用hash函数随机的读取和写入。每个buffer pool管理和维护各自的信息，包括free lists、flush lists、LRUs等。<br>
<http://blog.chinaunix.net/uid-26896862-id-3345441.html>

19、innodb_buffer_pool_load_at_startup = 1  在启动时把热数据加载到内存。
innodb_buffer_pool_dump_at_shutdown = 1 在关闭时把热数据dump到本地磁盘
<http://blog.csdn.net/zhu19774279/article/details/38645663>

20、innodb_io_capacity = 4000  默认值为200 innodb_io_capacity越大，一次刷新的脏页的数量也就越大.<br>
innodb_io_capacity_max = 8000 <br>
innodb_lru_scan_depth = 2000  默认值为 1024. 这是mysql 5.6中引入的一个新选项. Mark Callaghan 提供了 一些配置建议. 简单来说,如果增大了 innodb_io_capacity 值, 应该同时增加 innodb_lru_scan_depth.<br>
<https://opvps.com/mysql-innodb-performance-tuning/>

21、innodb_lock_wait_timeout = 5 默认值为 50 秒。
在回滚(rooled back)之前，InnoDB 事务将等待超时的时间(单位 秒)。InnoDB 会自动检查自身在锁定表与事务回滚时的事务死锁。如果使用 LOCK TABLES 命令，或在同一个事务中使用其它事务安全型表处理器(transaction safe table handlers than InnoDB)，那么可能会发生一个 InnoDB 无法注意到的死锁。在这种情况下超时将用来解决这个问题。
<http://man.chinaunix.net/database/mysql/inonodb_zh/2.htm>

22、innodb_flush_method = O_DIRECT  数据文件的写入操作是直接从mysql innodb buffer到磁盘的，并不用通过操作系统的缓冲，而真正的完成也是在flush这步,日志还是要经过OS缓冲。
<http://www.orczhou.com/index.php/2009/08/innodb_flush_method-file-io/>
<http://blog.csdn.net/jiao_fuyou/article/details/16113403>

23、innodb_file_format = Barracuda <br>
innodb_file_format_max = Barracuda <br>
目前，在InnoDB Plugin（1.0.6）配置文件中innodb_file_format支持两种：Antelope/ˈæntɪləʊp/、Barracuda/ˌbærəˈkjuːdə/。他们分别是两种文件格式的代号，在未来版本中，InnoDB将继续延续这种代号机制，它们会是Antelope, Barracuda, Cheetah, Dragon, Elk, Fox等等。<br>
<http://www.orczhou.com/index.php/2010/03/innodb-plugin-file-format/>

24、innodb_log_group_home_dir = /redolog/ InnoDB 日志文件的路径。必须与innodb_log_arch_dir设置相同值。 如果没有明确指定将默认在 MySQL 的datadir目录下建立两个 5 MB 大小的 ib_logfile… 文件。

25、innodb_undo_logs = 128 用于表示回滚段的个数<br>
innodb_undo_tablespaces = 3   用于设定创建的undo表空间的个数，在Install db时初始化后，就再也不能被改动了；<br>
innodb_undo_directory = /undolog/  当开启独立undo表空间时，指定undo文件存放的目录<br>
<http://mysqllover.com/?p=873>

26、innodb_flush_neighbors = 1 刷新邻接页，当刷新一个脏页时，InnoDB存储引擎会检测该页所在区（extent）的所有页，如果是脏页，那么一起进行刷新。
对于传统机械硬盘建议启用该特性，而对于固态硬盘有着超高IOPS性能的磁盘，则建议将该参数设置为0，即关闭此特性。

27、innodb_log_file_size = 4G redo日志的大小。redo日志被用于确保写操作快速而可靠并且在崩溃时恢复。<br>
innodb_log_buffer_size = 16777216 (16M)  缓冲器的字节大小的InnoDB使用写入到日志文件在磁盘上。

28、innodb_purge_threads = 4 Purge Thread(清洗线程)数，默认为4
增加值大于1创建许多单独的清洗线程，从而可以提高在其中的系统效率的DML上多个表执行操作。

29、innodb_large_prefix = 1
设定对于使用了DYNAMIC或COMPRESSED行格式的InnoDB表来说，是否能够使用大于767字节长度的索引前缀。

30、innodb_thread_concurrency = 64
用于限制能够进入innodb层的线程数，如果已经满了，就会等待innodb_thread_sleep_delay毫秒尝试一次。

31、innodb_print_all_deadlocks = 1
将所有的死锁信息全写入错误日志中

32、innodb_strict_mode = 1 InnoDB 对一些条件是否返回错误而不是警告。默认是ON。

33、innodb_sort_buffer_size = 67108864 (64M) 默认1M
通过CREATE INDEX、ALTER TABLE创建索引时，分配的缓冲区大小。

34、master_info_repository = TABLE <br>
relay_log_info_repository = TABLE <br>
多源复制需开启这两个项，MySQL存储master-info和relay-info的方式，即从文件存储改为表存储。可用于实现在奔溃时保证二进制及从服务器的安全的功能。<br>
<https://www.longlong.asia/2015/10/21/mysql57-new-features.html>

35、sync_binlog = 1 控制数据库的binlog刷到磁盘上去
<http://www.cnblogs.com/Cherie/p/3309503.html>

36、gtid_mode = on 开启gtid<br>
log_slave_updates <br>
enforce_gtid_consistency = 1 如果要开启GTID功能，需要同时开启log-bin和log_slave_updates功能，
另外还需要开启enforce_gtid_consistency功能。

37、binlog_format = row 基于行的复制
<http://blog.csdn.net/vhomes/article/details/8082734>

38、slave_skip_errors = ddl_exist_errors
slave_skip_errors选项有四个可用值，分别为：off，all，ErorCode，ddl_exist_errors。
默认情况下该参数值是off，我们可以列出具体的error code，也可以选择all，mysql5.6及MySQL Cluster NDB 7.3以及后续版本增加了参数ddl_exist_errors，该参数包含一系列error code（1007,1008,1050,1051,1054,1060,1061,1068,1094,1146）
<http://blog.csdn.net/jesseyoung/article/details/40585809>

39、plugin_dir=/usr/local/mysql/lib/plugin <br>
plugin_load = "rpl_semi_sync_master=semisync_master.so;rpl_semi_sync_slave=semisync_slave.so" <br>
loose_rpl_semi_sync_master_enabled = 1 <br>
loose_rpl_semi_sync_slave_enabled = 1 <br>
loose_rpl_semi_sync_master_timeout = 5000 <br>
<http://www.mike.org.cn/articles/how-to-install-the-mysql-plugin/>
<http://www.orczhou.com/index.php/2011/06/mysql-5-5-semi-sync-replication-setup-config/>

#### 5.7新增参数
40、innodb_buffer_pool_dump_pct = 40
表示转储每个bp instance LRU上最热的page的百分比。通过设置该参数可以减少转储的page数。
相关参考19项。
<http://mysqllover.com/?p=1123>

41、innodb_page_cleaners = 4  设置多个page cleaner线程提高脏页刷新效率

42、innodb_undo_log_truncate = 1 自动删除不用的 undo log

43、innodb_max_undo_log_size = 2G  控制最大undo tablespace文件的大小，超过这个阀值时才会去尝试truncate。truncate后的大小默认为10M。

44、innodb_purge_rseg_truncate_frequency = 128
用于控制purge回滚段的频度。 Innodb Purge操作的协调线程每隔这么多次purge事务分发后，就会触发一次History purge，并检查当前的undo log 表空间状态是否会触发truncate。

45、log_timestamps=system 控制写入一般查询日志（慢查询日志和错误日志）的时间戳时区信息，当写入日志表时的时区信息根据time_zone系统变量来设定。
<http://debugo.com/mysql-reading-note-the-general-query-log>

46、transaction_write_set_extraction=MURMUR32 预留
show_compatibility_56=on 兼容5.6版本

