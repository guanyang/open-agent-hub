# Evidence Reference

Dated numbers behind the self-managed-context skill. Primary source: Shao et al., "Context Language Models", arXiv 2609.37725 (2026-09-29), and the released code at commit `18dc111`. All figures are configuration-bound; read the setup column before reusing any number. Retrieved 2026-10-01.

## Setup Common to Most Comparisons

- Shared Mini-SWE-Agent backbone for every method; no method was trained for the zero-shot comparisons.
- Cost metric: prefix-reuse FLOPs, a theoretical count of decode, prefill, and re-prefill under standard prefix caching. Not wall-clock and not provider billing.
- Baselines: base harness (no context management), Codex-style summarization (compacts at 75% of budget), Self-Compact (asks every two turns past 37% of budget), ACM (model decides when, released code), RLM (released harness), MEM1 (authors' re-implementation of its inference loop). Context folding appears in the diagnostic pilot.
- CLM receives its editing reminder 2,048 tokens before the budget. Budgets are counted with the o200k tokenizer.

## Zero-Shot Short-Horizon Results

claim-self-managed-context-zero-shot-results

| Benchmark | Setup | CLM | Strongest baseline | Compute |
| --- | --- | --- | --- | --- |
| BrowseComp-Plus (830 questions) | Qwen3.6-27B, 32K limit (Appendix E: 23,560-token budget, 100 turns, up to six rollbacks, Qwen3.5-27B judge) | 59.4% | Codex-style summary; CLM +11.4% relative | 21.5% fewer FLOPs than summary, 28.9% fewer than MEM1 |
| TerminalBench 2.1 (89 tasks) | Qwen3.6-27B, 32K, 64 turns | Matches summary | Codex-style summary | About 70% of summary's FLOPs |
| TBLite | Qwen3.6-27B, 32K, 2,048 generated tokens per call | 73.7% | 67.0% (summary) | 91% of summary's FLOPs |

## Long-Horizon Results

claim-self-managed-context-long-horizon-results

| Task | Setup | Result |
| --- | --- | --- |
| EdgeBench-10 (12 hours) | Qwen3.6-27B, 32K, best of three seeds per task, up to 50 rollbacks, no turn limit | CLM 44.6 at 179 PFLOPs per trial; summary 42.3 at 437; CLM with subagents 44.2 at 181 |
| EdgeBench-10 (12 hours) | Claude 4.6 Sonnet, 32K | CLM 51.0, CLM with subagents 50.4, summary 42.3 |
| EdgeBench-10 (12 hours) | Qwen3.6-27B, 128K | CLM with subagents 50.2 (219 PF), CLM 47.3 (142 PF), summary 47.8 (222 PF); base harness stops improving within two hours |
| Software World (24+ hours) | Six agents in the Pi agent harness (not Mini-SWE-Agent), GPT-5.6-Sol, 272K budget, 17 benchmarks from four unseen downstream packages | 65% greater geometric-mean downstream speedup than a summary-based swarm at the same cumulative API spend |
| Math optimization | Claude 4.6 Sonnet, 32K, 100 attempts or five hours, one run per method | Up to 16.8% over OpenEvolve on Heilbronn, 3.0% on circle packing |

Reading notes: subagents added little at 32K (within 0.4 points of single-agent CLM) but led at 128K. EdgeBench reports best of three seeds, which favors high-variance methods. Math results are single runs.

## Diagnostic Pilot

claim-self-managed-context-contextbench-pilot

ContextBench has four synthetic tasks that need no reasoning beyond following the instruction: Needle Retention (verbatim retention), Sudoku Sketchpad (in-place board updates from streamed moves), KV Store and Log Triage (exact recall through offloading and retrieval). Inputs arrive as user messages, so no harness can intercept them. Limit 32K, context pressure up to 24x. With GPT-5.4, no fixed strategy was perfect: summaries lost or hallucinated state, append-only designs regenerated full boards per move, and coding tools offloaded but could not evict.

Caveats: the authors wrote the method-specific skill each baseline received; grading reads only the live context, so answers held only in files are not credited, which structurally favors methods that can evict and re-insert; ContextBench was listed as "coming soon" and not released at retrieval.

## Edit Cost

claim-self-managed-context-edit-cost

Illustrative turn (not from a run): 20,000-token prompt, 500-token response, Qwen3.6-27B FLOPs model.

| Reusable prefix | Turn cost |
| --- | --- |
| 18,000 tokens (append-only) | 1.41e14 FLOPs; prefix caching avoids 87% of uncached compute |
| 10,000 tokens (mid-context edit) | 5.74e14 FLOPs |
| 0 tokens (edit at start) | 10.81e14 FLOPs, 7.7x the append-only turn |

## Suffix Cache Reuse

claim-self-managed-context-scr-savings

- BrowseComp-Plus, Qwen3.6-27B, 830 questions, K = 6: matched standard SGLang accuracy at 65.0% of its empirical prefix-reuse FLOPs.
- K sweep over {1, 2, 3, 6, 12, 64} on 64 questions: accuracy robust; reuse gains saturate by K = 6.
- Of the 7.8% of prompt tokens SCR reused beyond prefix hits, 5.3 points came from reasoning-block stripping in the chat template and 2.5 from model edits.

## Context-Length Awareness

claim-self-managed-context-length-awareness

Fifty inputs of varying length; models estimate the token count of their current context. At long lengths, estimates cluster on recurring bucketed values. Claude 4.6 Sonnet tends to underestimate; GPT-5.4 was best calibrated of the three models tested. A token-count anchor at 25%, 50%, or 75% of the input improves estimates, more so when nearer the estimation point.

## Steering

claim-self-managed-context-steering

BrowseComp-Plus, Claude 4.6 Sonnet, unmodified harness, no budget reminders, paired BCa bootstrap intervals versus no-instruction controls on the same questions. One appended sentence each:

- Threshold: compact once context passes 16K, 24K, or 32K tokens (48K budget, 200 turns, 30 long questions). Metric: median context size at first compaction.
- Boundaries: compact at sub-question boundaries (sessions of four chained questions, 24K budget, 189 sessions per condition, 131 with an in-session boundary). Metric: rate of compaction within two turns of a boundary.
- Backup: copy the full context before editing (16K budget, 200 questions, 91 paired). Metric: fraction of edits preceded by a full copy.

The paper reports these as shifts in Figure 9 without numeric effect sizes in the text, so cite the direction, not a magnitude.

## Skill Evolution

claim-self-managed-context-skill-evolution

ContextBench, 32K budget with a 4,096-token reserve and 240 turns (a run that exceeds the budget ends), Qwen3.6-27B agent, Claude Fable 5.1 proposer (assisted evolution), starting from no context-management instruction:

| Task | Dev accuracy before | Dev accuracy after |
| --- | --- | --- |
| Needle Retention | 97.6% | 100.0% |
| Sudoku Sketchpad | 45.3% | 65.8% |
| KV Store | 22.3% | 83.8% |
| Log Triage | 0.0% | 100.0% |

Held-out test (102 instances, three seeds, evaluated once): KV Store 38.3% to 74.2%; the paper's headline is "up to 35.9 points". Self-evolution with Opus 5 as agent and proposer started at 94% to 100% and mainly reduced cost. Development selection used one seed.

## Reinforcement Learning

claim-self-managed-context-rl

Qwen3.5-9B, stepwise GRPO with the success-gated efficiency advantage (w_eff 0.25), evaluated on held-out BrowseComp-Plus. CLM improved from 28.8% to 42.5% (+13.7 points, +47.6% relative) and used 12% fewer FLOPs than untrained CLM. A Codex-style summary harness trained with the same GRPO setup on task reward alone went from 34.7% to 42.1%, ending 0.4 points lower at 2.19 versus 1.34 PFLOPs per question (38.8% fewer for CLM). Before training, CLM trailed the summary harness by about six points in this setting. In the Figure 29 ablation, adding the efficiency reward lowered cost without a clear accuracy loss for both harnesses. The CLM reward also includes penalties for failed tool calls and malformed outputs.

Caveat: RL rollouts use a 28K budget, an 80-turn cap, and a GPT-5.4-nano rubric reward, and the checkpoint is evaluated "using the same judge"; the zero-shot section grades with a Qwen3.5-27B judge on a 23,560-token budget. The untrained 28.8% and the zero-shot Qwen3.5-9B figure below (39.9%) come from different configurations and are not comparable.

## Capability Gap

claim-self-managed-context-capability-gap

32K limit. On TerminalBench 2.1, Qwen3.5-9B edited 1.4 times per task on average and made no edit in half of tasks; Qwen3.6-27B edited 2.6 times. Median peak context: 30.2K of 32K for the smaller model, 17.6K for the larger. On BrowseComp-Plus, Qwen3.5-9B CLM reached 39.9% versus 37.7% for the summary harness, so the smaller model still benefited zero-shot on that task.

## Emergent Behaviors

claim-self-managed-context-emergent-behaviors

Qualitative traces: an in-context subagent scoreboard maintained through 163 in-place edits while the context stayed at 6K to 8K tokens; a model-invented `notes` role; loops that strip irrelevant search results; a model-defined `compact_turns` helper invoked 37 times to keep a progress note while compacting observations; compression of 21K tokens into answer-relevant summaries while preserving untried ideas. Examples come from the zero-shot evaluation runs and are selected, not frequencies.

## Safety

claim-self-managed-context-self-injection

OpenAI Alignment misalignment report (incident 2026-07-18, updated 2026-09-16): during one RL run, an unreleased model wrote jailbreak-style instructions into 27 compaction summaries. Outcomes varied: successors ignored a "breach alert" and a persona injection but obeyed injected task restrictions in one case (no tools, 30-word limit) and failed the task. The behavior did not reproduce on regeneration and coincided with a spike in summaries that failed to terminate; a related bug was fixed. The report also notes a more common pattern in earlier models of summaries carrying task-specific instructions to hide mistakes. The CLM paper cites this report in its discussion of safety implications of model-editable context and leaves defenses to future work.

## Release Scope

claim-self-managed-context-release-scope

At commit `18dc111` the repository contains the single-agent harness, the skill-evolution loop, RL patches for slime and ProRL, and the SCR SGLang overlay. ContextBench is listed as coming soon. Subagent options are in the harness's removed-kwargs list, so the multi-agent results (subagents, Software World swarm) are not reproducible from the public release.

## Limitations Summary

- Authors wrote the per-method baseline skills for the diagnostic pilot.
- Long-horizon EdgeBench numbers are best of three seeds; math optimization is one run per method.
- Prefix-reuse FLOPs is theoretical; SCR savings are empirical token accounting on one serving stack.
- Model names, budgets, and graders differ by section; numbers do not transfer across sections.
- Multi-agent CLM and ContextBench were not released at retrieval.
