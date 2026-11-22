#!/usr/bin/env node
// Builds README.md and README.zh-CN.md. The discount, every price, the plans,
// the signup gift, the peak hours, the model table, the configs, the agent
// prompts and the error table are read from the public pages below at build
// time, so nothing is typed twice. Run: node build.mjs   (Node 18 or later,
// free GETs only, no API key, no model call)

import { writeFile } from "node:fs/promises";

const SITE = "https://haryai.com";
const LLMS = `${SITE}/llms.txt`;
const API_MD = `${SITE}/docs/api.md`;
const CAMPAIGN = "deepseek-codex-claude-code";
const SIBLING = "https://github.com/sunsiyuan/seedance-2.5-api";
// Site pages carry UTM; the docs (.md / .txt) don't.
const page = (path) => `${SITE}${path}?utm_source=github&utm_medium=readme&utm_campaign=${CAMPAIGN}`;

const get = async (url, tries = 3) => {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${url}: ${r.status}`);
      return await r.text();
    } catch (e) {
      if (i >= tries) throw e;
      await new Promise((ok) => setTimeout(ok, 1000 * i));
    }
  }
};
const must = (m, what) => {
  if (!m) throw new Error(`not found: ${what}`);
  return m;
};
const flat = (s) => s.replace(/\s+/g, " ").trim();
const unescape = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
const noTags = (s) => unescape(s.replace(/<[^>]+>/g, "")).trim();
// <table> → rows of cell texts; <pre><code> → code text
const tables = (html) =>
  (html.match(/<table[\s\S]*?<\/table>/g) || []).map((t) =>
    [...t.matchAll(/<tr[\s\S]*?<\/tr>/g)].map((r) => [...r[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => noTags(c[1]))),
  );
const pres = (html) => [...html.matchAll(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g)].map((m) => noTags(m[1]));

// ---- llms.txt: the DeepSeek part of the price section, the intro, the tool lines
const llms = await get(LLMS);
const prices = must(llms.match(/PRICES-BEGIN[^\n]*\n([\s\S]*?)<!-- PRICES-END/), "price markers")[1];
const payg = flat(must(prices.match(/\*\*Pay as you go:\*\*([\s\S]*?)\*\*DeepSeek Coding Plan/), "pay as you go")[1]);
const share = Number(must(payg.match(/cost (\d+)% of DeepSeek's official peak price/), "share of peak")[1]); // 45
const offPeakShare = Number(must(payg.match(/\((\d+)% of peak\)/), "off-peak share")[1]); // 50
const topups = must(payg.match(/top up ((?:\$\d+(?: \/ )?)+) of balance/), "top-ups")[1].trim(); // "$10 / $25 / ..."
const months = Number(must(payg.match(/used for (\d+) months after purchase/), "balance validity")[1]);
const perTok = [...prices.matchAll(/^- (DeepSeek [^(]+?) \(([\w-]+)\): input (\$[\d.]+), output (\$[\d.]+), input cache hit (\$[\d.]+)$/gm)].map(
  ([, name, id, input, output, hit]) => ({ name, id, input, output, hit }),
);
if (perTok.length !== 2) throw new Error(`expected 2 DeepSeek price lines, got ${perTok.length}`);
const plans = [...prices.matchAll(/^- (\w+): \$(\d+) a month, covers \$(\d+) of usage at DeepSeek's official prices$/gm)].map(([, name, price, covers]) => ({
  name,
  price: Number(price),
  covers: Number(covers),
}));
must(plans.length, "plan tiers");
const planDays = Number(must(prices.match(/A plan lasts (\d+) days/), "plan length")[1]);
const gift = Number(must(llms.match(/gets[\s>]+\$([\d.]+)[\s>]+of balance/), "signup gift")[1]);
const peakUtc = must(flat(llms).match(/\((\d\d:\d\d–\d\d:\d\d) and (\d\d:\d\d–\d\d:\d\d) UTC\)/), "peak windows").slice(1); // ["01:00–04:00", "06:00–10:00"]
const tools = flat(must(llms.match(/## Connecting a tool([\s\S]*?)## Pages/), "tool lines")[1]);
const [, codexBase, wireApi] = must(tools.match(/Codex \(OpenAI Responses API\): base URL `([^`]+)`, wire API `(\w+)`/), "Codex base URL");
const claudeBase = must(tools.match(/Claude Code \(Anthropic API\): base URL `([^`]+)`/), "Claude Code base URL")[1];

const off = 100 - share; // en: "55% off"
const zhe = (n) => `${n} 折`; // zh: two-digit 折, "45 折", "40 折"
const planShare = (p) => Math.round((p.price / p.covers) * 100); // 40 → "40 折", "60% off"
const usd = (n) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
const giftUsd = `$${gift.toFixed(2)}`;
const flash = perTok.find((m) => /Flash/.test(m.name));
const pro = perTok.find((m) => !/Flash/.test(m.name));

// ---- docs/api.md: base URLs, retired-name note, curl example, errors
const api = await get(API_MD);
const openaiBase = must(api.match(/^\| OpenAI \(Chat Completions, Responses\) \| `([^`]+)` \|$/m), "OpenAI base URL")[1];
const anthropicBase = must(api.match(/^\| Anthropic \(Messages\) \| `([^`]+)`/m), "Anthropic base URL")[1];
const baseTable = must(api.match(/## Base URLs\n\n((?:^\|.*\|\n?)+)/m), "base URL table")[1].trimEnd();
const retired = flat(must(api.match(/(`deepseek-v4-flash` is retired\.[\s\S]*?)\n\n/), "retired note")[1]);
const curl = must(api.match(/```sh\n([\s\S]*?)```/), "curl example")[1].trimEnd();
const errTable = must(api.match(/## Errors[\s\S]*?\n\n[\s\S]*?\n\n((?:^\|.*\|\n?)+)/m), "error table")[1].trimEnd();
const quotaCode = must(errTable.match(/^\| (\d+) \| `insufficient_user_quota` \|/m), "quota error")[1]; // 403

// ---- site pages, en and zh
const pages = {};
for (const loc of ["en", "zh"]) {
  const p = (path) => get(`${SITE}/${loc}/${path}`);
  const codex = pres(await p("deepseek-codex"));
  const setup = pres(await p("help/setup"));
  const cc = tables(await p("deepseek-claude-code"));
  const vs = tables(await p("deepseek-v4-pro-vs-flash"));
  const pricing = tables(await p("deepseek-api-pricing"));
  const peakHtml = await p("deepseek-peak-hours");
  if (codex.length !== 2) throw new Error(`${loc}/deepseek-codex: expected 2 code blocks, got ${codex.length}`);
  if (setup.length !== 4) throw new Error(`${loc}/help/setup: expected 4 code blocks, got ${setup.length}`);
  pages[loc] = {
    toml: codex[0],
    json: codex[1],
    codexPrompt: setup[0],
    claudePrompt: setup[2],
    settings: must(cc.find((t) => t[0][0] === "ANTHROPIC_BASE_URL"), `${loc} settings table`),
    models: must(vs.find((t) => t[1][1] === flash.id), `${loc} model table`),
    prices: must(pricing[0], `${loc} price table`),
    peak: must(tables(peakHtml)[0], `${loc} peak table`),
    pacific: noTags(must(peakHtml.match(/(?:In US Pacific time|按美国太平洋时间)[^<]*/), `${loc} Pacific time`)[0]),
  };
}

// ---- guards: the pages and llms.txt must agree
const en = pages.en;
if (!en.toml.includes(`base_url = "${codexBase}"`) || !en.toml.includes(`wire_api = "${wireApi}"`)) throw new Error("config.toml and llms.txt disagree");
if (!en.json.includes(`"ANTHROPIC_BASE_URL": "${claudeBase}"`)) throw new Error("settings.json and llms.txt disagree");
if (codexBase !== openaiBase || claudeBase !== anthropicBase) throw new Error("llms.txt and api.md base URLs disagree");
for (const loc of ["en", "zh"]) {
  const t = pages[loc].prices;
  for (const m of perTok) {
    const i = t.findIndex((r) => r[0] === m.name);
    const ours = must(t.slice(i).find((r) => r[1] === "HaryAI"), `HaryAI row for ${m.name}`);
    if (ours.slice(2).join() !== [m.hit, m.input, m.output].join()) throw new Error(`${loc} price table and llms.txt disagree for ${m.id}: ${ours}`);
  }
}
if (pages.en.peak.find((r) => r[0] === "UTC")?.[1] !== peakUtc.join(", ")) throw new Error("peak table and llms.txt disagree");
const officialPeak = (m, col) => {
  const t = en.prices;
  return t.slice(t.findIndex((r) => r[0] === m.name)).find((r) => /peak hours/.test(r[1]))[col];
};

// ---- markdown helpers
const fence = (lang, s) => {
  const n = Math.max(3, ...[...s.matchAll(/`+/g)].map((m) => m[0].length + 1));
  return "`".repeat(n) + lang + "\n" + s + "\n" + "`".repeat(n);
};
const mdTable = (head, rows) => [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
const modelTable = (t) => mdTable(t[0].map((c) => c || " "), t.slice(1).map((r, i) => (i < 2 ? [r[0], ...r.slice(1).map((c) => `\`${c}\``)] : r)));
const priceTable = (t) => mdTable(t[0].map((c) => c || " "), t.slice(1));
const settingsTable = (t, head) => mdTable(head, t.map(([k, v, d]) => [`\`${k}\``, `\`${v}\``, d]));
const peakTable = (t) => mdTable(t[0], t.slice(1));
const planTable = (head, row) => mdTable(head, plans.map(row));
const today = new Date().toLocaleDateString("sv"); // YYYY-MM-DD, local
const lead = plans[0];

// ================================================================ English
const md = `# DeepSeek V4 in Codex and Claude Code through HaryAI

[中文](README.zh-CN.md)

Use DeepSeek V4.1 Flash and DeepSeek V4 Pro through [HaryAI](${page("/en/deepseek-codex")}) at ${off}% off DeepSeek's official price, peak hours included. One HaryAI key works in Codex, Claude Code, Claude Desktop and any tool that takes an API key and base URL. You don't need a DeepSeek account.

This repo has the config to paste for each tool, the prices next to DeepSeek's own, and answers to common questions. The full API reference is [docs/api.md](${API_MD}).

## Models

${modelTable(en.models)}

${retired}

## Codex

One file covers the Codex CLI, Codex in the ChatGPT desktop app and the Codex extension for VS Code. Add this to \`~/.codex/config.toml\` and put your HaryAI key in place of \`<your HaryAI key>\`:

${fence("toml", en.toml)}

To use DeepSeek V4 Pro, set \`model = "${pro.id}"\`. Codex uses the Responses API (\`wire_api = "${wireApi}"\`) at \`${codexBase}\`. If you signed in to Codex with ChatGPT, this switches it to your HaryAI key; your earlier ChatGPT sessions are kept. Quit Codex completely, reopen it and send a short message. A reply means you're set.

Guide: [DeepSeek in Codex](${page("/en/deepseek-codex")}).

## Claude Code

Add this env block to \`~/.claude/settings.json\` (if the file already has an \`env\` block, add these entries to it) and put in your key. It covers the Claude Code CLI and the VS Code extension. Start a new Claude Code session and send a short message to check.

${fence("json", en.json)}

What each entry does:

${settingsTable(en.settings, ["Entry", "Value", "What it does"])}

To use DeepSeek V4 Pro, change \`${flash.id}\` to \`${pro.id}\` in the three main model entries and keep the \`[1m]\`. V4 Pro reads text only, so screenshots are skipped.

To undo it, put your backup of \`~/.claude/settings.json\` back, or delete these entries from its \`env\` block, then start a new session.

Guide: [DeepSeek in Claude Code](${page("/en/deepseek-claude-code")}).

## Let your agent set it up

Send one of these to Codex or Claude Code (or any AI assistant). Put your key in place of \`<your HaryAI key>\` first. Each one backs up the file before it changes anything and tells you how to undo it.

Codex:

${fence("text", en.codexPrompt)}

Claude Code:

${fence("text", en.claudePrompt)}

## Claude Desktop

Claude Desktop only accepts Claude's model names, so it is set up through CC Switch, which maps them to DeepSeek. Cowork and Code then run on DeepSeek V4.1 Flash (\`${flash.id}\`). The model menu keeps Claude's names; whichever you pick, DeepSeek answers. CC Switch passes the requests on from your computer, so leave it running while you use Claude Desktop. It doesn't change Claude Code.

Guide: [DeepSeek in Claude Desktop](${page("/en/deepseek-claude")}).

## One click with CC Switch

CC Switch is a free app that switches Codex, Claude Code and Claude Desktop between providers. Install it from its GitHub releases page.

1. On your HaryAI account page, press Show next to your key, then Import for Codex, Claude Code or Claude Desktop.
2. CC Switch opens. Confirm, switch the tool to HaryAI, and restart the tool.

It writes only the settings it needs. To undo it, switch the tool back to your previous provider in CC Switch. Guide: [Setup guide](${page("/en/help/setup")}).

## Other tools and your own code

Any tool that takes an API key and a base URL works (Cline and others). Use your HaryAI key and the model name \`${flash.id}\` or \`${pro.id}\`.

${baseTable}

Every endpoint takes \`Authorization: Bearer <HARYAI_KEY>\`.

${fence("sh", curl)}

Python and Node examples with the OpenAI and Anthropic SDKs: [DeepSeek API](${page("/en/deepseek-api")}).

## Prices

### Pay as you go

US dollars per 1M tokens. On HaryAI input and output cost ${share}% of DeepSeek's official peak price at every hour. That is below DeepSeek's own off-peak price, which is ${offPeakShare}% of peak.

${priceTable(en.prices)}

Top up ${topups}. A balance can be used for ${months} months after purchase. A verified new account gets ${giftUsd} of balance to try it. Prices are in US dollars; Stripe shows the amount in your own currency at checkout.

### DeepSeek Coding Plan

A monthly plan. Usage is counted at DeepSeek's official prices.

${planTable(["Plan", "Price", "Usage included (at DeepSeek's official prices)", "Off the official price"], (p) => [p.name, `${usd(p.price)} a month`, usd(p.covers), `${100 - planShare(p)}% off`])}

A plan lasts ${planDays} days and renews until you turn renewal off; unused usage expires at the end. You can cancel anytime and keep using it until the current ${planDays}-day period ends. With a plan, the plan is used first, then your balance.

### DeepSeek peak hours

From Monday to Friday, DeepSeek charges double in two windows: ${peakUtc[0]} and ${peakUtc[1]} UTC. Weekends and Chinese public holidays are off-peak all day. On HaryAI the price is the same at every hour.

${peakTable(en.peak)}

${en.pacific}

Full tables: [DeepSeek API pricing](${page("/en/deepseek-api-pricing")}), [DeepSeek Coding Plan](${page("/en/deepseek-coding-plan")}), [DeepSeek peak hours](${page("/en/deepseek-peak-hours")}).

## Questions

### How do I use DeepSeek V4 in Claude Code?

Set \`ANTHROPIC_BASE_URL\` to \`${claudeBase}\` and \`ANTHROPIC_AUTH_TOKEN\` to your HaryAI key in the \`env\` block of \`~/.claude/settings.json\`, and set the model entries to \`${flash.id}[1m]\` (or \`${pro.id}[1m]\` for V4 Pro). The full block is under [Claude Code](#claude-code). Start a new session.

### How do I use DeepSeek in Codex?

Add a model provider to \`~/.codex/config.toml\` with \`base_url = "${codexBase}"\`, \`wire_api = "${wireApi}"\` and your HaryAI key, set \`forced_login_method = "api"\`, and set \`model\` to \`${flash.id}\` or \`${pro.id}\`. The full file is under [Codex](#codex). Quit Codex completely and reopen it.

### Does it work in ChatGPT?

Only in Codex: Codex in the ChatGPT desktop app and the Codex CLI and IDE extension, signed in with an API key instead of a ChatGPT account. ChatGPT on the web, ChatGPT Classic and the mobile apps aren't supported.

### Do I need a Claude subscription, a ChatGPT login or a DeepSeek account?

No. Claude Code and Codex sign in with your HaryAI key, and HaryAI gives you DeepSeek's models through that key. HaryAI is a separate service, not affiliated with DeepSeek.

### Why does Claude Code still list Opus, Sonnet and Haiku?

Those are Claude Code's own labels. With these settings every one of them runs on DeepSeek.

### Do my projects and sessions stay?

In Claude Code, yes: only the entries above change. In Codex, your earlier sessions may seem to be gone after switching. They aren't: Codex keeps sessions from a ChatGPT login and sessions from an API key in separate lists, and shows the one that matches your current setup.

### Can I use DeepSeek in Claude Desktop without CC Switch?

No. Claude Desktop only accepts Claude's model names, so a DeepSeek model needs the mapping CC Switch creates. The model that answers is DeepSeek V4.1 Flash (\`${flash.id}\`).

### DeepSeek V4 Pro or V4.1 Flash?

\`${flash.id}\` for most work: it costs less and reads images. \`${pro.id}\` for harder reasoning; it reads text only. Both have a 1M-token context and up to 384K tokens of output. Switching is one setting, the model name.

### Can DeepSeek read screenshots in Codex or Claude Code?

DeepSeek V4.1 Flash takes image input. DeepSeek V4 Pro doesn't.

### Where did DeepSeek V4 Flash go?

It was retired. Its old names still work and are served by V4.1 Flash at the Flash price.

### How much does DeepSeek V4 cost per 1M tokens?

On HaryAI, at any hour: ${perTok.map((m) => `${m.name} input ${m.input}, output ${m.output}, input cache hit ${m.hit}`).join("; ")}. DeepSeek's official peak price is input ${officialPeak(flash, 3)} and output ${officialPeak(flash, 4)} for V4.1 Flash, input ${officialPeak(pro, 3)} and output ${officialPeak(pro, 4)} for V4 Pro. That is ${off}% off, peak hours included.

### When are DeepSeek's peak hours?

${peakUtc[0]} and ${peakUtc[1]} UTC, Monday to Friday. That is ${pages.en.peak.find((r) => /Beijing/.test(r[0]))[1]} in Beijing and ${pages.en.peak.find((r) => /JST/.test(r[0]))[1]} in Japan and Korea. Weekends and Chinese public holidays are off-peak all day. Off-peak prices are half of peak, for every model and every kind of token.

### Is HaryAI more expensive during peak hours?

No. Input and output cost ${share}% of DeepSeek's official peak price at every hour, which is below DeepSeek's own off-peak price.

### Coding Plan or pay as you go?

If you use it most days, the Coding Plan costs less: ${lead.name} is ${usd(lead.price)} a month for ${usd(lead.covers)} of usage at DeepSeek's official prices. If your usage goes up and down, top up only what you need, from ${topups.split(" / ")[0]}.

### Does the Coding Plan cover my own app and other tools?

Yes. DeepSeek requests sent with your key count toward the plan, whichever tool or code sends them. A plan is used first, then your balance. Video is paid from the balance only.

### Does my balance expire?

It stays usable for ${months} months after you add it. Ask for more time if you need it.

### What happens when my balance runs out?

Requests are refused with ${quotaCode} \`insufficient_user_quota\` until you top up. HaryAI emails you when it runs low.

### Is there a rate limit?

HaryAI doesn't cap requests per minute. If you expect heavy traffic, write to support@haryai.com first.

### Is it only for programmers?

No. Codex and Claude Code also write documents, edit spreadsheets and make slides, and DeepSeek does the same work there.

### What do the errors mean?

${errTable}

The message ends with \`(request id: …)\`. Send that id to support@haryai.com when asking about a failed request.

## Related

- [seedance-2.5-api](${SIBLING}): Seedance 2.5 video through the same HaryAI key and balance.
- [seedance-skill](https://github.com/sunsiyuan/seedance-skill): make Seedance 2.5 videos from Claude Code or Codex.
- [nano-banana-api](https://github.com/sunsiyuan/nano-banana-api): Nano Banana 2.1 and 2 through the OpenAI images API or Gemini's own format.

## Links

- [DeepSeek in Codex](${page("/en/deepseek-codex")}), [DeepSeek in Claude Code](${page("/en/deepseek-claude-code")}), [DeepSeek in Claude Desktop](${page("/en/deepseek-claude")}), [Setup guide](${page("/en/help/setup")})
- [DeepSeek API pricing](${page("/en/deepseek-api-pricing")}), [DeepSeek Coding Plan](${page("/en/deepseek-coding-plan")}), [DeepSeek peak hours](${page("/en/deepseek-peak-hours")}), [V4 Pro vs V4.1 Flash](${page("/en/deepseek-v4-pro-vs-flash")})
- [DeepSeek API in your app](${page("/en/deepseek-api")}), [Sign up](${page("/en/signup")})
- [Chat API reference](${API_MD}), [llms.txt](${LLMS})

## License

MIT. See [LICENSE](LICENSE).

Prices as of ${today}.

<!-- Generated by build.mjs on ${today} from ${LLMS} (DeepSeek part of the price section, intro, tool lines), ${API_MD}, and the configs, prompts and tables on ${SITE}/en/ deepseek-codex, help/setup, deepseek-claude-code, deepseek-v4-pro-vs-flash, deepseek-api-pricing and deepseek-peak-hours. Edit build.mjs, not this file. -->
`;

// ================================================================ 中文
const zh = pages.zh;
const zhPeak = zh.peak.find((r) => /北京/.test(r[0]))[1].replace(", ", "、");
const zhMd = `# 在 Codex 和 Claude Code 里用 DeepSeek V4（通过 HaryAI）

[English](README.md)

在 [HaryAI](${page("/zh/deepseek-codex")}) 用 DeepSeek V4.1 Flash 和 DeepSeek V4 Pro，价格是 DeepSeek 官方价 ${zhe(share)}，高峰时段也一样。一个 HaryAI 的 key 可以用在 Codex、Claude Code、Claude Desktop，以及任何能填 API key 和接口地址的工具里。不用注册 DeepSeek 账号。

这个仓库放的是每个工具可以直接粘贴的配置、和 DeepSeek 官方价的对比，还有常见问题的回答。完整接口文档见 [docs/api.md](${API_MD})。

## 模型

${modelTable(zh.models)}

\`deepseek-v4-flash\` 已经下线，这个模型名还能用，由 DeepSeek V4.1 Flash 回答。

## Codex

一个配置文件同时管 Codex 命令行、ChatGPT 桌面版里的 Codex 和 VS Code 里的 Codex 插件。把下面的内容加进 \`~/.codex/config.toml\`，把 \`<your HaryAI key>\` 换成你的 HaryAI key：

${fence("toml", zh.toml)}

想用 DeepSeek V4 Pro，就把 model 改成 \`${pro.id}\`。Codex 走的是 Responses API（\`wire_api = "${wireApi}"\`），接口地址是 \`${codexBase}\`。原来用 ChatGPT 账号登录 Codex 的，这样会改用 HaryAI 的 key 登录，之前的 ChatGPT 会话都还在。完全退出 Codex 再重新打开，发一条简短的消息，有回复就说明配好了。

详见 [在 Codex 里用 DeepSeek](${page("/zh/deepseek-codex")})。

## Claude Code

把下面这段 env 加进 \`~/.claude/settings.json\`（文件里已经有 \`env\` 的，把这些条目加进去就行），填上你的 key。Claude Code 命令行和 VS Code 插件都会生效。开一个新会话，发一条简短的消息检查一下。

${fence("json", zh.json)}

每一项的作用：

${settingsTable(zh.settings, ["设置", "值", "作用"])}

想用 DeepSeek V4 Pro，把三条主模型设置里的 \`${flash.id}\` 改成 \`${pro.id}\`，\`[1m]\` 保留。V4 Pro 只收文字，截图会被跳过。

想改回去，用备份把 \`~/.claude/settings.json\` 还原，或者从 env 里删掉这些条目，再开一个新会话。

详见 [在 Claude Code 里用 DeepSeek](${page("/zh/deepseek-claude-code")})。

## 让 AI 帮你配

把下面其中一段发给 Codex 或 Claude Code（或你平时用的 AI 助手），先把 \`<your HaryAI key>\` 换成你自己的 key。它会先备份配置文件再改，最后告诉你怎么改回去。

Codex：

${fence("text", zh.codexPrompt)}

Claude Code：

${fence("text", zh.claudePrompt)}

## Claude Desktop

Claude Desktop 只认 Claude 的模型名，所以要靠 CC Switch 建一个对应关系，把请求转给 DeepSeek。配好后 Cowork 和 Code 都跑在 DeepSeek V4.1 Flash（\`${flash.id}\`）上。模型菜单里还是 Claude 的名字，不管选哪个，回答的都是 DeepSeek。请求经过你电脑上的 CC Switch 转发，用 Claude Desktop 的时候 CC Switch 要一直开着。这样配不会影响 Claude Code。

详见 [在 Claude Desktop 里用 DeepSeek](${page("/zh/deepseek-claude")})。

## 用 CC Switch 一键导入

CC Switch 是一个免费应用，用来切换 Codex、Claude Code 和 Claude Desktop 连接的服务。从它的 GitHub 发布页下载安装。

1. 在 HaryAI 的我的账户里点 key 旁边的「显示」，再点「导入到 Codex」「导入到 Claude Code」或「导入到 Claude Desktop」。
2. CC Switch 会打开，确认后把这个工具切到 HaryAI，再重启它。

它只写入需要的设置。想改回去，在 CC Switch 里把工具切回原来的服务就行。详见 [配置指南](${page("/zh/help/setup")})。

## 其他工具和你自己的代码

能填 API key 和接口地址的工具都能用（Cline 等）。填上你的 HaryAI key，模型名填 \`${flash.id}\` 或 \`${pro.id}\`。

| 格式 | 接口地址 |
|---|---|
| OpenAI（Chat Completions、Responses） | \`${openaiBase}\` |
| Anthropic（Messages） | \`${anthropicBase}\`（客户端会自己加上 \`/v1/messages\`） |

所有接口都用 \`Authorization: Bearer <HARYAI_KEY>\` 鉴权。

${fence("sh", curl)}

用 OpenAI 和 Anthropic SDK 的 Python、Node 示例见 [DeepSeek API](${page("/zh/deepseek-api")})。

## 价格

### 按量付费

单位是美元，每百万 token。在 HaryAI，输入和输出任何时段都是 DeepSeek 官方高峰价的 ${share}%，比 DeepSeek 自己的低峰价（高峰价的 ${offPeakShare}%）还低。

${priceTable(zh.prices)}

可以充 ${topups}，余额自购买起 ${months} 个月内有效。新账号验证邮箱后送 ${giftUsd} 余额，可以先试用。价格以美元计，结账时 Stripe 会显示你所在地货币的金额。

### DeepSeek Coding Plan 月卡

按月付费，用量按 DeepSeek 官方价计算。

${planTable(["套餐", "价格", "包含用量（按 DeepSeek 官方价算）", "相当于"], (p) => [p.name, `每月 ${usd(p.price)}`, usd(p.covers), `官方价 ${zhe(planShare(p))}`])}

每期 ${planDays} 天，关掉续费之前每月自动续费，没用完的用量到期作废。随时可以取消，当前 ${planDays} 天的周期结束前还能继续用。有 Coding Plan 时先扣 Coding Plan，用完再扣余额。

### DeepSeek 高峰时段

周一到周五，DeepSeek 在北京时间 ${zhPeak} 按双倍收费。周末和中国法定节假日全天低峰。在 HaryAI 任何时段都是同一个价。

${peakTable(zh.peak)}

${zh.pacific}

完整价格表见 [DeepSeek API 价格](${page("/zh/deepseek-api-pricing")})、[DeepSeek Coding Plan](${page("/zh/deepseek-coding-plan")})、[DeepSeek 高峰时段](${page("/zh/deepseek-peak-hours")})。

## 常见问题

### Claude Code 怎么接 DeepSeek V4？

在 \`~/.claude/settings.json\` 的 \`env\` 里把 \`ANTHROPIC_BASE_URL\` 设成 \`${claudeBase}\`，\`ANTHROPIC_AUTH_TOKEN\` 设成你的 HaryAI key，模型设置填 \`${flash.id}[1m]\`（用 V4 Pro 就填 \`${pro.id}[1m]\`）。完整配置见上面的 [Claude Code](#claude-code) 一节。改完开一个新会话。

### Codex 怎么配置 DeepSeek？

在 \`~/.codex/config.toml\` 里加一个 model provider，\`base_url = "${codexBase}"\`，\`wire_api = "${wireApi}"\`，填上你的 HaryAI key，再设 \`forced_login_method = "api"\`，\`model\` 填 \`${flash.id}\` 或 \`${pro.id}\`。完整配置见上面的 [Codex](#codex) 一节。改完完全退出 Codex 再打开。

### ChatGPT 里能用吗？

只能在 Codex 里用：ChatGPT 桌面版里的 Codex、Codex 命令行和 IDE 插件，用 API key 登录，不用 ChatGPT 账号。网页版 ChatGPT、ChatGPT Classic 和手机 App 不支持。

### 需要 Claude 订阅、ChatGPT 账号或 DeepSeek 账号吗？

都不需要。Claude Code 和 Codex 用你的 HaryAI key 登录，通过这个 key 调用 DeepSeek 的模型。HaryAI 是独立的服务，和 DeepSeek 没有隶属关系。

### 为什么 Claude Code 里还显示 Opus、Sonnet、Haiku？

那是 Claude Code 自带的名字。按这些设置，选哪一个都是 DeepSeek 在回答。

### 原来的项目和会话还在吗？

Claude Code 里都在，只有上面那些条目会变。Codex 切换之后，之前的会话可能像是不见了，其实没有删：Codex 把 ChatGPT 登录时的会话和 API key 下的会话分开存，只显示和当前设置对应的那一份。

### Claude Desktop 不用 CC Switch 能配吗？

不能。Claude Desktop 只认 Claude 的模型名，要用 DeepSeek，得靠 CC Switch 建的对应关系。回答的模型是 DeepSeek V4.1 Flash（\`${flash.id}\`）。

### DeepSeek V4 Pro 和 V4.1 Flash 选哪个？

大多数情况用 \`${flash.id}\`：更便宜，也能读图。推理更难的任务用 \`${pro.id}\`，它只支持文字。两个模型上下文都是 100 万 token，最长输出都是 38.4 万 token。切换只改一项设置，就是模型名。

### 在 Codex 或 Claude Code 里，DeepSeek 能看截图吗？

DeepSeek V4.1 Flash 支持图片输入，DeepSeek V4 Pro 不支持。

### DeepSeek V4 Flash 去哪了？

已经下线。旧模型名还能用，由 V4.1 Flash 按 Flash 的价格回答。

### DeepSeek V4 每百万 token 多少钱？

在 HaryAI 任何时段都是：${perTok.map((m) => `${m.name} 输入 ${m.input}，输出 ${m.output}，输入缓存命中 ${m.hit}`).join("；")}。DeepSeek 官方高峰价是 V4.1 Flash 输入 ${officialPeak(flash, 3)}、输出 ${officialPeak(flash, 4)}，V4 Pro 输入 ${officialPeak(pro, 3)}、输出 ${officialPeak(pro, 4)}。也就是官方价 ${zhe(share)}，高峰时段也一样。

### DeepSeek 的高峰时段是什么时候？

周一到周五，北京时间 ${zhPeak}（UTC ${peakUtc.join("、")}）。周末和中国法定节假日全天低峰。所有模型、所有类型的 token，低峰价都是高峰价的一半。

### 高峰时段在 HaryAI 会更贵吗？

不会。输入和输出任何时段都是 DeepSeek 官方高峰价的 ${share}%，比 DeepSeek 自己的低峰价还低。

### 选月卡还是按量付费？

几乎每天都用、用量稳定，选 Coding Plan 月卡更划算，比如 ${lead.name} 每月 ${usd(lead.price)}，包含按 DeepSeek 官方价算的 ${usd(lead.covers)} 用量。用量忽高忽低，选按量付费，${topups.split(" / ")[0]} 起充，用多少扣多少。

### Coding Plan 能用在我自己的应用和别的工具里吗？

能。用你的 key 发出的 DeepSeek 请求，不管来自哪个工具或代码，都算在套餐里。有 Coding Plan 先扣 Coding Plan，用完再扣余额。视频只从余额扣费。

### 余额会过期吗？

充值起 ${months} 个月内有效，需要延期可以联系 HaryAI。

### 余额用完会怎样？

请求会被拒绝，返回 ${quotaCode} \`insufficient_user_quota\`，充值后恢复。余额快用完时 HaryAI 会发邮件提醒。

### 有频率限制吗？

HaryAI 不限制每分钟请求数。预计流量很大时，请先发邮件到 support@haryai.com。

### 只有程序员能用吗？

不是。Codex 和 Claude Code 也能写文档、改表格、做幻灯片，换成 DeepSeek 一样能做。

### 报错是什么意思？

${errTable}

401 是 key 缺失或无效，到我的账户里重新复制；\`model_not_found\` 返回 400 是模型名不对，返回 503 是暂时用不了，稍后重试；${quotaCode} \`insufficient_user_quota\` 是余额不够，充值或买 Coding Plan；429 是模型服务商繁忙，过几秒重试。错误信息结尾有 \`(request id: …)\`，问失败的请求时把这个 id 发到 support@haryai.com。

## 相关

- [seedance-2.5-api](${SIBLING})：用同一个 HaryAI key 和余额调用 Seedance 2.5 视频模型。
- [seedance-skill](https://github.com/sunsiyuan/seedance-skill)：在 Claude Code 或 Codex 里直接用 Seedance 2.5 做视频。
- [nano-banana-api](https://github.com/sunsiyuan/nano-banana-api)：用 OpenAI 图片接口或 Gemini 原生格式调 Nano Banana 2.1 和 2。

## 链接

- [在 Codex 里用 DeepSeek](${page("/zh/deepseek-codex")})，[在 Claude Code 里用 DeepSeek](${page("/zh/deepseek-claude-code")})，[在 Claude Desktop 里用 DeepSeek](${page("/zh/deepseek-claude")})，[配置指南](${page("/zh/help/setup")})
- [DeepSeek API 价格](${page("/zh/deepseek-api-pricing")})，[DeepSeek Coding Plan](${page("/zh/deepseek-coding-plan")})，[DeepSeek 高峰时段](${page("/zh/deepseek-peak-hours")})，[V4 Pro 和 V4.1 Flash 对比](${page("/zh/deepseek-v4-pro-vs-flash")})
- [在你的应用里调用 DeepSeek API](${page("/zh/deepseek-api")})，[注册](${page("/zh/signup")})
- [对话接口文档](${API_MD})，[llms.txt](${LLMS})

## 许可

MIT，见 [LICENSE](LICENSE)。

价格截至 ${today}。

<!-- 由 build.mjs 于 ${today} 生成，数据来自 ${LLMS}（价格标记之间的 DeepSeek 部分、开头介绍、接入工具一节）、${API_MD}，以及 ${SITE}/zh/ 下 deepseek-codex、help/setup、deepseek-claude-code、deepseek-v4-pro-vs-flash、deepseek-api-pricing、deepseek-peak-hours 页面上的配置、提示词和表格。请改 build.mjs，不要直接改本文件。 -->
`;

// The prose restates a few facts from the pages; fail if the source changed under it.
const modelRow = (label) => en.models.find((r) => r[0] === label)?.slice(1).join();
if (modelRow("Context") !== "1M,1M" || modelRow("Max output") !== "384K,384K") throw new Error(`context or max output changed: ${modelRow("Context")} / ${modelRow("Max output")}`);
if (modelRow("Image input") !== "Yes,No") throw new Error(`image input changed: ${modelRow("Image input")}`);
if (!/^`deepseek-v4-flash` is retired\. The name still works and is served by DeepSeek V4\.1 Flash\.$/.test(retired)) throw new Error(`retired note changed: ${retired}`);
if (offPeakShare !== 50) throw new Error(`off-peak share changed (prose says "half of peak"): ${offPeakShare}`);
if (!/^\| 401 \|[\s\S]*^\| 429 \|/m.test(errTable)) throw new Error("error table changed, check the zh summary");

await writeFile("README.md", md);
await writeFile("README.zh-CN.md", zhMd);
console.log(
  `README.md, README.zh-CN.md: ${share}% of official peak (${off}% off, ${zhe(share)}), gift ${giftUsd}, top-ups ${topups}, ${months} months; ` +
    `${perTok.map((m) => `${m.id} ${m.input}/${m.output}/${m.hit}`).join("; ")}; plans ${plans.map((p) => `${p.name} $${p.price}→$${p.covers}`).join(", ")}`,
);
