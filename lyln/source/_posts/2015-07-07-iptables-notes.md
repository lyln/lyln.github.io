---
layout: post
title: "iptables notes"
categories: Linux
tags: Linux
---

#### 链
```bash
INPUT：位于filter表，匹配目的ip是本机的数据包
FORWARD： 位于filter表，匹配穿越本机的数据包
PREROUTING： 位于 nat 表，用于修改目的地址（DNAT）
POSTROUTING：位于 nat 表，用于修改源地址（SNAT）
OUTPUT：位于filter表，匹配源ip是本机的数据包
```

#### 清空
```bash
iptables -F 清空所有规则链(谨慎用，尤其是默认策略是DROP)
iptables -X 删除特定手工设置的链
iptables -Z 清空计数器
```
<!--more-->
#### 修改默认策略
```bash
iptables -P INPUT DROP 
iptables -P OUTPUT DROP 
iptables -P FORWARD DROP
```

#### 保存恢复
```bash
iptables-save用来保存当前内存空间的策略，
iptables-restore用来将iptables配置文件的策略写入内存空间。
```

#### 查看规则
```bash
iptables -nvL --line
iptables -t nat -L -n --line
```

#### 删除规则
```bash
iptables -D INPUT num_id
iptables -t nat -D PREROUTING num_id
```

#### 允许ping
```bash
iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT
iptables -A OUTPUT -p icmp --icmp-type echo-reply -j ACCEPT
```

#### 禁止ping
```bash
iptables -A INPUT -p icmp --icmp-type 8 -s 0/0 -j DROP
Echo request——回显请求（Ping请求）
```

#### 允许ping回环
```bash
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT
```

#### 开启ssh端口
```bash
iptables -A INPUT -i eth1 -p tcp -m tcp --dport 22 -j ACCEPT
iptables -A OUTPUT -o eth1 -p tcp -m tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT
```

#### 开启redis端口
```bash
iptables -A INPUT -d dest_host -p tcp --dport 6379 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -s dest_host -p tcp --sport 6379 -m state --state ESTABLISHED -j ACCEPT
```

#### 开启1234端口
```bash
iptables -A INPUT -i eth1 -p tcp --dport 1234 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o eth1 -p tcp --sport 1234 -m state --state ESTABLISHED -j ACCEPT
```

#### 开启域名解析并允许访问固定ip
```bash
iptables -A INPUT -p udp --sport 53 -j ACCEPT
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT

iptables -A OUTPUT -d 0.0.0.0/0 -j ACCEPT
iptables -A INPUT -s 182.92.18.4 -j ACCEPT
```

