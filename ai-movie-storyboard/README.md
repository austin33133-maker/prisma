# AI 电影分镜工具

输入剧本或故事梗概，调用 Claude API 自动生成专业电影分镜表（storyboard），包含：

- **镜号 / 场景**（内景/外景-地点-时间）
- **景别**（远景 → 大特写）与**运镜**（推、拉、摇、移、跟……）
- **画面描述**（构图、人物动作、关键道具，可直接拍摄）
- **台词 / 旁白、音效 / 音乐、情绪与光线氛围**
- **英文文生图提示词**（可直接粘贴到 Midjourney / SD 等文生图模型生成分镜画面）

结果以分镜卡片展示，支持导出 **JSON / CSV**，或通过浏览器打印保存为 **PDF**。

## 快速开始

```sh
cd ai-movie-storyboard
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # 你的 Claude API Key
npm start
# 打开 http://localhost:3000
```

未设置 `ANTHROPIC_API_KEY` 时自动进入**演示模式**：返回内置示例分镜，便于在无凭证环境下体验界面与导出功能。

## 技术说明

- 后端：Node.js（>= 20）内置 `http` 模块，唯一依赖为官方 `@anthropic-ai/sdk`。
- 模型：`claude-opus-4-8`，启用自适应思考（`thinking: { type: "adaptive" }`）。
- 输出：通过 `output_config.format`（JSON Schema 结构化输出）保证返回严格合法的分镜 JSON，景别与运镜使用枚举约束。
- 请求采用流式（`messages.stream` + `finalMessage()`），避免长输出触发 HTTP 超时。

## API

`POST /api/generate`

```json
{ "script": "故事梗概……", "style": "电影感写实", "shotCount": 12 }
```

返回 `{ "demo": false, "storyboard": { "title", "logline", "visualStyle", "shots": [...] } }`。
