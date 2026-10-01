---
name: you-research
description: Route research tasks between a cost-conscious agentic search workflow, You.com Research API scripts, and managed or payment-aware MCP fallback.
compatibility: Requires network access and either You.com MCP tools with `YDC_API_KEY`, OAuth, or payment support, or the You.com Research API with `YDC_API_KEY` or an MPP/x402-capable client.
license: MIT
metadata:
  mcp_servers: '{"you-docs":{"url":"https://you.com/docs/_mcp/server","auth":"none","tools":["searchDocs"]},"you-research-base":{"url":"https://api.you.com/mcp?tools=you-search,you-contents","auth":"YDC_API_KEY OAuth x402","tools":["you-search","you-contents"],"avoidTools":["you-research"]}}'
  author: youdotcom-oss
  version: 0.3.0
  category: research
  keywords: you.com,mcp,web-search,content-extraction,deep-research,citations
---

# You.com Research Routing

Use this skill to choose the right You.com research path for the user's goal: agent-led search, Research API scripts, or managed MCP fallback.

## Prerequisites

For API scripts:

- Use `YDC_API_KEY` when available, or an MPP/x402-capable HTTP client for keyless paid Research API calls.
- With `YDC_API_KEY`, use these API request headers: `X-API-Key: ${YDC_API_KEY}` and `User-Agent: SKILL/(@youdotcom-oss/agent-skills you-research)`.
- With MPP/x402, expect Research API pricing by `research_effort` and at least a 1 cent charge; confirm the user expects a paid managed research request before sending it.

For the agent-led workflow, use the `you-research-base` MCP profile with `you-search` and `you-contents` when available. Those tools and their REST endpoints should use x402 for keyless paid retries, not MPP. See the [agent-led deep-search workflow](references/agent-led-deep-search.md) for setup and workflow details.

MPP/x402-aware MCP or HTTP clients may receive HTTP `402` payment challenges from You.com tools and endpoints, then retry with payment headers. Use MPP/x402 for managed Research API calls where appropriate. Let the host client handle external payment and retry; do not add wallet signing logic to this skill.

## Research API scripts

When the user wants You.com managed research APIs, write a small script or direct HTTP request instead of calling `you-research` through MCP, especially for `deep`, `exhaustive`, or `frontier` work.

Before coding or updating a script, query the You.com Docs MCP server, usually through `searchDocs`, for current API details. Use targeted queries such as:

- `Research API v1 research background source_control output_schema research_effort`
- `Research task status v1 research task`
- `Research task stream SSE v1 research task stream`

If Docs MCP is unavailable, use the canonical pages:

- https://you.com/docs/api-reference/research/v1-research
- https://you.com/docs/api-reference/research/v1-research-task
- https://you.com/docs/api-reference/research/v1-research-task-stream

Keep the script aligned with the docs returned at runtime and include the auth or payment headers listed above. If the user wants keyless MPP/x402 direct HTTP usage for Research API, verify current payment guidance in Docs MCP first, then handle `402 payment-required` as a challenge and retry only through a payment-capable client or library. For the direct x402 REST client pattern, follow [x402 direct client](references/x402-direct-client.md); for the MCP-composition alternative (You.com MCP + Coinbase Payments MCP, no manual signing), see [Coinbase Payments MCP path](references/coinbase-payments-mcp.md). Do not apply MPP guidance to plain search or contents REST calls; those should use x402 only.

## Decision Tree

- User is cost-conscious or wants to develop/fine-tune a research skill -> follow the [agent-led deep-search workflow](references/agent-led-deep-search.md).
- User asks for You.com managed API output, structured output, source controls, background tasks, or `deep`/`exhaustive`/`frontier` research -> write a script against the Research API.
- User needs OAuth or MPP/x402 payment handling and direct API scripts are not practical -> use MCP only if the MCP client supports the expected response time and payment flow.
- Required API access or `you-research-base` MCP tools are unavailable -> tell the user what is missing, provide the relevant API or MCP setup options from the prerequisites above, and request approval before installing, connecting, or changing configuration.
- Simple lookup -> use `you-research-base` `you-search` once, answer directly.
- URL provided -> use `you-research-base` `you-contents` on those URLs.
- Everything else -> use the base agent-led workflow.

## Agent-led workflow reference

When choosing the cost-conscious skill-building path, open and follow the [agent-led deep-search workflow](references/agent-led-deep-search.md). Adapt its tool budget, source policy, and output format to the user's agent environment. Preserve its core requirements: read sources before relying on exact claims, cross-check key facts, cite real URLs, and finish with the best supported answer even when evidence is incomplete.
