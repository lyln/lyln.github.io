---
layout: post
title: kubevirt初体验
categories: K8S
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/kubevirt.png
tags: kubevirt
date: 2022-05-21
---

在云计算发展过程中，有两类虚拟化平台技术:
• OpenStack(laaS):关注虚拟机的计算、网络和存储资源管理
• Kubernetes(PaaS):关注容器的自动化部署、编排调度和发布管理

![kubevirt](https://inshub.oss-cn-beijing.aliyuncs.com/blog/kubevirt.png)

#### 安装Kubevirt组件

```
如果虚拟化不可用，则需要手动开启软件仿真
kubectl create configmap kubevirt-config -n kubevirt --from-literal debug.useEmulation=true --from-literal feature-gates=Macvtap,LiveMigration,Snapshot

# LiveMigration 开启迁移功能
# Snapshot 开启快照功能

export VERSION=v0.46.1
echo $VERSION
kubectl create -f https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/kubevirt-operator.yaml
kubectl create -f https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/kubevirt-cr.yaml

```

检查实例是否正常运行
```
kubectl get pods -n kubevirt
```

<!--more-->

#### 使用KubeVirt创建虚拟机

```
wget https://kubevirt.io/labs/manifests/vm.yaml 
kubectl apply -f vm.yaml
kubectl get vm

vm.yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: testvm
spec:
  running: false
  template:
    metadata:
      labels:
        kubevirt.io/size: small
        kubevirt.io/domain: testvm
    spec:
      domain:
        devices:
          disks:
            - name: containerdisk
              disk:
                bus: virtio
            - name: cloudinitdisk
              disk:
                bus: virtio
          interfaces:
          - name: default
            masquerade: {}
        resources:
          requests:
            memory: 64M
      networks:
      - name: default
        pod: {}
      volumes:
        - name: containerdisk
          containerDisk:
            image: quay.io/kubevirt/cirros-container-disk-demo
        - name: cloudinitdisk
          cloudInitNoCloud:
            userDataBase64: SGkuXG4=
```

#### virtctl常用命令
```

export VERSION=v0.41.0
wget https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/virtctl-${VERSION}-linux-amd64
copy virtctl-v0.41.0-linux-amd64 /usr/local/sbin/virtctl
chmod +x /usr/local/sbin/virtctl

virtctl start testvm 
virtctl stop testvm 
virtctl restart testvm

virtctl console testvm
退出虚拟机
快捷键： ctrl+]

```

#### 创建虚拟机快照和恢复
snap.yaml
```
apiVersion: snapshot.kubevirt.io/v1alpha1
kind: VirtualMachineSnapshot
metadata:
  name: snap-testvm
spec:
  source:
    apiGroup: kubevirt.io
    kind: VirtualMachine
    name: testvm
```
查看快照
`kubectl get virtualmachinesnapshot.snapshot.kubevirt.io`

recovery-snap.yaml
```
apiVersion: snapshot.kubevirt.io/v1alpha1
kind: VirtualMachineRestore
metadata:
  name: restore-testvm
spec:
  target:
    apiGroup: kubevirt.io
    kind: VirtualMachine
    name: testvm
  virtualMachineSnapshotName: snap-testvm
```
查看恢复快照
`kubectl get virtualmachinerestore.snapshot.kubevirt.io`

目前测试镜像快照和恢复有问题，恢复虚拟机快照数据丢失。




#### 虚拟机迁移
`virtctl migrate testvm`

会将虚拟机vm从一个节点迁移到另外一台节点上，测试从旧节点迁移到新节点，不会丢数据。

查看命令
```
kubectl get pods -o wide
NAME                         READY   STATUS     RESTARTS   AGE   IP              NODE          NOMINATED NODE   READINESS GATES
virt-launcher-testvm-bwfh8   3/3     Running    0          14m   172.12.124.24   node-117   <none>           <none>
virt-launcher-testvm-znv55   1/3     NotReady   0          21h   172.12.64.96    node-119   <none>           <none>

迁移前
kubectl get vmi
NAME     AGE   PHASE     IP              NODENAME      READY
testvm   21h   Running   172.12.64.96    node-119   Tru


迁移后
kubectl get vmi
NAME     AGE   PHASE     IP              NODENAME      READY
testvm   21h   Running   172.12.124.24   node-117   Tru

```


#### kubevirt磁盘和卷
在 spec.volumes 下可以指定多种类型的卷:
cloudInitNoCloud:Cloud-init相关的配置，用于修改或者初始化虚拟机中的配置信息 containerDisk:指定一个包含 qcow2 或 raw 格式的 docker 镜像，重启 vm 数据会丢失 dataVolume:动态创建一个 PVC，并用指定的磁盘映像填充该 PVC，重启 vm 数据不会丢失 emptyDisk:从宿主机上分配固定容量的空间，映射到vm中的一块磁盘，emptyDisk 的生命周期与 vm 等同，重启 mv 数据会丢失
ephemeral: 在虚机启动时创建一个临时卷，虚机关闭后自动销毁，临时卷在不需要磁盘持久性的任何情 况下都很有用。
hostDisk:在宿主机上创建一个 img 镜像文件，挂给虚拟机使用。重启 vm 数据不会丢失。 persistentVolumeClaim: 指定一个 PVC 创建一个块设备。重启 vm 数据不会丢失。
configMap
serviceAccount
secret : 可以把信息configMap，serviceAccount，secret写入到 iso 磁盘中，挂给虚拟机。


#### 删除命名空间下异常pod
delete_unexpect_pods.sh
```
namespace=$1
list=`kubectl get pods -n $namespace | grep UnexpectedAdmissionError |awk '{print $1}'`
for i in $list;do echo $i; kubectl delete pods -n $namespace $i;done
```

#### 参考链接

http://kubevirt.io/user-guide