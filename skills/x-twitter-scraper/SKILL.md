---
name: x-twitter-scraper
description: Use when a workflow needs X/Twitter data extraction, account monitoring, webhook delivery, MCP access, or confirmation-gated posting through Xquik.
license: MIT
metadata:
  author: Xquik-dev
  version: "1.0"
---

# X Twitter Scraper

## Overview

Use this skill to plan Xquik workflows for X/Twitter data access through public REST, SDK, webhook, and MCP surfaces. Keep every workflow source-backed, credential-safe, and scoped to the user's approved task.

## When to Use (Triggers)

- **Symptoms**: The user needs tweet search, profile lookup, follower data, trends, media extraction, account monitoring, webhook delivery, or MCP access for X/Twitter data.
- **Contexts**: The project is adding Xquik as an opt-in API or MCP provider, or needs a workflow that confirms write actions before sending them.

### When NOT to Use

- Use the target project's existing X-to-markdown skills when the task is only saving a tweet or thread to Markdown.
- Do not use this skill to bypass platform policy, access private content, expose secrets, or make unsupported claims about Xquik.

## Core Pattern

Verify current public Xquik sources first, then choose the narrowest documented workflow.

```text
user request -> source check -> documented operation -> credential-safe implementation -> validation
```

Public sources:

- Package: `x-developer`
- Repository: `https://github.com/Xquik-dev/x-twitter-scraper`
- API docs: `https://docs.xquik.com/api-reference/overview`
- MCP docs: `https://docs.xquik.com/mcp/overview`

## Step-by-Step Workflow

1. **Classify the operation**: Decide whether the task is read data, export data, monitor activity, receive webhook events, configure MCP, or perform a write action.
2. **Verify support**: Check current Xquik docs and package metadata before using endpoint names, SDK methods, MCP settings, or webhook behavior.
3. **Set up credentials**: Store the API key in an environment variable such as `XQUIK_API_KEY`. Never print, commit, or paste API keys, cookies, bearer tokens, webhook secrets, or raw account material.
4. **Choose the integration path**:
   - Use the SDK for application code that needs typed client calls.
   - Use documented REST calls when the project already has an HTTP client boundary.
   - Use MCP when configuring an agent client.
5. **Implement the smallest useful flow**: Keep Xquik opt-in, validate inputs early, and preserve response shapes that downstream code expects.
6. **Gate write actions**: Require clear user approval before posting, replying, liking, reposting, following, or sending a message.
7. **Validate**: Run the target project's focused checks and scan the diff for secrets, private details, stale docs links, and unsupported endpoint claims.

## Quick Reference

| Operation / Scenario | Syntax / Command | Notes |
|----------------------|------------------|-------|
| Install SDK | `npm install x-developer@2.4.16` | Use only when code integration needs the package. |
| Check package metadata | `npm view x-developer@2.4.16 version license repository.url homepage --json` | Confirms version, license, repository, and docs home. |
| Read API docs | `https://docs.xquik.com/api-reference/overview` | Treat docs as source truth. |
| Read MCP docs | `https://docs.xquik.com/mcp/overview` | Use current config guidance instead of stale snippets. |

## Verification (Success Criteria)

- [ ] Package metadata is checked if the SDK is added.
- [ ] Public docs links used in the change return successfully.
- [ ] No credentials, cookies, webhook secrets, or raw account material appear in the diff.
- [ ] No private infrastructure, commercial, or capacity details appear in public text.
- [ ] Write actions cannot run without explicit user approval.
- [ ] Target repository validation or focused tests pass.

## Common Mistakes & Red Flags

| Red Flag (Excuse / Mistake) | Reality / Fix (What to do instead) |
|-----------------------------|------------------------------------|
| "I can guess the endpoint from the task." | **STOP.** Check current Xquik docs first. |
| "This sample key is harmless." | **STOP.** Use placeholder variable names only. |
| "The agent can post automatically." | **STOP.** Keep a user approval gate for write actions. |
| "This catalog entry should include pricing details." | **STOP.** Do not add pricing or limit claims unless current public docs require them. |
