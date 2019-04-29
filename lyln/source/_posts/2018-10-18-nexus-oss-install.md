---
layout: post
title: "Nexus OSS私服的安装和迁移"
categories: Linux
tags: Nexus
date: 2018/10/18
---

### Nexus私服

Nexus常用功能就是：指定私服的中央地址、将自己的Maven项目指定到私服地址、从私服下载中央库的项目索引、从私服仓库下载依赖组件、将第三方项目jar上传到私服供其他项目组使用。

一般用到的仓库种类是hosted、proxy。 
1. Hosted代表宿主仓库，用来发布一些第三方不允许的组件，比如Oracle驱动、比如商业软件jar包。
2. Proxy代表代理远程的仓库，最典型的就是Maven官方中央仓库、JBoss仓库等等。如果构建的Maven项目本地仓库没有依赖包，
那么就会去这个代理站点去下载，那么如果代理站点也没有此依赖包，就回去远程中央仓库下载依赖，这些中央仓库就是proxy。代理站点下载成功后再下载至本机。

<!--more-->
### 下载解压nexus

Nexus Repository Manager OSS ,之前叫做 Nexus OS，是开源免费的。【OSS = Open Source Software，开源软件——免费】

Nexus Repository Manager，之前叫做 Nexus Professional。只有拥有一个有效的许可证才可以使用所有功能【专业版本——收费

```
wget https://download.sonatype.com/nexus/oss/nexus-latest-bundle.tar.gz

tar zxvf nexus-latest-bundle.tar.gz  -C /data/app/opt


cp bin/nexus /etc/init.d/nexus2 
设置nexus服务开机自启动
chkconfig --add nexus2
chkconfig nexus2 on 

/etc/init.d/nexus2 start

默认admin/admin123

```

### Nexus2配置文件

```
/etc/init.d/nexus2 修改
NEXUS_HOME修改为Nexus的解压目录 /data/apps/opt/nexus-2.14.11-01
RUN_AS_USER修改为 root

cd /data/apps/opt/nexus-2.14.11-01
bin/jsw/conf/wrapper.conf 修改
#设置好Java执行文件所处的位置
wrapper.java.command=/usr/java/bin/java


Nexus2监听的端口以及仓库存储位置
conf/nexus.properties
# Jetty section
application-port=8081  #端口
application-host=0.0.0.0
nexus-webapp=${bundleBasedir}/nexus
nexus-webapp-context-path=/nexus

# Nexus section
#nexus-work=${bundleBasedir}/../sonatype-work/nexus
nexus-work=/data/apps/data/sonatype-work/nexus #仓库存储位置
runtime=${bundleBasedir}/nexus/WEB-INF

# orientdb buffer size in megabytes
storage.diskCache.bufferSize=4096

```

###  仓库的备份与迁移
登陆旧的Nexus OSS私服仓库，查看conf/nexus.properties 配置，找到仓库存储位置
同步数据目录到新的Nexus OSS私服仓库
重启nexus即可
