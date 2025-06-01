
---

# 🧱 PHASE 1 — Finalize & Harden the Chain

### ✅ 1. **Fix Build System**

* [ ] Extract `pallets/`, `runtime/`, `node/` into a new directory: `c-suite-chain/`
* [ ] Create new `Cargo.toml` at the root:

  * Remove any `bridges/` workspace members
  * Replace Polkadot SDK workspace dependencies with Git tags or crates.io
* [ ] Add `.cargo/config.toml`:

  ```toml
  [build]
  target-dir = "target"
  ```
* [ ] Run: `cargo check -p c_suite_runtime`
* [ ] Run: `cargo build --release`

---

### 🔄 2. **Update Genesis & Chain Spec**

* [ ] Add demo agents in `genesis_config.rs`
* [ ] Export raw chain spec:

  ```bash
  ./target/release/c-suite-node build-spec --chain dev --raw > c-suite-dev-raw.json
  ```
* [ ] Launch node:

  ```bash
  ./target/release/c-suite-node \
    --chain ./c-suite-dev-raw.json \
    --alice --rpc-cors=all --rpc-methods=Unsafe --ws-external
  ```

---

### 📦 3. **Package Docker Image**

* [ ] Write `Dockerfile` for the node:

  ```dockerfile
  FROM rust:1.72 as builder
  WORKDIR /app
  COPY . .
  RUN cargo build --release

  FROM debian:buster-slim
  COPY --from=builder /app/target/release/c-suite-node /usr/local/bin/c-suite-node
  CMD ["c-suite-node", "--dev"]
  ```
* [ ] Run: `docker build -t celaya/c-suite-node .`

---

# 🖥️ PHASE 2 — Build the Dashboard

### 🎛 4. **Scaffold React + ShadCN Dashboard**

* [ ] Create project:

  ```bash
  npx create-next-app@latest c-suite-dashboard -e with-tailwindcss
  cd c-suite-dashboard
  ```
* [ ] Install Polkadot JS API:

  ```bash
  yarn add @polkadot/api @polkadot/react-hooks
  ```
* [ ] Install ShadCN:

  ```bash
  npx shadcn-ui@latest init
  ```

---

### 🧠 5. **Create Pages**

* [ ] `/agents` – live list of agent metadata + trust score
* [ ] `/consensus` – table of recent consensus logs
* [ ] `/replay/:cid` – CID-based replay interface
* [ ] `/signatures` – validator for agent signatures
* [ ] `/log` – real-time event stream via `api.query.system.events()`
* [ ] `/submit` – dev-only form to call extrinsics (`register_agent`, `submit_insight`, etc.)

---

### 🧪 6. **Connect RPC**

* [ ] Create `useApi.tsx` hook:

  ```ts
  import { ApiPromise, WsProvider } from '@polkadot/api';
  export const connect = async () => {
    const provider = new WsProvider('ws://localhost:9944');
    const api = await ApiPromise.create({ provider });
    return api;
  };
  ```
* [ ] Call `api.query.agentRegistry.agents.entries()` to fetch live data

---

# 🤖 PHASE 3 — Agent ↔ Chain Integration

### 🔐 7. **Agent Keygen + Signing**

* [ ] Generate ED25519 keypairs for each agent (use `subkey` or libsodium)
* [ ] Store keys locally per agent
* [ ] Sign hashes before calling `sign_consensus_log`

---

### 🧠 8. **LLM ↔ Blockchain Toolflow**

* [ ] In your Ollama fork (Celaya), implement:

  ```python
  def submit_to_chain(insight: str, cid: str, agent_id: str):
      # call RPC or use Polkadot API to call extrinsic
      return result
  ```
* [ ] Agents submit:

  * `submit_insight(cid)`
  * `sign_output(sig)`
  * `log_consensus(log_id)`

---

### 🧪 9. **End-to-End Test: Agent Proof**

* [ ] Prompt → LLM generates output
* [ ] CID is created (IPFS/Arweave)
* [ ] Agent signs hash
* [ ] Log is submitted to chain
* [ ] Replay via dashboard

---

# 🌐 PHASE 4 — Public Testnet + SDK

### 🌍 10. **Deploy WSS RPC**

* [ ] Setup NGINX reverse proxy:

  ```nginx
  server {
      listen 443 ssl;
      server_name rpc.celaya.solutions;

      ssl_certificate /etc/letsencrypt/live/rpc.celaya.solutions/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/rpc.celaya.solutions/privkey.pem;

      location / {
          proxy_pass http://localhost:9944;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection "upgrade";
      }
  }
  ```
* [ ] Use Let’s Encrypt for SSL

---

### 📦 11. **Release `@celaya/sdk`**

* [ ] Create `packages/sdk/`:

  * `registerAgent()`
  * `submitInsight()`
  * `signConsensus()`
  * `verifySignature()`
* [ ] Publish to npm:

  ```bash
  npm publish --access public
  ```

---

### 👥 12. **Launch Developer Portal**

* [ ] Use Next.js + Tailwind
* [ ] Pages:

  * Home
  * SDK Docs
  * Chain Explorer
  * Agent Registry
  * Start Building

---
