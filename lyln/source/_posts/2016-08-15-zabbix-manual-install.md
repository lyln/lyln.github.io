---
layout: post
title: "Zabbix 3.0 安装小记"
categories: Linux
tags: zabbix
---

### zabbix_server部署
1、Zabbix 3.0 for Ubuntu 14.04 LTS:
```
wget http://repo.zabbix.com/zabbix/3.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_3.0-1+trusty_all.deb
dpkg -i zabbix-release_3.0-1+trusty_all.deb
apt-get update
apt-get install zabbix-server-mysql zabbix-frontend-php #安装server和frontend
apt-get install zabbix-agent #安装agent
```
2、初始化数据库
```
cd /usr/share/doc/zabbix-server-mysql
zcat create.sql.gz | mysql -uroot zabbix
```
<!--more-->
3、修改nginx
```
server{
        server_name zabbix.xxx.com;
        listen 80;
        root /usr/share/zabbix;
        index index.html index.htm index.php portal.php default.php;
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
                root   /usr/share/nginx/html;
        }
        location ~ \.php$ {
                try_files $uri =404;
                fastcgi_pass   127.0.0.1:2088;
                fastcgi_index  index.php;
                fastcgi_param  SCRIPT_FILENAME    $document_root$fastcgi_script_name;
                fastcgi_param PATH_INFO $fastcgi_script_name;
                include        fastcgi_params;
                fastcgi_buffer_size 128k;
                fastcgi_buffers 256 16k;
                fastcgi_busy_buffers_size 256k;
                fastcgi_temp_file_write_size 256k;
        }
        #location ~ /\.ht {
        #deny  all;
        #}
}
```
4、修改php参数
```
/etc/php5/fpm/php.ini

max_execution_time 300
memory_limit 128M
post_max_size 16M
upload_max_filesize 2M
max_input_time 300
always_populate_raw_post_data -1
date.timezone = UTC
```
5、zabbix 配置
```
ListenPort=10051
LogFile=/var/log/zabbix/zabbix_server.log
LogFileSize=0
PidFile=/var/run/zabbix/zabbix_server.pid
DBHost=localhost
DBName=zabbix
DBUser=zabbix
DBPassword=pass
DBSocket=/tmp/mysql.sock
DBPort=3306
JavaGateway=10.254.140.104
JavaGatewayPort=10052
StartJavaPollers=5
ListenIP=10.254.140.104
Timeout=4
AlertScriptsPath=/etc/zabbix/sendEmail
ExternalScripts=/usr/lib/zabbix/externalscripts
FpingLocation=/usr/bin/fping
Fping6Location=/usr/bin/fping6
LogSlowQueries=3000
```
### zabbix_server邮件报警
1、修改zabbix_server配置
```
zabbix_server.conf
AlertScriptsPath=/etc/zabbix/sendEmail
```
2、安装sendemail
```
git clone https://github.com/mogaal/sendemail.git
cp -a sendEmail-v1.XX/sendEmail /usr/local/bin
chmod +x /usr/local/bin/sendEmail
```
3、添加脚本发邮件脚本
```
mail.sh

#!/bin/sh
#export.UTF-8 #解决发送邮件中文变成乱码的问题
to=$1
subject=$2
body=$3
/usr/local/bin/sendEmail -f itsupport@sevenga.com -t "$to" -s smtp.exmail.qq.com \
-u "$subject" -o message-content-type=html -o message-charset=utf8 \
-xu user@qq.com -xp mail_pass -m "$body" 2>>/tmp/sendEmail.log
```
4、web添加媒介类型
```
Administration->Media types->Create medis type

zabbix-agent安装
修改zabbix_agentd.conf

PidFile=/var/run/zabbix/zabbix_agentd.pid
LogFile=/var/log/zabbix-agent/zabbix_agentd.log
LogFileSize=0
Server=10.254.140.104  #zabbix server ip
ServerActive=10.254.140.104:10051 #zabbix server ip+port
Hostname=10.136.11.159 # 本机ip
Include=/etc/zabbix/zabbix_agentd.conf.d/
zabbix 监听tomcat
apt-get install zabbix-java-gateway
修改zabbix_java_gateway.conf

LISTEN_IP="10.254.140.104"
LISTEN_PORT=10052
PID_FILE="/var/run/zabbix/zabbix_java_gateway.pid"
START_POLLERS=5
TIMEOUT=3
在zabbix_server去掉如下选项注释

JavaGateway=10.254.140.104
JavaGatewayPort=10052
StartJavaPollers=5
```

### zabbix_agent端tomcat设置
1、[下载](http://repo2.maven.org/maven2/org/apache/tomcat/tomcat-catalina-jmx-remote/)与之对应的
tomcat-catalina-jmx-remote-8.0.36.jar到tomcat的lib目录下
2、修改catalina.sh
```
export CATALINA_OPTS="-Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false \
-Dcom.sun.management.jmxremote.port=12345 -Dcom.sun.management.jmxremote.ssl=false
-Djava.rmi.server.hostname=x.x.x.x"
```
3、重启tomcat和zabbix_java_gateway、zabbix_server
4、使用cmdline测试
```
java -jar cmdline-jmxclient-0.10.3.jar - 10.136.11.159:10053 java.lang:type=Memory NonHeapMemoryUsage
08/16/2016 16:20:07 +0800 org.archive.jmx.Client NonHeapMemoryUsage:
committed: 26083328
init: 2555904
max: -1
used: 25317240
```
5、下载jmx template
[jmx template 模板](https://raw.githubusercontent.com/lyln/Shell/master/zabbix/Templates/JMX_templates.xml)

### zabbix_agent远程拉起tomcat
1、zabbix_agentd.conf开启
```
EnableRemoteCommands=1
```
2、修改sudoer使zabbix用户免密码执行
```
zabbix  ALL=NOPASSWD: /bin/sh /opt/apache-tomcat-8.0.36/bin/startup.sh
所有命令免密码
zabbix  ALL=NOPASSWD: ALL
```
3、tomcat startup.sh脚本头添加
```
JAVA_HOME=/usr/local/jdk
export PATH=$JAVA_HOME/bin:$PATH
```
### 问题小结
1、Zabbix报告系统缺少交换分区空间（“Lack of free swap space”）
由于云主机交换分区没有设置，free -m Swap三项为0。修改触发条件解决。
```
Configuration->Templates->Template OS Linux->Triggers->Lack of…
修改
{Template OS Linux:system.swap.size[,pfree].last(0)}<50
为

{Template OS Linux:system.swap.size[,pfree].last(0)}<50
and {Template OS Linux:system.swap.size[,free].last(0)}<>0
判断系统有交换空间，当系统无交换空间值为0时，不触发。
```
2、zabbix图形中文乱码
```
win下找到SIMHEI.TTF字体，上传至/usr/local/zabbix/fonts
然后修改/usr/local/zabbix/include/defines.inc.php 文件

define('ZBX_GRAPH_FONT_NAME', 'simhei'); // font file name
```
#### links:
<https://www.zabbix.com/documentation/3.0/manual/installation/install_from_packages#debianubuntu>