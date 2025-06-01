# Advanced Control Station

> **Next-Generation C-Suite Agent Simulation & Tool Calling Platform**

A modern, powerful control station built with the latest polkadot-api for managing C-Suite agents, executing sophisticated tool calls, running complex simulations, and monitoring blockchain networks.

## 🚀 Features

### 🎯 Core Capabilities
- **Advanced Agent Management** - Control and monitor C-Suite agents with real-time status
- **Tool Calling Interface** - Execute agent tools with custom parameters and real-time feedback
- **Simulation Engine** - Run complex multi-agent simulations with customizable scenarios
- **Advanced Chat Interface** - Communicate with agents using prompt engineering templates
- **System Monitoring** - Real-time logs, signatures, and network monitoring
- **Blockchain Integration** - Full polkadot-api integration with substrate chains

### 🛠 Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Blockchain**: Polkadot API v2, Substrate Client
- **Styling**: Tailwind CSS, Framer Motion
- **Development**: Vite, Monaco Editor, Recharts
- **Architecture**: Modern ESM, PNPM Workspaces

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PNPM 8+
- A running Substrate/Polkadot node

### Quick Start

```bash
# Clone and setup
git clone <repository>
cd advanced-control-station

# Install dependencies
pnpm install

# Generate API descriptors
pnpm codegen

# Start development server
pnpm dev
```

### Environment Setup

Create a `.env.local` file:

```env
# Blockchain Connection
NEXT_PUBLIC_WS_ENDPOINT=ws://localhost:9944
NEXT_PUBLIC_PARACHAIN_ENDPOINT=ws://localhost:9988

# Agent Configuration
NEXT_PUBLIC_AGENT_REGISTRY_URL=http://localhost:3001
NEXT_PUBLIC_SIMULATION_ENGINE_URL=http://localhost:3002

# Features
NEXT_PUBLIC_ENABLE_SIMULATIONS=true
NEXT_PUBLIC_ENABLE_TOOL_CALLING=true
NEXT_PUBLIC_ENABLE_SIGNATURES=true
```

## 🎮 Usage

### Dashboard Overview
The main dashboard provides:
- System status monitoring
- Agent activity overview
- Quick action shortcuts
- Real-time performance metrics

### Agent Management
- View all active C-Suite agents
- Monitor agent states and performance
- Execute agent-specific commands
- Configure agent parameters

### Tool Calling
- Browse available agent tools
- Execute tools with custom parameters
- Monitor tool execution status
- View detailed results and logs

### Simulation Engine
- Create multi-agent simulation scenarios
- Configure simulation parameters
- Monitor simulation progress
- Analyze results and metrics

### Advanced Chat
- Communicate with agents using natural language
- Use prompt engineering templates
- Execute complex multi-step workflows
- Real-time agent responses

## 🏗 Architecture

### Project Structure
```
advanced-control-station/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React Components
│   │   ├── agents/         # Agent management
│   │   ├── chat/           # Chat interface
│   │   ├── simulation/     # Simulation engine
│   │   ├── tools/          # Tool calling
│   │   ├── logs/           # System logs
│   │   ├── signature/      # Signature management
│   │   └── ui/             # UI components
│   ├── lib/                # Utilities and providers
│   ├── hooks/              # React hooks
│   └── types/              # TypeScript types
├── public/                 # Static assets
└── .papi/                  # Generated API descriptors
```

### Key Components

#### Polkadot Integration
- Modern polkadot-api v2 implementation
- Observable client for real-time updates
- Substrate client for chain interaction
- Automatic type generation

#### Agent System
- C-Suite agent registry
- Real-time status monitoring
- Tool execution framework
- Simulation coordination

#### Tool Calling Framework
- Dynamic tool discovery
- Parameter validation
- Execution monitoring
- Result visualization

## 🔧 Development

### Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests
- `pnpm codegen` - Generate API descriptors

### Code Generation
The project uses polkadot-api's code generation for type-safe blockchain interaction:

```bash
# Generate descriptors for your chain
pnpm codegen

# This creates type-safe APIs in .papi/descriptors
```

### Adding New Tools
1. Define tool interface in `src/types/tools.ts`
2. Implement tool executor in `src/lib/tools/`
3. Add tool to registry in `src/lib/tool-registry.ts`
4. Create UI component in `src/components/tools/`

### Creating Simulations
1. Define scenario in `src/types/simulation.ts`
2. Implement simulation logic in `src/lib/simulation/`
3. Add to simulation engine in `src/components/simulation/`

## 🌐 Deployment

### Production Build
```bash
pnpm build
pnpm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --production
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Environment Variables
See `.env.example` for all available configuration options.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the BSL (Business Source License) - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: chris@celayasolutions.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

---

**Built with ❤️ by Celaya Solutions** 