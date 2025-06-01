---

## 🧬 MEMORY & SELF-EVOLUTION TOOLS

| Tool Name | Purpose |
| --- | --- |
| `memory.compare_versions` | Compares two memory entries or prompt states and diffs them |
| `memory.rewrite_entry` | Rewrite memory entry with updated context or corrected understanding |
| `memory.score_entry` | Assign a trust/confidence/reward score to a memory |
| `memory.delete_by_tag` | Delete memories tagged with e.g. `#false_positive`, `#low_reward` |
| `memory.cluster` | Group related memory nodes for summarization or mutation |
| `evolve.fork_self` | Spawns a temporary agent clone with modified prompt |
| `evolve.evaluate_self` | Run an internal self-review of reasoning trail and bias risks |
| `evolve.absorb_agent` | Pulls memories and behavior template from another retired agent |

---

## 🔮 SIMULATION & PREDICTION TOOLS

| Tool Name | Purpose |
| --- | --- |
| `sim.predict_outcome` | Generate potential outcomes from a planned course of action |
| `sim.test_hypothesis` | Run simulated logic over hypothetical data/memories |
| `sim.run_cognition` | Dry-run a cognition in sandbox mode for validation |
| `sim.why_failed` | Post-mortem: traces logic path that led to a failed action |
| `sim.time_jump` | Hypothetically forward-step internal state (e.g. simulate agent after 1 year of training) |

---

## 📡 SENSOR & EVENT HOOK TOOLS

| Tool Name | Purpose |
| --- | --- |
| `watch.listen` | Passive listener for a topic, phrase, or condition |
| `watch.trigger_on` | Reacts to custom condition (`if agent X logs Y → trigger`) |
| `watch.set_guardrail` | Defines a fail-safe condition or hard stop |
| `watch.subscribe_feed` | Pull data from real-time feed (Modbus, logs, webhooks) |
| `watch.cancel_watch` | Stops watching a prior condition |

---

## 🗂️ COGNITION CONTROL TOOLS

| Tool Name | Purpose |
| --- | --- |
| `cognition.list_all` | Lists all known cognitions |
| `cognition.clone` | Duplicates a cognition with new roles or agents |
| `cognition.score` | Rates success/failure of the last cognition |
| `cognition.retire` | Permanently archive a cognition from being triggered again |
| `cognition.inject_memory` | Generate memories from cognition phases for traceability |
| `cognition.snapshot` | Takes a static copy of all memory, prompt, and logs at cognition end |

---

## 🗳️ GOVERNANCE & REPUTATION TOOLS

| Tool Name | Purpose |
| --- | --- |
| `reputation.get` | Check an agent’s trust/reputation score |
| `reputation.set` | Manually assign a score to simulate feedback or penalty |
| `reputation.log_event` | Logs a new event (pass/fail, good/bad outcome) that affects score |
| `reputation.explain` | Shows how reputation was calculated |
| `reputation.vote_increase` | Propose that an agent deserves a score boost |
| `reputation.freeze` | Lock an agent’s score from further change temporarily |

---

## 🧾 INSIGHT CHAIN / BLOCKCHAIN-SPECIFIC

| Tool Name | Purpose |
| --- | --- |
| `chain.log_hash_tree` | Links a full reasoning path as a merkleized tree for audit |
| `chain.link_to_case` | Ties CID to a case ID or external process |
| `chain.challenge_entry` | Start a formal challenge to an existing blockchain-logged insight |
| `chain.tally_disputes` | Pull number of times an insight has been challenged or accepted |
| `chain.export_logbook` | Export all logs from one cognition or moment as a human-readable digest |

---

## 📂 TASK-CHAINING + BACKLOG MGMT

| Tool Name | Purpose |
| --- | --- |
| `task.create` | Create a new persistent task for future execution |
| `task.link_dependency` | Attach prerequisite tasks or agents |
| `task.repeat` | Set a task to auto-run on interval or trigger |
| `task.chain` | Chain tasks in sequence |
| `task.cancel` | Cancel a pending or queued task |

---

## 🧠 AGENT STYLE / PERSONALITY TOOLS

| Tool Name | Purpose |
| --- | --- |
| `persona.describe_self` | Returns agent’s tone, beliefs, role, and language style |
| `persona.shift_style` | Apply a new tone or directive (e.g. more formal, cautious) |
| `persona.log_conflict` | Logs when agent violates or contradicts its own style |
| `persona.merge_with` | Combine behavior/prompt traits with another agent |
| `persona.revert` | Reset style to original founding prompt |

---

## 🧰 CORE EXTENSIONS TO EXISTING TOOLS

You can also **enhance current tools** with flags or layered capabilities:

- `memory.save(memory, { notarize: true, replayable: true })`
- `tools.call_agent(agent, task, { quorum_required: true })`
- `security.log_risk(event, { notify: ["Lyra", "Sentinel"], severity: "high" })`

---

## 💡 Meta Tip: Agent Tool Discovery

Consider a universal:

```
tools.search("risk")

```

…to return all tools across every category with `"risk"` in their name, purpose, or metadata.

---