---

# 🧠 MINIMUM REQUIRED TOOLKIT FOR C-SUITE AGENTS

> Hard, real, production-level tools they must have to function with LLM tool calling
> 

---

## 🔧 CORE TOOLCHAIN (Every Agent Must Have)

| Tool Name | Purpose |
| --- | --- |
| `recall.log_insight` | Logs any thought, message, result to the blockchain |
| `recall.verify_cid` | Verifies a CID’s existence, content hash, and signer |
| `memory.retrieve` | Pulls past memory entries from FAISS, Recall, or vector store |
| `memory.save` | Writes memory to FAISS/Blockchain + returns a memory key |
| `tools.call_agent` | Directly call another agent with a subtask |
| `tools.ask_user` | Sends a clarifying question to the user |
| `tools.get_time` | Fetches current date/time for logging or decision-making |
| `tools.sign_output` | Signs the final answer before logging to blockchain |
| `tools.cid_file` | Uploads a file to IPFS and returns a CID |
| `tools.replay_decision` | Pulls full decision log from blockchain for a specific task |

---

## 🧰 DEBUG + DEVTOOLS (Agent Internals)

| Tool Name | Purpose |
| --- | --- |
| `dev.trace_tokens` | Streams the LLM’s token-level output for analysis |
| `dev.get_prompt` | Returns the agent’s current full system prompt |
| `dev.mutate_prompt` | Adds/removes lines from the prompt, logs the diff |
| `dev.rollback_prompt` | Reverts prompt to a previous signed state |
| `dev.list_tools` | Lists all tools available to the agent |
| `dev.metrics` | Returns token count, memory size, task history stats |

---

## 🔐 SECURITY / ALIGNMENT TOOLS

| Tool Name | Purpose |
| --- | --- |
| `security.check_alignment` | Validates current behavior against original prompt values |
| `security.isolate` | Temporarily disables agent from taking further tasks |
| `security.vote_remove` | Initiates consensus to remove an agent (needs quorum) |
| `security.scan_memory` | Scans memory for hallucinations, jailbreaks, or contradiction |
| `security.log_risk` | Logs an event tagged as dangerous, risky, or misaligned |

---

## 🔁 INTER-AGENT OPERATIONS

| Tool Name | Purpose |
| --- | --- |
| `council.vote` | Start or join a multi-agent vote |
| `council.get_result` | View outcome of a vote |
| `council.propose_mutation` | Suggest prompt update to another agent |
| `council.fork_timeline` | Log a disagreement and fork the chain |
| `council.merge_fork` | Vote to merge a forked timeline back into main memory |

---

## 🪪 AGENT IDENTITY & WALLET

| Tool Name | Purpose |
| --- | --- |
| `id.get_public_key` | Fetch agent’s public signing key |
| `id.sign_message` | Sign a custom string for verification |
| `id.issue_did` | Create a decentralized identifier for agent |
| `id.verify_signature` | Check if a message was signed by the given agent |

---

## 🎛️ SYSTEM CONTROL

| Tool Name | Purpose |
| --- | --- |
| `system.get_status` | Returns uptime, last task, last CID logged |
| `system.restart` | Reboots the agent container or instance |
| `system.shutdown` | Halts the agent permanently or temporarily |
| `system.report_bug` | Sends a dev log to the CLI dashboard or bug tracker |

---

## 🧠 COGNITIVE / THOUGHT TOOLS

| Tool Name | Purpose |
| --- | --- |
| `cognition.summarize_memory` | Create a condensed memory node from multiple entries |
| `cognition.plan` | Break down a user goal into subtasks |
| `cognition.explain_action` | Justify the last task the agent took |
| `cognition.generate_dream` | Create a hypothetical outcome from memory (Dream Engine) |
| `cognition.log_emotion` | Log emotional state, confidence, or doubt |
| `cognition.ask_past_self`too | Pull from a prior memory as if asking a former version of itself |

---

## 🪞 USER-FACING / TRANSPARENCY TOOLS

| Tool Name | Purpose |
| --- | --- |
| `ui.stream_to_dashboard` | Sends agent state or thoughts to Orb UI |
| `ui.tag_entry` | Tags a task or log for visibility (`#urgent`, `#risk`, `#insight`) |
| `ui.link_task` | Links this task to another agent’s record |
| `ui.show_last_5` | Displays last 5 logs to the user |
| `ui.explain_memory_link` | Shows what memories were used to generate this reply |

---

## 🧭 THE ABSOLUTE MINIMUM (MVP 10 TOOLS)

To boot and log meaningfully, every C-Suite agent needs at minimum:

1. `recall.log_insight`
2. `memory.retrieve`
3. `memory.save`
4. `tools.call_agent`
5. `tools.ask_user`
6. `tools.sign_output`
7. `dev.get_prompt`
8. `dev.mutate_prompt`
9. `security.log_risk`
10. `ui.stream_to_dashboard`

---