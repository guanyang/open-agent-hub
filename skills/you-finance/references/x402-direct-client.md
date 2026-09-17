# Direct x402 REST client for Finance Research

On-demand reference for the direct-client path: a local script pays USDC on Base for a You.com Finance Research report with no API key and no account. This is guidance plus a compact skeleton, not a copy of a runnable file. Adapt it to the host; do not ship it verbatim as an executable script from this skill.

Before coding, verify the live request shape, auth, payment behavior, and `research_effort` values through the You.com Docs MCP `searchDocs` tool. If Docs MCP is unavailable, use the canonical page: https://you.com/docs/api-reference/finance-research/v1-finance_research

## The 5-step flow

1. **`402 Payment Required`** — `POST https://api.you.com/v1/finance_research` with no payment returns `402`. The priced requirements travel in a `payment-required` response header (x402 v2), not the JSON body.
2. **Sign EIP-3009 authorization** — the client signs an off-chain authorization; the payer sends no on-chain transaction and pays no gas. A facilitator settles the payment on Base.
3. **Settled on Base** — retry the original request with the payment attached. The settlement receipt comes back in a `payment-response` header (`success`, `transaction`). The response body now carries a `jobId` and a `poll_url`.
4. **SIWX (CAIP-122) auth on the result URL** — `poll_url` is gated by Sign-In-With-X. Prove the same wallet paid with a base64-encoded `SIGN-IN-WITH-X` header.
5. **Result poll** — the report is async (roughly 1-3 minutes). Poll `poll_url` until the status is terminal.

## Dependencies and the version trap

Use `@x402/fetch@2.x` with `@x402/evm`, `@x402/extensions`, and `viem`. Do **not** use `x402-fetch@1.x`: it crashes on x402 v2 with `Cannot read properties of undefined (reading 'map')` because it expects requirements in the JSON body. `api.you.com` speaks x402 v2.

## Rules and gotchas

Treat these as hard requirements, not suggestions:

- **Requirements live in a header, not the body.** x402 v2 returns payment requirements in the `payment-required` response header. Reading them from the JSON body is the v1 bug that breaks `x402-fetch@1.x`.
- **The SIWX challenge comes back in a `401` JSON body**, not a `402` header, so the stock `wrapFetchWithSIWx` helper does not fire. Read `body['sign-in-with-x']` yourself.
- **Not every `401` is a SIWX challenge.** Rate limits and proxy errors also return `401`. Check for `supportedChains` before treating a `401` as a challenge; fail fast otherwise.
- **The client generates the `nonce` and `issuedAt`.** The server sends neither, and `createSIWxPayload` only copies fields through. Omit them and the payload fails schema validation. The nonce must be alphanumeric.
- **The payer must be a plain EOA.** Smart-contract wallets that sign via ERC-1271/ERC-6492 (Coinbase Base Account, most modern smart wallets) pay successfully but then fail at the result-fetch step, which currently advertises `type: "eip191"` / `signatureScheme: null` (plain `personal_sign` only). Use a plain private-key account until smart-wallet verification ships.
- **`poll_url` is server-supplied and must stay on-origin.** Resolve it against `https://api.you.com`. Reject any absolute off-origin URL (it would send proof-of-wallet to another host) and fail fast if `poll_url` is missing.
- **On a terminal non-success status, report `status` + `body`.** Do not dereference `body.output` — it is absent when the job ends unsuccessfully, and the user already paid, so say why instead of crashing on an undefined field.
- **Parse untrusted `401` bodies defensively.** Server-controlled JSON drives control flow; guard every field access and fall back to a clear error rather than throwing on shape.

## Spend discipline

- Enforce a hard `MAX_USDC` cap and check it **before** a signature exists. If the offered price exceeds the cap, stop without signing.
- `DRY=1` is a rehearsal mode: sign the payment and stop before submitting it, so the user can verify the signed header without spending.

## Skeleton

The shape to implement, not the full file:

```text
request POST /v1/finance_research (no payment)
  -> 402  (requirements in payment-required header)
selectWithCap(version, requirements)
  -> pick exact / eip155:8453, fail if none
  -> usdc = amount / 1e6; throw if usdc > MAX_USDC
  -> return chosen requirement
sign EIP-3009 authorization (no gas; facilitator settles)
  -> if DRY=1: log signed header, exit 0
retry request with payment attached
  -> 202, payment-response header: success, transaction
  -> body: { jobId, poll_url }
poll_url = new URL(body.poll_url, ORIGIN)
  -> reject if poll_url.origin !== ORIGIN
  -> fail fast if body.poll_url missing
loop (timeout ~5m, sleep 5s):
  siwxFetch(poll_url):
    first = fetch(poll_url)
    if first.status !== 401: return { res, body }
    challenge = first.json()['sign-in-with-x']
    if !challenge?.supportedChains: throw "401 carried no SIWX challenge"
    chain = find supportedChains chainId === eip155:8453, type === eip191
    info = { ...challenge.info, chainId, type, nonce (alphanumeric), issuedAt (ISO) }
    res = fetch(poll_url, headers: SIGN-IN-WITH-X = encodeSIWxHeader(createSIWxPayload(info, account)))
    return { res, body }
  if res.status in (401, 403): report auth failure, exit 1
  if res.ok and status terminal:
    if !body.output: report status + body, exit 1   # paid but failed
    deliver body.output.content
```

## Related

- [Coinbase Payments MCP path](coinbase-payments-mcp.md) — the MCP-composition alternative when the host can run both MCP servers and you want no key management or manual signing.
- Finance Research API reference: https://you.com/docs/api-reference/finance-research/v1-finance_research
