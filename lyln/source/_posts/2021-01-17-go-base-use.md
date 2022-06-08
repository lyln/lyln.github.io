---
layout: post
title: Go简明语法
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/golang.jpg
tags: Go
date: 2021-01-17
---

#### Go基础用法

Go指针

```
a := 5
fmt.Println(a)

var pa *int
pa = &a

fmt.Println(pa)
fmt.Println(*pa)

go常量
const message string = "go入门"
```



Go选择控制语句

```
for循环
for i := 1; i <= 5; i++ {
fmt.Println(i)
}

If/Else逻辑判断
score := 10
if score >= 30 {
fmt.Println("MVP级别")
} else if score >= 20 {
fmt.Println("球星级别")
} else if score >= 10 {
fmt.Println("首发球员")
} else {
fmt.Println("酱油球员")
}

Switch分支
switch time.Now().Weekday() {
case time.Saturday, time.Sunday:
fmt.Println("来了来了，周末来了")
default:
fmt.Println("哭吧哭吧")
}
```

Go数组定义

```
// 数组定义
var a [5]int
fmt.Println("a数组:", a)
// 元素赋值
a[4] = 100
fmt.Println("a数组:", a)
fmt.Println("a[4]:", a[4])
// 数组长度
fmt.Println("len:", len(a))
// 数组定义且赋值
b := [5]int{1, 2, 3, 4, 5}
fmt.Println("b数组:", b)
// 二维数组
var c [2][3]int
for i := 0; i < 2; i++ {
for j := 0; j < 3; j++ {
c[i][j] = i + j
}
}
fmt.Println("二维数组: ", c)

```

Go切片

```
// 创建空切片
s := make([]string, 3)
fmt.Println("切片:", s)

s[0] = "a"
s[1] = "b"
s[2] = "c"
fmt.Println("切片内容:", s)
fmt.Println("s[2]:", s[2])
fmt.Println("切片长度:", len(s))

// 内容追加
s = append(s, "d")
s = append(s, "e", "f")
fmt.Println("数据追加后切片内容:", s)

// 创建新的切片
c := make([]string, len(s))
// 拷贝切片内容
copy(c, s)
fmt.Println("新切片内容:", c)

// 取切片下标：2,3,4. 结果[2,5) 
l := s[2:5]
fmt.Println("数据234:", l)
// 取切片下标：0,1,2,3,4
l = s[:5]
fmt.Println("数据01234:", l)
// 取切片下标：2,3,4,5
l = s[2:]
fmt.Println("数据2345:", l)

// 创建数组
t := []string{"g", "h", "i", "x", "y", "z"}
fmt.Println("数组t:", t)
// 数组切片
fmt.Println("数组t[2:4]:", t[2:4])
```

Go map哈希字典

```
// 定义一个key:value的哈希表
m := make(map[string]int)
// 赋值
m["k1"] = 7
m["k2"] = 13

fmt.Println("m:", m)
// 给变量赋值
v1 := m["k1"]
fmt.Println("v1: ", v1)
// 哈希长度
fmt.Println("len(m):", len(m))

// 删除一个哈希值
delete(m, "k2")
fmt.Println("m:", m)

// 定义+初始化
n := map[string]int{"foo": 1, "bar": 2}
fmt.Println("n:", n)
```

Go range的使用

```
// 定义一个数组
nums := []int{2, 3, 4}
sum := 0
// range 循环数组
for _, num := range nums {
sum += num
}
fmt.Println("sum:", sum)

for i, num := range nums {
fmt.Println("index:", i, ", num:", num)
}

// 迭代一个字典
kvs := map[string]string{"a": "apple", "b": "banana", "c": "orange"}
for k, v := range kvs {
fmt.Printf("%s -> %s\n", k, v)
}

// 仅仅迭代字典的key
for k := range kvs {
fmt.Println("key:", k)
}

// 仅仅迭代字典的value
for _, v := range kvs {
fmt.Println("value:", v)
}
// 迭代循环一个字符串
for i, c := range "iloveu" {
fmt.Println(i, string(c))
}
```

Go函数使用

```
函数声明
// a+b
func plus2(a int, b int) int {
	return a + b
}

// a+b+c
func plus3(a, b, c int) int {
	return a + b + c
}

// 四则计算：计算两个值的加减乘除结果，返回多个值
func calABCD(a, b int) (int, int, int, int) {
	return a + b, a - b, a * b, a / b
}

// 可变参数函数：合计参数值
func addNums(nums ...int) int {
	fmt.Print(nums, " ")
	total := 0
	for _, num := range nums {
		total += num
	}
	return total
}
	
函数使用
//两个数相加
result := plus2(10, 20)
fmt.Println("10+20=", result)
// 三个数相加
result = plus3(10, 20, 30)
fmt.Println("10+20+30=", result)
// 两个数计算加减乘除
w, x, y, z := calABCD(200, 100)
fmt.Println("ab四则计算=", w, x, y, z)
// 可变参数函数计算合集
result = addNums(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
fmt.Println("1-10合计为=", result)
```

Go递归函数

```
// 递归函数(自调用)
func sum(num int) int {
    if num == 1 {
        return num
    }
    return sum(num-1) + num 
}

// 求和1-10
fmt.Println(sum(10))
```

Go Structs的使用

值传递结构体

```
// 声明user结构体
type user struct {
    name string
    password string
    age  int
}


// 实例化 user 结构体 user1
user1 := user{name: "koma", password: "12345678", age: 25}
fmt.Println(user1.name, user1.password, user1.age)

// 声明一个指向 user1 的指针 user1p
user1p := &user1
fmt.Println(user1p.name, user1p.password, user1p.age)

// 利用指针给 user1 赋值，会改变 user1 的内容
user1p.name = "mike"
user1p.password = "iloveu"
user1p.age = 20
fmt.Println(user1.name, user1.password, user1.age)
fmt.Println(user1p.name, user1p.password, user1p.age)
```

Structs结构体定义专用的方法

rect结构体， func(r *rect) area() init   area为rect的方法

```
// 定义矩形结构体
type rect struct {
    width, height int
}
// 为 rect 结构体定义计算面积方法 area(), 参数为指针类型
func (r *rect) area() int {
	return r.width * r.height
}
// 为 rect 结构体定义计算周长的方法 perim(), 参数为值类型
func (r rect) perim() int {
	return 2 * (r.width + r.height)
}

使用结构体方法
// 定义一个矩形结构体变量
r := rect{width: 10, height: 4}
// 分别调用计算面积和周长的方法
fmt.Println("area: ", r.area())
fmt.Println("perim:", r.perim())

// 指针方式调用
rp := &r
fmt.Println("area: ", rp.area())
fmt.Println("perim:", rp.perim())
```

Go接口使用

```
// 定义一个几何图形接口
type geometry interface {
    area() float64
    perim() float64
}
// 定义一个矩形结构体
type rect struct {
    width, height float64
}
// 定义一个圆形结构体
type circle struct {
    radius float64
}
// 矩形计算面积
func (r rect) area() float64 {
    return r.width * r.height
}
// 矩形计算周长
func (r rect) perim() float64 {
    return 2 * (r.width * r.height)
}
// 圆形计算面积
func (c circle) area() float64 {
    return math.Pi * c.radius * c.radius
}
// 圆形计算周长
func (c circle) perim() float64 {
    return 2 * math.Pi * c.radius
}
// 计算函数，参数为几何图形接口类型
func measure(g geometry) {
    fmt.Println(reflect.TypeOf(g), g)
    fmt.Println(g.area())
    fmt.Println(g.perim())
}


使用
// 声明一个矩形
r := rect{width: 4, height: 5}
// 声明一个圆形
c := circle{radius: 10}
// 用measure函数计算矩形面积和周长
measure(r)
// 用measure函数计算圆形面积和周长
measure(c)
```

Go协程Goroutines的使用

```
func sayHelo(name string) {
	for i := 1; i <= 5; i++ {
		fmt.Println("Helo", name, ":", i)
	}
}

cmd := exec.Command("clear")
cmd.Stdout = os.Stdout
cmd.Run()
// 同步执行函数
sayHelo("world")
// 异步执行函数
go sayHelo("iphone")
go sayHelo("ipad")
// 匿名函数，异步执行
go func(msg string) {
fmt.Println("this is a", msg)
}("lesson")
// 等待一秒
time.Sleep(time.Second)
```

Go channel通道的使用

```
// 定义一个字符型的通道
	message := make(chan string)
	go func() {
		for i := 1; i <= 3; i++ {
			message <- (strconv.Itoa(i) + ".helo channel.")
		}
	}()
	// 接收通道发送的消息
	result_channel := ""
	result_channel = <-message
	fmt.Println(result_channel)
	result_channel = <-message
	fmt.Println(result_channel)
	result_channel = <-message
	fmt.Println(result_channel)

	message_buff := make(chan string, 3) // 如果是2的话，系统会报错，因为线程阻塞死锁

	// 发送消息
	message_buff <- "消息1"
	message_buff <- "消息2"
	message_buff <- "消息3"

	// 接收消息
	fmt.Println(<-message_buff)
	fmt.Println(<-message_buff)
	fmt.Println(<-message_buff)
```

