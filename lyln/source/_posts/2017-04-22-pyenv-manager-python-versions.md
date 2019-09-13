---
layout: post
title:  "pyenv 管理 Python 版本 "
categories: Python
tags: pyenv
date: 2017/04/22
---

pyenv 是 Python 版本管理工具。 pyenv 可以改变全局的 Python 版本，安装多个版本的 Python， 设置目录级别的 Python 版本，还能创建和管理 virtual python environments 。所有的设置都是用户级别的操作，不需要 sudo 命令。

pyenv 主要用来管理 Python 的版本，比如一个项目需要 Python 2.x ，一个项目需要 Python 3.x 。 而 virtualenv 主要用来管理 Python 包的依赖，不同项目需要依赖的包版本不同，则需要使用虚拟环境。

<!--more-->
### pyenv安装

如果使用 Mac 直接使用 Homebrew 
```
brew install pyenv
```

自动安装
```
curl -L https://raw.githubusercontent.com/yyuu/pyenv-installer/master/bin/pyenv-installer | bash
```

手动安装
将 pyenv 检出到你想安装的目录。建议路径为：$HOME/.pyenv
```
git clone https://github.com/pyenv/pyenv.git ~/.pyenv

echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bash_profile
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bash_profile
echo 'eval "$(pyenv init -)"' >> ~/.bash_profile
source ~/.bash_profile
```

卸载
移除变量配置
```
rm -fr ~/.pyenv
```

### pyenv 常用命令

```
使用如下命令查看可安装版本
pyenv install -l

查看当前pyenv可检测到的所有版本,处于激活状态的版本前以 * 标示
pyenv versions

查看当前处于激活状态的版本,括号中内容表示这个版本是由哪条途径激活的（global、local、shell）
pyenv version   

安装与卸载
pyenv install 3.6.3
pyenv uninstall 3.6.3

```