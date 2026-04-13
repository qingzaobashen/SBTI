# 自定义人格卡功能设计文档

> 创建日期：2026-04-11
> 状态：设计中

---

## 1. 功能概述

### 1.1 目标
为 SBTI 人格测试添加"自定义人格卡"功能，允许用户在测试结果基础上：
- 自定义形象（通过预设模板 + 组件组合）
- 自定义文本内容（类型名称、简介、描述）
- 保存到本地并导出为图片

### 1.2 使用场景
用户完成测试后，点击"制作人格卡"按钮，进入独立工坊页面进行编辑。

---

## 2. 技术架构

### 2.1 新增文件结构
```
├── card-workshop.html          # 人格卡工坊页面
├── src/
│   ├── workshop.js             # 工坊主逻辑
│   ├── avatar-editor.js        # 形象拼图编辑器
│   ├── card-preview.js         # 人格卡预览渲染
│   └── style-workshop.css      # 工坊样式
├── assets/
│   └── avatar-components/      # 形象组件资源
│       ├── bodies/             # 身子模板
│       ├── heads/              # 头饰组件
│       └── hands/              # 手饰组件
└── data/
    └── avatar-templates.json   # 形象模板配置
```

### 2.2 数据流
```
测试结果页 → 点击"制作人格卡" → 携带结果数据跳转
                                    ↓
                            工坊页面接收数据
                                    ↓
                        用户编辑：形象 + 文本
                                    ↓
                    本地存储 + 导出 JPG 图片
```

### 2.3 URL 参数传递
```javascript
// 从结果页跳转
window.location.href = `card-workshop.html?data=${encodeURIComponent(JSON.stringify(resultData))}`

// 工坊页面接收
const urlParams = new URLSearchParams(window.location.search)
const resultData = JSON.parse(urlParams.get('data'))
```

---

## 3. 形象拼图编辑器

### 3.1 模板 + 组件结构
```json
{
  "templates": [
    {
      "id": "body_01",
      "name": "标准站姿",
      "image": "assets/avatar-components/bodies/body_01.svg",
      "headSlot": { "x": 100, "y": 20 },
      "handSlot": { "x": 150, "y": 180 }
    }
  ],
  "components": {
    "heads": [
      { "id": "head_crown", "name": "皇冠", "image": "assets/avatar-components/heads/crown.svg" }
    ],
    "hands": [
      { "id": "hand_cup", "name": "咖啡杯", "image": "assets/avatar-components/hands/cup.svg" }
    ]
  }
}
```

### 3.2 编辑器界面
- 形象预览区域
- 身子模板选择器
- 头饰组件选择器
- 手饰组件选择器

### 3.3 渲染逻辑
使用 Canvas 或 SVG 叠加渲染：
1. 绘制身子模板
2. 在 headSlot 位置叠加头饰
3. 在 handSlot 位置叠加手饰

---

## 4. 文本编辑功能

### 4.1 可编辑字段
| 字段 | 最大长度 | 必填 |
|------|----------|------|
| 类型代码 | 10 | 是 |
| 类型名称 | 20 | 是 |
| 一句话简介 | 50 | 否 |
| 详细描述 | 500 | 否 |

### 4.2 实时预览
编辑时实时更新人格卡预览。

---

## 5. 保存与导出

### 5.1 本地存储
```javascript
// localStorage 存储格式
const savedCards = [
  {
    id: 'card_1704038400000',
    createdAt: '2024-01-01T10:00:00Z',
    testData: { ... },
    customData: {
      avatar: { template: 'body_01', head: 'head_crown', hand: 'hand_cup' },
      text: { code: 'CTRL', name: '拿捏者', intro: '...', desc: '...' }
    }
  }
]
```

### 5.2 导出图片
- 格式：JPG（质量 90%）
- 尺寸：800 x 1200 px（竖版）
- 内容：形象 + 文本 + 装饰元素

---

## 6. 图片组件规格

### 6.1 身子模板（5-8 个）
- 尺寸：约 200x300 px
- 格式：SVG 或 PNG（透明背景）
- 内容：不同体型、姿势、风格的人物轮廓

### 6.2 头饰组件（6-10 个）
- 建议内容：皇冠、猫耳、兔耳、光环、恶魔角、花朵等
- 需要定义叠加位置

### 6.3 手饰组件（6-10 个）
- 建议内容：咖啡杯、书本、魔法棒、手机、吉他等
- 需要定义叠加位置

---

## 7. 页面布局

```
┌─────────────────────────────────────────────┐
│  ← 返回测试结果          SBTI 人格卡工坊    │
├─────────────────────────────────────────────┤
│  ┌─────────────────┬─────────────────────┐ │
│  │   形象编辑区     │    文本编辑区       │ │
│  │  [形象预览]     │  类型代码: [____]   │ │
│  │  身子模板选择   │  类型名称: [____]   │ │
│  │  头饰选择       │  一句话:   [____]   │ │
│  │  手饰选择       │  详细描述: [____]   │ │
│  └─────────────────┴─────────────────────┘ │
│  ┌─────────────────────────────────────────┐│
│  │           实时预览卡片                   ││
│  └─────────────────────────────────────────┘│
│  [保存到本地]  [导出图片]  [重新测试]       │
└─────────────────────────────────────────────┘
```

---

## 8. 实现计划

1. 创建数据文件 `data/avatar-templates.json`
2. 创建工坊页面 `card-workshop.html`
3. 创建工坊样式 `src/style-workshop.css`
4. 创建形象编辑器 `src/avatar-editor.js`
5. 创建卡片预览 `src/card-preview.js`
6. 创建工坊主逻辑 `src/workshop.js`
7. 修改结果页添加跳转按钮
8. 创建示例图片资源
9. 测试完整功能流程
