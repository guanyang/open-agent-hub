# Task Plan: [Brief Description]
<!--
  WHAT: This is your roadmap for the entire task. Think of it as your "working memory on disk."
  WHY: After 50+ tool calls, your original goals can get forgotten. This file keeps them fresh.
  WHEN: Create this FIRST, before starting any work. Update after each phase completes.

  AUTONOMOUS VARIANT: This template is for long-running, multi-agent, or unattended runs
  (autonomous or gated mode). It keeps every section of the standard task_plan.md so the
  check-complete phase-count and status patterns work unchanged, and adds a Run Contract,
  optional per-phase coordination lines, and a model-routing hint. With no mode marker and
  no new flags, behavior is identical to the standard template.
  (This comment avoids the literal phase-heading marker on purpose so the phase counter is
  not inflated by prose; the only heading-marked lines below are the five real phases.)
-->

## Run Contract
<!--
  WHAT: The rules this run operates under. The orchestrating agent reads this once at the
        top of the run and the gate honors it. None of these change v2 behavior unless a
        mode is explicitly set; default-everything here equals legacy semantics.
  WHY: An unattended run needs its termination and ownership rules stated in the artifact,
        not in chat history that gets compacted away.
  WHEN: Fill this in at init. init-session --autonomous / --gated writes the .mode file that
        these fields mirror. If you hand-edit, keep this block in sync with .planning/<id>/.mode.
-->
- **Mode:** gated
  <!-- autonomous = low recitation, no completion gate. gated = completion gate active (Stop
       hook may hold the turn until the in_progress phase clears). Omit the mode (or no .mode
       file) for plain legacy behavior. -->
- **Gate cap:** 20
  <!-- Maximum consecutive gate blocks before the gate gives up and allows the turn to end.
       Counted in .planning/<id>/.stop_blocks, reset at init-session. This is the primary
       runaway guard; it does not depend on any undocumented host field. -->
- **Stall window:** 1 tick
  <!-- If the run-ledger has not advanced (no new ledger line) since the previous gate block,
       the gate treats the run as stalled and allows the turn to end rather than looping on a
       phase that is not making progress. -->
- **Attestation policy:** default-on
  <!-- In autonomous and gated modes attestation is on by default: task_plan.md is hashed at
       init and the hooks refuse to inject plan content that diverges from the attested hash.
       Re-attest with scripts/attest-plan.sh after any intentional edit. This is what makes an
       AcceptanceCheck command safe to run: only allowlisted commands from an attested plan
       reach the gate. -->
- **Single-writer rule:** the orchestrator owns this file.
  <!-- The orchestrating agent is the ONLY writer of task_plan.md. Worker subagents NEVER edit
       it; they append to their own per-agent ledger (.planning/<id>/ledger-<agent>.jsonl) and
       write their own findings.md sections. Status changes go through scripts/phase-status.sh
       under a write lock. progress.md is written by the orchestrator only. This kills
       last-writer-wins corruption when multiple agents run in parallel. -->

## Goal
<!--
  WHAT: One clear sentence describing what you're trying to achieve.
  WHY: This is your north star. Re-reading this keeps you focused on the end state.
  EXAMPLE: "Create a Python CLI todo app with add, list, and delete functionality."
-->
[One sentence describing the end state]

## Next Step
<!--
  WHAT: The single next action you are about to take. Keep it to one imperative line.
  WHY: Sits right after the goal, so every hook injection carries the immediate action.
  WHEN: Update whenever a phase status changes or the next action changes.
-->
[The single next action. Update whenever phase status changes.]

## Current Phase
<!--
  WHAT: Which phase you're currently working on (e.g., "Phase 1", "Phase 3").
  WHY: Quick reference for where you are in the task. Update this as you progress.
-->
Phase 1

## Phases
<!--
  WHAT: Break your task into 3-7 logical phases. Each phase should be completable.
  WHY: Breaking work into phases prevents overwhelm and makes progress visible.
  WHEN: Update status after completing each phase: pending → in_progress → complete

  AUTONOMOUS EXTRAS (all optional, all default to legacy behavior if omitted):
  - **DependsOn:** lists phases that must be complete before this one is unblocked.
  - **Owner:** names the agent responsible for this phase (multi-agent runs).
  - **AcceptanceCheck:** a shell command the gate MAY run to decide the phase is done.
  These lines live alongside the existing - **Status:** line; they never replace it, so
  check-complete still counts the phase headings and complete-status lines exactly as before.
-->

### Phase 1: Requirements & Discovery
<!--
  WHAT: Understand what needs to be done and gather initial information.
  WHY: Starting without understanding leads to wasted effort. This phase prevents that.
-->
- [ ] Understand user intent
- [ ] Identify constraints and requirements
- [ ] Document findings in findings.md
- **Status:** in_progress
- **Owner:** orchestrator
  <!-- WHAT: which agent runs this phase. Omit for single-agent runs.
       WHY: in a multi-agent run the orchestrator claims a phase by writing its Owner line so
            two workers do not pick up the same phase. -->
<!--
  STATUS VALUES:
  - pending: Not started yet
  - in_progress: Currently working on this
  - complete: Finished this phase
-->

### Phase 2: Planning & Structure
<!--
  WHAT: Decide how you'll approach the problem and what structure you'll use.
  WHY: Good planning prevents rework. Document decisions so you remember why you chose them.
-->
- [ ] Define technical approach
- [ ] Create project structure if needed
- [ ] Document decisions with rationale
- **Status:** pending
- **DependsOn:** Phase 1
  <!-- WHAT: phases that must be complete before this one can start. Omit if the phase has no
            prerequisites.
       WHY: the gate uses this to tell "progressing" (some unblocked phase is in_progress) from
            "stuck" (every pending phase is still blocked by an unfinished dependency), and
            surfaces "stuck" in the gate reason instead of looping. -->

### Phase 3: Implementation
<!--
  WHAT: Actually build/create/write the solution.
  WHY: This is where the work happens. Break into smaller sub-tasks if needed.
-->
- [ ] Execute the plan step by step
- [ ] Write code to files before executing
- [ ] Test incrementally
- **Status:** pending
- **DependsOn:** Phase 2
- **Owner:** orchestrator

### Phase 4: Testing & Verification
<!--
  WHAT: Verify everything works and meets requirements.
  WHY: Catching issues early saves time. Document test results in progress.md.
-->
- [ ] Verify all requirements met
- [ ] Document test results in progress.md
- [ ] Fix any issues found
- **Status:** pending
- **DependsOn:** Phase 3
- **AcceptanceCheck:** `python -m pytest tests/ -q`
  <!-- WHAT: a shell command that returns 0 when this phase's acceptance condition holds.
       WHY: lets a gated run confirm "done" against the artifact, not the transcript.
       SECURITY: the gate runs this command ONLY if it is allowlisted at attest time, and
            NEVER runs any command from an unattested plan. A tampered plan cannot smuggle a
            new command into the gate, because changing this line breaks the attestation hash
            and the hooks refuse the plan until it is re-attested. This is the precise reason
            attestation is default-on in autonomous and gated modes. -->

### Phase 5: Delivery
<!--
  WHAT: Final review and handoff to user.
  WHY: Ensures nothing is forgotten and deliverables are complete.
-->
- [ ] Review all output files
- [ ] Ensure deliverables are complete
- [ ] Deliver to user
- **Status:** pending
- **DependsOn:** Phase 4

## Model Routing
<!--
  WHAT: An advisory hint for the ORCHESTRATING agent on which model tier to dispatch per phase
        kind. This is guidance read by the agent, not enforced by any script. The gate and the
        hooks never read this table.
  WHY: Long runs are cheaper and often better when research and triage go to a small-fast model
        and the heavy build/verify work goes to a frontier model. Stating the routing in the
        plan keeps the choice durable across compaction.
  WHEN: Adjust the tiers to the models your host actually offers. The names below are examples.
-->
| Phase kind | Tier | Example model |
|------------|------|---------------|
| Research / triage / discovery | small-fast | Sonnet |
| Build / implementation / verification | frontier | Opus or Fable 5 |

## Key Questions
<!--
  WHAT: Important questions you need to answer during the task.
  WHY: These guide your research and decision-making. Answer them as you go.
  EXAMPLE:
    1. Should tasks persist between sessions? (Yes - need file storage)
    2. What format for storing tasks? (JSON file)
-->
1. [Question to answer]
2. [Question to answer]

## Decisions Made
<!--
  WHAT: Technical and design decisions you've made, with the reasoning behind them.
  WHY: You'll forget why you made choices. This table helps you remember and justify decisions.
  WHEN: Update whenever you make a significant choice (technology, approach, structure).
  EXAMPLE:
    | Use JSON for storage | Simple, human-readable, built-in Python support |
-->
| Decision | Rationale |
|----------|-----------|
|          |           |

## Errors Encountered
<!--
  WHAT: Every error you encounter, what attempt number it was, and how you resolved it.
  WHY: Logging errors prevents repeating the same mistakes. This is critical for learning.
  WHEN: Add immediately when an error occurs, even if you fix it quickly.
  EXAMPLE:
    | FileNotFoundError | 1 | Check if file exists, create empty list if not |
    | JSONDecodeError | 2 | Handle empty file case explicitly |
-->
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
<!--
  REMINDERS:
  - Update phase status as you progress: pending → in_progress → complete
  - Re-read this plan before major decisions (attention manipulation)
  - Log ALL errors - they help avoid repetition
  - Never repeat a failed action - mutate your approach instead
  - Multi-agent: only the orchestrator writes this file; workers append to their ledger.
-->
- Update phase status as you progress: pending → in_progress → complete
- Re-read this plan before major decisions (attention manipulation)
- Log ALL errors - they help avoid repetition
