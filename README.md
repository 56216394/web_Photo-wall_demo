# 苏州金鸡湖地图推荐区域 Demo

酒店列表页地图交互 Demo，使用高德 JavaScript API 2.0，展示景区围栏、推荐居住区域和酒店价格气泡。

## 在线预览

https://suzhou-map-demo.vercel.app/

## 本地运行

```bash
./start-demo.sh
```

默认地址：

- 本机：http://localhost:4173/
- 局域网：启动脚本会输出当前 IP 地址

## 主要文件

- `index.html`：页面结构与高德 Key 配置
- `styles.css`：移动端 UI、围栏和气泡样式
- `script.js`：地图、状态机、坐标投影、碰撞与数据模拟
- `PROJECT_CONTEXT.md`：跨设备续接上下文
- `PROJECT_METHODOLOGY.md`：方法论与技能沉淀

## 项目状态

当前已完成核心地图交互和公网部署。待办及关键决策见 [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)。
