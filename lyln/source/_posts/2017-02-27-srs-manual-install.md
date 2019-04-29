---
layout: post
title: "SRS使用小记"
categories: Linux
tags: srs
date: 2017/02/27
---

### SRS简介
互联网上的两种主要的分发方式：HLS和RTMP。
SRS支持HLS/RTMP两种成熟而且广泛应用的流媒体分发方式。

HLS指Apple的HLS(Http Live Streaming)，本身就是Live（直播）的，不过Vod（点播）也能支持。HLS是Apple平台的标准流媒体协议，和RTMP在PC上一样支持得天衣无缝。

SRS直播将RTMP作为基本协议，以各种方式转码为RTMP后输入到SRS，输出为RTMP和HLS，支持广泛的客户端和各种应用场景。
SRS点播还在计划中，不会使用RTMP作为点播协议，点播还是文件为主，即HTTP协议为主。

SRS编译配置参数详解
https://github.com/ossrs/srs/wiki/v2_CN_Build
<!--more-->
### 获取SRS
```bash
git clone  https://github.com/ossrs/srs
```
### 编译SRS
```bash
./configure && make -j4
```
### 启动SRS
```bash
./objs/srs -c conf/srs.conf
cp etc/init.d/srs /etc/init.d/srs 
注意修改配置文件
CONFIG="./conf/srs.conf"
```

### 配置文件说明
SRS的使用,主要是对配置文件的理解
```bash
conf/srs.conf
# main config for srs.
# @see full.conf for detail config.

listen              1935; #监听端口
max_connections     1000;
srs_log_tank        file;
srs_log_file        ./objs/srs.log;
http_api {
    enabled         on;
    listen          1985;
}
http_server {
    enabled         on;
    listen          8085;
    dir             ./objs/nginx/html;
}
stats {
    network         0;
    disk            sda sdb xvda xvdb;
}
vhost __defaultVhost__ {
}

---
RTMP Cluster配置
conf/edge.conf 
# the config for srs origin-edge cluster
# @see https://github.com/ossrs/srs/wiki/v1_CN_Edge
# @see full.conf for detail config.

listen              19350; #边缘节点监听端口
max_connections     1000;
pid                 objs/edge.pid;
daemon              off;
srs_log_tank        console;

vhost __defaultVhost__ {
    mode            remote;
    origin          127.0.0.1:1935;　#源节点监听端口
}

---
HTTP FLV Live Stream配置
在vhost下添加http_remux
vhost __defaultVhost__ {
    http_remux {
        enabled     on;
        mount       [vhost]/[app]/[stream].flv;
        hstrs       on;
    }
}
播放流地址
HTTP FLV: http://192.168.1.158:8085/live/ljd.flv
https://github.com/ossrs/srs/wiki/v2_CN_DeliveryHttpStream#http-live-stream-config

---
HTTP FLV Live Stream Cluster配置
单独节点，区别于在vhost下添加
vhost __defaultVhost__ {
    mode remote; # 边缘节点开启
    origin 192.168.1.158; #源节点地址
    http_remux {
        enabled     on;
        mount       [vhost]/[app]/[stream].flv;
        hstrs       on;
    }

---

HLS分发配置
在vhost下添加hls
vhost __defaultVhost__ {
    hls {
        enabled         on;
        hls_fragment    10;
        hls_window      60;
        hls_path        ./objs/nginx/html;
        hls_m3u8_file   [app]/[stream].m3u8;
        hls_ts_file     [app]/[stream]-[seq].ts;
    }
}
HLS流地址为： http://192.168.1.158/live/ljd.m3u8

---
转码HLS后分发
HLS需要h.264+aac,若不符合这个要求则需要转码。
在vhost下添加transcode 转码
vhost __defaultVhost__ {
	...
	#低延时配置
	gop_cache       off;
    queue_length    10;
    min_latency     on;
    mr {
        enabled     off;
    }
    mw_latency      100;
    tcp_nodelay     on;
    #转码HLS
    transcode live{
        # whether the transcode enabled.
        # if off, donot transcode.
        # default: off.
        enabled     on;
        # the ffmpeg 
        ffmpeg      /usr/local/ffmpeg/bin/ffmpeg;
        # the transcode engine for matched stream.
        # all matched stream will transcoded to the following stream.
        # the transcode set name(ie. hd) is optional and not used.
        engine ff {
            # whether the engine is enabled
            # default: off.
            enabled         on;
            # input format, can be:
            # off, do not specifies the format, ffmpeg will guess it.
            # flv, for flv or RTMP stream.
            # other format, for example, mp4/aac whatever.
            # default: flv
            iformat         flv;
            # video encoder name. can be:
            #       libx264: use h.264(libx264) video encoder.
            #       copy: donot encoder the video stream, copy it.
            #       vn: disable video output.
            vcodec          libx264;
            # video bitrate, in kbps
            # @remark 0 to use source video bitrate.
            # default: 0
            vbitrate        1500;
            # video framerate.
            # @remark 0 to use source video fps.
            # default: 0
            vfps            0;
            # video width, must be even numbers.
            # @remark 0 to use source video width.
            # default: 0
            vwidth          1440;
            # video height, must be even numbers.
            # @remark 0 to use source video height.
            # default: 0
            vheight         720;
            # the max threads for ffmpeg to used.
            # default: 1
            vthreads        12;
            # x264 profile, @see x264 -help, can be:
            # high,main,baseline
            vprofile        main;
            # x264 preset, @see x264 -help, can be: 
            #       ultrafast,superfast,veryfast,faster,fast
            #       medium,slow,slower,veryslow,placebo
            vpreset         medium;
            # other x264 or ffmpeg video params
            vparams {
                # ffmpeg options, @see: http://ffmpeg.org/ffmpeg.html
                t               100;
                # 264 params, @see: http://ffmpeg.org/ffmpeg-codecs.html#libx264
                coder           1;
                b_strategy      2;
                bf              3;
                refs            10;
            }
            # audio encoder name. can be:
            #       libfdk_aac: use aac(libfdk_aac) audio encoder.
            #       copy: donot encoder the audio stream, copy it.
            #       an: disable audio output.
            acodec          copy;
            # audio bitrate, in kbps. [16, 72] for libfdk_aac.
            # @remark 0 to use source audio bitrate.
            # default: 0
            abitrate        70;
            # audio sample rate. for flv/rtmp, it must be:
            #       44100,22050,11025,5512
            # @remark 0 to use source audio sample rate.
            # default: 0
            asample_rate    44100;
            # audio channel, 1 for mono, 2 for stereo.
            # @remark 0 to use source audio channels.
            # default: 0
            achannels       2;
            # other ffmpeg audio params
            aparams {
                # audio params, @see: http://ffmpeg.org/ffmpeg-codecs.html#Audio-Encoders
                # @remark SRS supported aac profile for HLS is: aac_low, aac_he, aac_he_v2
                profile:a   aac_low;
                bsf:a       aac_adtstoasc;
            }
            # output format, can be:
            #       off, do not specifies the format, ffmpeg will guess it.
            #       flv, for flv or RTMP stream.
            #       other format, for example, mp4/aac whatever.
            # default: flv
            oformat         flv;
            # output stream. variables:
            #       [vhost] the input stream vhost.
            #       [port] the intput stream port.
            #       [app] the input stream app.
            #       [stream] the input stream name.
            #       [engine] the tanscode engine name.
            output          rtmp://127.0.0.1:[port]/[app]?vhost=[vhost]/[stream]_[engine];
        }
    }
}

转码后的RTMP流地址为：rtmp://192.168.1.158/live/ljd_ff
转码后的HLS流地址为： http://192.168.1.158/live/ljd_ff.m3u8


---
SRS支持将RTMP流录制成flv文件
vhost __defaultVhost__ {
	dvr {
        # whether enabled dvr features
        # default: off
        enabled         on;
        # the dvr output path.
        # we supports some variables to generate the filename.
        #       [vhost], the vhost of stream.
        #       [app], the app of stream.
        #       [stream], the stream name of stream.
        #       [2006], replace this const to current year.
        #       [01], replace this const to current month.
        #       [02], replace this const to current date.
        #       [15], replace this const to current hour.
        #       [04], repleace this const to current minute.
        #       [05], repleace this const to current second.
        #       [999], repleace this const to current millisecond.
        #       [timestamp],replace this const to current UNIX timestamp in ms.
        # @remark we use golang time format "2006-01-02 15:04:05.999"
        # for example, for url rtmp://ossrs.net/live/livestream and time 2015-01-03 10:57:30.776
        # 1. No variables, the rule of SRS1.0(auto add [stream].[timestamp].flv as filename):
        #       dvr_path ./objs/nginx/html;
        #       =>
        #       dvr_path ./objs/nginx/html/live/livestream.1420254068776.flv;
        # 2. Use stream and date as dir name, time as filename:
        #       dvr_path /data/[vhost]/[app]/[stream]/[2006]/[01]/[02]/[15].[04].[05].[999].flv;
        #       =>
        #       dvr_path /data/ossrs.net/live/livestream/2015/01/03/10.57.30.776.flv;
        # 3. Use stream and year/month as dir name, date and time as filename:
        #       dvr_path /data/[vhost]/[app]/[stream]/[2006]/[01]/[02]-[15].[04].[05].[999].flv;
        #       =>
        #       dvr_path /data/ossrs.net/live/livestream/2015/01/03-10.57.30.776.flv;
        # 4. Use vhost/app and year/month as dir name, stream/date/time as filename:
        #       dvr_path /data/[vhost]/[app]/[2006]/[01]/[stream]-[02]-[15].[04].[05].[999].flv;
        #       =>
        #       dvr_path /data/ossrs.net/live/2015/01/livestream-03-10.57.30.776.flv;
        # @see https://github.com/ossrs/srs/wiki/v2_CN_DVR#custom-path
        # @see https://github.com/ossrs/srs/wiki/v2_CN_DVR#custom-path
        # default: ./objs/nginx/html/[app]/[stream].[timestamp].flv
        dvr_path        ./objs/nginx/html/[app]/[stream].[timestamp].flv;
        # the dvr plan. canbe:
        #   session reap flv when session end(unpublish).
        #   segment reap flv when flv duration exceed the specified dvr_duration.
        # default: session
        dvr_plan        session;
        # the param for plan(segment), in seconds.
        # default: 30
        dvr_duration    30;
        # the param for plan(segment),
        # whether wait keyframe to reap segment,
        # if off, reap segment when duration exceed the dvr_duration,
        # if on, reap segment when duration exceed and got keyframe.
        # default: on
        dvr_wait_keyframe       on;
        # about the stream monotonically increasing:
        #   1. video timestamp is monotonically increasing, 
        #   2. audio timestamp is monotonically increasing,
        #   3. video and audio timestamp is interleaved monotonically increasing.
        # it's specified by RTMP specification, @see 3. Byte Order, Alignment, and Time Format
        # however, some encoder cannot provides this feature, please set this to off to ignore time jitter.
        # the time jitter algorithm:
        #   1. full, to ensure stream start at zero, and ensure stream monotonically increasing.
        #   2. zero, only ensure sttream start at zero, ignore timestamp jitter.
        #   3. off, disable the time jitter algorithm, like atc.
        # default: full
        time_jitter             full;
    }

}
```