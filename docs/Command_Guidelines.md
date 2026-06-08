# 🛠 Slash Command Definitions & Workflow Guidelines (Command Guidelines)

This guide describes the design philosophy, running mechanisms, and workflows for the Slash Commands stored in [commands/](../commands/). These commands are designed to be interpreted and executed by AI agents during runtime.

---

## 📂 Commands Specification

We provide 3 high-frequency automated slash commands mapping to different Anthropic workflow patterns:

### 1. `commit.md` (`/commit` - Commit Helper)
*   **Command Scope**: Automated Git Commit workflows.
*   **Workflow Pattern**: **Prompt Chaining**.
*   **Core Function**:
    *   Instructs the agent to inspect staged modifications using `git diff --cached`.
    *   Deduces the **Conventional Commit** type (e.g., `feat`, `fix`, `docs`, `refactor`, `chore`) and scope based on modified files.
    *   Generates a formatted commit message (detailing Added, Modified, and Deleted resources) and writes it directly to `.git/COMMIT_EDITMSG`.

### 2. `review.md` (`/review` - Code Review Helper)
*   **Command Scope**: Local workspace code auditing.
*   **Workflow Pattern**: **Evaluator-Optimizer**.
*   **Core Function**:
    *   Instructs the agent to capture all uncommitted modifications.
    *   Directs the agent to perform a complete code review covering Correctness, Security (OWASP Top 10), Performance, and Maintainability using the `agent-reviewer` specifications.

### 3. `test-tdd.md` (`/test-tdd` - TDD Test Runner)
*   **Command Scope**: Smart test matching and TDD validation.
*   **Workflow Pattern**: **Test-Driven Development (TDD)**.
*   **Core Function**:
    *   Instructs the agent to detect modified source files (`.js`, `.ts`, `.py`, `.go`, etc.).
    *   Scans directories to find matching test suites (e.g., `foo.js` ➔ `foo.test.js` or `foo.spec.js`).
    *   Deduces the correct test runner command (e.g., `npm test --`, `jest`, `pytest`, `go test`) and executes the tests.
