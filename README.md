# open-agent-hub

**English** | [简体中文](README.zh-CN.md)

A lightweight, zero-dependency CLI tool to manage and activate capabilities for AI coding assistants (such as Claude Code, Cursor, Trae, etc.). With a single command, you can link **Skills** (modular prompting), **Agents** (expert workflow roles), and **Commands** (slash commands) to your project workspaces or global system configurations.

---

## 📂 Directory Structure

```
.
├── agents/             # System prompts for expert Agents (agent-*.md)
├── commands/           # Agent runtime Slash Commands (*.md)
├── docs/               # Technical specs and user guidelines
├── scripts/            # CLI manager source code (hub.js)
├── skills/             # Modular capability skills (83+ skills)
├── spec/               # Technical specification definitions for capabilities
├── template/           # Development templates for Skills, Agents, and Commands
├── AGENTS.md           # Project-level LLM coding guidelines
├── CLAUDE.md           # Claude-specific coding guidelines
├── GEMINI.md           # Gemini-specific coding guidelines
├── CHANGELOG.md        # Changelog of project versions
├── CONTRIBUTING.md     # Community guidelines for contributions
├── LICENSE             # MIT license file
├── SECURITY.md         # Vulnerability reporting policies
├── package.json        # CLI configuration and npm registration
├── skills_index.json   # Scanned and generated global metadata index for skills
├── skills_sources.json # Data sources configuration for `oah sync` command
├── README.md           # English documentation (this file)
└── README.zh-CN.md     # Chinese translation documentation
```
*(Note: `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` contain project-level LLM coding behavioral guidelines, derived from [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills))*

---

## 📖 Technical Guidelines & Documentation

To maintain clean and focused documentation, deep-dive specifications have been moved under the `docs/` directory. Please refer to:

*   🧩 **[Skill Guidelines](docs/Skill_Guidelines.md)**: Design standards, trigger rules, and a complete catalog of the 83+ modular skills.
*   🤖 **[Agent Guidelines](docs/Agent_Guidelines.md)**: Specifications for Orchestrator, Evaluator, and Optimizer agent roles, detailing handoff contracts and Evaluator-Optimizer loops.
*   🛠 **[Command Guidelines](docs/Command_Guidelines.md)**: Guidelines for agent-facing slash commands (such as `/commit`, `/review`, and `/test-tdd`).

---

## 🔌 Compatibility

`open-agent-hub` follows standardized Markdown prompts with YAML frontmatter metadata. The CLI dynamically links components (Skills, Agents, Commands) to their respective subdirectories (`/skills/`, `/agents/`, `/commands/`) within the project or global configuration directories of the AI assistant:

| Tool Name (Agent) | Type | Compatibility | Project Path (Workspace) | Global Path (System) |
| :--- | :--- | :--- | :--- | :--- |
| **Claude Code** | CLI | ✅ Full | `.claude/` | `~/.claude/` |
| **Antigravity** | IDE | ✅ Full | `.agents/` | `~/.gemini/antigravity/` |
| **Gemini CLI** | CLI | ✅ Full | `.gemini/` | `~/.gemini/` |
| **Codex** | CLI | ✅ Full | `.codex/` | `~/.codex/` |
| **Cursor** | IDE | ✅ Full | `.cursor/` | `~/.cursor/` |
| **Trae** | IDE | ✅ Full | `.trae/` | `~/.trae/` |
| **OpenCode** | CLI | ✅ Full | `.opencode/` | `~/.config/opencode/` |
| **Kiro** | CLI/Agent | ✅ Full | `.kiro/` | `~/.kiro/` |

> [!TIP]
> The CLI tool (`oah`) links files into subdirectories under these paths, e.g., `<Path>/skills/` for skills, `<Path>/agents/` for agents, and `<Path>/commands/` for slash commands.

---

## 🚀 Quick Start

You can install and manage skills either directly using Vercel's standard `skills` CLI, or via our built-in zero-dependency manager (`oah`) which also supports managing Agents and Slash Commands.

### Option 1: Quick Install via Vercel's `skills` CLI (Easiest)

If you only need to use the modular **Skills** and are using a compatible agent (like Claude Code, Cursor, etc.), you can use Vercel's official `skills` CLI to install them directly from this repository without cloning:

```bash
# Add all skills from this repository
npx skills@latest add guanyang/open-agent-hub

# Add a specific skill (e.g., remotion)
npx skills@latest add guanyang/open-agent-hub --skill remotion
```

### Option 2: Clone and use the built-in CLI (`oah`)

If you want to manage **Skills, Agents, and Slash Commands** dynamically via local symlinks, or if you want to sync upstream sources, you can clone the repository and use our CLI tool:

#### 1. Clone the Hub
Clone this repository locally (it is recommended to place it in a fixed location for global reference):
```bash
git clone https://github.com/guanyang/open-agent-hub.git ~/open-agent-hub
```

#### 2. Global Link via CLI
In the root directory, run the link command to register the CLI manager `open-agent` (with aliases `open-agent-hub`, `oah`, `ahub`):
```bash
cd ~/open-agent-hub
npm link
```

#### 3. Manage Capabilities
After linking, you can manage your local agent environments from anywhere:
```bash
# List all dynamically scanned Skills, Agents, and Commands
oah list

# Check link status in your current project workspace (default behavior)
oah status

# Check link status in global system configurations (e.g. ~/.claude/)
oah status --global

# Enable a specific component inside the current project workspace
oah enable canvas-design

# Enable all components (Skills, Agents, Commands) in current project workspace (defaults to all)
oah enable

# Enable all components in project workspace for Cursor (links to .cursor/)
oah enable --target=cursor

# Enable all components in project workspace for ALL supported targets
oah enable --target=all

# Enable all components globally for ALL supported targets
oah enable --global --target=all

# Enable all components globally (system-level)
oah enable --global

# Enable all components in a custom target directory (auto-creates subdirectories dynamically)
oah enable --path=/path/to/my_agent_dir

# Disable all components inside the current project workspace
oah disable
```

#### CLI Filters & Options:
*   **Filters (Passed as the name argument, mutually exclusive):**
    *   `<name>`: Enable/disable a single component by its name/ID.
    *   `--skills`: Enable/disable only all Skills components.
    *   `--agents`: Enable/disable only all Agents components.
    *   `--commands`: Enable/disable only all Commands components.
    *   `--all`, `-a`: Enable/disable all Skills, Agents, and Commands (default behavior when no arguments are provided).
*   **Options:**
    *   `-p, --project` (default): Project-level activation (links config directories inside your current working directory, e.g. `.claude/`).
    *   `-g, --global`: System global level activation (e.g., links into user home config folder, like `~/.claude/`).
    *   `-t, --target <name>`: Target environment to link to (supported: `claude`, `antigravity`, `gemini`, `codex`, `cursor`, `trae`, `opencode`, `kiro` and `all` to configure all of them, default: `claude`).
    *   `--path <dir_path>`: Custom base directory to link components into (creates and links within `skills/`, `agents/`, and `commands/` subdirectories automatically).



## 🔄 Keeping Skills in Sync

Many modular skills in the `skills/` directory originate from active open-source communities. You can sync them with upstream sources using the CLI or the underlying script:

```bash
# Sync all configured sources
oah sync

# Sync only a specific source (e.g., anthropics-skills)
oah sync anthropics-skills
```
*Note: Configured upstream sources are stored in `skills_sources.json`. You can also execute this directly via `./scripts/sync_skills.sh`.*

---

## 🛡️ Security & Contributing

*   **Security Policy**: Please refer to [SECURITY.md](SECURITY.md) to report vulnerabilities.
*   **Contributing**: We welcome community contributions for new skills, agents, or commands. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
