---
layout: post
title:  "如何向Nexus上添加第三方Repository"
categories: Linux
tags: Linux
date: 2016/11/29
---

登陆nexus

点击Repositories->Proxy Repository，如下图：
![添加](https://lyln.oss-cn-beijing.aliyuncs.com/wiredtiger/201611/nexus-1.png)

在打开的页面中填入以下三项，然后点保存：
![保存](https://lyln.oss-cn-beijing.aliyuncs.com/wiredtiger/201611/nexus-2.png)

Repository ID：仓库的唯一标识;
Repository Name：仓库的名称，在nexus中用这个来显示某个仓库;
Remote Storage Location：仓库的远程地址;

能看到在nexus中已经有了：
![查看](https://lyln.oss-cn-beijing.aliyuncs.com/wiredtiger/201611/nexus-3.png)
注：Browse Remote这个tab如果没显示出来，刷新一下页面即可。
这个时候Browse Remote下已经能看到远程仓库的结构了，但Browser Storage下没有任何东西，说明构件还都没有从远程仓库拉取到nexus。

选择Public Repositories（这个是nexus对外的仓库地址），把getui从右边添加到左边，表示把getui的仓库添加到Public group中，这样才能对外可见。
![设置权限](https://lyln.oss-cn-beijing.aliyuncs.com/wiredtiger/201611/nexus-4.png)
注：Browse Remote这个tab如果没显示出来，刷新一下页面即可。

在自己的maven项目中，配置依赖关系：
```
<dependency>
    <groupId>com.gexin.platform</groupId>
    <artifactId>gexin-rp-sdk-http</artifactId>
    <version>4.0.1.7</version>
</dependency>
```

这样，项目首先会去nexus检索看有没有这个jar，如果没有，再在nexus中检索有没有这个jar相关的仓库配置，发现有，然后会去getui这个仓库将所有相关jar拉取到nexus中，然后下载到你本机的.m2目录下。这时，可以看到nexus的getui这个仓库的Browser Storage下也有了这些jar：
![结果](https://lyln.oss-cn-beijing.aliyuncs.com/wiredtiger/201611/nexus-4.png)
