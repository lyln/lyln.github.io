---
layout: post
title: "CAT集群部署"
categories: Linux
tags: cat
date: 2019/05/15
---

### cat集群机器列表
cat1
192.168.1.110 8080
cat2
192.168.1.111 8080
cat3
192.168.1.112 8080


### 部署tomcat
新建setenv.sh然后添加环境变量
```
bin/setenv.sh
export CAT_HOME=/data/apps/data/cat/
export JAVA_OPTS="-server -Xms10g -Xmx10g -Xmn8g -XX:PermSize=256m -XX:MaxPermSize=512m -Dfile.encoding=UTF-8 -verbose:gc -Xloggc:${CATALINA_HOME}/logs/gc.log`date +%Y-%m-%d-%H-%M` -XX:+UseConcMarkSweepGC -XX:+CMSIncrementalMode -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -noclassgc"

server.xml
<Connector port="8080" protocol="HTTP/1.1"
           URIEncoding="utf-8"    connectionTimeout="20000"
               redirectPort="8443" />  <!-- 增加  URIEncoding="utf-8"  -->  

CAT_HOME目录权限
chmod -R 777 $CAT_HOME

```
<!--more-->

### 配置/data/appdatas/cat/client.xml ($CAT_HOME/client.xml)
```
client.xml
<?xml version="1.0" encoding="utf-8"?>
<config mode="client">
    <servers>
        <server ip="192.168.1.110" port="2280" http-port="8080"/>
        <server ip="192.168.1.111" port="2280" http-port="8080"/>
        <server ip="192.168.1.112" port="2280" http-port="8080"/>
    </servers>
</config>

```

### 安装CAT数据库
安装数据库并导入数据
```
mysql -uroot -Dcat < CatApplication.sql

```

### 配置/data/appdatas/cat/datasources.xml($CAT_HOME/datasources.xml)
```
<?xml version="1.0" encoding="utf-8"?>

<data-sources>
	<data-source id="cat">
		<maximum-pool-size>3</maximum-pool-size>
		<connection-timeout>1s</connection-timeout>
		<idle-timeout>10m</idle-timeout>
		<statement-cache-size>1000</statement-cache-size>
		<properties>
			<driver>com.mysql.jdbc.Driver</driver>
			<url><![CDATA[jdbc:mysql://192.168.1.110:3306/newsapp_cat]]></url>  <!-- 请替换为真实数据库URL及Port  -->
			<user>newsapp_cat</user>  <!-- 请替换为真实数据库用户名  -->
			<password>newsapp_cat_monitor</password>  <!-- 请替换为真实数据库密码  -->
			<connectionProperties><![CDATA[useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&socketTimeout=120000]]></connectionProperties>
		</properties>
	</data-source>
</data-sources>
```

### war打包
[官方下载](http://unidal.org/nexus/service/local/repositories/releases/content/com/dianping/cat/cat-home/3.0.0/cat-home-3.0.0.war)




### war部署
cat.war部署到webapps目录下。
默认用户名：admin 默认密码：admin。

```
<?xml version="1.0" encoding="utf-8"?>
<router-config backup-server="192.168.1.110" backup-server-port="2280">
   <default-server id="192.168.1.110" weight="1.0" port="2280" enable="false"/>
   <default-server id="192.168.1.111" weight="1.0" port="2280" enable="true"/>
   <default-server id="192.168.1.112" weight="1.0" port="2280" enable="true"/>
   <network-policy id="default" title="default" block="false" server-group="default_group">
   </network-policy>
   <server-group id="default_group" title="default-group">
      <group-server id="192.168.1.111"/>
      <group-server id="192.168.1.112"/>
   </server-group>
   <domain id="cat">
      <group id="default">
         <server id="192.168.1.111" port="2280" weight="1.0"/>
         <server id="192.168.1.112" port="2280" weight="1.0"/>
      </group>
   </domain>
</router-config>
```

### 服务端配置
配置链接：http://{ip:port}/cat/s/config?op=serverConfigUpdate
```
<?xml version="1.0" encoding="utf-8"?>
<server-config>
   <server id="default">
      <properties>
         <property name="local-mode" value="false"/>
         <property name="job-machine" value="false"/>
         <property name="send-machine" value="false"/>
         <property name="alarm-machine" value="false"/>
         <property name="hdfs-enabled" value="false"/>
         <property name="remote-servers" value="192.168.1.110:8080,192.168.1.111:8080,192.168.1.112:8080"/>
      </properties>
      <storage local-base-dir="/data/apps/data/cat/bucket/" max-hdfs-storage-time="15" local-report-storage-time="7" local-logivew-storage-time="7" har-mode="true" upload-thread="5">
         <hdfs id="logview" max-size="128M" server-uri="hdfs://10.1.77.86/" base-dir="user/cat/logview"/>
         <hdfs id="dump" max-size="128M" server-uri="hdfs://10.1.77.86/" base-dir="user/cat/dump"/>
         <hdfs id="remote" max-size="128M" server-uri="hdfs://10.1.77.86/" base-dir="user/cat/remote"/>
      </storage>
      <consumer>
         <long-config default-url-threshold="1000" default-sql-threshold="100" default-service-threshold="50">
            <domain name="cat" url-threshold="500" sql-threshold="500"/>
            <domain name="OpenPlatformWeb" url-threshold="100" sql-threshold="500"/>
         </long-config>
      </consumer>
   </server>
   <server id="192.168.1.110">
      <properties>
         <property name="job-machine" value="true"/>
         <property name="alarm-machine" value="true"/>
         <property name="send-machine" value="true"/>
      </properties>
   </server>
</server-config>
```

### notes:
<https://github.com/dianping/cat/wiki/readme_server>
