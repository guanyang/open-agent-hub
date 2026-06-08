# 🧩 Modular Skills Specification & Directory (Skill Guidelines)

This guide describes the design standards, trigger rules, and catalog of the modular **Skills** stored in [skills/](../skills/).

---

## 📂 Naming & Structure

Every skill is defined as a self-contained directory under [skills/](../skills/), structured as follows:
```
skills/skill-name/
├── SKILL.md      # Core prompt template and metadata (Required)
├── scripts/      # Execution scripts, CLI helpers (Optional)
├── examples/     # Code patterns and usage mockups (Optional)
└── resources/    # Supporting templates, schemas, and static data (Optional)
```

---

## ⚙️ Trigger Rules & Frontmatter Format

Each `SKILL.md` file must start with a YAML Frontmatter block. This metadata is parsed by host AI agents (like Claude Code) to decide when to automatically trigger and load the skill:

```yaml
---
name: skill-name-using-hyphens
description: Use when [describe precise triggering conditions, developer symptoms, or errors]. Keep under 500 characters.
---
```

### Prompt Structure of `SKILL.md`
To maintain consistency, a skill prompt should follow this standard Markdown structure:
1.  **Overview**: A 1-2 sentence description of the core principle and insight.
2.  **When to Use (Triggers)**: Specific symptoms (errors, behaviors) and contexts where this skill applies.
3.  **When NOT to Use**: Clear boundaries showing when to skip this skill and defer to others.
4.  **Core Pattern**: Before (Anti-pattern) and After (Best Practice) code blocks illustrating the correct implementation.
5.  **Step-by-Step Workflow**: Actionable, numbered instructions guiding the agent to complete the task.

---

## 🚀 Integrated Skills Catalog (Total: 83)

### 🎨 Creative & Design
These skills focus on visual expression, UI/UX design, and artistic creation.
*   **`@[algorithmic-art]`**: Create algorithmic and generative art using p5.js code.
*   **`@[canvas-design]`**: Create posters and artworks (PNG/PDF output) based on design philosophies.
*   **`@[json-canvas]`**: Create and edit JSON Canvas files (`.canvas`) with nodes, edges, and groups.
*   **`@[frontend-design]`**: Create high-quality, production-grade frontend interfaces and Web components.
*   **`@[ui-ux-pro-max]`**: Professional UI/UX design intelligence, providing design schemes for colors, layouts, and typography.
*   **`@[web-artifacts-builder]`**: Build complex, modern Web apps (based on React, Tailwind, shadcn/ui).
*   **`@[theme-factory]`**: Generate matching themes for documents, slides, HTML, etc.
*   **`@[brand-guidelines]`**: Apply Anthropic's official brand design specifications (colors, typography, etc.).
*   **`@[remotion]`**: Best practices for Remotion - Video creation in React.
*   **`@[web-design-guidelines]`**: Review UI code for Web Interface Guidelines compliance.
*   **`@[slack-gif-creator]`**: Create high-quality animated GIFs optimized specifically for Slack.
*   **`@[baoyu-infographic]`**: Generate professional infographics with various layouts and styles.
*   **`@[baoyu-diagram]`**: Generate structured diagrams from content.
*   **`@[baoyu-imagine]`**: AI image generation wrapper for Midjourney or similar APIs.
*   **`@[baoyu-image-gen]`**: [Deprecated] AI image generation with multiple APIs.

### 📢 Content & Publishing
These skills focus on content generation, formatting, and publishing to social media.
*   **`@[baoyu-xhs-images]`**: Xiaohongshu image card series generator with styles and layouts.
*   **`@[baoyu-post-to-wechat]`**: Publish content to WeChat Official Account.
*   **`@[baoyu-post-to-weibo]`**: Publish content to Weibo.
*   **`@[baoyu-post-to-x]`**: Publish content to X (Twitter).
*   **`@[baoyu-cover-image]`**: Generate professional cover images.
*   **`@[baoyu-slide-deck]`**: Generate presentation slide decks.
*   **`@[baoyu-comic]`**: Generate comic strips from content.
*   **`@[baoyu-article-illustrator]`**: Generate illustrations for articles.
*   **`@[baoyu-image-cards]`**: Generates infographic image card series with multiple styles and layouts (social media optimized).

### 🛠️ Development & Engineering
These skills cover the full lifecycle of coding, testing, debugging, and code review.
*   **`@[composition-patterns]`**: React composition patterns for building scalable, flexible component libraries.
*   **`@[react-best-practices]`**: Vercel's official React and Next.js performance optimization guidelines.
*   **`@[react-native-skills]`**: React Native and Expo best practices for performant mobile apps.
*   **`@[supabase-postgres-best-practices]`**: Postgres performance optimization and best practices from Supabase.
*   **`@[test-driven-development]`**: Test-Driven Development (TDD) - write tests before implementation code.
*   **`@[systematic-debugging]`**: Systematic debugging for resolving bugs, test failures, or abnormal behaviors.
*   **`@[webapp-testing]`**: Use Playwright for interactive testing and verification of local web applications.
*   **`@[receiving-code-review]`**: Handle code review feedback using technical verification rather than blind modification.
*   **`@[requesting-code-review]`**: Proactively initiate code reviews to verify code quality before merging.
*   **`@[finishing-a-development-branch]`**: Guide the finalization of a development branch (merges, PRs, cleanups).
*   **`@[subagent-driven-development]`**: Coordinate multiple sub-agents to perform independent development tasks in parallel.
*   **`@[claude-api]`**: Build apps with the Claude API or Anthropic SDK.
*   **`@[baoyu-electron-extract]`**: Extracts resources and source code from installed Electron apps.

### 📄 Documentation & Office
These skills are used for handling professional documents and office needs in various formats.
*   **`@[doc-coauthoring]`**: Guide users through collaborative writing of structured documents (proposals, tech specs).
*   **`@[obsidian-markdown]`**: Create and edit Obsidian Flavored Markdown with wikilinks, embeds, callouts, and properties.
*   **`@[obsidian-bases]`**: Create and edit Obsidian Bases (`.base`) files with views, filters, formulas, and summaries.
*   **`@[obsidian-cli]`**: Interact with Obsidian vaults using the Obsidian CLI from the command line.
*   **`@[defuddle]`**: Extract clean markdown content from web pages using Defuddle CLI, removing clutter and navigation.
*   **`@[docx]`**: Create, edit, and analyze Word documents.
*   **`@[xlsx]`**: Create, edit, and analyze Excel spreadsheets (supporting formulas and charts).
*   **`@[pptx]`**: Create and modify PowerPoint presentations.
*   **`@[pdf]`**: Process PDF documents (extracting text, merging/splitting, filling forms).
*   **`@[internal-comms]`**: Draft corporate internal communication documents (weekly reports, announcements, FAQs).
*   **`@[notebooklm]`**: Query Google NotebookLM notebooks for definitive, document-grounded answers.
*   **`@[baoyu-youtube-transcript]`**: Fetch and process YouTube video transcripts.
*   **`@[baoyu-url-to-markdown]`**: Convert web page content to clean Markdown.
*   **`@[baoyu-format-markdown]`**: Format and clean up Markdown files.
*   **`@[baoyu-markdown-to-html]`**: Convert Markdown to styled HTML.
*   **`@[baoyu-translate]`**: High-quality translation for articles and content.
*   **`@[baoyu-compress-image]`**: Compress and optimize images.
*   **`@[baoyu-danger-gemini-web]`**: Web automation or scraping using Gemini (experimental).
*   **`@[baoyu-danger-x-to-markdown]`**: Convert X (Twitter) threads to Markdown.
*   **`@[baoyu-wechat-summary]`**: Summarize WeChat group chat highlights and topics into structured digests.

### 📅 Planning & Workflow
These skills help optimize workflows, task planning, and execution efficiency.
*   **`@[brainstorming]`**: Brainstorm before starting any work to clarify requirements and design.
*   **`@[writing-plans]`**: Write detailed execution plans (Specs) for complex multi-step tasks.
*   **`@[planning-with-files]`**: A file-based planning system (Manus-style) suitable for complex tasks.
*   **`@[executing-plans]`**: Execute existing implementation plans with checkpoints and review mechanisms.
*   **`@[using-git-worktrees]`**: Create isolated Git worktrees for parallel development or task switching.
*   **`@[verification-before-completion]`**: Run verification commands to ensure concrete evidence before completing tasks.
*   **`@[using-superpowers]`**: Guide users to discover and use these advanced skills.

### 🧠 Core Cognition & Context
These skills build the agent's mental models, memory systems, and context management capabilities.
*   **`@[bdi-mental-states]`**: Simulate Agent's Belief-Desire-Intention (BDI) models.
*   **`@[memory-systems]`**: Build long-term memory and entity tracking systems.
*   **`@[context-fundamentals]`**: Understand and debug fundamental issues like context windows and attention.
*   **`@[context-optimization]`**: Optimize context efficiency to reduce Token costs.
*   **`@[context-compression]`**: Implement context compression and summarization to handle long window limits.
*   **`@[context-degradation]`**: Diagnose and fix context degradation issues like "lost in the middle".
*   **`@[filesystem-context]`**: Utilize the filesystem for dynamic context offloading and management.
*   **`@[latent-briefing]`**: Share memory across agents at the representation level using KV cache compaction and Attention Matching.

### 📐 System Design & Evaluation
These skills focus on architectural design, tool building, and quality assessment of AI systems.
*   **`@[project-development]`**: Full lifecycle design of LLM projects, including task-model matching and pipeline architecture.
*   **`@[tool-design]`**: Design efficient and clear agent tool interfaces and MCP protocols.
*   **`@[evaluation]`**: Establish multi-dimensional agent performance evaluation systems and quality gates.
*   **`@[advanced-evaluation]`**: Implement advanced evaluation methods like LLM-as-a-Judge and pairwise comparison.
*   **`@[harness-engineering]`**: Design control systems and boundaries for autonomous agent loops.

### 🧩 System Extension
These skills allow agents to extend their own capability boundaries.
*   **`@[mcp-builder]`**: Build MCP (Model Context Protocol) servers to connect external tools and data.
*   **`@[skill-creator]`**: Create new skills or update existing ones.
*   **`@[writing-skills]`**: A subset of tools to assist in writing, editing, and verifying skill files.
*   **`@[dispatching-parallel-agents]`**: Dispatch parallel tasks to multiple agents for processing.
*   **`@[multi-agent-patterns]`**: Design advanced multi-agent collaboration patterns like Supervisor or Swarm.
*   **`@[hosted-agents]`**: Build and deploy sandboxed, persistently running background agents.

---

## 🌟 Credits & Sources

This project integrates core ideas or skill implementations from the following excellent open-source projects. Respect to the original authors:

- **[Anthropic Skills](https://github.com/anthropics/skills)**: Official API usage paradigms and skill definition references provided by Anthropic.
- **[UI/UX Pro Max Skills](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)**: Top-tier UI/UX design intelligence, providing full design schemes for colors, layouts, etc.
- **[Superpowers](https://github.com/obra/superpowers)**: A toolkit and workflow inspiration aimed at giving LLMs "superpowers."
- **[Planning with Files](https://github.com/OthmanAdi/planning-with-files)**: Implements a Manus-style file-based task planning system to enhance persistent memory for complex tasks.
- **[NotebookLM](https://github.com/PleasePrompto/notebooklm-skill)**: Knowledge retrieval and Q&A skill implementation based on Google NotebookLM.
- **[Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)**: In-depth Context Engineering skills covering compression, optimization, and degradation handling.
- **[Obsidian Skills](https://github.com/kepano/obsidian-skills)**: Professional Obsidian integration skills, including JSON Canvas and enhanced Markdown support.
- **[Remotion Skills](https://github.com/remotion-dev/skills)**: Official Remotion skills for AI agents to create videos programmatically.
- **[Vercel Agent Skills](https://github.com/vercel-labs/agent-skills)**: Official Vercel skills for React best practices, composition patterns, and web design guidelines.
- **[Supabase Agent Skills](https://github.com/supabase/agent-skills)**: Official Supabase skills for Postgres performance optimization and best practices.
- **[Baoyu Skills](https://github.com/JimLiu/baoyu-skills)**: A collection of skills for content generation, publishing, and daily efficiency, including XHS image generator, infographic generator, and content converters.

