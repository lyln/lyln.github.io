---
layout: post
title: Centos7下编译安装ffmpeg扩展gl-transitions
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/ffmpeg.png
tags: ffmpeg gl-transitions
date: 2022-09-06
---

ffmpeg在4.3版本后加入xfade的转场，GRE大神使用WebGL编写的一些转场，效果十分酷炫，以及Travis Fischer大神gl-transitions,
本文记录帮开发编译扩展gl-transitions

![ffmpeg](https://inshub.oss-cn-beijing.aliyuncs.com/blog/ffmpeg.png)

#### 环境准备

源码下载目录
`/data/apps/ffmpeg_sources`

系统版本
```
Red Hat7.9 or Centos7
```

```
替换yum源
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
yum makecache

安装编译工具及依赖
yum -y install autoconf automake bzip2 bzip2-devel cmake freetype-devel gcc gcc-c++ git libtool make pkgconfig zlib-devel libxml2-devel mesa* freeglut*

```

#### cmake安装
当前安装cmake版本基本是2.8左右的，后续依赖的glfw需要升级cmake。

```
cmake --version

#移除旧的cmake版本
yum remove cmake -y
wget https://cmake.org/files/v3.14/cmake-3.14.5.tar.gz
tar zxvf cmake-3.14.5.tar.gz
cd cmake-3.14.5
./configure
make && make install

```

#### 安装glfw3

```
cd /usr/local/ffmpeg_sources
wget https://github.com/glfw/glfw/archive/refs/tags/3.3.4.tar.gz
tar -xzvf glfw-3.3.4.tar.gz
cd glfw-3.3.4
yum -y install libXrandr*
yum -y install libXcursor*
yum -y install libXi*
cmake .
make && make install
```

#### 安装OpenGL相关库(glew)

```
yum -y install glew glew-devel
```

#### 编译安装ffmpeg

全版本地址:https://ffmpeg.org/releases/
选择4.4版本(https://ffmpeg.org/releases/ffmpeg-4.4.tar.gz)

##### 安装编译依赖

**安装nasm**

```
cd /data/apps/ffmpeg_sources
curl -O -L https://www.nasm.us/pub/nasm/releasebuilds/2.15.05/nasm-2.15.05.tar.bz2
tar xjvf nasm-2.15.05.tar.bz2
cd nasm-2.15.05
./autogen.sh
./configure
make
make install
```
**安装yasm**

```
cd /data/apps/ffmpeg_sources
curl -O -L https://www.tortall.net/projects/yasm/releases/yasm-1.3.0.tar.gz
tar xzvf yasm-1.3.0.tar.gz
cd yasm-1.3.0
./configure
make
make install
```
**安装libx264**

```
cd /data/apps/ffmpeg_sources
git clone --branch stable --depth 1 https://code.videolan.org/videolan/x264.git
cd x264
./configure --enable-static
make
make install
```
**下载ffmpeg**

```
cd /data/apps/ffmpeg_sources
wget https://ffmpeg.org/releases/ffmpeg-4.4.tar.gz
tar -xzvf ffmpeg-4.4.tar.gz
```

**下载ffmpeg-gl-transition**

```
cd /data/apps/ffmpeg_sources
git clone https://github.com/transitive-bullshit/ffmpeg-gl-transition.git
# 注意clone后进入ffmpeg4.4目录下
cd ffmpeg-4.4
# 拷贝vf_gltransition.c到libavfilter
cp /data/apps/ffmpeg_sources/ffmpeg-gl-transition/vf_gltransition.c libavfilter/
```
上面的复制就是在ffmpeg/libavfilter里加入要编译vf_gltransition.c这个文件
然后进入libavfilter文件夹
```
# 在libavfilter/Makefile里加入
OBJS-$(CONFIG_GLTRANSITION_FILTER)           += vf_gltransition.o
# 在libavfilter/allfilters.c加入
extern AVFilter ff_vf_gltransition;
```
还需要修改vf_gltransition.c,去掉宏定义。直接将`# define GL_TRANSITION_USING_EGL`删除就可。
ps：`#`这里不是注释，直接删除哈～

编译ffmpeg
```
cd /data/apps/ffmpeg_sources/ffmpeg-4.4
# 指定pkgconfig 避免找不到
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH
# 执行configure
./configure --enable-nonfree --enable-cross-compile --enable-gpl --enable-libx264 --enable-opengl --enable-filter=gltransition --extra-libs='-lGLEW -lglfw3 -ldl -lX11'
# 执行make
make
# 建立软连接
ln -sf /data/apps/ffmpeg_sources/ffmpeg /usr/bin/ffmpeg && ln -sf /data/apps/ffmpeg_sources/ffprobe /usr/bin/ffprobe

```
#### 校验是否安装成功

`ffmpeg -v 0 -filters |grep transitions`

#### 测试效果

**安装并启动Xvfb**

```
yum -y install Xvfb 
nohup Xvfb :1 -screen 0 1280x1024x16 >/dev/null 2>&1 &
# 设置环境变量
export DISPLAY=:1
```

```
cd /data/apps/ffmpeg_sources/gl-transitions/transitions
# 转场文件在https://github.com/gl-transitions/gl-transitions，crosswarp.glsl为转场文件
ffmpeg -i input.mp4 -filter_complex "gltransition=duration=4:offset=1.5:source=crosswarp.glsl" -y out.mp4
```

#### 参考地址

https://blog.csdn.net/weixin_40948587/article/details/121073081
https://github.com/transitive-bullshit/ffmpeg-gl-transition