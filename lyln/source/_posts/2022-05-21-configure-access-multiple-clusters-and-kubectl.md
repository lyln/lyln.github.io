---
layout: post
title: k8s配置多集群访问和kubectl自动补全
categories: K8S
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/kubecolor.png
tags: kubectl
date: 2022-05-21
---

#### 定义集群、用户和上下文

```
config-demo

apiVersion: v1
clusters:
- cluster:
    certificate-authority: fake-ca-file
    server: https://1.2.3.4
  name: development
- cluster:
    insecure-skip-tls-verify: true
    server: https://5.6.7.8
  name: scratch
contexts:
- context:
    cluster: development
    namespace: frontend
    user: developer
  name: dev-frontend
- context:
    cluster: development
    namespace: storage
    user: developer
  name: dev-storage
- context:
    cluster: scratch
    namespace: default
    user: experimenter
  name: exp-scratch
current-context: ""
kind: Config
preferences: {}
users:
- name: developer
  user:
    client-certificate: fake-cert-file
    client-key: fake-key-file
- name: experimenter
  user:
    password: some-password
    username: exp

```

多集群配置，将云上或者集群对应的配置复制到config-demo对应的
clusters
contexts
users
下，即可。如果多个集群冲突contexts下修改对应的名字就行。

<!--more-->

#### 常用切换集群命令

```
alias kubectl='/usr/local/sbin/kubectl --kubeconfig /etc/sysconfig/kubeconfig'

kubectl config get-contexts
kubectl config use-context append-test
kubectl config current-context

```

获取当前K8S上下文
`kubectl config current-context`

获取取全局上下文
`kubectl config get-contexts`

切换当前上下文
`kubectl config use-context kubernetes-dev`

#### kubectl自动补全
```
yum install -y bash-completion
source /usr/share/bash-completion/bash_completion
source <(kubectl completion bash)
echo "source <(kubectl completion bash)" >> ~/.bashrc

```

#### kubecolor显示输出
```
https://github.com/hidetatz/kubecolor 下载二进制后cp到/usr/local/sbin/

alias kubectl="kubecolor" kube自动补全会提示kubecolor，修改为kbc
alias kubectl='kbc'

```

#### 参考链接

https://kubernetes.io/zh/docs/tasks/access-application-cluster/configure-access-multiple-clusters/

https://github.com/hidetatz/kubecolor