---
layout: post
title: Fastapi+Vue前后端分离
categories: Python
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/freepd-vue.png
tags: Fastapi vue
date: 2022-05-21
---

### Fastapi+Vue前后端分离-Vue环境搭建

#### nodejs环境安装

nvm多版本管理工具

https://github.com/nvm-sh/nvm (linux/mac)

https://github.com/coreybutler/nvm-windows/releases (win)

nvm常用命令

```
nvm off                     // 禁用node.js版本管理(不卸载任何东西)
nvm on                      // 启用node.js版本管理
nvm install <version>       // 安装node.js的命名 version是版本号 例如：nvm install 8.12.0
nvm uninstall <version>     // 卸载node.js是的命令，卸载指定版本的nodejs，当安装失败时卸载使用
nvm ls                      // 显示所有已安装的node.js版本
nvm list available          // 显示可以安装的所有node.js的版本
nvm use <version>           // 切换到使用指定的nodejs版本
nvm v                       // 显示nvm版本
nvm install stable          // 安装最新稳定版
```

node,npm版本查看

```
node -v
npm -v
```

vue-cli安装

```
sudo npm i -g vue-cli

EEXIST: file already exists, mkdir xxx
卸载重装 sudo npm uninstall vue-cli -g

```

在对应的项目目录初始化vue项目

```
vue-init webpack freepd

? Project name freepd
? Project description freepd fronted project
? Author lyln
? Vue build standalone
? Install vue-router? Yes
? Use ESLint to lint your code? No
? Set up unit tests No
? Setup e2e tests with Nightwatch? No
? Should we run `npm install` for you after the project has been created? (recommended) (Use arrow keys)
❯ Yes, use NPM
  Yes, use Yarn
  No, I will handle that myself
```

启动项目

```

sudo npm run dev 可能会报错。

启动找不到如下命令，安装即可。
sudo npm install webpack-dev-server --save-dev
sudo npm install -g webpack webpack-cli
npm link webpack
npm link webpack-cli

sudo npm install 安装依赖。
```

![vue-start](https://inshub.oss-cn-beijing.aliyuncs.com/blog/vue-start.png)



### Fastapi+Vue前后端分离-整合element-ui

package.json

```
  "dependencies": {
    "vue": "^2.5.2",
    "vue-router": "^3.0.1",
    "element-ui": "^2.15.7"
  },
```

`npm install`执行安装

然后在main.js引入element-ui组件

```
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'; 

Vue.config.productionTip = false 
Vue.use(ElementUI)
```

https://element.faas.ele.me/#/zh-CN/component/quickstart 具体可以参考官网，目前先使用完全引入的方式，后面优化按需引入。

直接修改helloworld模块

```
<template>
	<el-container>
		<el-main style="wide: 80%">
			<el-row>
				<el-col :span="24">
					<div class="grid-content bg-purple-dark"></div>

					<el-form ref="form" :model="form" label-width="120px" class="fpd-form">
						<el-form-item label="分享链接内容">
							<el-input v-model="form.url"></el-input>
						</el-form-item>
						<el-form-item label="平台" label-width="120px">
							<el-radio-group v-model="form.type">
								<el-radio :label="1">抖音</el-radio>
								<el-radio :label="2">网易云</el-radio>
								<el-radio :label="3">快手</el-radio>
							</el-radio-group>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="onSubmit">在线解析</el-button>
						</el-form-item>
					</el-form>

				</el-col>
			</el-row>
		</el-main>
	</el-container>

</template>
<script>
export default {
	name: 'HelloWorld',
	data() {
		return {
			msg: 'free parse download',
			form: {
				url: '',
				type: 1,
			},
		}
	},
	methods: {
		onSubmit() {
			console.log('submit!')  #这里实现后端请求交互。
		},
	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
	font-weight: normal;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: inline-block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
.el-input {
	width: 320px;
}

.fpd-form {
	text-align: left;
}
</style>

```

![freepd-v1](https://inshub.oss-cn-beijing.aliyuncs.com/blog/freepd-v1.png)

前端展示如上，整合element-ui完成。



### Fastapi+Vue前后端分离-前后端交互

目前我们已经实现了前端页面的展示，那怎样和后端交互呢？

后端交互使用axios请求。

package.json

```
  "dependencies": {
    "vue": "^2.5.2",
    "vue-router": "^3.0.1",
    "element-ui": "^2.15.7",
    "axios": "0.18.1"
  },
```

`npm install`执行安装

在vue页面中导入使用

```

import axios from 'axios'

		onSubmit() {
			console.log('submit!')  #这里实现后端请求交互。
			axios
				.post('http://127.0.0.1:8000/douyin', { url: this.form.url })
				.then((res) => {
					console.log(res.data)
					this.data = res.data
				})
				.catch((err) => {
					console.log('请求失败', err)
				})	
		},

```

将请求返回的data数据赋值给data。

![freepd-vue](https://inshub.oss-cn-beijing.aliyuncs.com/blog/freepd-vue.png)



### 项目地址

https://github.com/lyln/freepd

可参见backend下Dockerfile自行构建镜像。

```
cd backend
docker build -t freepd:v1 .
docker run -d --name freepd -p 9000:9000 freepd:v1
```



#### 问题汇总

fastapi docs接口访问解决方法

```
 /usr/local/lib/python3.8/site-packages/fastapi/openapi/docs.py
 venv/lib/python3.8/site-packages/fastapi/openapi/docs.py
 
# swagger_js_url: str = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui-bundle.js",
swagger_js_url: str = "https://petstore.swagger.io/swagger-ui-bundle.js",
# swagger_css_url: str = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui.css",
swagger_css_url: str = "https://petstore.swagger.io/swagger-ui.css",
```

https://cdnjs.com/libraries/swagger-ui

替换swagger js和css文件

```
https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.12.0/swagger-ui-bundle.js
https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.12.0/swagger-ui.css
或者
https://petstore.swagger.io/swagger-ui-bundle.js
https://petstore.swagger.io/swagger-ui.css

```

问题描述：

ImportError: No module named Crypto

问题解决：

```
1.pycrypto、pycrytodome和crypto是一个东西，crypto在python上面的名字是pycrypto，它是一个第三方库，但是已经停止更新三年了，所以不建议安装这个库；

2.windows下python3.6安装也不会成功！
这个时候pycryptodome就来了，它是pycrypto的延伸版本，用法和pycrypto是一模一样的；
所以，现在告诉大家一种解决方法，直接安装：pip install pycryptodome

```

