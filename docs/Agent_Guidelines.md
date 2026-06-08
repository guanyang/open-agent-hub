# 🤖 Expert Agent Definitions & Collaboration Guidelines (Agent Guidelines)

This guide describes the system prompts, tool declarations, handoff contracts, and collaboration workflows for the expert agents stored in [agents/](../agents/).

---

## 📂 Naming & Directory Structure

All agent source files are located in the [agents/](../agents/) folder and use the standardized prefix naming convention:

*   **[agent-architect.md](../agents/agent-architect.md) (Orchestrator)**
    *   **Role**: Principal Software Architect & Technical Lead.
    *   **Core Responsibility**: Deconstruct complex business requirements, generate Architectural Decision Records (ADRs) and Work Breakdown Structures (WBS) for worker agents.
*   **[agent-reviewer.md](../agents/agent-reviewer.md) (Evaluator)**
    *   **Role**: Code Reviewer & Security Auditor.
    *   **Core Responsibility**: Review code modifications, flag issues by severity (🛑`Critical`, ⚠️`Warning`, 💡`Suggestion`), and enforce quality gates.
*   **[agent-refactorer.md](../agents/agent-refactorer.md) (Optimizer)**
    *   **Role**: Clean Code & Refactoring Specialist.
    *   **Core Responsibility**: Reduce cognitive complexity, optimize runtime/memory efficiency, and resolve issues flagged by Evaluator loops.
*   **[agent-debugger.md](../agents/agent-debugger.md) (Optimizer)**
    *   **Role**: Debugging & Diagnostics Expert.
    *   **Core Responsibility**: Diagnose stack traces, create reproduction scripts, and apply surgical bug fixes.
*   **[agent-tester.md](../agents/agent-tester.md) (Evaluator)**
    *   **Role**: Test Automation Engineer.
    *   **Core Responsibility**: Write robust unit, integration, and E2E test suites with high edge-case coverage.

---

## ⚙️ Anthropic Workflow Coordination Mechanism

All agent prompt templates are engineered to support automated collaboration using three core patterns:

### 1. Handoff Contracts
Each agent prompt explicitly defines its **Expected Input** and **Structured Output**. This ensures that multiple agents can be chained in sequence (Prompt Chaining or Orchestrator-Workers) using reliable data contracts.

### 2. Evaluator-Optimizer Loop
*   **Reviewer / Tester (Evaluators)** specify strict **Exit Conditions** (e.g., all Critical/Warning issues must reach 0, or test pass rate must be 100%).
*   **Refactorer / Debugger (Optimizers)** are instructed to consume review reports and incrementally refine the code using diff structures until the exit criteria are met.

### 3. Context Compaction & Budgeting
At the end of each agent's execution, they output structured XML compaction blocks (such as `<review-compaction>`, `<compaction-summary>`). These blocks summarize design agreements, pending tasks, and next steps. The host system uses these summaries to prune historical context logs, preventing token bloat and attention drift.