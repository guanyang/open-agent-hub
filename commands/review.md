---
name: review
description: Run when user calls /review. Analyzes local changes and runs a comprehensive code review using the agent-reviewer prompt.
type: command
---
# Slash Command: /review

## Core Objective
Inspect modified files in the workspace and execute a thorough code review.

## Steps for the Agent
1. **Gather Modified Files**: Run `git diff` (unstaged) and `git diff --cached` (staged) to identify modified files.
2. **Load Review Guide**: Read the [agent-reviewer](../agents/agent-reviewer.md) prompt template.
3. **Analyze Code Diffs**: Evaluate all modifications against:
   - Correctness & Safety.
   - Security (OWASP Top 10, credential exposures).
   - Performance (N+1 queries, resource leaks).
   - Maintainability.
4. **Output Report**: Present a structured report:
   - 🛑 **[Critical]**: Blocker issues.
   - ⚠️ **[Warning]**: Highly recommended improvements.
   - 💡 **[Suggestion]**: Readability enhancements.
   - Print the `<review-compaction>` loop state.
