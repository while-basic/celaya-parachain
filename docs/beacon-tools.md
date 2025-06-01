
---

# ✅ LET’S BUILD: **Beacon** — the Knowledge & Insight Agent

## 🧠 Mission:

> “To retrieve, summarize, and publish external knowledge — with full transparency and on-chain audit logs.”

---

## 🔥 Why Beacon?

* Easy to build: all APIs are public and available.
* Zero hardware required.
* Perfect for testing: get query → retrieve data → log + sign → submit to blockchain.
* Shows how C-Suite can **prove insight provenance**.

---

## 🔌 Tools You Can Use *Right Now*

| Tool/API                                                    | Function                                         |
| ----------------------------------------------------------- | ------------------------------------------------ |
| 🌐 [Wikipedia API](https://en.wikipedia.org/api/rest_v1/)   | Fetch factual summaries of any topic.            |
| 🧮 [Wolfram Alpha](https://products.wolframalpha.com/api/)  | Solve math, answer science/logic queries.        |
| 🔬 [PubMed](https://www.ncbi.nlm.nih.gov/home/develop/api/) | Fetch clinical or scientific references.         |
| 📰 [News API](https://newsapi.org/)                         | Pull recent headlines (free tier available).     |
| 🧠 \[OpenAI / Ollama]                                       | Optional: Summarize or explain in plain English. |

---

## 💡 Example Task Flow

> **User asks:**
> “Beacon, what are the symptoms of lithium toxicity?”

**Flow:**

1. Beacon hits PubMed + Wikipedia APIs
2. Retrieves sources + summary
3. Pushes metadata + summary to IPFS → gets CID
4. Signs summary + CID with Beacon’s key
5. Submits to `Recall.storeConsensusRecord()` (only Beacon signed — single-agent log)

✅ Now the knowledge is:

* **Traceable** (you can check where it came from)
* **Signed** (Beacon, not a ghost model)
* **Immutable** (IPFS + chain)

---

## 🛠️ What We’ll Build

### ✅ 1. `ask_beacon(topic: str)`

* Makes API request to Wikipedia or Wolfram
* Returns summary + source URLs

### ✅ 2. `generate_summary(data)`

* Optional: Summarize response via LLM

### ✅ 3. `log_insight(summary, sources)`

* Hash + sign + push to IPFS
* Submit to blockchain via Recall pallet

---

## 🧪 Example Output Log (Markdown)

```markdown
### 🔍 Insight: Symptoms of Lithium Toxicity

- **Sources**: [Wikipedia](https://en.wikipedia.org/wiki/Lithium_toxicity), PubMed: 332
- **Summary**: Lithium toxicity causes tremors, confusion, nausea, and kidney issues.

- **Signed by**: Agent Beacon (ed25519)
- **CID**: QmXYZ123abc...
- **Timestamp**: 2025-06-01T12:44:00Z
```

---

## 🚀 Why This Is the Perfect Starter:

* ✅ Shows off your **Recall pallet + IPFS log**
* ✅ Real-time queries = real value
* ✅ Easy to test, easy to demo
* ✅ Sets foundation for multi-agent tasks (e.g., Theory fact-checks Beacon, Verdict legalizes the claim)

---