---
layout: post
title:  "K8S常用命令"
categories: K8S
tags: kubernetes
date: 2018/12/08
---

```
获取集群状态
kubectl get componentstatus 
kubectl get cs

获取node节点
kubectl get nodes

获取node节点ip
kubectl get node -o json |grep  "address" |grep -v 'addresses' |awk  '{ print $2}' |sort -nr |uniq |cut -d'"' -f2

kubectl scale sts myapp --replication=5
kubectl patch sts myapp --repli

更新指定容器镜像版本
kubectl set image deployment/myapp busybox=busybox:v2

回滚
kubectl rollout undo deployment/myapp

扩容
kubectl scale --replicas=3 deployment myapp
缩容
kubectl scale --replicas=3 deployment myapp

观察更新状态
kubectl rollout status deployment myapp

查看历史版本
kubectl rollout history deployment myapp

查看节点的 label。
kubectl get nodes --show-labels

增加label
kubectl label node k8s-node1 app=zk

kubectl label pod myapp-01 app=myapp
kubectl get pod -Lapp

删除 label app，执行如下命令：
kubectl label node k8s-node1 app-
- 即删除。


根据标签查询节点
kubectl get node -a -l "node=kube-node"

kubectl label nodes 10.126.72.31 points=test
会给10.126.72.31这个节点添加一个标签：points=test

```