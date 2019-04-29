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

kubectl scale sts myapp --replication=5
kubectl patch sts myapp --repli
```
