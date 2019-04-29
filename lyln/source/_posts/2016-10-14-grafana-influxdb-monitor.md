---
layout: post
title: "grafana influxdb构建自定义监控"
categories: Linux
tags: grafana influxdb
date: 2016/10/14
---

#### grafana 安装
```
$ wget https://grafanarel.s3.amazonaws.com/builds/grafana_3.0.4-1464167696_amd64.deb
$ sudo apt-get install -y adduser libfontconfig
$ sudo dpkg -i grafana_3.0.4-1464167696_amd64.deb
/etc/init.d/grafana-server start/stop/status
http://192.168.1.158:3000/ admin/admin
```

#### influxdb 安装
```
wget https://dl.influxdata.com/influxdb/releases/influxdb_1.0.2_amd64.deb
sudo dpkg -i influxdb_1.0.2_amd64.deb
web访问influxdb http://192.168.1.158:8083/
```
<!--more-->
#### influxdb 基本操作
```
show databases;
show MEASUREMENTS;
show SERIES;
create database mydb;
insert s_status,prog='http://www.wiredtiger.org/abc',server_ip=192.168.1.168,client_ip=192.168.1.169 stream_rate=3047,recv_speed=3123,duration_time=761
select * from /.*/
```

#### python 操作influxdb
```
Install, upgrade and uninstall InfluxDB-Python with these commands:
pip install influxdb
pip install --upgrade influxdb
pip uninstall influxdb
git clone https://github.com/influxdata/influxdb-python.git
cd influxdb-python/
pip install -r requirements.txt  -i http://pypi.douban.com/simple
python setup.py install
写入数据
$ python
>>> from influxdb import InfluxDBClient
>>> json_body = [
    {
        "measurement": "cpu_load_short",
        "tags": {
            "host": "server01",
            "region": "us-west"
        },
        "time": "2009-11-10T23:00:00Z",
        "fields": {
            "value": 0.64
        }
    }
]
>>> client = InfluxDBClient('localhost', 8086, 'root', 'root', 'example')
>>> client.write_points(json_body)
>>> result = client.query('select value from cpu_load_short;')
>>> print("Result: {0}".format(result))
```
### grafana 配置数据源显示
配置数据源
![数据源](http://lyln.oss-cn-beijing.aliyuncs.com/wiredtiger/201610/influx_db.jpg)
最终显示效果
![数据显示](http://lyln.oss-cn-beijing.aliyuncs.com/wiredtiger/201610/ks_stream_status.jpg)

#### notes:
<http://docs.grafana.org/v3.0/installation/debian/>
<http://influxdb-python.readthedocs.io/en/latest/include-readme.html>