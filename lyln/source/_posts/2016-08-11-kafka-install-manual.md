---
layout: post
title: "Kafka操作小结"
categories: Kafka
tags: Kafka
date: 2016/08/11
---

#### Kafka操作小结
kafka依赖zookeeper，所以要先安装zookeeper。

下载安装包
省略，解压即可食用，方便快捷

#### zookeeper安装
1、zoo.cfg参数解释
```
dataDir：数据目录
dataLogDir：日志目录
clientPort：客户端连接端口
tickTime：Zookeeper 服务器之间或客户端与服务器之间维持心跳的时间间隔，也就是每个 tickTime 时间就会发送一个心跳。
initLimit：Zookeeper的Leader 接受客户端（Follower）初始化连接时最长能忍受多少个心跳时间间隔数。当已经超过 5个心跳的时间（也就是tickTime）长度后 Zookeeper 服务器还没有收到客户端的返回信息，那么表明这个客户端连接失败。总的时间长度就是 5*2000=10 秒
syncLimit：表示 Leader 与 Follower 之间发送消息时请求和应答时间长度，最长不能超过多少个tickTime 的时间长度，总的时间长度就是 2*2000=4 秒。
server.A=B：C：D：其中A 是一个数字，表示这个是第几号服务器；B 是这个服务器的 ip 地址；C 表示的是这个服务器与集群中的 Leader 服务器交换信息的端口；D 表示的是万一集群中的 Leader 服务器挂了，需要一个端口来重新进行选举，选出一个新的 Leader，而这个端口就是用来执行选举时服务器相互通信的端口。如果是伪集群的配置方式，由于 B 都是一样，所以不同的 Zookeeper 实例通信端口号不能一样，所以要给它们分配不同的端口号。
```
<!--more-->
2、修改配置文件
```bash
echo 1 > /data/zk1/myid
zoo1.cfg最终如下：

tickTime=2000
initLimit=10
syncLimit=5
dataDir=/opt/zookeeper/data/zk1
dataLogDir=/opt/zookeeper/logs/zk1
clientPort=2181
clientPortAddress=10.254.140.104
server.1=10.254.140.104:2389:3389
```
3、设置zk chroot路径（强烈建议）
```bash
./bin/zkCli.sh -server 10.254.139.104:2181
create /kafka
创建topics后
ls /kafka/brokers/topics
kafka连接时指定zk chroot位置

zookeeper.connect=10.254.140.104:2181/kafka
```
4、启动停止zk
```bash
./bin/zkServer.sh start conf/zoo1.cfg
./bin/zkServer.sh status conf/zoo1.cfg
./bin/zkServer.sh stop conf/zoo1.cfg
```

### kafka 单机版安装

1、kafka的一些概念
```
Broker
Kafka集群包含一个或多个服务器，这种服务器被称为broker
Topic
每条发布到Kafka集群的消息都有一个类别，这个类别被称为topic。（物理上不同topic的消息分开存储，逻辑上一个topic的消息虽然保存于一个或多个broker上但用户只需指定消息的topic即可生产或消费数据而不必关心数据存于何处）
Partition
parition是物理上的概念，每个topic包含一个或多个partition，创建topic时可指定parition数量。每个partition对应于一个文件夹，该文件夹下存储该partition的数据和索引文件
Producer
负责发布消息到Kafka broker
Consumer
消费消息。每个consumer属于一个特定的consumer group（可为每个consumer指定group name，若不指定group name则属于默认的group）。使用consumer high level API时，同一topic的一条消息只能被同一个consumer group内的一个consumer消费，但多个consumer group可同时消费这一消息。
```
2、修改server.properties
```
broker.id=0 #Kafka集群需要保证各个Broker的id在整个集群中必须唯一
listeners=PLAINTEXT://10.254.139.104:9092 #监听ip和port
zookeeper.connect=10.254.140.104:2181/kafka #指定zk连接
```
3、启动停止kafka
```
./bin/kafka-server-start.sh -daemon config/server.properties
./bin/kafka-server-stop.sh config/server.properties
```
4、kafka常用命令
```bash
创建topic
./bin/kafka-topics.sh --create --zookeeper 10.254.139.104:2181/kafka --replication-factor 1 --partitions 5 --topic chat #5个分区，并且复制因子为1
查看topic
./bin/kafka-topics.sh --list --zookeeper 10.254.139.104:2181/kafka
./bin/kafka-topics.sh --describe --zookeeper 10.254.139.104:2181/kafka --topic chat
产生消息
./bin/kafka-console-producer.sh --broker-list 10.254.139.104:9092 --topic chat
消费消息
./bin/kafka-console-consumer.sh --zookeeper 10.254.139.104:2181/kafka --topic chat --from-beginning
```
5、查看topic的解释
```bash
./bin/kafka-topics.sh –describe –zookeeper 10.254.139.104:2181/kafka –topic chat

Topic:chat      PartitionCount:5        ReplicationFactor:1     Configs:
        Topic: chat     Partition: 0    Leader: 0       Replicas: 0     Isr: 0
        Topic: chat     Partition: 1    Leader: 0       Replicas: 0     Isr: 0
        Topic: chat     Partition: 2    Leader: 0       Replicas: 0     Isr: 0
        Topic: chat     Partition: 3    Leader: 0       Replicas: 0     Isr: 0
        Topic: chat     Partition: 4    Leader: 0       Replicas: 0     Isr: 0
a)Partition： 分区
b)Leader ： 负责读写指定分区的节点
c)Replicas ： 复制该分区log的节点列表
d)Isr ： "in-sync" replicas，当前活跃的副本列表（是一个子集），并且可能成为Leader
```
#### 一些其他操作
1、修改zk默认jvm
```bash
# vim java.env
#!/bin/sh
export JAVA_HOME=/usr/local/jdk/bin/java
# heap size MUST be modified according to cluster environment
export JVMFLAGS="-Xmx512M -Xms512M"
```