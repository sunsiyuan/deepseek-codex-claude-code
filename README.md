# DeepSeek V4 in Codex and Claude Code through HaryAI

[中文](README.zh-CN.md)

Use DeepSeek V4.1 Flash and DeepSeek V4 Pro through [HaryAI](https://haryai.com/en/deepseek-codex?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code) at 55% off DeepSeek's official price. One HaryAI key works in Codex, Claude Code, Claude Desktop and any tool that takes an API key and base URL. You don't need a DeepSeek account.

This repo has the config to paste for each tool, the prices next to DeepSeek's own, and answers to common questions. The full API reference is [docs/api.md](https://haryai.com/docs/api.md).

## Models

|   | DeepSeek V4.1 Flash | DeepSeek V4 Pro |
|---|---|---|
| Model name | `deepseek-flash` | `deepseek-v4-pro` |
| Served by | `DeepSeek-V4.1-Flash-1017` | `DeepSeek-V4-Pro-0813` |
| Context | 1M | 1M |
| Max output | 384K | 384K |
| Image input | Yes | No |

`deepseek-v4-flash` is retired. The name still works and is served by DeepSeek V4.1 Flash.

## Codex

One file covers the Codex CLI, Codex in the ChatGPT desktop app and the Codex extension for VS Code. Add this to `~/.codex/config.toml` and put your HaryAI key in place of `<your HaryAI key>`:

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

To use DeepSeek V4 Pro, set `model = "deepseek-v4-pro"`. Codex uses the Responses API (`wire_api = "responses"`) at `https://api.haryai.com/v1`. If you signed in to Codex with ChatGPT, this switches it to your HaryAI key; your earlier ChatGPT sessions are kept. Quit Codex completely, reopen it and send a short message. A reply means you're set.

Guide: [DeepSeek in Codex](https://haryai.com/en/deepseek-codex?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code).

## Claude Code

Add this env block to `~/.claude/settings.json` (if the file already has an `env` block, add these entries to it) and put in your key. It covers the Claude Code CLI and the VS Code extension. Start a new Claude Code session and send a short message to check.

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

What each entry does:

| Entry | Value | What it does |
|---|---|---|
| `ANTHROPIC_BASE_URL` | `https://api.haryai.com` | Sends Claude Code's requests to HaryAI instead of Anthropic. |
| `ANTHROPIC_AUTH_TOKEN` | `<your HaryAI key>` | Signs in with your HaryAI key, so no Claude account is used. |
| `ANTHROPIC_MODEL` | `deepseek-flash[1m]` | The main model: DeepSeek V4.1 Flash with its full 1M-token context. |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | `deepseek-flash[1m]` | Whenever Claude Code would pick Opus, it gets the same model. |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | `deepseek-flash[1m]` | The same for Sonnet. |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | `deepseek-flash` | Small background jobs, such as naming a session. |
| `CLAUDE_CODE_SUBAGENT_MODEL` | `deepseek-flash` | Subagents run on DeepSeek as well. |
| `CLAUDE_CODE_EFFORT_LEVEL` | `max` | Thinks as hard as it can on every task. |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | `786432` | Shortens the conversation only when it nears 768K tokens, not at 200K. |
| `CLAUDE_CODE_DISABLE_ARTIFACT` | `1` | Turns off the Artifact tool, which DeepSeek doesn't accept. |

To use DeepSeek V4 Pro, change `deepseek-flash` to `deepseek-v4-pro` in the three main model entries and keep the `[1m]`. V4 Pro reads text only, so screenshots are skipped.

To undo it, put your backup of `~/.claude/settings.json` back, or delete these entries from its `env` block, then start a new session.

Guide: [DeepSeek in Claude Code](https://haryai.com/en/deepseek-claude-code?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code).

## Let your agent set it up

Send one of these to Codex or Claude Code (or any AI assistant). Put your key in place of `<your HaryAI key>` first. Each one backs up the file before it changes anything and tells you how to undo it.

Codex:

````text
Set up Codex on this computer to use HaryAI.
The full guide is at https://haryai.com/en/help/setup. Read it first if anything is unclear.

1. Back up ~/.codex/config.toml (copy it to ~/.codex/config.toml.bak). If it doesn't exist, create it.
2. Add these settings. If a setting with the same name is already there, change its value. Leave everything else as it is.

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

3. Then tell me to quit Codex completely, reopen it, and send a short message to check that it answers.
4. Also tell me how to undo this: put the backup back and reopen Codex.
````

Claude Code:

````text
Set up Claude Code on this computer to use HaryAI.
The full guide is at https://haryai.com/en/help/setup. Read it first if anything is unclear.

1. Back up ~/.claude/settings.json (copy it to ~/.claude/settings.json.bak). If it doesn't exist, create it containing {}.
2. Add the entries below to the "env" object in that file. If an entry with the same name is already there, change its value. Keep every other setting, and keep the file valid JSON.

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

3. Then tell me to start a new Claude Code session and send a short message to check that it answers.
4. Also tell me how to undo this: put the backup back and start a new session.
````

## Claude Desktop

Claude Desktop only accepts Claude's model names, so it is set up through CC Switch, which maps them to DeepSeek. Cowork and Code then run on DeepSeek V4.1 Flash (`deepseek-flash`). The model menu keeps Claude's names; whichever you pick, DeepSeek answers. CC Switch passes the requests on from your computer, so leave it running while you use Claude Desktop. It doesn't change Claude Code.

Guide: [DeepSeek in Claude Desktop](https://haryai.com/en/deepseek-claude?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code).

## One click with CC Switch

CC Switch is a free app that switches Codex, Claude Code and Claude Desktop between providers. Install it from its GitHub releases page.

1. On your HaryAI account page, press Show next to your key, then Import for Codex, Claude Code or Claude Desktop.
2. CC Switch opens. Confirm, switch the tool to HaryAI, and restart the tool.

It writes only the settings it needs. To undo it, switch the tool back to your previous provider in CC Switch. Guide: [Setup guide](https://haryai.com/en/help/setup?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code).

## Other tools and your own code

Any tool that takes an API key and a base URL works (Cline and others). Use your HaryAI key and the model name `deepseek-flash` or `deepseek-v4-pro`.

| Format | Base URL |
|---|---|
| OpenAI (Chat Completions, Responses) | `https://api.haryai.com/v1` |
| Anthropic (Messages) | `https://api.haryai.com` (the client appends `/v1/messages`) |

Every endpoint takes `Authorization: Bearer <HARYAI_KEY>`.

```sh
curl https://api.haryai.com/v1/chat/completions \
  -H "Authorization: Bearer $HARYAI_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-flash","messages":[{"role":"user","content":"Hello"}]}'
```

Python and Node examples with the OpenAI and Anthropic SDKs: [DeepSeek API](https://haryai.com/en/deepseek-api?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code).

## Prices

### Pay as you go

US dollars per 1M tokens. On HaryAI input and output cost 45% of DeepSeek's official price (55% off).

| Model |   | Input, cache hit | Input, cache miss | Output |
|---|---|---|---|---|
| DeepSeek V4.1 Flash | DeepSeek, peak hours | $0.006 | $0.3 | $1.2 |
|  | DeepSeek, off-peak | $0.003 | $0.15 | $0.6 |
|  | HaryAI | $0.003 | $0.135 | $0.54 |
| DeepSeek V4 Pro | DeepSeek, peak hours | $0.044 | $1.32 | $3.96 |
|  | DeepSeek, off-peak | $0.022 | $0.66 | $1.98 |
|  | HaryAI | $0.022 | $0.594 | $1.782 |

Top up $10 / $25 / $50 / $100 / $250. A balance can be used for 6 months after purchase. A verified new account gets $0.35 of balance to try it. Prices are in US dollars; Stripe shows the amount in your own currency at checkout.

### DeepSeek Coding Plan

A monthly plan. Usage is counted at DeepSeek's official prices.

| Plan | Price | Usage included (at DeepSeek's official prices) | Off the official price |
|---|---|---|---|
| Lite | $20 a month | $50 | 60% off |
| Plus | $50 a month | $135 | 63% off |
| Pro | $100 a month | $300 | 67% off |

A plan lasts 30 days and renews until you turn renewal off; unused usage expires at the end. You can cancel anytime and keep using it until the current 30-day period ends. With a plan, the plan is used first, then your balance.

Full tables: [DeepSeek API pricing](https://haryai.com/en/deepseek-api-pricing?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code), [DeepSeek Coding Plan](https://haryai.com/en/deepseek-coding-plan?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code).

## Questions

### How do I use DeepSeek V4 in Claude Code?

Set `ANTHROPIC_BASE_URL` to `https://api.haryai.com` and `ANTHROPIC_AUTH_TOKEN` to your HaryAI key in the `env` block of `~/.claude/settings.json`, and set the model entries to `deepseek-flash[1m]` (or `deepseek-v4-pro[1m]` for V4 Pro). The full block is under [Claude Code](#claude-code). Start a new session.

### How do I use DeepSeek in Codex?

Add a model provider to `~/.codex/config.toml` with `base_url = "https://api.haryai.com/v1"`, `wire_api = "responses"` and your HaryAI key, set `forced_login_method = "api"`, and set `model` to `deepseek-flash` or `deepseek-v4-pro`. The full file is under [Codex](#codex). Quit Codex completely and reopen it.

### Does it work in ChatGPT?

Only in Codex: Codex in the ChatGPT desktop app and the Codex CLI and IDE extension, signed in with an API key instead of a ChatGPT account. ChatGPT on the web, ChatGPT Classic and the mobile apps aren't supported.

### Do I need a Claude subscription, a ChatGPT login or a DeepSeek account?

No. Claude Code and Codex sign in with your HaryAI key, and HaryAI gives you DeepSeek's models through that key. HaryAI is a separate service, not affiliated with DeepSeek.

### Why does Claude Code still list Opus, Sonnet and Haiku?

Those are Claude Code's own labels. With these settings every one of them runs on DeepSeek.

### Do my projects and sessions stay?

In Claude Code, yes: only the entries above change. In Codex, your earlier sessions may seem to be gone after switching. They aren't: Codex keeps sessions from a ChatGPT login and sessions from an API key in separate lists, and shows the one that matches your current setup.

### Can I use DeepSeek in Claude Desktop without CC Switch?

No. Claude Desktop only accepts Claude's model names, so a DeepSeek model needs the mapping CC Switch creates. The model that answers is DeepSeek V4.1 Flash (`deepseek-flash`).

### DeepSeek V4 Pro or V4.1 Flash?

`deepseek-flash` for most work: it costs less and reads images. `deepseek-v4-pro` for harder reasoning; it reads text only. Both have a 1M-token context and up to 384K tokens of output. Switching is one setting, the model name.

### Can DeepSeek read screenshots in Codex or Claude Code?

DeepSeek V4.1 Flash takes image input. DeepSeek V4 Pro doesn't.

### Where did DeepSeek V4 Flash go?

It was retired. Its old names still work and are served by V4.1 Flash at the Flash price.

### How much does DeepSeek V4 cost per 1M tokens?

On HaryAI: DeepSeek V4.1 Flash input $0.135, output $0.54, input cache hit $0.003; DeepSeek V4 Pro input $0.594, output $1.782, input cache hit $0.022. DeepSeek's official price is input $0.3 and output $1.2 for V4.1 Flash, input $1.32 and output $3.96 for V4 Pro. That is 55% off.

### Is there a discount for large purchases?

Yes. Write to support@haryai.com for a direct top-up at a bigger discount.

### Coding Plan or pay as you go?

If you use it most days, the Coding Plan costs less: Lite is $20 a month for $50 of usage at DeepSeek's official prices. If your usage goes up and down, top up only what you need, from $10.

### Does the Coding Plan cover my own app and other tools?

Yes. DeepSeek requests sent with your key count toward the plan, whichever tool or code sends them. A plan is used first, then your balance. Video is paid from the balance only.

### Does my balance expire?

It stays usable for 6 months after you add it. Ask for more time if you need it.

### What happens when my balance runs out?

Requests are refused with 403 `insufficient_user_quota` until you top up. HaryAI emails you when it runs low.

### Is there a rate limit?

HaryAI doesn't cap requests per minute. If you expect heavy traffic, write to support@haryai.com first.

### Is it only for programmers?

No. Codex and Claude Code also write documents, edit spreadsheets and make slides, and DeepSeek does the same work there.

### What do the errors mean?

| Status | Code | Meaning | What to do |
|---|---|---|---|
| 401 | (empty) | Missing or invalid key (`Invalid token`) | Check the key on the account page |
| 400 | `model_not_found` | The model name is not available to your account | Use a model name from the table above |
| 503 | `model_not_found` | The model is available to you but can't be served right now | Retry later |
| 403 | `insufficient_user_quota` | Balance too low for this request | Top up, or buy a plan |
| 429 | varies | The model provider is busy | Wait a few seconds and retry |
| 5xx | varies | The model provider failed | Retry |

The message ends with `(request id: …)`. Send that id to support@haryai.com when asking about a failed request.

## Related

- [seedance-2.5-api](https://github.com/haryai-com/seedance-2.5-api): Seedance 2.5 video through the same HaryAI key and balance.
- [seedance-skill](https://github.com/haryai-com/seedance-skill): make Seedance 2.5 videos from Claude Code or Codex.
- [nano-banana-api](https://github.com/haryai-com/nano-banana-api): Nano Banana 2.1 and 2 through the OpenAI images API or Gemini's own format.

## Links

- [DeepSeek in Codex](https://haryai.com/en/deepseek-codex?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code), [DeepSeek in Claude Code](https://haryai.com/en/deepseek-claude-code?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code), [DeepSeek in Claude Desktop](https://haryai.com/en/deepseek-claude?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code), [Setup guide](https://haryai.com/en/help/setup?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)
- [DeepSeek API pricing](https://haryai.com/en/deepseek-api-pricing?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code), [DeepSeek Coding Plan](https://haryai.com/en/deepseek-coding-plan?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code), [V4 Pro vs V4.1 Flash](https://haryai.com/en/deepseek-v4-pro-vs-flash?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)
- [DeepSeek API in your app](https://haryai.com/en/deepseek-api?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code), [Sign up](https://haryai.com/en/signup?utm_source=github&utm_medium=readme&utm_campaign=deepseek-codex-claude-code)
- [Chat API reference](https://haryai.com/docs/api.md), [llms.txt](https://haryai.com/llms.txt)

## License

MIT. See [LICENSE](LICENSE).

Prices as of 2026-11-27.

<!-- Generated on 2026-11-27 from HaryAI's price catalog, its setup pages' source and https://haryai.com/docs/api.md. Don't edit by hand. -->
