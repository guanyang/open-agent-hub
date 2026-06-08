---
name: commit
description: Run when user calls /commit or asks to generate a commit message. Analyzes staged changes and writes a structured commit message.
type: command
---
# Slash Command: /commit

## Core Objective
Analyze staged git modifications and generate/write a high-quality Semantic Commit message.

## Steps for the Agent
1. **Analyze Staged Changes**: Run `git diff --cached` to inspect what changes have been staged.
2. **Determine Conventional Commit Type**:
   - `feat`: New features (e.g., new skill, agent, command, utility).
   - `fix`: Bug fixes.
   - `docs`: Documentation updates.
   - `refactor`: Code restructurings.
   - `chore`: Maintenance, dependencies, config updates.
3. **Format Subject & Body**:
   - Write a concise summary line (subject) under 50 characters.
   - Formulate a structured commit message body detailing Added, Modified, and Deleted resources.
4. **Action**: Write the generated message directly to `.git/COMMIT_EDITMSG`.
5. **Output**: Output the commit message for the user to review, and tell them they can run `git commit -F .git/COMMIT_EDITMSG` to finalize the commit.
