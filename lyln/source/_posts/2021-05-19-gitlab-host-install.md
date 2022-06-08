---
layout: post
title: Yum安装Gitlab并备份还原
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/907596-20191118212733899-716856611.png
tags: gitlab
date: 2021-05-19
---

![gitlab](https://inshub.oss-cn-beijing.aliyuncs.com/blog/907596-20191118212733899-716856611-20220607184727327.png)

#### GitLab安装

添加GitLab社区版Package
`curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | sudo bash`
安装GitLab社区版
`sudo yum install -y gitlab-ce`

安装完成如下提示

```
Thank you for installing GitLab!
GitLab was unable to detect a valid hostname for your instance.
Please configure a URL for your GitLab instance by setting `external_url`
configuration in /etc/gitlab/gitlab.rb file.
Then, you can start your GitLab instance by running the following command:
  sudo gitlab-ctl reconfigure

For a comprehensive list of configuration options please see the Omnibus GitLab readme
https://gitlab.com/gitlab-org/omnibus-gitlab/blob/master/README.md

Help us improve the installation experience, let us know how we did with a 1 minute survey:
https://gitlab.fra1.qualtrics.com/jfe/form/SV_6kVqZANThUQ1bZb?installation=omnibus&release=13-10
```

修改/etc/gitlab/gitlab.rb后

```
external_url 'http://hacker.sohu.com/git'
nginx['listen_port'] = 8000

sudo gitlab-ctl reconfigure

```

gitlab-ctl常用命令及项目默认目录

```
gitlab-ctl status
gitlab-ctl restart
gitlab-rake 生成的备份文件一般在 /var/opt/gitlab/backups 中
/opt/gitlab/embedded/sbin/nginx -p /var/opt/gitlab/nginx -t
/opt/gitlab/embedded/sbin/nginx -p /var/opt/gitlab/nginx -s reload

nginx['enable'] = true
nginx['client_max_body_size'] = '4096m'
nginx['redirect_http_to_https'] = false
nginx['redirect_http_to_https_port'] = 80
```

修改nginx配置文件

```
upstream gitlab {
    server 192.168.0.110:8000;
}
server {
        listen 80;
        server_name git.inshub.cn;
        #也可以将client_max_body_size提到server层
        client_max_body_size  2048m;
        location /git {
            # 设置最大允许上传单个的文件大小1G
            client_max_body_size 1024m;
            proxy_redirect off;
            #以下确保 gitlab中项目的 url 是域名而不是 http://git，不可缺少
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            # 反向代理到 gitlab 内置的 nginx
            proxy_pass http://gitlab/git;
            index index.html index.htm;
        }
    }
```



#### GitLab备份恢复

备份

```
sudo gitlab-rake gitlab:backup:create

gitlab-rake 生成的备份文件一般在 /var/opt/gitlab/backups 
```

恢复

```
将 /var/opt/gitlab/backups 中的文件同步到新服务器相同目录中

gitlab-ctl stop unicorn  
gitlab-ctl stop sidekiq

chmod 777 /var/opt/gitlab/backups/

从指定文件恢复（不要加_gitlab_backup.tar）
sudo gitlab-rake gitlab:backup:restore BACKUP=
gitlab-rake gitlab:backup:restore BACKUP=1621409658_2021_05_19_13.10.3_gitlab_backup

gitlab-ctl restart
```



#### 问题汇总

问题描述：
git最大文件上传限制

问题解决：
修改nginx配置client_max_body_size
可以设置为到server层


问题描述：
GitLab is taking too much time to respond.

问题解决：
```
检查端口
因为gitlab的webcache系统默认8080端口。我的8080端口已经被别的占用了
解决办法：
找到gitlab.rb这个配置文件
gitlab_workhorse['auth_backend'] = "http://localhost:8080"
unicorn['port'] = 8080
把前面的注释打开，然后修改成别空的端口，
#使配置生效
gitlab-ctl reconfigure
#重新启动GitLab
gitlab-ctl restart
即可生效

```
参考地址：
https://blog.51cto.com/cainiaibage/2312499