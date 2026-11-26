# 在 Codex 和 Claude Code 里用 DeepSeek V4（通过 HaryAI）

[English](README.md)

在 [HaryAI](https://haryai.com/zh/deepseek-codex?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code) 用 DeepSeek V4.1 Flash 和 DeepSeek V4 Pro，价格是 DeepSeek 官方价 45 折。一个 HaryAI 的 key 可以用在 Codex、Claude Code、Claude Desktop，以及任何能填 API key 和接口地址的工具里。不用注册 DeepSeek 账号。

这个仓库放的是每个工具可以直接粘贴的配置、和 DeepSeek 官方价的对比，还有常见问题的回答。完整接口文档见 [docs/api.md](https://haryai.com/docs/api.md)。

## 模型

|   | DeepSeek V4.1 Flash | DeepSeek V4 Pro |
|---|---|---|
| 模型名 | `deepseek-flash` | `deepseek-v4-pro` |
| 实际回答的模型 | `DeepSeek-V4.1-Flash-1017` | `DeepSeek-V4-Pro-0813` |
| 上下文 | 1M | 1M |
| 最长输出 | 384K | 384K |
| 图片输入 | 支持 | 不支持 |

`deepseek-v4-flash` 已经下线，这个模型名还能用，由 DeepSeek V4.1 Flash 回答。

## Codex

一个配置文件同时管 Codex 命令行、ChatGPT 桌面版里的 Codex 和 VS Code 里的 Codex 插件。把下面的内容加进 `~/.codex/config.toml`，把 `<your HaryAI key>` 换成你的 HaryAI key：

```toml
model = "deepseek-flash"
model_provider = "haryai"
forced_login_method = "api"
model_reasoning_effort = "high"

[model_providers.haryai]
name = "HaryAI"
base_url = "https://api.haryai.com/v1"
wire_api = "responses"
experimental_bearer_token = "<your HaryAI key>"
model_catalog_url = "https://api.haryai.com/v1/models"
```

想用 DeepSeek V4 Pro，就把 model 改成 `deepseek-v4-pro`。Codex 走的是 Responses API（`wire_api = "responses"`），接口地址是 `https://api.haryai.com/v1`。原来用 ChatGPT 账号登录 Codex 的，这样会改用 HaryAI 的 key 登录，之前的 ChatGPT 会话都还在。完全退出 Codex 再重新打开，发一条简短的消息，有回复就说明配好了。

详见 [在 Codex 里用 DeepSeek](https://haryai.com/zh/deepseek-codex?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)。

## Claude Code

把下面这段 env 加进 `~/.claude/settings.json`（文件里已经有 `env` 的，把这些条目加进去就行），填上你的 key。Claude Code 命令行和 VS Code 插件都会生效。开一个新会话，发一条简短的消息检查一下。

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.haryai.com",
    "ANTHROPIC_AUTH_TOKEN": "<your HaryAI key>",
    "ANTHROPIC_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-flash",
    "CLAUDE_CODE_SUBAGENT_MODEL": "deepseek-flash",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "786432",
    "CLAUDE_CODE_DISABLE_ARTIFACT": "1"
  }
}
```

每一项的作用：

| 设置 | 值 | 作用 |
|---|---|---|
| `ANTHROPIC_BASE_URL` | `https://api.haryai.com` | Claude Code 的请求发到 HaryAI，不再发给 Anthropic。 |
| `ANTHROPIC_AUTH_TOKEN` | `<your HaryAI key>` | 用你的 HaryAI key 登录，不用 Claude 账号。 |
| `ANTHROPIC_MODEL` | `deepseek-flash[1m]` | 主模型：DeepSeek V4.1 Flash，用满 100 万 token 上下文。 |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | `deepseek-flash[1m]` | Claude Code 本来要用 Opus 的地方，也换成同一个模型。 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | `deepseek-flash[1m]` | Sonnet 也一样。 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | `deepseek-flash` | 后台的小任务，比如给会话起名字。 |
| `CLAUDE_CODE_SUBAGENT_MODEL` | `deepseek-flash` | 子代理也跑在 DeepSeek 上。 |
| `CLAUDE_CODE_EFFORT_LEVEL` | `max` | 每个任务都用最深的思考强度。 |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | `786432` | 对话接近 76.8 万 token 时才压缩，而不是 20 万就压缩。 |
| `CLAUDE_CODE_DISABLE_ARTIFACT` | `1` | 关掉 Artifact 工具，DeepSeek 不接受它。 |

想用 DeepSeek V4 Pro，把三条主模型设置里的 `deepseek-flash` 改成 `deepseek-v4-pro`，`[1m]` 保留。V4 Pro 只收文字，截图会被跳过。

想改回去，用备份把 `~/.claude/settings.json` 还原，或者从 env 里删掉这些条目，再开一个新会话。

详见 [在 Claude Code 里用 DeepSeek](https://haryai.com/zh/deepseek-claude-code?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)。

## 让 AI 帮你配

把下面其中一段发给 Codex 或 Claude Code（或你平时用的 AI 助手），先把 `<your HaryAI key>` 换成你自己的 key。它会先备份配置文件再改，最后告诉你怎么改回去。

Codex：

````text
请帮我把这台电脑上的 Codex 配置成使用 HaryAI。
完整的配置说明在 https://haryai.com/zh/help/setup，有拿不准的地方先读这一页。

1. 先备份 ~/.codex/config.toml（复制成 ~/.codex/config.toml.bak）。如果这个文件不存在，就新建一个。
2. 加入下面这些设置。已经有同名设置的，只改它的值；其他设置都不要动。

```toml
model = "deepseek-flash"
model_provider = "haryai"
forced_login_method = "api"
model_reasoning_effort = "high"

[model_providers.haryai]
name = "HaryAI"
base_url = "https://api.haryai.com/v1"
wire_api = "responses"
experimental_bearer_token = "<your HaryAI key>"
model_catalog_url = "https://api.haryai.com/v1/models"
```

3. 最后告诉我：完全退出 Codex 再重新打开，发一条简短的消息，看有没有回复。
4. 再告诉我怎么改回去：用备份文件恢复，然后重新打开 Codex。
````

Claude Code：

````text
请帮我把这台电脑上的 Claude Code 配置成使用 HaryAI。
完整的配置说明在 https://haryai.com/zh/help/setup，有拿不准的地方先读这一页。

1. 先备份 ~/.claude/settings.json（复制成 ~/.claude/settings.json.bak）。如果这个文件不存在，就新建一个，内容只写 {}。
2. 把下面这些条目加进文件里的 "env"。已经有同名条目的，只改它的值；其他设置都不要动，保持文件是合法的 JSON。

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.haryai.com",
    "ANTHROPIC_AUTH_TOKEN": "<your HaryAI key>",
    "ANTHROPIC_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-flash",
    "CLAUDE_CODE_SUBAGENT_MODEL": "deepseek-flash",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "786432",
    "CLAUDE_CODE_DISABLE_ARTIFACT": "1"
  }
}
```

3. 最后告诉我：在 Claude Code 里开一个新会话，发一条简短的消息，看有没有回复。
4. 再告诉我怎么改回去：用备份文件恢复，然后开一个新会话。
````

## Claude Desktop

Claude Desktop 只认 Claude 的模型名，所以要靠 CC Switch 建一个对应关系，把请求转给 DeepSeek。配好后 Cowork 和 Code 都跑在 DeepSeek V4.1 Flash（`deepseek-flash`）上。模型菜单里还是 Claude 的名字，不管选哪个，回答的都是 DeepSeek。请求经过你电脑上的 CC Switch 转发，用 Claude Desktop 的时候 CC Switch 要一直开着。这样配不会影响 Claude Code。

详见 [在 Claude Desktop 里用 DeepSeek](https://haryai.com/zh/deepseek-claude?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)。

## 用 CC Switch 一键导入

CC Switch 是一个免费应用，用来切换 Codex、Claude Code 和 Claude Desktop 连接的服务。从它的 GitHub 发布页下载安装。

1. 在 HaryAI 的我的账户里点 key 旁边的「显示」，再点「导入到 Codex」「导入到 Claude Code」或「导入到 Claude Desktop」。
2. CC Switch 会打开，确认后把这个工具切到 HaryAI，再重启它。

它只写入需要的设置。想改回去，在 CC Switch 里把工具切回原来的服务就行。详见 [配置指南](https://haryai.com/zh/help/setup?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)。

## 其他工具和你自己的代码

能填 API key 和接口地址的工具都能用（Cline 等）。填上你的 HaryAI key，模型名填 `deepseek-flash` 或 `deepseek-v4-pro`。

| 格式 | 接口地址 |
|---|---|
| OpenAI（Chat Completions、Responses） | `https://api.haryai.com/v1` |
| Anthropic（Messages） | `https://api.haryai.com`（客户端会自己加上 `/v1/messages`） |

所有接口都用 `Authorization: Bearer <HARYAI_KEY>` 鉴权。

```sh
curl https://api.haryai.com/v1/chat/completions \
  -H "Authorization: Bearer $HARYAI_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-flash","messages":[{"role":"user","content":"Hello"}]}'
```

用 OpenAI 和 Anthropic SDK 的 Python、Node 示例见 [DeepSeek API](https://haryai.com/zh/deepseek-api?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)。

## 价格

### 按量付费

单位是美元，每百万 token。在 HaryAI，输入和输出是 DeepSeek 官方价 45 折。

| 模型 |   | 输入（缓存命中） | 输入（缓存未命中） | 输出 |
|---|---|---|---|---|
| DeepSeek V4.1 Flash | DeepSeek 高峰时段 | $0.006 | $0.3 | $1.2 |
|  | DeepSeek 低峰时段 | $0.003 | $0.15 | $0.6 |
|  | HaryAI | $0.003 | $0.135 | $0.54 |
| DeepSeek V4 Pro | DeepSeek 高峰时段 | $0.044 | $1.32 | $3.96 |
|  | DeepSeek 低峰时段 | $0.022 | $0.66 | $1.98 |
|  | HaryAI | $0.022 | $0.594 | $1.782 |

可以充 $10 / $25 / $50 / $100 / $250，余额自购买起 6 个月内有效。新账号验证邮箱后送 $0.50 余额，可以先试用。价格以美元计，结账时 Stripe 会显示你所在地货币的金额。

### DeepSeek Coding Plan 月卡

按月付费，用量按 DeepSeek 官方价计算。

| 套餐 | 价格 | 包含用量（按 DeepSeek 官方价算） | 相当于 |
|---|---|---|---|
| Lite | 每月 $20 | $50 | 官方价 40 折 |
| Plus | 每月 $50 | $135 | 官方价 37 折 |
| Pro | 每月 $100 | $300 | 官方价 33 折 |

每期 30 天，关掉续费之前每月自动续费，没用完的用量到期作废。随时可以取消，当前 30 天的周期结束前还能继续用。有 Coding Plan 时先扣 Coding Plan，用完再扣余额。

完整价格表见 [DeepSeek API 价格](https://haryai.com/zh/deepseek-api-pricing?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)、[DeepSeek Coding Plan](https://haryai.com/zh/deepseek-coding-plan?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)。

## 常见问题

### Claude Code 怎么接 DeepSeek V4？

在 `~/.claude/settings.json` 的 `env` 里把 `ANTHROPIC_BASE_URL` 设成 `https://api.haryai.com`，`ANTHROPIC_AUTH_TOKEN` 设成你的 HaryAI key，模型设置填 `deepseek-flash[1m]`（用 V4 Pro 就填 `deepseek-v4-pro[1m]`）。完整配置见上面的 [Claude Code](#claude-code) 一节。改完开一个新会话。

### Codex 怎么配置 DeepSeek？

在 `~/.codex/config.toml` 里加一个 model provider，`base_url = "https://api.haryai.com/v1"`，`wire_api = "responses"`，填上你的 HaryAI key，再设 `forced_login_method = "api"`，`model` 填 `deepseek-flash` 或 `deepseek-v4-pro`。完整配置见上面的 [Codex](#codex) 一节。改完完全退出 Codex 再打开。

### ChatGPT 里能用吗？

只能在 Codex 里用：ChatGPT 桌面版里的 Codex、Codex 命令行和 IDE 插件，用 API key 登录，不用 ChatGPT 账号。网页版 ChatGPT、ChatGPT Classic 和手机 App 不支持。

### 需要 Claude 订阅、ChatGPT 账号或 DeepSeek 账号吗？

都不需要。Claude Code 和 Codex 用你的 HaryAI key 登录，通过这个 key 调用 DeepSeek 的模型。HaryAI 是独立的服务，和 DeepSeek 没有隶属关系。

### 为什么 Claude Code 里还显示 Opus、Sonnet、Haiku？

那是 Claude Code 自带的名字。按这些设置，选哪一个都是 DeepSeek 在回答。

### 原来的项目和会话还在吗？

Claude Code 里都在，只有上面那些条目会变。Codex 切换之后，之前的会话可能像是不见了，其实没有删：Codex 把 ChatGPT 登录时的会话和 API key 下的会话分开存，只显示和当前设置对应的那一份。

### Claude Desktop 不用 CC Switch 能配吗？

不能。Claude Desktop 只认 Claude 的模型名，要用 DeepSeek，得靠 CC Switch 建的对应关系。回答的模型是 DeepSeek V4.1 Flash（`deepseek-flash`）。

### DeepSeek V4 Pro 和 V4.1 Flash 选哪个？

大多数情况用 `deepseek-flash`：更便宜，也能读图。推理更难的任务用 `deepseek-v4-pro`，它只支持文字。两个模型上下文都是 100 万 token，最长输出都是 38.4 万 token。切换只改一项设置，就是模型名。

### 在 Codex 或 Claude Code 里，DeepSeek 能看截图吗？

DeepSeek V4.1 Flash 支持图片输入，DeepSeek V4 Pro 不支持。

### DeepSeek V4 Flash 去哪了？

已经下线。旧模型名还能用，由 V4.1 Flash 按 Flash 的价格回答。

### DeepSeek V4 每百万 token 多少钱？

在 HaryAI：DeepSeek V4.1 Flash 输入 $0.135，输出 $0.54，输入缓存命中 $0.003；DeepSeek V4 Pro 输入 $0.594，输出 $1.782，输入缓存命中 $0.022。DeepSeek 官方价是 V4.1 Flash 输入 $0.3、输出 $1.2，V4 Pro 输入 $1.32、输出 $3.96。也就是官方价 45 折。

### 大额充值有更多折扣吗？

有。写信到 support@haryai.com，可以直充，折扣更多。

### 选月卡还是按量付费？

几乎每天都用、用量稳定，选 Coding Plan 月卡更划算，比如 Lite 每月 $20，包含按 DeepSeek 官方价算的 $50 用量。用量忽高忽低，选按量付费，$10 起充，用多少扣多少。

### Coding Plan 能用在我自己的应用和别的工具里吗？

能。用你的 key 发出的 DeepSeek 请求，不管来自哪个工具或代码，都算在套餐里。有 Coding Plan 先扣 Coding Plan，用完再扣余额。视频只从余额扣费。

### 余额会过期吗？

充值起 6 个月内有效，需要延期可以联系 HaryAI。

### 余额用完会怎样？

请求会被拒绝，返回 403 `insufficient_user_quota`，充值后恢复。余额快用完时 HaryAI 会发邮件提醒。

### 有频率限制吗？

HaryAI 不限制每分钟请求数。预计流量很大时，请先发邮件到 support@haryai.com。

### 只有程序员能用吗？

不是。Codex 和 Claude Code 也能写文档、改表格、做幻灯片，换成 DeepSeek 一样能做。

### 报错是什么意思？

| Status | Code | Meaning | What to do |
|---|---|---|---|
| 401 | (empty) | Missing or invalid key (`Invalid token`) | Check the key on the account page |
| 400 | `model_not_found` | The model name is not available to your account | Use a model name from the table above |
| 503 | `model_not_found` | The model is available to you but can't be served right now | Retry later |
| 403 | `insufficient_user_quota` | Balance too low for this request | Top up, or buy a plan |
| 429 | varies | The model provider is busy | Wait a few seconds and retry |
| 5xx | varies | The model provider failed | Retry |

401 是 key 缺失或无效，到我的账户里重新复制；`model_not_found` 返回 400 是模型名不对，返回 503 是暂时用不了，稍后重试；403 `insufficient_user_quota` 是余额不够，充值或买 Coding Plan；429 是模型服务商繁忙，过几秒重试。错误信息结尾有 `(request id: …)`，问失败的请求时把这个 id 发到 support@haryai.com。

## 相关

- [seedance-2.5-api](https://github.com/haryai-com/seedance-2.5-api)：用同一个 HaryAI key 和余额调用 Seedance 2.5 视频模型。
- [seedance-skill](https://github.com/haryai-com/seedance-skill)：在 Claude Code 或 Codex 里直接用 Seedance 2.5 做视频。
- [nano-banana-api](https://github.com/haryai-com/nano-banana-api)：用 OpenAI 图片接口或 Gemini 原生格式调 Nano Banana 2.1 和 2。

## 链接

- [在 Codex 里用 DeepSeek](https://haryai.com/zh/deepseek-codex?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)，[在 Claude Code 里用 DeepSeek](https://haryai.com/zh/deepseek-claude-code?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)，[在 Claude Desktop 里用 DeepSeek](https://haryai.com/zh/deepseek-claude?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)，[配置指南](https://haryai.com/zh/help/setup?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)
- [DeepSeek API 价格](https://haryai.com/zh/deepseek-api-pricing?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)，[DeepSeek Coding Plan](https://haryai.com/zh/deepseek-coding-plan?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)，[V4 Pro 和 V4.1 Flash 对比](https://haryai.com/zh/deepseek-v4-pro-vs-flash?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)
- [在你的应用里调用 DeepSeek API](https://haryai.com/zh/deepseek-api?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)，[注册](https://haryai.com/zh/signup?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)
- [对话接口文档](https://haryai.com/docs/api.md)，[llms.txt](https://haryai.com/llms.txt)

## 许可

MIT，见 [LICENSE](LICENSE)。

价格截至 2026-11-27。

<!-- 由 build.mjs 于 2026-11-27 生成，数据来自 https://haryai.com/llms.txt（价格标记之间的 DeepSeek 部分、开头介绍、接入工具一节）、https://haryai.com/docs/api.md，以及 https://haryai.com/zh/ 下 deepseek-codex、help/setup、deepseek-claude-code、deepseek-v4-pro-vs-flash、deepseek-api-pricing 页面上的配置、提示词和表格。请改 build.mjs，不要直接改本文件。 -->
