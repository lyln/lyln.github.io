---
layout: post
title: 通过api创建Grafana图表
categories: Linux
index_img: https://inshub.oss-cn-beijing.aliyuncs.com/blog/grafana-api.jpg
tags: 监控 
date: 2021-02-08
---

**获取API Keys**

```
用户名：ops
密码：123456
API KEY：xxxx
```



**创建dashboard**

参考官网接口 <https://grafana.com/docs/grafana/latest/http_api/dashboard/>

```
POST /api/dashboards/db 
Accept: application/json
Content-Type: application/json
Authorization: Bearer <API KEY>

{
  "dashboard": {
    "id": null,
    "uid": null,
    "title": "Production Overview",
    "tags": [ "templated" ],
    "timezone": "browser",
    "schemaVersion": 16,
    "version": 0,
    "refresh": "25s"
  },
  "folderId": 0,
  "overwrite": false
}
```



**创建图表**

获取创建dashboard的id及uid

```
{
 "dashboard":  {
        "id": 104,
        "uid": "dHEquNzGz",
        "title": "Production Overview",
        "panels": [
            {		
            		"datasource": "prometheus_xxx",
                "gridPos": {
                    "h": 8,
                    "w": 24,
                    "x": 0,
                    "y": 8
                },
                "targets": [
                    {	
                    		"format": "time_series",
                    		"rawSql": "查询sql",
                        "refId": "A"
                    }
                ],
                "timeRegions": [],
                "timeShift": null,
                "title": "Panel Title",
                "title": "接口QPS",
                "type": "graph"
            }
        ],
        "overwrite": true,
        "version": 1
    }
}
```

Response响应JSON，通过获取url拼接grafana的生成地址。

```
{
  "id":      1,
  "uid":     "cIBgcSjkk",
  "url":     "/d/cIBgcSjkk/production-overview",
  "status":  "success",
  "version": 1
}
```

**Go代码实现**

```
import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/bitly/go-simplejson"
)

//发送Grafana请求函数
func reqGrafanaServer(jsonStr []byte) (*simplejson.Json, error) {
	grafana_url := "http://192.168.1.101:3001/api/dashboards/db"
	grafana_token := "Bearer  <API KEY>"

	grafanaReq, err := http.NewRequest("POST", grafana_url, bytes.NewBuffer(jsonStr))
	grafanaReq.Header.Set("Content-Type", "application/json")
	grafanaReq.Header.Set("Authorization", grafana_token)

	client := &http.Client{}
	grafanaResp, err := client.Do(grafanaReq)

	if err != nil {
		fmt.Println("get grafanaResp failed, err:", err)

	}
	defer grafanaResp.Body.Close()
	grafanaRespBody, err := ioutil.ReadAll(grafanaResp.Body)

	if err != nil {
		fmt.Println("read from grafanaRespBody failed,err:", err)
	}
	return simplejson.NewJson([]byte(grafanaRespBody))
}

func main() {
	grafana_ui_url := "http://xxx_url"
	
	var dashJson = []byte(`{"dashboard": {"id": null,"uid": null,"title": "Production Overview Test","tags": [ "templated" ],"timezone": "browser","schemaVersion": 16,"version": 0},"folderId": 0,"overwrite": false}`)

	dashData, err := reqGrafanaServer(dashJson)
	if err != nil {
		fmt.Printf("%v\n", err)
		return
	}
	
	dashId, _ := dashData.Get("id").Int()
	dashUid, _ := dashData.Get("uid").String()

	fmt.Println("dashId status is: ", dashId)
	fmt.Println("dashUid status is: ", dashUid)

	//创建图表
	var graphJson = []byte(`{"dashboard": {"id":` + strconv.Itoa(dashId) + `,"uid":"` + dashUid + `","title":"Production Overview Test","panels": [{"datasource": "viper_test","gridPos": {"h": 8,"w": 24,"x": 0,"y": 8},"targets": [{"format": "time_series","rawSql": "查询sql","refId": "A"}],"title": "接口QPS","type": "graph"}]},"overwrite": true}`)

	graphData, err := reqGrafanaServer(graphJson)
	
	if err != nil {
		fmt.Printf("%v\n", err)
		return
	}
	grafana_url, _ := graphData.Get("url").String()
	fmt.Println("reqGrafanaServer grafana url :", grafana_url)
	fmt.Println("grafana url is:", grafana_ui_url+grafana_url)
}
```

**通过接口调用自动生成grafana界面**

![grafana-interface-qps](https://inshub.oss-cn-beijing.aliyuncs.com/blog/grafana-interface-qps.jpg)