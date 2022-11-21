---
layout: post
title: Windows Server2008 elk监控服务器日志和防火墙日志
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/win_server_elk.png
tags: win-server elk syslog elastic logstash kibana
date: 2022-10-01
---

![win_server_elk](https://inshub.oss-cn-beijing.aliyuncs.com/blog/win_server_elk.png)

Win2008搭建elk收集防火墙日志和服务器日志，用于安全审核。本文记录下搭建过程中的注意事项和遇到的一些问题。

**组件如下：**

- Syslog: 记录设备的系统日志信息
- Logstash: 数据过滤组件，用于收集和日志过滤等
- Winlogbeat: 收集windows系统日志
- Metricbeat: 收集Elasticsearch指标,kibana监控es展示需要此插件
- Elasticsearch: 全文索引引擎+存储
- Kibana: 可视化平台，可展示、检索、管理Elasticsearch中的数据。
- Nginx: 反向代理，增加安全认证。
- NSSM:NSSM是一个服务封装程序，将exe封装为服务。

**注意事项：**

- 安装版本 6.8.22

  版本说明：本计划安装7.17.6版本的elk，但是kibana依赖nodejs版本。win2008 server不支持node版本，被迫放弃。 kibana7系列支持用户认证，所以7以下的版本只能通过nginx加简单的安全认证。

- win下部署所有服务都是用NSSM将exe封装为服务。通过win服务管理启动关闭等。

- win有防火墙规则，需要给 syslog服务开放端口。

**Elasticsearch安装**

```
解压，修改配置文件
cluster.name: es-cluster
node.name: elk-1
node.master: true
node.data: true
network.host: 0.0.0.0
http.port: 9200
path.data: D:/data/elk/elastic/data
path.logs: D:/data/elk/elastic/logs
http.cors.enabled: true
http.cors.allow-origin: "*"

elasticsearch可不用nssm
elasticsearch-service.bat install
elasticsearch-service.bat后面还可以执行这些命令
install: 安装Elasticsearch服务
remove: 删除已安装的Elasticsearch服务（如果启动则停止服务）
start: 启动Elasticsearch服务（如果已安装）
stop: 停止服务（如果启动）
manager:启动GUI来管理已安装的服务

curl http://localhost:9200
```

**Kibana安装**

```
解压，修改配置文件
server.port: 5601
server.host: "0.0.0.0"
server.name: "kibana-cluster"
elasticsearch.hosts: ["http://localhost:9200"]
elasticsearch.requestTimeout: 99999
#支持中文
i18n.locale: "zh-CN"

```

**NSSM使用**

```
https://nssm.cc/download

安装服务：nssm install 服务名
删除服务：nssm remove 服务名
删除服务确定：nssm remove 服务名 confirm 
修改服务（显示界面修改）：nssm edit 服务名
启动服务：nssm start 服务名
停止服务：nssm stop 服务名
重启服务：nssm restart 服务名

nssm.exe 放到程序目录

nssm install kibana 将kibana通过service.msi服务管理。

如果指定配置文件位置，nssm指定启动参数，不然会启动失败
Arguments：参数
-f D:\elk\logstash\config\syslog-security.conf
```

**Winlogbeat** 安装

```
winlogbeat.exe setup
.\winlogbeat.exe test config -c .\winlogbeat.yml

winlogbeat.yml
修改es和kibana地址

nssm安装为服务即可

要查看全部类型，在PowerShell中运行Get-EventLog *，更多信息请参考event_logs.name.

```

**Metricbeat** 安装

```
默认加载配置加载modules.d/system.yml
metricbeat.yml
setup.kibana:
  host: "localhost:5601"
output.elasticsearch:
  hosts: ["localhost:9200"]
 
nssm安装为服务即可
```

**Logstash安装**

```
收集防火墙日志syslog日志到es
logstash.yml
input {    
   syslog{
   		type => "syslog-security"
    	port => 514
   }
}
output {    
   elasticsearch {        
			hosts => ["localhost:9200"]        
      index => "syslog-security-%{+YYYY.MM}"    
   }
        
	#stdout {codec => rubydebug}
}
```

