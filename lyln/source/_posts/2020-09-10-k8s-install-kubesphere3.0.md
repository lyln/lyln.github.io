---
layout: post
title: KubeSphere3.0踩坑指南
categories: k8s
index_img: https://wx1.sinaimg.cn/large/005yWAylly1gkfakr3ca0j31ez0ksgqe.jpg
tags: kubesphere
date: 2020-09-10
---

### 环境概况
```
ansible脚本部署k8s集群
k8s版本v1.17.11
helm版本v3.2.1
默认的 storageclass

```
### 部署准备

helm3安装
```
下载[helm3](https://get.helm.sh/helm-v3.4.0-linux-amd64.tar.gz)
tar -zxvf helm-v3.4.0-linux-amd64.tar.gz
mv linux-amd64/helm /usr/local/bin/helm

查看helm源
helm repo list
helm repo add stable http://mirror.azure.cn/kubernetes/charts
helm repo add incubator http://mirror.azure.cn/kubernetes/charts-incubator


helm inspect values harbor/harbor > values.yaml

helm install harbor harbor/harbor -f values.yaml

helm uninstall harbor
```
<!--more-->

nfs文件共享
```
yum install nfs-utils
cat /etc/exports
/data/apps/data/ *(rw,sync,no_root_squash)

#配置生效
exportfs -r
#查看生效
exportfs

showmount  -e
service nfs start

```

### 部署nfs默认存储
```
helm install my-nfs-provisioner --set nfs.server=192.168.10.116 --set nfs.path=/data/apps/data stable/nfs-client-provisioner -n kube-system

改变默认 StorageClass
kubectl patch storageclass nfs-client -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

### kubesphere3.0安装
```
kubesphere-installer.yaml 安装3.0
cluster-configuration.yaml 3.0组件配置文件
kubesphere-delete.sh 删除卸载3.0

/data/apps/opt/kubesphere

kubectl apply -f kubesphere-installer.yaml
kubectl apply -f cluster-configuration.yaml

重启安装ks-installer
kubectl rollout restart deploy -n kubesphere-system ks-installer
重新安装servicemesh
重新安装把status里servicemesh的status删掉，然后重启下ks-installer
kubectl edit cc -n kubesphere-system ks-installer

```
查看所有pod正常运行后
![kubesphere登陆界面](https://wx2.sinaimg.cn/large/005yWAylly1gkfbaoia8dj319o0jv75b.jpg)
默认用户/密码
```
admin/P@88w0rd
```
![kubesphere3.0](https://wx1.sinaimg.cn/large/005yWAylly1gkfakr3ca0j31ez0ksgqe.jpg)

### 强制删除
```

强制删除namespaces
kubectl  get ns kubesphere-system  -o json > tmp.json
kubectl proxy 
curl -k -H "Content-Type:application/json" -X PUT --data-binary @tmp.json http://127.0.0.1:8001/api/v1/namespaces/kubesphere-monitoring-system/finalize

kubectl get ns kubernetes-dashboard -o json | jq '.spec.finalizers=[]' | curl -X PUT http://localhost:8001/api/v1/namespaces/kube-node-lease/finalize -H "Content-Type: application/json" --data @-

kubectl get namespace "kube-node-lease" -o json   | tr -d "\n" | sed "s/\"finalizers\": \[[^]]\+\]/\"finalizers\": []/"   | kubectl replace --raw /api/v1/namespaces/kube-node-lease/finalize -f -



pv/pvc强制删除

kubectl patch pvc opspvc  -p '{"metadata":{"finalizers":null}}' -n kube-ops
kubectl patch pvc -n  kubesphere-monitoring-system prometheus-k8s-db-prometheus-k8s-0  -p '{"metadata":{"finalizers":null}}'


强制删除crds
kubectl get apiservices
kubectl get fluentbits.logging.kubesphere.io -n kubesphere-logging-system fluent-bit -o yaml > b.yaml
修改finalizers: null
kubectl apply -f b.yaml 即可强制删除。
```


### helm安装gitlab
```
helm pull gitlab
helm install gitlab gitlab-ce/ -f values.yaml
kubectl apply -f my-gitlab-com.yaml

卸载gitlab
helm delete gitlab
```

### 安装harbor
harbor安装使用docker-compose方式

docker添加私仓地址
```
DOCKER_OPTS="--log-level=warn --storage-driver=overlay2 --userland-proxy=false --log-opt max-size=1g --log-opt max-file=5 --insecure-registry=my.harbor.io"
```

### source to images
测试从gitlab代码库构建镜像

目的镜像地址
```
my.harbor.io/s2i/s2i-test
```

参考地址：<https://v2-1.docs.kubesphere.io/docs/zh-CN/quick-start/source-to-image/>

### 构建流水线
kubesphere测试使用流水线构建流程
参考地址: <https://v2-1.docs.kubesphere.io/docs/zh-CN/quick-start/devops-online/>

![kubesphere构建流水线](https://wx1.sinaimg.cn/large/005yWAylly1gkfmhaqyt1j315l0lbtdd.jpg)

### 目前问题
服务治理，流量数据展示有问题，还没有解决。
istio版本是1.4.8，其他同学说是可以，可以一起探讨下。
