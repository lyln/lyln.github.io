---
layout: post
title: SpringBoot使用Nacos配置中心
categories: Nginx
index_img: https://nacos.io/img/nacosMap.jpg
tags: springboot nacos
date: 2020-09-27
---

#### Nacos简介

Nacos 致力于帮助您发现、配置和管理微服务。

springboot 使用nacos配置中心及服务注册及服务消费的使用。

- 通过 Nacos Server 和 nacos-config-spring-boot-starter 实现配置的动态变更；
- 通过 Nacos Server 和 nacos-discovery-spring-boot-starter 实现服务的注册与发现。



#### Nacos部署

可以参见[Docker快速构建测试环境](http://www.inshub.cn/2020/10/21/2020-10-21-docker-install-develop/)

![img](https://inshub.oss-cn-beijing.aliyuncs.com/blog/image2020-8-27_18-20-55.png)



#### SpringBoot使用Nacos

**配置中心**

pom.xml添加依赖

```
<properties>
<latest.version>0.2.7</latest.version>
</properties>


<dependency>
<groupId>com.alibaba.boot</groupId>
<artifactId>nacos-config-spring-boot-starter</artifactId>
<version>${latest.version}</version>
</dependency>
```

在 application.properties 中配置 Nacos server 的地址：

![img](https://inshub.oss-cn-beijing.aliyuncs.com/blog/image2020-8-27_18-27-49.png)

```
notes: 
1、0.2.7 支持密码配置
2、命名空间dev
```



使用 @NacosPropertySource 加载 dataId 为 example 的配置源，并开启自动更新：

![img](https://inshub.oss-cn-beijing.aliyuncs.com/blog/image2020-8-27_18-32-52.png)

通过 Nacos 的 @NacosValue 注解设置属性值。

![img](https://inshub.oss-cn-beijing.aliyuncs.com/blog/image2020-8-27_18-34-12.png)

http://localhost:8880/config/get
获取connectTimeoutInMills nacos配置结果：8000



**服务注册**

pom.xml增加依赖

```
<dependency>
    <groupId>com.alibaba.boot</groupId>
    <artifactId>nacos-discovery-spring-boot-starter</artifactId>
    <version>${latest.version}</version>
</dependency>
```

在 application.properties 中配置 增加注册到nacos的服务地址：

```

spring.application.name=nacos.example
nacos.discovery.auto-register=true
nacos.discovery.register.ip=192.168.1.101 --服务ip
nacos.discovery.register.port=8880  --服务port
nacos.discovery.register.serviceName=nacos.example.service  --注册的服务名
```

服务启动后自动注册到nacos

![img](https://inshub.oss-cn-beijing.aliyuncs.com/blog/image2020-8-27_18-40-39.png)



**服务发现**

nacos-spring-boot-discovery-example 服务获取注册的服务，同时消费服务。

pom.xml添加依赖

```

<dependency>
    <groupId>com.alibaba.boot</groupId>
    <artifactId>nacos-discovery-spring-boot-starter</artifactId>
    <version>${nacos-discovery-spring-boot.version}</version>
</dependency>
```

在 application.properties 中配置 Nacos server 的地址：

![img](https://inshub.oss-cn-beijing.aliyuncs.com/blog/image2020-8-27_18-43-29.png)

使用 `@NacosInjected` 注入 Nacos 的 `NamingService` 实例：

discovery/get 接口获取注册的服务列表。 http://localhost:8888/discovery/get?serviceName=nacos.example.service

discovery/client 通过服务名消费配置服务。 http://localhost:8888/discovery/client

![img](https://inshub.oss-cn-beijing.aliyuncs.com/blog/image2020-8-27_18-44-42.png)



参考地址：<https://nacos.io/zh-cn/docs/quick-start-spring-boot.html>

