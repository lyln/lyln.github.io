---
layout: post
title: zabbix跨版本升级避坑指南(3.2-5.0)
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/Grafana-Zabbix.png
tags: zabbix
date: 2022-09-01
---

由于最近zabbix服务需要迁移，在运行的zabbix版本为Zabbix 3.2.4,所以趁这次迁移也把Zabbix版本。本计划直接升级为zabbix6.0(zabbix6.0支持原生高可用集群），但是由于这边db版本问题（zabbix6.0需要mysql8）。暂且升级为zabbix5版本。

![zabbix-update-3to5](https://inshub.oss-cn-beijing.aliyuncs.com/blog/zabbix-update-3to5.png)

#### 升级流程
升级流程大致如下：
1.搭建ha环境
2.搭建新的zabbix5 server环境
3.备份旧zabbix数据导入新zabbix server
4.两边关闭报警（禁用Media types），批量替换zabbix agent配置。

#### 环境说明
| ip            | keepalive         | nginx        | linux   |
| ------------- | ----------------- | ------------ | ------- |
| 192.168.0.101 | Keepalived v1.3.5 | nginx/1.12.1 | Centos7 |
| 192.168.0.102 | Keepalived v1.3.5 | nginx/1.12.1 | Centos7 |
| vip           | 192.168.0.168     |              |         |


#### zabbix监听端口
| Zabbix component    | Port number | Protocol | Type of connection |
| :------------------ | :---------- | :------- | :----------------- |
| Zabbix agent        | 10050       | TCP      | on demand          |
| Zabbix agent 2      | 10050       | TCP      | on demand          |
| Zabbix server       | 10051       | TCP      | on demand          |
| Zabbix proxy        | 10051       | TCP      | on demand          |
| Zabbix Java gateway | 10052       | TCP      | on demand          |


#### 搭建ha环境
安装keeplaived+nginx主备环境
```
yum install keepalive
yum install nginx
```
由于nginx及zabbix server本身就部署在192.168.0.101/102这两台，所有无需配置virtual_serve(LVS负载均衡)。
keepalive配置参考
```
! Configuration File for keepalived

global_defs {
   router_id KEEPALIVED_ZABBIX_101
}

vrrp_script chk_http_nginx {   
    script "/etc/keepalived/check_nginx_status.sh"    #一句指令或者一个脚本文件，需返回0(成功)或非0(失败)，keepalived以此为依据判断其监控的服务状态。
    interval 1   #健康检查周期
    #weight -10   #优先级变化幅度，如果script中的指令执行失败，那么相应的vrrp_instance的优先级会减少10个点。
}

vrrp_instance Z1 {
    state MASTER
    nopreempt  # nopreempt 允许一个priority比较低的节点作为master，即使有priority更高的节点启动
    interface eth0 # interface 节点固有IP（非VIP）的网卡，用来发VRRP包
    virtual_router_id 144 # virtual_router_id 取值在0-255之间，用来区分多个instance的VRRP组播， 同一网段中virtual_router_id的值不能重复，否则会出错
    priority 200
    advert_int 1 # advert_int 发VRRP包的时间间隔，即多久进行一次master选举（可以认为是健康查检时间间隔）
    authentication { # authentication 认证区域，认证类型有PASS和HA（IPSEC），推荐使用PASS（密码只识别前8位）
        auth_type PASS
        auth_pass 110
    }
    virtual_ipaddress { # 设置vip
        192.168.0.168/24
    }
	  track_script {
        chk_http_nginx
    }
}

```
两台配置唯一不同的就是**router_id、state以及priority**
**virtual_router_id** 注意保持一致！

`router_id` KEEPALIVED_ZABBIX_101
router_id 标识本节点的字符串，通常为hostname，但不一定非得是hostname。故障发生时，邮件通知会用到。

`state MASTER`
state MASTER或BACKUP，当其他节点keepalived启动时会将priority比较大的节点选举为MASTER，因此该项其实没有实质用途。

`priority 100`
priority用来选举master的，根据服务是否可用，以weight的幅度来调整节点的priority，
从而选取priority高的为master，该项取值范围是1-255（在此范围之外会被识别成默认值100）


check_nginx_status.sh参考
```
#!/bin/bash
/usr/bin/curl http://localhost &>/dev/null
if [ $? -ne 0 ]
then
systemctl stop keepalived
systemctl stop zabbix-server
#ssh 192.168.0.102 "systemctl start zabbix-server"
fi
```

模拟停掉keepalive或者nginx，查看keepalived测试vip漂移
`journalctl -f -u keepalived`


#### 搭建新的zabbix5 server环境

先搭建lnmp环境
https://www.zabbix.com/documentation/5.0/en/manual/installation/requirements
注意查看版本要求，尤其php，mysql版本
不然你可能会卸载重装～

```
#修改epel源
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
yum install -y epel-release

#php yum源
rpm -ivh http://rpms.famillecollet.com/enterprise/remi-release-7.rpm

#php74安装
yum install -y php74-php-gd php74-php-bcmath php74-php-mbstring php74-php-mysqlnd php74-php-ldap php74-php-xml 
yum install -y php74-php-fpm
```
nginx配置参考
```
	listen       80;
	server_name  localhost;
	#charset koi8-r;
	#access_log  logs/host.access.log  main;
	location / {
		root   /data/zabbix;
		index  index.php;
		allow 192.168.0.0/16;
		deny all;
	}
	error_page   500 502 503 504  /50x.html;
	location = /50x.html {
	root   html;
	}
	# proxy the PHP scripts to Apache listening on 127.0.0.1:80
	#
	location ~ \.php$ {
	root /data/zabbix;
	fastcgi_pass   127.0.0.1:9000;
	fastcgi_index  index.php;
	fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
	include        fastcgi_params;
	}

```
php info查看配置详情,查看php.ini位置，修改参数
```
nginx添加info.php
/data/zabbix/info.php
<?php
echo phpinfo();
?>
```

Configuration File (php.ini) Path	
```
php_value max_execution_time 300
php_value memory_limit 128M
php_value post_max_size 16M
php_value upload_max_filesize 2M
php_value max_input_time 300
php_value max_input_vars 10000
php_value always_populate_raw_post_data -1
php_value date.timezone Asia/Shanghai

修改完重启php-fpm。
```
lnmp环境搭建完毕。

**zabbix server编译安装**
```
wget https://cdn.zabbix.com/zabbix/sources/stable/5.0/zabbix-5.0.26.tar.gz
tar -zxvf zabbix-5.0.26.tar.gz

groupadd --system zabbix
useradd --system -g zabbix -d /usr/lib/zabbix -s /sbin/nologin -c "Zabbix Monitoring System" zabbix

yum install zlib-devel
yum install libevent-devel  -y
yum install curl-devel

./configure --prefix=/data/apps/zabbix-server --enable-server --enable-agent --with-mysql --with-net-snmp --with-libcurl
make && make install -j2

```

zabbix_server.conf配置参考
```

ListenPort=10051
SourceIP=192.168.0.168
LogFile=/data/logs/zabbix/zabbix_server.log
LogFileSize=1024
PidFile=/data/apps/zabbix-server/zabbix_server.pid
DBHost=dbhost
DBName=zabbix
DBUser=zabbix
DBPassword=zabbixpass
StartPollers=100 #看配置自行调整参数
StartPollersUnreachable=50
StartTrappers=50
StartPingers=5
StartDiscoverers=30
StartHTTPPollers=20
CacheSize=8G
HistoryCacheSize=1G
HistoryIndexCacheSize=1G
TrendCacheSize=1G
ValueCacheSize=4G
Timeout=30
FpingLocation=/usr/sbin/fping
LogSlowQueries=3000
AllowRoot=1
User=root
StatsAllowedIP=127.0.0.1
```

#### 备份旧zabbix数据导入新zabbix server
备份原来的zabbix数据，（history/history_uint/trends/trends_uint）这4张表数据比较大，备份可跳过。新的mysql库清空。给予新zabbix用户**足够的权限**,systemctl启动zabbix_server,
查看zabbix_server.log。zabbix会自动升级表结构，看日志报错解决即可。

notes:
数据库可能会修改的参数

```
set GLOBAL SQL_SAFE_UPDATES=0
set GLOBAL innodb_large_prefix=1
```

ui配置
zabbix-5.0.26/ui目录同步到/data/zabbix目录下，conf/zabbix.conf.php web相关的配置

访问http://vip_ip 即可。

#### 批量替换zabbix agent配置

新zabbix server启动后，记得禁用报警的方式，不然会收到一坨报警。如果误操作，看下面的【问题处理】

获取所有zabbix主机
zabbix_get_all_hosts.py脚本参考
```
# -*-coding: utf-8 -*-
import requests
import json

headers = {'Content-Type': 'application/json-rpc'}
server_ip = 'zabbix server_ip'
url = 'http://%s/api_jsonrpc.php' % server_ip
username = 'username'
passwd = 'password'
# 获取token
def getToken():
    # url = 'http://%s/zabbix/api_jsonrpc.php'%server_ip
    # headers = {'Content-Type': 'application/json-rpc'
    data = {
        "jsonrpc": "2.0",
        "method": "user.login",
        "params": {
            "user": username,
            "password": passwd
        },
        "id": 0
    }
    request = requests.post(url=url, headers=headers, data=json.dumps(data))
    dict = json.loads(request.text)
    return dict['result']
# 从api获取主机信息，
def getHosts(token_num):
    data = {
        "jsonrpc": "2.0",
        "method": "host.get",
        "params": {
            "output": [
                "hostid",
                "host"
            ],
            "selectInterfaces": [
                "interfaceid",
                "ip"
            ]
        },
        "id": 2,
        "auth": token_num,

    }

    request = requests.post(url=url, headers=headers, data=json.dumps(data))
    dict = json.loads(request.content)
    # print dict['result']
    return dict['result']

# 整理信息,输出想要的信息，组合成字典，我这边提出ip。
def getProc(data):
    dict = {}
    list = data
    for i in list:
        host = i['host']
        inter = i['interfaces']
        for j in inter:
            ip = j['ip']
            dict[host] = ip

    return dict

# 排序ip列表
def getData(dict):
    data = dict
    ip_list = []
    for key in data.keys():
        ip = data[key]
        ip_list.append(ip)
    ip_list = list(set(ip_list))
    ip_list.sort()
    return ip_list

# 整理输出ip
def getGroup(ip_list):
    ip_group = {}
    ips = ip_list
    for i in ips:
        print(i)

if __name__ == "__main__":
    token_num = getToken()
    data = getHosts(token_num)
    hosts = getProc(data)
    ip_list = getData(hosts)
    getGroup(ip_list)

```
modiy_zabbix_server.sh脚本参考
```
if [ $# -ne 1 ];then
        echo "Usage: ./`basename $0` host_ip_list"
        exit 1;
fi
for i in `grep -v ^# $1`;
do
        timestamps=`date +%F`
	echo $i
	ssh $i "cp /etc/zabbix_agentd.conf /etc/zabbix_agentd.conf-${timestamps}"
        ssh $i "sed -i 's/old_server/new_server/g' /etc/zabbix_agentd.conf"
        ssh $i "service zabbix_agentd restart"
	ssh $i "grep -i server /etc/zabbix_agentd.conf |grep -v '#'"
done

```
运行批量修改脚本前，可以先ansible ping过滤下机器是否可登录。

批量修复后可以观察zabbix server状态，如果有些angent有问题可以逐个修复。

#### grafana配置zabbix数据源
grafana扩展zabbix数据源插件
```
grafana-cli plugins install alexanderzobnin-zabbix-app
systemctl restart grafana-server

```
界面配置参数
```
Url: http://zabbix.local/zabbix/api_jsonrpc.php #zabbix服务器api地址,注意是否有zabbix
Access: Browser
Username: zabbix用户名
Password：zabbix密码
```
导入grafana看板，16896。（觉得不错可以给个star）
zabbix作为数据源的弊端就是需要Item的名称统一，如果看板没有数据，可以先从zabbix看是不是item有区别于模版，自行修复。
用zabbix数据源，grafana的通用型和可扩展性的相比于NodeExporter还是差一些。

最终效果

![Grafana-Zabbix](https://inshub.oss-cn-beijing.aliyuncs.com/blog/Grafana-Zabbix.png)


#### 问题处理

**Zabbix告警队列清理**

```
场景：由于网络故障导致，导致zabbix几百上千台机子告警，邮件失败多次尝试发送，导致堆积了很多告警队列，其他邮件产生了时延
处理：
方法1、通过修改mysql的zabbix库alerts表,把状态改为已发送或发送失败 （建议使用）
方法2、直接清理alerts表，但这种操作会导致action日志也被清理
说明：alerts表为告警日志表，记录zabbix action发送过的信息，status字段含义：0表示待发送，1表示发送正常，2表示发送失败
建议：在对数据库进行修改或删除操作时，对数据进行备份，命令：mysqldump -u -p 库名 表名 >表名.sql

方法一：
1、查看alerts目前存在多少待发送的action;
mysql> select count(*) from alerts where status =0;
2、对待发送的action进行状态更新
mysql> update zabbix.alerts set status = 1 where status = 0;
3、重启zabbix-server服务
#systemctl restart zabbix_server

方法二：
（该方法请先备份alerts表）
1、查看alerts表创建的语句,记录，后面清理后需重新创建
mysql> show create table alerts；
2、删除alerts表
mysql>drop table alterts；
3、重启zabbix-server服务，查看状态是否正常
#systemctl restart zabbix_server
```

#### 参考地址

https://www.jianshu.com/p/53382fdeab28
https://www.cnblogs.com/phpdragon/p/14710830.html
https://www.zabbix.com/documentation/5.0/en/manual/installation/requirements