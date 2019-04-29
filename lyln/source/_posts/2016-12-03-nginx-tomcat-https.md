---
layout: post
title: "Nginx/Tomcat添加Https支持"
categories: Linux
tags: https
date: 2016/12/03
---

安装certbot
<https://certbot.eff.org/>
```
wget https://dl.eff.org/certbot-auto
chmod a+x certbot-auto
nginx生成免费证书
./certbot-auto certonly --webroot -w /web/ss-panel/public -d ss.wiredtiger.org
nginx生成dhparams
openssl dhparam -out /etc/ssl/certs/dhparams.pem 2048
```
<!--more-->
nginx配置添加
```
server {
	#强制跳转https
    listen 80;
    server_name ss.wiredtiger.org;
    return 301 https://$server_name$request_uri;
}
server_name ss.wiredtiger.org;
listen       443 ssl;
ssl on;
ssl_certificate /etc/letsencrypt/live/ss.wiredtiger.org/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/ss.wiredtiger.org/privkey.pem;
ssl_dhparam /etc/ssl/certs/dhparams.pem;
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_ciphers "EECDH+ECDSA+AESGCM EECDH+aRSA+AESGCM EECDH+ECDSA+SHA384 EECDH+ECDSA+SHA256 EECDH+aRSA+SHA384 EECDH+aRSA+SHA256 EECDH+aRSA+RC4 EECDH EDH+aRSA !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS !RC4";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-Xss-Protection 1;
```
tomcat生成免费证书
```
./certbot-auto  certonly --standalone -m lijd@rgbvr.com -d test.wiredtiger.org
```
生成.p12文件
```
openssl pkcs12 -export -in fullchain.pem -inkey privkey.pem -out fullchain_and_key.p12 -name tomcat
admin123
```
.jks证书
```
keytool -importkeystore -deststorepass admin123 -destkeypass admin123 -destkeystore rgbvrkeystore.jks -srckeystore fullchain_and_key.p12 -srcstoretype PKCS12 -srcstorepass rgbvradmin -alias tomcat
```
tomcat配置修改
```
<Connector port="8443" protocol="org.apache.coyote.http11.Http11NioProtocol"
           maxThreads="150" SSLEnabled="true" scheme="https" secure="true"
           clientAuth="false" sslProtocol="TLS" 
           keystoreFile="conf/rgbvrkeystore.jks" 
           keystorePass="admin123" 
           keyAlias="tomcat" 
           keyPass="admin123"
/>
```
证书更新
```
./certbot-auto renew
```
SSL Server测试
<https://www.ssllabs.com/ssltest/index.html>