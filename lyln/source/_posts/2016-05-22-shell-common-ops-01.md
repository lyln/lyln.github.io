---
layout: post
title:  "Shell常用命令"
categories: Linux
tags: Shell
date: 2016/05/22
---

1、防止rm,mv惨案，环境变量添加/etc/profile

```
alias rm='rm -i'
alias mv='mv -i'
alias vi='vim'
alias cp='cp -i'
```
<!--more-->
2、vi替换
```
:n,$s/well/good/g 替换第 n 行开始到最后一行中每一行所有 well 为 good  
n-> . 表示到从当前行
```
3、sed替换
```
sed  '/password/s/abc/admin/g' db.properties  #不写入文件`
sed -i '/password/s/abc/admin/g' db.properties`


一个文件有 f1,f2,f3,f4,f5.....替换成 f1_i,f2_i,f3_i,f4_i,f5_i?
`cat a.txt |tr ',' '\n'|sed 's/$/&_i/g'|tr '\n' ','`

tr实现行列转换,sed在文件末尾添加_i
`sed 's/$/&_i/g'`

如果文件内容为"f559":166,"f560":167,"f561":168,"f562":169,"f563":170,
`cat a.txt |tr ',' '\n'|sed 's/"\w\{4\}/&_i/g'|tr '\n' ','`
sed在指定字符串末尾添加_i
`sed 's/"\w\{4\}/&_i/g'`

```

4、代码注释：
```
按 Ctrl+v 切换到可视化模式；
移动光标(j 或 k)选中需要注释的行的开头；
按大写 I，然后输入注释符，如 #；
最后按 Esc。

取消注释：
按 Ctrl+v 切换到可视化模式；
按 j 或 k 选择要删除的注释符；
按 d 或 x 删除注释符
如果使用 // 符号注释，则取消注释时需进行两遍操作。
```
5、grep过滤
```
egrep -v "(^#|^$)" /etc/zabbix/zabbix_agend.conf`
```
6、使用netstat和awk命令来统计网络连接数
```
netstat -n | awk '/^tcp/ {++state[$NF]} END {for(key in state) print key," ",state[key]}'
状态描述：
CLOSED：无连接是活动的或正在进行
LISTEN：服务器在等待进入呼叫
SYN_RECV：一个连接请求已经到达，等待确认
SYN_SENT：应用已经开始，打开一个连接
ESTABLISHED：正常数据传输状态
FIN_WAIT1：应用说它已经完成
FIN_WAIT2：另一边已同意释放
ITMED_WAIT：等待所有分组死掉
CLOSING：两边同时尝试关闭
TIME_WAIT：另一边已初始化一个释放
LAST_ACK：等待所有分组死掉
```
7、screen使用
```
screen -R s_name
ctrl+a    d 退出， :quit 取消这个screen回话
screen -list
```

8、xargs常用
```
xargs -0将\0作为定界符。
-i [{}] 代表参数mv 时,{}将被逐个替换。
`find . -name "*.php" |xargs  -t -i mv  {} {}.bak`
`find logs/ -atime +90 -size +500M |xargs mv -t /tmp/databk`
```

9、修改进程打开的最大文件数
```
/etc/security/limits.conf 
`*          soft    nofile        65535`
`*           hard   nofile        65535`
`ulimit -a 显示当前所有的limit信息`
ubuntu要指明用户，*不起作用。退出重进生效。
```
10、crontab 中脚本使用命令指定命令的全路径
```
java替换为/usr/java/jdk1.8.0_65/bin/java 
```

11、java打依赖包及jar包运行
```
mvn dependency:copy-dependencies -DoutputDirectory=lib
java -cp java_metrics-0.0.1-SNAPSHOT.jar:lib/\* java_metrics.GetStarted
```

12、Ubuntu在rc.local下开机自启动自定义脚本（启动tomcat、jar程序）不生效
自定义脚本放在/home/user下导致启动不成功，放入root或者系统目录下生效

13、openssl生成密码
```
openssl rand -base64 6
```
14、redis批量删除key

```
redis-cli -h host -a passwd keys "USER:*" |xargs redis-cli -h host -a passwd del

redis查看key
type key 看看可以类型

hget
zrange 
```
15、获取进程号及杀掉进程
```
pgrep -f name
pkill -f name
```

