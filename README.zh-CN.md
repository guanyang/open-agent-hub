# open-agent-hub

[English](README.md) | **简体中文**

`open-agent-hub` 是一个面向 AI 编码助手（如 Claude Code, Cursor, Codex, Antigravity 等）的本地统一能力管理中心。它通过一个零依赖的本地 CLI 工具，集中管理并一键链接各种 AI 助手能力组件（如 **Skills/模块化技能**、**Agents/专家角色**、**Commands/运行时指令**等，并对未来的其他能力形态保持完全开放与兼容）。

---

## 📂 目录结构

```
.
├── agents/             # 专家 Agent 系统提示词目录 (agent-*.md)
├── commands/           # Agent 运行时的 Slash Commands 目录 (*.md)
├── docs/               # 技术规范与使用指南 (Agent, Command, Skill 指南)
├── scripts/            # CLI 核心管理脚本 (hub.js)
├── skills/             # 模块化能力技能库目录 (83+ 技能)
├── spec/               # Agent 能力标准与技术规范定义目录
├── template/           # 新增能力组件（Skill/Agent/Command）开发模板
├── AGENTS.md           # LLM 编码行为规范指导 (项目级)
├── CLAUDE.md           # Claude 编码行为规范指导 (项目级)
├── GEMINI.md           # Gemini 编码行为规范指导 (项目级)
├── CHANGELOG.md        # 项目版本更新日志
├── CONTRIBUTING.md     # 社区贡献与代码提交指南
├── LICENSE             # MIT 开源授权协议
├── SECURITY.md         # 安全策略与缺陷反馈机制说明
├── package.json        # CLI 工具 npm 全局链接与发布配置
├── skills_index.json   # 动态扫描后生成的技能元数据全局索引
├── skills_sources.json # oah sync 同步指令依赖的上游技能数据源配置
├── README.md           # 英文主文档
└── README.zh-CN.md     # 中文主文档
```
*(注：`AGENTS.md`、`CLAUDE.md`、`GEMINI.md` 是项目级 LLM 编码行为规范指导文件，其设计源于 [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills))*

---

## 📖 技术规范与开发指南

为了保持根目录文档的高聚焦度与专业性，各项能力的具体设计规范与细节已被整理至 `docs/` 目录下统一管理：

*   🧩 **[Skill 技能指南](docs/Skill_Guidelines.md) (英文)**：模块化技能的设计标准、Frontmatter 触发词规则以及 83 个内置技能的完整目录。
*   🤖 **[Agent 角色指南](docs/Agent_Guidelines.md) (英文)**：Orchestrator（协调者）、Evaluator（评估者）、Optimizer（优化者）的角色定义、对接契约与反馈循环机制。
*   🛠 **[Command 指令指南](docs/Command_Guidelines.md) (英文)**：Agent 运行时 Slash Commands（如 `/commit`、`/review`、`/test-tdd`）的设计规范与执行流。

---

## 🔌 兼容性

`open-agent-hub` 采用标准的 Markdown 格式与 YAML Frontmatter 元数据。CLI 工具会动态将组件（Skills、Agents、Commands）链接到 AI 编码助手对应项目或全局配置路径下的子目录（如 `/skills/`、`/agents/`、`/commands/`）中：

| 助手名称 | 类型 | 兼容性 | 项目路径 (工作区) | 全局路径 (系统级) |
| :--- | :--- | :--- | :--- | :--- |
| **Claude Code** | CLI | ✅ 完整 | `.claude/` | `~/.claude/` |
| **Antigravity** | IDE | ✅ 完整 | `.agent/` | `~/.gemini/antigravity/` |
| **Gemini CLI** | CLI | ✅ 完整 | `.gemini/` | `~/.gemini/` |
| **Codex** | CLI | ✅ 完整 | `.codex/` | `~/.codex/` |
| **Cursor** | IDE | ✅ 完整 | `.cursor/` | `~/.cursor/` |
| **Trae** | IDE | ✅ 完整 | `.trae/` | `~/.trae/` |
| **OpenCode** | CLI | ✅ 完整 | `.opencode/` | `~/.config/opencode/` |

> [!TIP]
> CLI 工具 (`oah`) 会在这些路径下自动映射相应的子目录，例如：技能映射至 `<Path>/skills/`，专家角色映射至 `<Path>/agents/`，快捷命令映射至 `<Path>/commands/`。

---

## 🚀 快速开始

### 1. 克隆仓库
首先将本仓库克隆到本地（建议放在一个固定位置以便全局引用）：
```bash
git clone https://github.com/guanyang/open-agent-hub.git ~/open-agent-hub
```

### 2. 全局链接 CLI 工具
在克隆的项目根目录下运行以下命令，注册全局可执行命令 `open-agent`（同时支持别名 `open-agent-hub`、`oah`、`ahub`）：
```bash
cd ~/open-agent-hub
npm link
```

### 3. 一键管理能力
链接成功后，你可以在系统任何地方使用命令行轻松管理和配置本地的 AI 助手环境：
```bash
# 列出本地所有已扫描到的 Skills、Agents 与 Commands
oah list

# 检查当前项目（工作区）中各组件的软链接状态 (默认为项目级)
oah status

# 检查系统全局（如 ~/.claude/）中各组件的激活状态
oah status --global

# 激活指定的组件到当前项目目录下 (例如激活到当前项目的 .claude 目录下)
oah enable canvas-design

# 一键激活所有组件到当前项目目录下 (不传入组件名称则默认激活全部组件)
oah enable

# 在特定的目标环境（如 Cursor）的当前项目工作区下激活所有组件
oah enable --target=cursor

# 一键激活所有组件到所有支持的目标环境的当前项目工作区下
oah enable --target=all

# 一键激活所有组件到所有支持的目标环境的全局系统目录下
oah enable --global --target=all

# 激活所有组件到全局系统目录下 (系统级激活)
oah enable --global

# 一键禁用并安全清理当前项目工作区的全部软链接
oah disable
```

#### 命令行过滤器与选项参数：
*   **过滤器（作为名称参数传入，互斥）：**
    *   `<name>`：启用/禁用指定的单个组件。
    *   `--skills`：仅启用/禁用所有的 Skills 组件。
    *   `--agents`：仅启用/禁用所有的 Agents 组件。
    *   `--commands`：仅启用/禁用所有的 Commands 组件。
    *   `--all`, `-a`：启用/禁用本仓库的所有 Skills、Agents 和 Commands (不传参数时默认为此选项)。
*   **可选参数：**
    *   `-p, --project`：项目工作区级别激活（默认行为，软链接至当前命令行所在项目目录下的配置目录中，如 `.claude/` 等）。
    *   `-g, --global`：系统全局级别激活（软链接至用户家目录系统路径下，如 `~/.claude/` 等）。
    *   `-t, --target <name>`：指定目标环境（支持：`claude`, `antigravity`, `gemini`, `codex`, `cursor`, `trae`, `opencode` 以及 `all`，默认值：`claude`）。



## 🔄 保持技能库同步

`skills/` 目录下的许多模块化技能源于优秀的开源社区。你可以随时使用 CLI 命令或内置脚本将它们与上游仓库同步：

```bash
# 同步所有配置了上游源的技能
oah sync

# 仅同步指定的技能源 (例如 anthropics-skills)
oah sync anthropics-skills
```
*注：上游同步源在根目录下的 `skills_sources.json` 中配置。也可以通过 `./scripts/sync_skills.sh` 脚本直接执行。*

---

## 🛡️ 安全与贡献指南

*   **安全策略**：若发现安全漏洞，请阅读 [SECURITY.md](SECURITY.md) 安全策略进行反馈。
*   **贡献代码**：我们非常欢迎你为项目添砖加瓦！关于如何贡献新的技能、专家角色或快捷指令，请参考 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 协议开源。