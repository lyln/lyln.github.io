---
layout: post
title: "redis-migrate-tool使用详解"
categories: Linux
tags: redis
date: 2019/08/25
---

### rmt介绍

redis-migrate-tool 是维品会开源的一款redis数据迁移工具，基于redis复制，快速，稳定，github地址为：https://github.com/vipshop/redis-migrate-tool 。

- 快速。
- 多线程。
- 基于redis复制。
- 实时迁移。
- 迁移过程中，源集群不影响对外提供服务。
- 异构迁移。
- 支持Twemproxy集群，redis cluster集群，rdb文件 和 aof文件。
- 过滤功能。
- 当目标集群是Twemproxy，数据会跳过Twemproxy直接导入到后端的redis。
- 迁移状态显示。
- 完善的数据抽样校验(-C redis_check)。

划重点 实时迁移 迁移过程中，源集群不影响对外提供服务
<!--more -->

### 安装redis-migrate-tool

依赖

```
yum -y install automake libtool autoconf bzip2 git
```
构建
```
$ cd redis-migrate-tool
$ autoreconf -fvi
$ ./configure
$ make
$ src/redis-migrate-tool -h
```

警告

在运行工具之前，确保源redis所在的机器有足够的内存可以允许至少一个redis生成.rdb文件，如果源机器有大量足够的内存允许所有的redis生成.rdb，可以在配置文件rmt.conf设置source_safe: false。

下列命令不支持传播给target redis组，因为这些命令下的keys可能交叉了不同的目标redis节点。
```
RENAME,RENAMENX,RPOPLPUSH,BRPOPLPUSH,FLUSHALL,FLUSHDB,BITOP,MOVE,GEORADIUS,GEORADIUSBYMEMBE
```

### redis-migrate-tool 命令详解


出现下列帮助说明表示安装成功
```
This is redis-migrate-tool-0.1.0

Usage: redis-migrate-tool [-?hVdIn] [-v verbosity level] [-o output file]
                  [-c conf file] [-C command]
                  [-f source address] [-t target address]
                  [-p pid file] [-m mbuf size] [-r target role]
                  [-T thread number] [-b buffer size]

Options:
  -h, --help             : this help
  -V, --version          : show version and exit
  -d, --daemonize        : run as a daemon
  -I, --information      : print some useful information
  -n, --noreply          : don't receive the target redis reply
  -v, --verbosity=N      : set logging level (default: 5, min: 0, max: 11)
  -o, --output=S         : set logging file (default: stderr)
  -c, --conf-file=S      : set configuration file (default: rmt.conf)
  -p, --pid-file=S       : set pid file (default: off)
  -m, --mbuf-size=N      : set mbuf size (default: 512)
  -C, --command=S        : set command to execute (default: redis_migrate)
  -r, --source-role=S    : set the source role (default: single, you can input: single, twemproxy or redis_cluster)
  -R, --target-role=S    : set the target role (default: single, you can input: single, twemproxy or redis_cluster)
  -T, --thread=N         : set how many threads to run the job(default: 4)
  -b, --buffer=S         : set buffer size to run the job (default: 140720309534720 byte, unit:G/M/K)
  -f, --from=S           : set source redis address (default: 127.0.0.1:6379)
  -t, --to=S             : set target redis group address (default: 127.0.0.1:6380)
  -s, --step=N           : set step (default: 1)

Commands:
    redis_migrate        : Migrate data from source group to target group.
    redis_check          : Compare data between source group and target group. Default compare 1000 keys. You can set a key count behind.
    redis_testinsert     : Just for test! Insert some string, list, set, zset and hash keys into the source redis group. Default 1000 keys. You can set key type and key count behind.
```
部分指令解析：

-h, --help：帮助
-V, --version：显示版本
-d, --daemonize：后台进程运行
-I, --information：打印一些有用的信息，包括可以解析的指令（126个），不支持的指令（14个）等等
-v, --verbosity=N：设置日志等级。(默认: 5, 最低: 0, 最高: 11)
-o, --output=S：设置输出的日志文件
-c, --conf-file=S：设置配置文件。(默认: rmt.conf)
-C, --command=S：设置运行的指令(默认: redis_migrate ，迁移)。redis_check 比较源和目的，默认1000个样本key。redis_testinsert测试插入Keys，默认所有类型总共1000个。
-T, --thread=N：设置多少个线程用来运行工具。(默认: 4)

1. 运行迁移
```
$ src/redis-migrate-tool -c rmt.conf -o log -d

```
注意：-d指定为后台运行，如果再次运行可能需要杀死占用当前端口的进程。netstat -tnulp查看找到redis-migrate-tool的端口号，kill -9 [端口号]杀死再运行。

指定输出日志文件为log，可通过tail -200 log等查看日志。

2. 抽样检查
```
$ src/redis-migrate-tool -c rmt.conf -o log -C redis_check
Check job is running...

Checked keys: 1000
Inconsistent value keys: 0
Inconsistent expire keys : 0
Other check error keys: 0
Checked OK keys: 1000

All keys checked OK!
Check job finished, used 1.041s

```
抽样检查源组和目标组的数据，默认为1000个。如果需要检查更多的数据，
```
$ src/redis-migrate-tool -c rmt.conf -o log -C "redis_check 200000"
Check job is running...

Checked keys: 200000
Inconsistent value keys: 0
Inconsistent expire keys : 0
Other check error keys: 0
Checked OK keys: 200000

All keys checked OK!
Check job finished, used 11.962s
```

### rmt.conf配置文件

配置文件包含三部分：[source], [target] 和 [common]

迁移工具的来源（source）可以是：单独的redis实例，twemproxy集群，redis cluster，rdb文件，aof文件。
迁移工具的目标（target）可以是：单独的redis实例，twemproxy集群，redis cluster，rdb文件。
```
[source]/[target]：

type：
single：单独的redis实例
twemproxy：twemproxy集群
redis cluster：redis集群
rdb file：.rdb文件
aof file：.aof文件
servers：redis地址组，如果type:twemproxy，则为twemproxy配置文件，如果type:rdb file，则为rdb文件名。
redis_auth：连接redis服务的认证auth。
timeout：读写redis服务的超时时间(ms)，默认为120000ms
hash：哈希方法名。仅当type:twemproxy有效。可以为one_at_a_time、md5、crc16、crc32、crc32a、fnv1_64、fnv1a_64、fnv1_32、fnv1a_32、hsieh、murmur、jenkins。
hash_tag：用来哈希的关键key的两个字符，例如"{}" 或 "$$"。仅当type:twemproxy有效。只要标签内的关键key是相同的，能够将不同的键映射到同一服务器。
distribution：键的分布模式。仅当type:twemproxy有效。可以为 ketama、modula、random。
[common]：

listen：监听的地址和端口。默认为127.0.0.1:8888
max_clients：可监听端口的最大连接数。默认为100
threads：工具可用的最多线程数。默认为cpu内核数。
step：解析请求的步数。默认为1，数字越大，迁移越快，需要越多的内存。
mbuf_size：请求的缓存大小（M），默认为512M
noreply：是否检查目标组的回复，默认为false
source_safe：是否保护源组机器的内存安全。默认为true，工具将允许在源组的同一台机器同时只有一个redis生成.rdb。
dir：工作目录。用来存储文件，例如rdb文件，默认为当前目录。
filter：过滤不符合表达式的Key，默认为NULL，支持通配符为glob-style风格
? ：1个任意字符。例如 h?llo 匹配 hello, hallo , hxllo
* ：0个或多个任意字符。例如 h*llo 匹配 hllo ， heeeello
[characters]：匹配任意一个方括号内的字符，比如[abc]，要么匹配a，要么匹配b，要么匹配c。例如 h[ae]llo 匹配 hello ， hallo, 但不匹配 hillo。
[^character]：排除方括号内的字符。例如h[^e]llo 匹配 hallo, hbllo, ... 但不匹配 hello。
[character-character]：表示2个字符范围内的都可以匹配，如[a-z]，[0-9]。例如h[a-b]llo 匹配 hallo 和 hbllo。
\用来转移特殊字符。
```
更多例子见
https://github.com/vipshop/redis-migrate-tool

### 监听redis-migrate-tool

可以使用redis-cli连接工具，监听地址和端口设置在配置文件的[common]下的listen，默认为127.0.0.1:8888

1. info指令
```
$redis-cli -h 127.0.0.1 -p 8888
127.0.0.1:8888> info
# Server
version:0.1.0                                   # 工具的版本号
os:Linux 2.6.32-573.12.1.el6.x86_64 x86_64      # 操作系统信息
multiplexing_api:epoll                          # 多路复用接口
gcc_version:4.4.7                               # gcc版本
process_id:9199                                 # 工具的进程id
tcp_port:8888                                   # 工具监听的tcp端口号
uptime_in_seconds:1662                          # 工具运行的时间（秒）
uptime_in_days:0                                # 工具运行的时间（天）
config_file:/ect/rmt.conf                       # 工具运行的配置文件名称

# Clients
connected_clients:1                             # 当前连接的客户端数
max_clients_limit:100                           # 客户端同时连接最大限制
total_connections_received:3                    # 至今总共连接

# Memory
mem_allocator:jemalloc-4.0.4

# Group
source_nodes_count:32                          # 源redis组的节点数
target_nodes_count:48                          # 目的redis组的节点数

# Stats
all_rdb_received:1                             # 是否已接收源redis组节点的所有.rdb文件
all_rdb_parsed:1                               # 是否已解析源redis组节点的所有.rdb文件
all_aof_loaded:0                               # 是否已加载源redis组节点的所有.aof文件
rdb_received_count:32                          # 已接收的源redis组节点.rdb文件数
rdb_parsed_count:32                            # 已解析的源redis组节点.rdb文件数
aof_loaded_count:0                             # 已加载的源redis组节点.aof文件数
total_msgs_recv:7753587                        # 从源组节点接收的所有消息数
total_msgs_sent:7753587                        # 所有已发送目标节点并且收到的响应的消息数
total_net_input_bytes:234636318                # 从源组接收的输入字节的总数
total_net_output_bytes:255384129               # 已发送到目标组的输出字节的总数
total_net_input_bytes_human:223.77M            # 同total_net_input_bytes，而是转换成人类可读的。
total_net_output_bytes_human:243.55M           # 同total_net_output_bytes，而是转换成人类可读的。
total_mbufs_inqueue:0                          # 来自源组的mbufs输入缓存的命令数据(不包括rdb数据)
total_msgs_outqueue:0                          # 将被发送到目标组，和已被发送到目标，但正在等待响应的消息数
```

2. shutdown [seconds|asap]

执行指令后的行为：

停止从源redis复制
尝试将工具中的缓存数据发送到目标redis
Redis-migrate-tool 停止，退出
参数：

seconds：工具用于在退出之前将缓存的数据发送到目标redis的大多数时间。默认为10秒。
asap：不关心缓存的数据，立即退出。
例如，
```
$ redis-cli -h 127.0.0.1 -p 8888
127.0.0.1:8888> shutdown 5
OK
(5.00s)

```
### 总结
不适用redis4.0.x及以上版本
当源中存在多库时，避免发生键值覆盖，最好换别的方式迁移
多源要不都不带密码，要不源是同一个密码，否则无法启动，在线变更密码可以通过config set requirepass [密码]