---
layout: post
title: RabbitMq容器化部署
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/1552936-20201024103921637-693350551.png
tags: rabbit k8s docker
date: 2022-11-12
---

![img](https://inshub.oss-cn-beijing.aliyuncs.com/blog/1552936-20201024103921637-693350551.png)

#### rabbit服务组成

rabbitmq服务4大部分组成：
- epmd服务：rabbitmq起来后会自动的启动epmd服务，empd服务是erlang的一个小程序，专门用来做端口管理的。通常端口是4369
- rabbitmq amqp server：这个服务就是我们通常使用rabbitmq服务的时候，连接5672端口的服务，使用来支持amqp服务的。通常端口是5672
- rabbitmq cluster server：主要是用来做cluster节点之间的心跳发现的，通常端口是25672
- 如果开启来rabbitmq manager plugin，会有一个manager api服务，通常端口是15672
除以上的服务之外，还有一个是erlang自带的数据库，专门用来做分部署服务发现的:mnesia数据库。

由于之前环境都是相对比较老的版本，所有本人中容器部署都是用3.6.14版本

#### RabbitMQ常用命令

```
rabbitmqctl status
rabbitmqctl cluster_status

rabbitmqctl eval 'rabbit_mnesia:dir().'

#修改用户密码
rabbitmqctl change_password {userName} {newPassword}

#所有名称以ha.开始的队列，都会在集群的所有节点上成为镜像队列。
rabbitmqctl set_policy ha-all "^ha\." '{"ha-mode":"all"}'

#同步队列
rabbitmqctl --vhost=/test sync_queue test

https://www.cnblogs.com/caoweixiong/p/14371114.html
```

rabbitmqctl设置策略参数
```
rabbitmqctl set_policy [-p Vhost] Name Pattern Definition [Priority]

-p Vhost： 可选参数，针对指定vhost下的queue进行设置
Name: policy的名称
Pattern: queue的匹配模式(正则表达式)
Definition：镜像定义，包括三个部分ha-mode, ha-params, ha-sync-mode 
ha-mode:指明镜像队列的模式，有效值为 all/exactly/nodes 
all：表示在集群中所有的节点上进行镜像 
exactly：表示在指定个数的节点上进行镜像，节点的个数由ha-params指定 
nodes：表示在指定的节点上进行镜像，节点名称通过ha-params指定 ha-params：ha-mode模式需要用到的参数 ha-sync-mode：进行队列中消息的同步方式，有效值为automatic和manual
priority：可选参数，policy的优先级

```

#### 单机容器部署

单机容器部署仅用于测试环境。
docker启动命令行参考

```
docker run -d \
--name=my-rabbitmq \
-p 5672:5672 \
-p 15672:15672  \
-e RABBITMQ_DEFAULT_USER=admin \
-e RABBITMQ_DEFAULT_PASS=pass  \
-v /data/rabbitmq/rabbitmq_test:/var/lib/rabbitmq \
rabbitmq:3.6.14-management
```

ps:latest版本没有管理界面，管理界面注意选择management版本。

https://www.rabbitmq.com/download.html

#### 集群镜像模式

RabbitMQ提供了一个Autocluster插件，可以自动创建RabbitMQ集群。
基于RabbitMQ的官方docker镜像，添加这个autocluster插件，构建我们自己的Rabbit镜像，在DomeOS部署使用这个镜像。

注意事项：

- **Autocluster插件适用于低于3.7.X版本**
  **对3.7.X及以上版本使用abbitmq_peer_discovery_k8s插件**

- 部署类型使用StatefulSet

- AUTOCLUSTER_CLEANUP 设置为false,默认值也为false

**RABBITMQ及Autocluster插件参数说明：**

**AUTOCLUSTER_CLEANUP** 这个环境变量是用来设置自动清除不健康的节点，
需要配合CLEANUP_WARN_ONLY=false，同时也依赖CLEANUP_INTERVAL这个参数，默认是60s，
每隔一分钟进行一次检测，当检测到不健康节点的时候，
就会把节点从集群中删除，对应的节点上的数据也相应丢失，如果对应的queue没设置成mirror queue是非常危险的。所以一般会AUTOCLUSTER_CLEANUP =false。

如果AUTOCLUSTER_CLEANUP设置成true，当不健康节点节点从集群中剔除，后面故障节点又重新起来后，
由于故障节点中存储的的信息中，包含该节点属于之前的集群，所以节点在起来后会尝试加入之前的集群，但是之前的集群已经吧它剔除， 所以导致故障节点一直起不来，并且报错，具体错误信息参照问题汇总3。 这个时候，需要吧对应的故障节点的数据目录下的mnesia数据目录（mnesia数据目录是erlang自带的mnesia数据库的数据存储目录）。
然后重启节点，让节点重新加入集群。

**RABBITMQ_ERLANG_COOKIE生成命令**
生成.erlang.cookie
echo $(openssl rand -base64 32)

**RABBITMQ_NODENAME设置**
需要指定rabbitmq nodename,可以通过env查看拼接。
不指定AUTOCLUSTER使用默认值导致创建集群失败。

yaml变量设置参考

```
RABBITMQ_DEFAULT_USER	admin	
RABBITMQ_DEFAULT_PASS	pass	
RABBITMQ_ERLANG_COOKIE	xxx
RABBITMQ_NODE_TYPE	disc	
RABBITMQ_USE_LONGNAME	true	
AUTOCLUSTER_TYPE	k8s	
K8S_SERVICE_NAME	rabbitmq部署服务svc
K8S_HOST	k8s的svc	kubernetes+命名空间+cluster-domain拼接
K8S_PORT	443	
AUTOCLUSTER_LOG_LEVEL	debug
RABBITMQ_NODENAME	rabbit@$(MY_POD_IP)
```

部署过程可参考

https://blog.frognew.com/2017/09/kubernetes-rabbitmq-stateful-set.html#

#### rabbitmq备份还原

由于这边只做元数据备份和还原。参考如下链接

https://www.cnblogs.com/heruiguo/p/11045288.html#_label1

#### rabbitmq监控

选择单独部署rabbitmq_exporter监控rabbit集群

```
/etc/systemd/system/rabbitmq_exporter.service

[Unit]
Description=rabbitmq_exporter
After=network.target
[Service]
Type=simple
User=root
ExecStart=/data/apps/rabbitmq_exporter/rabbitmq_exporter -config-file /data/apps/rabbitmq_exporter/config.json
Restart=on-failure
[Install]
WantedBy=multi-user.target
```

prometheus增加配置

```
  - job_name: 'rabbitmq-online'
    static_configs:
      - targets: ["192.168.0.110:9419"]
```

grafana导入看板2121。

监控指标参考如下。

https://blog.csdn.net/yaomingyang/article/details/103978330

过滤对应的指标，添加到grafana展示。

#### 问题汇总

- `"pod_name": nxdomain (non-existing domain)`
  RABBITMQ_NODENAME 配置不对，可以通过容器内执行env 查看容器启动后的rabbitmq名称。

- `Error: {inconsistent_cluster,"Node 'rabbit@172.29.44.2' thinks it's clustered with node 'rabbit@172.29.120.3', but 'rabbit@172.29.120.3' disagrees"}`

  查看集群状态，执行forget_cluster_node节点。
  rabbitmqctl cluster_status
  rabbitmqctl forget_cluster_node rabbit@${MY_POD_IP};

  如果一个节点在与集群失去联系后被重置，它将表现得像一个空白节点。注意，其他集群成员可能仍然认为它是集群成员，
  在这种情况下，双方会产生分歧，节点将无法加入。还必须使用针对现有集群成员执行的rabbitmqctl forget_cluster_node从集群中删除此类重置节点。
  https://blog.csdn.net/zhongbeida_xue/article/details/117447892

- `{"init terminating in do_boot",{error,{inconsistent_cluster,"Node 'rabbit@rabbit_slave' thinks it's clustered with node 'rabbit@rabbit_master', but 'rabbit@rabbit_master' disagrees"}}}
  init terminating in do_boot ()`
  `Crash dump is being written to: erl_crash.dump...`

  删除宿主节点对应挂载点mnesia数据目录下数据。

  问题2，3为**AUTOCLUSTER_CLEANUP设置为ture多次出现。所以建议AUTOCLUSTER_CLEANUP设置为false，即默认即可**



参考地址：

https://www.cnblogs.com/cao-lei/p/13050206.html

https://www.cnblogs.com/xiaozhang666/p/13866121.html

https://www.cnblogs.com/caoweixiong/p/12736573.html