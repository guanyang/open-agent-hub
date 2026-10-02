# Harness Protocol Reference

Implementation detail for the self-managed-context skill. Source: the released Context Language Models code at `github.com/facebookresearch/context-language-models`, commit `18dc111` (retrieved 2026-10-01), licensed CC BY-NC 4.0, plus the paper's Appendix E where a protocol is described but not shipped. Prompt wording below is paraphrased with attribution. Defaults are pinned to that commit and are volatile (claim-self-managed-context-harness-defaults).

## Mirror File

- One file per agent context (the reference uses a path under `/tmp/.live_ctx/`). It is refreshed from the live messages before every command.
- The pinned prefix (system prompt and initial task, `protect=2`) is never written to the file.
- Each editable turn is rendered as a header line followed by its text:

```text
[[CTX_TURN 1 role=assistant]]
THOUGHT: check the parser first ...
grep -n "split(',')" src/parser.py

[[CTX_TURN 2 role=tool]]
142:    fields = line.split(',')
```

- Turn numbers start at 1 from the top of the editable region and are display-only; parse-back ignores them. Tool calls render as `name {json-args}` text.
- Whitespace-only differences between the rendered and read-back file are treated as no change.

## Parse-Back Rules

`parse_back(edited, protected)` maps any edited string to a legal message list:

1. Re-pin the protected prefix from the original messages, never from the file.
2. Surviving headers define the remaining turns. Text before the first header, or a file with no headers, becomes a user turn.
3. `assistant` stays `assistant`; every other role (including `system`, `tool`, and invented roles such as `notes`) becomes `user`. Tool-call structure is not reconstructed.
4. Drop turns whose body is empty (emptying a turn deletes it) and merge consecutive same-role turns.

Consequence: tool results become plain user turns after any applied edit. That is acceptable for chat-completion APIs but loses tool-call pairing; any harness feature that depends on tool-call identifiers must run before the first edit or tolerate their absence.

## Edit Gate

- Growth is measured against the round-tripped original (`parse_back(rendered)`), not the raw messages, so parse normalization never counts as an edit.
- `fit` (default, selectable by environment variable or agent kwarg): growth is allowed if the result fits the budget. With no budget configured, growth is refused.
- `shrink`: any growth is rejected.
- A rejected edit leaves the context unchanged and does not count as a change.

## Receipts

Appended to the tool result whenever the mirror changed or the command text referenced the main context file or its directory; a turn that does neither gets no receipt:

| Situation | Receipt content |
| --- | --- |
| Edit applied, did not grow, within the limit | Applied, tokens before and after, turn count |
| Edit applied but still over the limit | Applied, still over, compact more now or the session ends |
| Edit applied and grew (fits) | Applied, grew; warns that the model likely duplicated instead of replacing |
| Edit rejected by gate | Rejected, the rule in force, sizes |
| Command referenced the file but exited non-zero | No change, the exit code |
| Command referenced the file but matched nothing | No change, a reminder of the real header format |

When a budget is configured, a context readout follows on every result: `[context: ~N/LIMIT tokens]`, where LIMIT is the strict target (budget minus reserve), with an `OVER` marker once the calibrated count passes it.

## Free Edit Turns

A turn is free (does not consume task-step budget) only when the edit was applied, the command printed nothing to stdout or stderr, and it exited 0. Any output, non-zero exit, or no-match edit costs a normal turn.

## System Prompt Content (paraphrased)

The reference system prompt tells the model:

- The goal is task success; there is no penalty for extra turns. The budget is stated, and every result shows current size.
- The conversation is mirrored to the file and refreshed before each command. Free context by replacing stale regions (large outputs, dead ends, superseded notes) with concise, specific summaries.
- Locate text with code; never paste or retype context. One worked example collapses a turn by regex on its header and substitutes a one-line note.
- Do not print the file (its text is already in context). Keep the header of any turn being kept. The prefix is protected.
- Edit cost grows with the text after the edit: batch; do not compact a small early region under a long useful tail unless the limit is near; write generous replacements because the tail is re-read anyway.

Tool outputs longer than the observation cap are head- and tail-truncated (5,000 characters each in the reference config) with a hint to produce less output.

## Budget Controller Defaults

| Setting | Default | Purpose |
| --- | --- | --- |
| Reserve | 2,048 tokens | Strict target is budget minus reserve |
| Protected prefix | 2 messages | Rollback and parse never touch system and task |
| Tokenizer | Local o200k count times a calibration ratio | Deterministic; corrected toward the served tokenizer |
| Calibration clamp | Ratio accepted only within [0.5, 3.0] | A wild ratio means a truncated or cached prompt or a gateway miscount |
| Nudge tiers | 25%, 50%, 75% of the budget; each fires once and re-arms after compacting below it | See below |
| Adaptive urgent band | On by default: max(10% of limit, 2x largest of the last 3 tool outputs), capped at 50% of limit; fires every turn inside the band | Fires before one large output can jump past the limit |
| Retry on limit | Up to 50 rollbacks per run at the agent level (the standalone controller defaults to 0, meaning final turn then stop) | Overflow becomes a recoverable event instead of the end of the run |
| Rollback margin | 2,048 tokens | Free just enough room for one compaction |
| Rollback escalation | The first four consecutive rollbacks without an applied edit free exactly the margin; from the fifth, depth grows by one margin per rollback, capped at max(three quarters of the target, margin) | Breaks livelock without discarding more than necessary |
| Newest-output cap | Head and tail truncate only the newest tool output to fit | Cache-friendly; older turns untouched |

Paper runs override the retry count: BrowseComp-Plus allowed up to six rollbacks and EdgeBench-10 up to 50; TerminalBench 2.1, skill evolution, and steering ended the run on overflow.

Nudge message classes:

- At or below 25% fill: informational only. States the size, says no action is needed, and asks the model to keep a record of queries already tried. The compaction how-to is deliberately omitted because it triggers premature wholesale deletion.
- At or below 50%: finish the unit of work in flight, then tidy once, following the note contract.
- Above 50%: close to the limit; compact settled spans but do not wipe, because edits keeping under a quarter of the region they touch are usually followed by redoing the deleted work. Note contract plus the overflow consequence.
- Urgent band: compact this turn and do nothing else; crossing the limit yields one final turn.

Note contract, appended to mid and high tiers: when writing a replacement note, copy facts forward from the text being replaced, including every ruled-out candidate with its reason and a "do not retry" marker, the exact queries or commands already tried, exact values marked verified or unverified, and a next-step line.

Rollback notice on overflow: states that the newest turns were rolled back and are unrecoverable, the cumulative turns lost, the remaining room, an instruction to condense this turn only, and the list of commands whose output blew the budget with advice to re-run them with less output. Only an applied context edit resets escalation; dipping under the limit does not, because that happens every cycle of a livelock.

Final-turn notice: when the budget is exhausted and retries are spent, the model gets one turn to put its answer in place before grading.

## Skill Evolution Loop

Released code (`clm_icl`):

- Each round runs the incumbent skill on the training tasks and builds a contrastive note from up to five pairs of runs (configurable): same task with different rewards first, then worst versus best across tasks, then two successful runs of the same task where one was cheaper.
- A proposer model reads the note and writes N full candidate skill documents. Malformed candidates are dropped, never repaired.
- Every valid candidate is evaluated on the development tasks. Gate with d = candidate accuracy minus incumbent accuracy and SE the paired standard error of per-task differences (unpaired combination when task sets differ): pass if d > SE; fail if d < -SE; inside one SE, pass only if cost is in the same metric and lower. Selection takes the most accurate passing candidate, breaking ties within one SE by cost.
- If no development split is supplied, selection falls back to the training tasks and the loop logs a warning; treat such results as in-sample.

Paper protocol (Appendix E, not encoded in the released loop):

- Four proposers in parallel, each reading at least ten rollouts and writing at least four rewrites with a predicted effect on accuracy and cost. A lineage stops after five consecutive proposals without development improvement.
- Staged evaluation: six training instances; if accuracy is at least the frontier's, twelve more; then a development split (102 instances per task, one seed) that alone decides frontier membership and selection. A held-out test split (102 instances, three seeds) is evaluated once after the archive freezes.

## RL Advantage

Stepwise GRPO: trajectories are split at context edits, each segment is trained under the exact input it was generated from, and the outcome advantage is assigned to every segment rather than differentiated through edits.

```text
A[i, t] = r_i + w_eff * a_eff_i * m_i[t]
a_eff_i = clip((mean_cost_successes - cost_i) / mean_cost_successes, -1, 1)   for successful i
a_eff_i = 0                                                                     for failures, or groups with < 2 successes
m_i[t]  = 1 on context-edit tokens, 0 elsewhere
w_eff   = 0.25
cost    = prefix-reuse FLOPs of the trajectory
```

Reference training run: Qwen3.5-9B, 3,040 OpenResearcher prompts, 8 prompts by 32 rollouts per step, 70 steps, 28K budget with a 2,048-token reserve, up to 80 turns with editing turns excluded, binary reward from GPT-5.4-nano with the DeepSearchQA rubric. The CLM run also adds penalties for failed tool calls and malformed outputs; the summary harness in the paper's headline comparison (Table 2) is trained on task reward alone (claim-self-managed-context-rl).

## Suffix Cache Reuse Configuration

SCR is a start-up monkeypatch for SGLang 0.5.16; no SGLang source file is modified.

- Full-attention layers: diff the new prompt against the session's previous prompt, relocate up to K surviving spans (largest first), re-rotate key positions, splice after the edited text, and prefill only new tokens. Relocated entries live in session-private slots, so the shared radix tree never holds a moved entry. If slots cannot be allocated, the server falls back to standard re-prefill.
- Linear-attention layers (hybrid models): restore the recurrent state saved at the end of the previous prompt when splicing the first relocated span; the edit is reflected through the full-attention layers.
- Defaults: K = 6 relocated blocks per request, linear-attention mode `fork`, 16 trailing tokens of each block re-prefilled, 12 side sessions of 30,000 tokens each.
- Memory: the side buffer is a separate GPU allocation. At defaults for Qwen3.6-27B it is about 22 GiB; lower the static memory fraction to leave room, and size side sessions to at least the number of concurrent conversations.
- Remaining waste on hybrid models: recurrent states are stored only at cached request boundaries, so a prompt diverging inside a cached span can fall back to a much shorter prefix match. This affects standard prefix caching as well.

## Prefix-Reuse FLOPs

Per turn, cost is the forward compute for the prompt tokens beyond the reusable prefix plus decode for generated tokens; summed over the trajectory it captures decode, prefill, and re-prefill under standard serving. It is a theoretical metric from a model FLOPs formula, not measured GPU time; SCR savings are reported separately as empirical reused-token accounting (claim-self-managed-context-edit-cost, claim-self-managed-context-scr-savings).
