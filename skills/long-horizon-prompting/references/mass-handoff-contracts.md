# MASS Handoff Contracts, Annotated

Status and provenance, as of 2026-10-11:

- Source: Hyunin Lee, Jinglue Xu, Jeffrey Seely, Donghyun Lee, Somayeh Sojoudi, Matei Zaharia, Yujin Tang, "Recursive Self-Improvement through Multi-Agent Self-Supervision" (Sakana AI and UC Berkeley), arXiv 2610.12176v1, October 2026. Project page: `https://pub.sakana.ai/mass/`. Code: `https://github.com/SakanaAI/mass`.
- MASS is a recursive self-improvement method. One shared model (Qwen3.6-27B in the experiments) acts as executor, workflow optimizer, and evaluator. The optimizer searches multi-agent workflow text using the evaluator's pairwise judgments, then the model is fine-tuned with LoRA on orchestrator and subagent trajectories from the self-judged best workflows. The paper reports two full rounds.
- This skill does not cover the weight-update loop; that belongs to `self-improvement-loops`. What transfers to launch-prompt design is the workflow representation, the contracts the optimizer converged on, the execution directive the authors wrote for trajectory collection, and three findings about verification and search.
- Preprint, unreviewed at retrieval. Training used eight synthetic research tasks in finance, robotics, and pharmacy. The component analysis covers 8 to 9 tasks and 43 to 51 agents, which the authors describe as descriptive text statistics rather than independent replications. Progress was scored by external judges (GPT-5.5 and Claude Opus 4.8) whose judgments were withheld from the loop.

## Workflow as a prompt

MASS represents a workflow as text appended to the task prompt, with four components per subagent:

- Role: the responsibility assigned to the subagent.
- Instruction: the work the subagent should carry out.
- Contract: "the information and artifacts it must return, including any required checks."
- Hop: the order of subagent calls, including any return to an earlier step.

The optimizer's system prompt emphasizes contracts and hops, directing search toward what information agents exchange and when they receive it.

This decomposition lines up with the four-part delegation spec in vendor guidance (objective, output format, tool guidance, boundaries), with one difference that matters. An output format says what shape to return. A contract also says what must be established, and checked, before the next agent may proceed.

## Finding 1: task information moves into contracts and hops

Between workflow-search iterations 3 and 11, estimated mutual information between component text and task descriptions fell for roles and instructions and rose for contracts and hops, across two embedding models and two estimators. Redundancy among components generally fell (claim-long-horizon-contract-information-shift). The project page gives the intuition: "a role such as 'careful data scientist' could apply to many tasks. A contract specifying leakage checks for a trading backtest is much more distinctive."

Implication: when an optimizer is free to put task knowledge anywhere in a worker prompt, it moves that knowledge into what the worker must return and when. Brief writers should do the same: keep roles short, and spend task-specific words on contracts and call order.

## Annotated contract: the finance data stage

Condensed from the evolved finance workflow on the project page:

```text
Call order
  Data -> Features -> Modeling -> Backtest
       -> Audit -> Reconciliation -> Report

Data specialist's output contract
  validation_report:
    no_future_leakage:           bool
    train_end_before_val_start:  bool
    val_end_before_test_start:   bool
```

The authors' gloss: "A backtest can look convincing if it lets historical decisions use information from the future. This contract requires the data specialist to check for that error and report whether the time splits are valid. It also tells later agents what evidence they should receive before proceeding."

Three properties of this contract generalize:

1. Each check is named after the failure it rules out (`no_future_leakage`), not after a quality ("rigorous data preparation").
2. Each check is typed. A boolean in a validation report can be read by the next agent and by a harness without judgment.
3. The check sits at the handoff where the error is introduced, not only in the final audit, so downstream work does not build on a broken input.

A research report is non-verifiable in the paper's sense: no automatic rule-based signal exists for the whole artifact. The contract carves verifiable pieces out of it anyway. The same move applies to code (`tests_pass`, `tests_unmodified`), to modeling (`no_target_leakage`, `split_overlap_free`), and to documents (`every_claim_cites_a_source`).

## The evolved orchestrator: gates, degenerate values, recall

The complete evolved workflow for one finance task (paper Appendix I.1, task 51, workflow version 10) adds three patterns on top of per-stage contracts. The paper notes that its thresholds and heuristics "are optimizer proposals, not additional benchmark requirements or validated scientific criteria."

- Gates on every handoff: "Enforce strict JSON schema validation on every subagent output," and "Halt synthesis until all gates pass or max hops exhausted with documented fallbacks."
- Degenerate-value rejection: "Reject any output containing NaN, Inf, or degenerate values (e.g., regime_accuracy==1.0, confusion_matrix=[[N]], IC==RankIC, ablation_delta_sharpe>0)." The auditor's checklist adds "Sharpe > 10" and a "stability = 0.5 placeholder." These are too-good-to-be-true signatures: values that appear only when something upstream is broken.
- Recall with its own acceptance criteria: "if a gate fails, issue a RECALL command with {target_agent, failed_checks, error_context, narrowed_scope, acceptance_criteria, code_patch_hint, max_retries: 3}." The fix request names one responsible agent, the checks that failed, a narrower scope, what will count as fixed, and a retry cap.

The recall shape is what keeps review from becoming open-ended. A finding turns into a bounded work order with its own definition of done, routed to one agent, instead of reopening the whole artifact for another unbounded pass.

## The authors' execution directive

Appendix B.3 reproduces the directive appended to every workflow during trajectory collection. The authors wrote it; it was not evolved. Selected items, verbatim:

- "Run the team for real. ... Simulating a role in your own turn does not count. You, the orchestrator, do not write pipeline or analysis code yourself; you set up the project, delegate, verify, and integrate."
- "One stage at a time. Launch a worker only when the inputs it needs already exist on disk."
- "Self-contained instructions. A worker sees nothing but your prompt and the filesystem. Each prompt must include: the role's instruction from the team definition above; the absolute workspace path; the exact files to create or modify; the interfaces or artifacts produced by earlier stages that it must use; the command(s) to run to verify its work; and the report you expect back (files written, commands run with results, key numbers, known problems)."
- "Verify before you build on it. After each report, check the worker's output yourself (run the entry point, inspect the artifacts). If the check fails or the report shows problems, re-delegate to the same role with a corrected, narrower instruction instead of fixing it yourself."
- "Bounded work. Give each worker one deliverable it can finish in a single run: a handful of files and one verification command."
- "Finish cleanly. ... Your final answer must summarize every worker call: role, what it was asked, status, and what you verified."

Every item is a non-counting outcome ("simulating a role does not count"), a gate ("launch only when inputs exist", "verify before you build on it"), or a reporting contract ("summarize every worker call ... and what you verified"). None of it is a persona.

## Finding 2: the reviser can be the bottleneck, not the reviewer

With the executor fixed at the base model, replacing only the evaluator with a stronger external model improved workflow search less than replacing both the evaluator and the optimizer. The fully homogeneous loop still reached unanimous wins on 11 of 12 tasks, more slowly (claim-long-horizon-reviser-bottleneck). The authors' reading: strong feedback is wasted when the component that acts on it cannot digest it.

Implication: in an orchestration, the agent that turns audit findings into the next round (usually the root) needs as much capability and prompt design as the auditor. Investing only in a stricter verifier can leave a run holding accurate findings that nobody acts on well.

## Finding 3: one run is an anecdote

On one task, two workflow files and their rendered prompts were byte-identical and shared a generation seed. The first episode completed and won all six external judgments; the second halted under loop detection and lost all six. Workflow search more generally showed strong iterations followed by sharp regressions (claim-long-horizon-run-variance). MASS itself executes each champion workflow 18 times per task before selecting training trajectories.

Implication: judge a brief, or a change to a brief, across several runs. A single success does not validate it and a single failure does not refute it.

## Shared blind spots

The paper motivates multi-agent organization with the observation that "generation, evaluation, and revision share the same learned prior, meaning that self-feedback can reinforce rather than correct errors." Its conclusion names shared blind spots as a safety concern for homogeneous loops, where a flawed result can be "produced, accepted as an improvement, and incorporated into the next model." MASS keeps measurement outside the loop: external judges score progress and their judgments are withheld from the optimizer and evaluator. The appendix also shows one supervised revision whose first diagnostic "incorrectly treats NaN correlations as passing," so a check can itself be faulty.

Implication: fresh context removes the author's build history but not the model family's priors. For results that matter, keep at least one check outside the loop, and test each check on a known-bad input so a vacuous pass gets caught.

## What this reference does not claim

- No ablation isolates contracts as a causal driver of task performance. The information-shift result describes the text of retained workflows.
- Transfer was uneven. After two rounds, score per output token was 1.2-1.6x the base model on four research benchmarks but 0.96x on Terminal-Bench 2.0 and 0.94x on SWE-bench Verified.
- The evolved thresholds quoted above are optimizer proposals for one finance task, not validated criteria.
