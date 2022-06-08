---
layout: post
title: Go环境搭建及VSCode配置
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/go-env.png
tags: Go
date: 2021-01-16
---

#### Go开发环境搭建

```
mac升级go版本
https://golang.org/dl/
或者这个地址https://studygolang.com/dl
下载对应的版本
设置环境变量即可
export GOROOT=~/go
export PATH=$PATH:$GOROOT/bin

GOROOT表示Go语言的安装目录
GOPATH用于指定我们的开发工作区(workspace),是存放源代码、测试文件、库静态文件、可执行文件等
GOPATH目录下的每个工作一般分为三个子目录:src,pkg,bin
mkdir $GOPATH/{src,pkg,bin}

为啥我mac构建的bin部署到服务器上不能用？
交叉编译,是指在一个平台上就能生成可以在另一个平台运行的代码。
GOOS的默认值是我们当前的操作系统， 如果windows，linux,注意mac os操作的上的值是darwin
GOARCH则表示CPU架构，如386，amd64,arm等
举个例子
GOOS=linux GOARCH=amd64 go build main.go
Go涉及的主要环境变量就都在这里了。
```



#### 解决Go各种失败肝疼问题

```
Go 1.13 及以上（推荐）
$ go env -w GO111MODULE=on
$ go env -w GOPROXY=https://goproxy.cn,direct

如果提示冲突unset GOPROXY一把
```

参考地址

<https://shockerli.net/post/go-get-golang-org-x-solution/>

<https://github.com/goproxy/goproxy.cn/blob/master/README.zh-CN.md>



### go modules使用

```
go mod init
go mod

运行前执行go mod tidy即可，这个命令会自动下载依赖的库，也会删除多余的库

go help mod 查看常用
go.mod文件是记录我们依赖库以及版本号
```



### govendor使用

```
go get github.com/kardianos/govendor

用govendor初始化项目并拉取gin
govendor init
govendor fetch github.com/gin-gonic/gin
```



####  VSCode Go配置

settings-extensions-go

```
//golang配置
"editor.wordWrap": "on",
// 如果useLanguageServer设为true，那么在编写代码时引入本地没有的package时，会自动下载安装
// 就是有时候会非常卡，保存go的编码文件时偶尔会卡死。这点你们自己取舍吧
"go.useLanguageServer": false,
"editor.minimap.renderCharacters": false,
"editor.minimap.enabled": false,
"terminal.external.osxExec": "iTerm.app",
"go.docsTool": "gogetdoc",
"go.testFlags": [
"-v",
"-count=1"
],
"go.buildTags": "",
"go.buildFlags": [],
"go.lintFlags": [],
"go.vetFlags": [],
"go.coverOnSave": false,
"go.useCodeSnippetsOnFunctionSuggest": false,
"go.formatTool": "goreturns",
"go.gocodeAutoBuild": false,
"go.goroot": "填写GOROOT路径",
"go.gopath": "填写GOPATH路径",
"go.autocompleteUnimportedPackages": true,
"go.formatOnSave": true,
"window.zoomLevel": 0,
"debug.console.fontSize": 16,
"debug.console.lineHeight": 30,
```



#### Go常用命令

```
go build 编译所有的包和依赖
go clean 清理执行其它命令时产生的一些文件和目录
go install 编译并安装指定的代码包及它们的依赖包
go run 编译并运行命令源码文件

go mod init 初始化一个新模块
go mod vendor 把所有依赖拷贝到vendor文件夹中
go mod tidy 添加缺失的模块，移除无用的模块
```



### Go类型转换

```
The most common numeric conversions are Atoi (string to int) and Itoa (int to string).
i, err := strconv.Atoi("-42")
s := strconv.Itoa(-42)




https://golang.org/pkg/strconv/

```



### Go语言解析json数据

```
package main
 
import (
	"fmt"
	"go-simplejson-master"//注意导入方式,网上常见的导入"github.com/bitly/go-simplejson"，
//应该是修改了文件夹的名字，本人修改名字后，试验成功
)
 
func main() {
	js,err:=simplejson.NewJson([]byte(`{
	"test":{
		"array":[1,2,3],
		"int":18,
		"float":7.66,
		"string":"simplejson",
		"bignum":7617690283790,
		"bool":true   //这里一定不要加逗号，否则会出错
	}
}`))
 
	if err!=nil{
		panic("json format error")
	}else {
        //按照键值获取json中的数据
		arr,_:=js.Get("test").Get("array").Array()
		i,_:=js.Get("test").Get("int").Int()
		f,_:=js.Get("test").Get("float").Float64()
		s:=js.Get("test").Get("string").MustString()
		fmt.Println(arr,i,f,s)
 
	}
 
}
```
