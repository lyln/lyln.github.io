---
layout: post
title: "nginx rtmp 录播 转码 播放"
categories: Nginx
tags: Nginx
---

#### nginx rtmp 编译及相关配置
1、下载nginx，nginx-rtmp模块
[rtmp模块](https://github.com/arut/nginx-rtmp-module/releases)<br>
2、编译安装，打开flv,mp4
```bash
./configure --prefix=/usr/local/nginx --with-http_flv_module --with-http_mp4_module  --add-module=../nginx-rtmp-module-master --with-http_ssl_module --with-debug
```
<!--more-->

3、添加nginx配置
```bash
rtmp_auto_push on;
rtmp{
    
    server{
        listen 1935;
        application hls{
            live on; #启用rtmp
            hls on; #启用hls
            hls_path /web/media/vod;
            hls_fragment 15s;

            recorder rec{ #启用录制
                record all;
                record_suffix _rec.flv;
                record_path /web/media/vod/rec;
                record_unique on;
            }
        application vod{
            paly /web/media/vod
        }   

        }
    }
}

http{
    
    include mime.types;
    default_type  application/octet-stream;
    server{
        listen 8989;
        location ~\.flv${
            root /web/media/vod/flvs;
            flv;
        }

        location ~\.mp4${
            root /web/media/vod/mp4s;
            mp4;
        }

        location /hls{
            types{
                application/vnd.apple.mpegurl m3u8;
                video/mp2t ts;
            }
            expires -1;
        }
    }

}
```
4、ffmpeg推流
```bash
ffmpeg -re -i {your_video_file} -r 30 -s 1280x720 -f flv {your_rtmp_address}
```

5、jw播放
```bash
<html>
<head>
<title>ljd player</title>
<script src="jwplayer.js"></script>
<script>jwplayer.key="M8fc0uJt8f4FtzMTSL/VhG1rIrm1iIOtg4u8kA==";</script>
</head>

<body>
  <div id="container"></div>
  <script>
    jwplayer("container").setup({
    sources: [
    {
        file:'http://192.168.1.158:8989/ljd01.flv',
        label: 'Auto'
        },
        ],
});
  </script>
</body>
</html>
```

##### note:
1、yadmi为flv文件添加关键帧，实现拖动播放。
```bash
yamdi -i {in_video_file} -o {out_video_file}
```

2、ffmpeg参数解释
```bash
-s 368x208（输出的分辨率为368x208，注意片源一定要是16:9的不然会变形）
-r 29.97（帧数，一般就用这个吧）
-re 代表按照帧率发送
-vcodec copy 要加，否则ffmpeg会重新编码输入的H.264裸流
-title "Test"（在PSP中显示的影片的标题）
-f 设置输出格式
-vcodec 设定视频编解码器，未设定时则使用与输入流相同的编解码器
-acodec 设定声音编解码器，未设定时则使用与输入流相同的编解码器
-vn  不处理视频
-an  不处理音频
```