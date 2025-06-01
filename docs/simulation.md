# Example Simuations

### 2. **📚 Knowledge Retrieval & Verification (Beacon + Theory + Recall)**

**Goal**: Show an insight being retrieved, verified, and notarized.

#### Flow:

* Beacon fetches summary via Wikipedia/Wolfram
* Theory checks if it’s scientifically sound (semantic match + source validation)
* Consensus reached: “This knowledge is trusted”
* Summary + source + signatures → IPFS → blockchain log

> **Why**: Showcases provable insight with multiple agents checking each other — ideal for media, healthcare, education.

### 4. **⚖️ Agent Misbehavior Test (Any Agent + Auditor)**

**Goal**: Simulate an agent submitting false data and being penalized.

#### Flow:

* Volt submits a fake log
* Echo + Core catch inconsistency in consensus
* Auditor detects contradiction → tags it
* Trust score for Volt is reduced via `updateTrustScore`
* Log minted with a red flag

> **Why**: Shows automated accountability — “no rogue agents survive.”

---

## 🧠 BONUS SIMULATION TYPES

### 🔁 **Agent Stress Test**

* Run 100+ fake events
* Simulate time-based triggers
* See how fast consensus forms
* Monitor how fast logs hit the chain

---

## 📊 What the Simulation Tab Should Show

| Feature                   | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| 🔘 **Scenario Selector**  | Pick a prebuilt or custom simulation                       |
| 🧠 **Agent Live View**    | See which agents are active, what tools they use           |
| 🧾 **Consensus Timeline** | View who signed, when, and the final decision              |
| 🧬 **Log Viewer**         | Pull up log content, signatures, CID, and metadata         |
| 🎯 **Outcome Panel**      | Result: consensus success/fail, trust delta, actions taken |

---

## 🧱 MVP Simulation

1. ✅ Simulate agent tools
2. ✅ Generate a IPFS hash (CID)
3. ✅ Collect signatures with Ed25519 keys
4. ✅ Submit to your **Recall pallet**
5. ✅ Show consensus + result on dashboard
