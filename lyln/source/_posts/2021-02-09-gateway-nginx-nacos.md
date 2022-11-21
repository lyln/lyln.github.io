---
layout: post
title: 接入层网关配置管理中心
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/fabos-login.jpg
tags: 接入层网关 
date: 2021-02-09
---

之前调研confd+nacos无侵入的管理nginx配置管理方案，可以通过nacos本身的ui管理配置实现nginx配置的自动更新。但是本身ui可能管理配置起来相对麻烦。遂考虑整合到运维管理平台。

http://www.inshub.cn/2020/04/19/2020-04-19-confd-nacos-notes/



### confd新增权限

开源版本confd没有新增权限，修改开源版本

https://github.com/lyln/nacos-confd 

用于Nacos 1.2.0 增加权限控制后，拉取配置中心配置。



```
### 环境版本

#### 后端
- [Spring Boot 2.2.1](http://spring.io/projects/spring-boot/)
- [Mybatis-Plus](https://mp.baomidou.com/guide/)
- [MySQL 5.7.x](https://dev.mysql.com/downloads/mysql/5.7.html#downloads),[Hikari](https://brettwooldridge.github.io/HikariCP/),[Redis](https://redis.io/)
- [Shiro 1.4.2](http://shiro.apache.org/)

#### 前端
- [Layui 2.5.5](https://www.layui.com/)
- [Nepadmin](https://gitee.com/june000/nep-admin)
- [formSelects 4.x 多选框](https://hnzzmsf.github.io/example/example_v4.html)
- [eleTree 树组件](https://layuiextend.hsianglee.cn/eletree/)
- [formSelect.js树形下拉](https://wujiawei0926.gitee.io/treeselect/docs/doc.html)
- [Apexcharts图表](https://apexcharts.com/)
```

### 后台登陆

![fabos-login](https://inshub.oss-cn-beijing.aliyuncs.com/blog/fabos-login.jpg)

### 域名管理

![](https://inshub.oss-cn-beijing.aliyuncs.com/blog/fabos-domain.jpg)



### 域名新增

![fabos-add-domain](https://inshub.oss-cn-beijing.aliyuncs.com/blog/fabos-add-domain.jpg)



### 域名更新

![fabos-update-domain](https://inshub.oss-cn-beijing.aliyuncs.com/blog/fabos-update-domain.jpg)