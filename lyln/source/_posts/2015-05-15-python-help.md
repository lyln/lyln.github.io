---
layout: post
title:  "python小技巧"
categories: Python
tags: Python
---
dir查看对象的属性
```bash
>>> dir(re)
['DEBUG', 'DOTALL', 'I', ...'compile'....]
```

help查看模块方法的使用
```bash
>>>help('compile')
```
<!--more-->
命令行自动补全
```bash
cat ~/.pythonstartup 
# python startup file
import readline
import rlcompleter
import atexit
import os
# tab completion
readline.parse_and_bind('tab: complete')
# history file
histfile = os.path.join(os.environ['HOME'], '.pythonhistory')
try:
  readline.read_history_file(histfile)
except IOError:
    pass
atexit.register(readline.write_history_file, histfile)
del os, histfile, readline, rlcompleter

vi /etc/profile
export PYTHONSTARTUP=/root/.pythonstartup
source /etc/profile
```
