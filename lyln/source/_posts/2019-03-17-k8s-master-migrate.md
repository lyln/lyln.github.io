---
layout: post
title: k8s master节点迁移
categories: Docker
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/2019-11-12-kubernetes.jpg
tags: k8s
date: 2019-03-17
---

### 环境概况

#### master节点涉及组建

```
kube-apiserver
kube-scheduler
kube-controller-manager
flanneld
```

#### node节点涉及组建

```
kubelet
kube-proxy
flanneld
```

#### etcd集群

[etcd集群迁移](http://www.inshub.cn/2020/11/21/2020-11-21-etcd-migrate-date-md/)

#### master节点迁移

**部署完新的master节点后，修改旧master节点配置**

```
改旧的apiserver 192.168.1.144 组件配置，加上选主等配置
首先disable !!! 
systemctl disable kube-apiserver
systemctl disable kube-scheduler
systemctl disable kube-controller
修改为
/etc/sysconfig/kube-apiserver
KUBE_APISERVER_OPTS='--apiserver-count=2'
修改为
/etc/sysconfig/kube-scheduler
KUBE_SCHEDULER_OPTS='--leader-elect=true'
修改为
/etc/sysconfig/kube-controller
KUBE_CONTROLLER_OPTS='--cloud-provider= --leader-elect=true'
修改kube-apiserver的etcd地址
ETCD_SERVERS='--etcd-servers=新的etcd地址'
systemctl restart kube-apiserver
systemctl restart kube-scheduler
systemctl restart kube-controller
```

**修改新的apiserver组件配置，加上选主等配置**

```
修改为
/etc/sysconfig/kube-apiserver
KUBE_APISERVER_OPTS='--apiserver-count=2'
修改为
/etc/sysconfig/kube-scheduler
KUBE_SCHEDULER_OPTS='--leader-elect=true'
修改为
/etc/sysconfig/kube-controller
KUBE_CONTROLLER_OPTS='--cloud-provider= --leader-elect=true'
修改kube-apiserver的etcd地址
ETCD_SERVERS='--etcd-servers=新的etcd地址'
systemctl restart kube-apiserver
systemctl restart kube-scheduler
systemctl restart kube-controller
```

**修改所有节点flannel的etcd地址**

```

禁用flanneld
ansible -i inventory/appserver/online_node.yml online_node -m shell -a "systemctl disable flanneld"
修改flanneld地址
ansible -i inventory/appserver/online_node.yml online_node -m shell -a "sed -i 's/old_ip/new_ip/g' /etc/sysconfig/flanneld"
ansible -i inventory/appserver/online_node.yml online_node -m shell -a "sed -i 's/old_ip/new_ip/g' /etc/sysconfig/flanneld"
重启flanneld
ansible -i inventory/appserver/online_node.yml online_node -m shell -a "systemctl restart flanneld"
开机启动flanneld
ansible -i inventory/appserver/online_node.yml online_node -m shell -a "systemctl enable flanneld"
如果回滚，调换下ip位置。按同样方式执行。

```

**同理修改kubelet,kube-proxy的配置文件**

观察一段时间，测试功能，一切没问题的话，停止旧的apiserver。

**去掉新apiserver 选主配置**

切换观察如果没问题后，关机迁移旧的 master节点后，去掉新的apiserver选主等配置重启。

