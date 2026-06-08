---
name: test-tdd
description: Run when user calls /test-tdd. Scans modified files, locates their corresponding unit/integration test suites, and runs them.
type: command
---
# Slash Command: /test-tdd

## Core Objective
Locate and execute the test suites corresponding to modified files.

## Steps for the Agent
1. **Identify Modified Code**: Run `git status` or `git diff --name-only` to identify source code files that have changed.
2. **Find Matching Tests**: Search for matching test files in the project. For example:
   - `foo.js` ➔ search for `foo.test.js`, `foo.spec.js`, `test_foo.js` in `test/`, `spec/`, or local directories.
3. **Deduce Test Command**: Determine the correct command runner based on `package.json` scripts or file types (e.g., `npm test -- <file>`, `npx jest <file>`, `pytest <file>`, `go test <file>`).
4. **Execute**: Run the test command and display the execution results.
5. **Loop Strategy**:
   - If tests fail, suggest invoking [agent-debugger](../agents/agent-debugger.md) to inspect stack traces.
