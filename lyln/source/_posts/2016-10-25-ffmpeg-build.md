---
layout: post
title: "ffmpeg 编译安装"
categories: Linux
tags: ffmpeg
date: 2016/10/25
---
系统环境
Ubuntu 14.04.3 LTS
最近测试ffmpeg转推，使用老版本ffmpeg流转推一段时间会断掉，测试发现在新版本ffmpeg效果明显好很多。但是由于依赖众多(主要问题)，编译花费了好长时间。
记录下编译过程。

ffmpeg 编译安装
依赖安装
```
apt-get install yasm pkg-config
apt-get install gnutls-bin libgnutls-dev libass-dev libfdk-aac-dev 
libmp3lame0 libmp3lame-dev libpulse0 libpulse-dev libsoxr0 libsoxr-dev speex libspeex-dev libopus0 libopus-dev  libvpx1 libvpx-dev
libwavpack1 libwavpack-dev 
apt-get install libx264-dev libxvidcore-dev libopencore-amrwb-dev libopencore-amrnb-dev libfaad-dev libfaac-dev libmp3lame-dev libtwolame-dev liba52-0.7.4-dev libcddb2-dev libcdaudio-dev libcdio-cdda-dev libvorbis-dev libopenjpeg-dev
add-apt-repository ppa:sunab/kdenlive-release
apt-get install libvidstab1.0 libvidstab-dev
```
<!--more-->
x265 安装
```
# ubuntu packages:
sudo apt-get install mercurial cmake cmake-curses-gui build-essential yasm
Note: if the packaged yasm is older than 1.2, you must download yasm (1.3 recommended) and build ithg clone https://bitbucket.org/
hg clone https://bitbucket.org/multicoreware/x265
cd x265/build/linux
./make-Makefiles.bash
make
make install
```
编译安装
```
./configure  --prefix=/opt/ffmpeg --extra-libs=-ldl --mandir=/usr/share/man --enable-avresample --disable-debug --enable-nonfree --enable-gpl --enable-version3 --enable-libopencore-amrnb --enable-libopencore-amrwb --disable-decoder=amrnb --disable-decoder=amrwb --enable-libpulse --enable-libfreetype --enable-gnutls --enable-libx264 --enable-libx265 --enable-libfdk-aac --enable-libvorbis --enable-libmp3lame --enable-libopus --enable-libvpx --enable-libspeex --enable-libass --enable-avisynth --enable-libsoxr --enable-libxvid --enable-libvidstab --enable-libwavpack --enable-nvenc
make && make install
```
添加环境变量或做软连接
查看ffmpeg版本
```
ffmpeg -version
ffmpeg version N-82143-gbf14393 Copyright (c) 2000-2016 the FFmpeg developers
built with gcc 4.8 (Ubuntu 4.8.4-2ubuntu1~14.04.3)
configuration: --prefix=/opt/ffmpeg --extra-libs=-ldl --mandir=/usr/share/man --enable-avresample --disable-debug --enable-nonfree --enable-gpl --enable-version3 --enable-libopencore-amrnb --enable-libopencore-amrwb --disable-decoder=amrnb --disable-decoder=amrwb --enable-libpulse --enable-libfreetype --enable-gnutls --enable-libx264 --enable-libx265 --enable-libfdk-aac --enable-libvorbis --enable-libmp3lame --enable-libopus --enable-libvpx --enable-libspeex --enable-libass --enable-avisynth --enable-libsoxr --enable-libxvid --enable-libvidstab --enable-libwavpack --enable-nvenc
libavutil      55. 35.100 / 55. 35.100
libavcodec     57. 65.100 / 57. 65.100
libavformat    57. 57.100 / 57. 57.100
libavdevice    57.  2.100 / 57.  2.100
libavfilter     6. 66.100 /  6. 66.100
libavresample   3.  2.  0 /  3.  2.  0
libswscale      4.  3.100 /  4.  3.100
libswresample   2.  4.100 /  2.  4.100
libpostproc    54.  2.100 / 54.  2.100
```
祝你成功