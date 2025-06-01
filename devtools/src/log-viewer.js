// ----------------------------------------------------------------------------
//  File:        log-viewer.js
//  Project:     Celaya Solutions (C-Suite Blockchain)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Beautiful real-time log viewer for C-Suite parachain
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import chalk from 'chalk';
import { Command } from 'commander';
import { Tail } from 'tail';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import figlet from 'figlet';
import gradient from 'gradient-string';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Agent colors for consistent visualization
const AGENT_COLORS = {
  'Lyra': chalk.magenta,
  'Echo': chalk.cyan,
  'Volt': chalk.yellow,
  'Nexus': chalk.green,
  'Sage': chalk.blue,
  'Iris': chalk.red,
  'Zara': chalk.white,
  'Kai': chalk.gray,
  'Nova': chalk.brightMagenta,
  'Orion': chalk.brightCyan,
  'System': chalk.brightBlue,
  'Consensus': chalk.brightGreen,
  'Unknown': chalk.dim
};

// Log level colors
const LOG_LEVELS = {
  'ERROR': chalk.red.bold,
  'WARN': chalk.yellow.bold,
  'INFO': chalk.blue,
  'DEBUG': chalk.gray,
  'TRACE': chalk.dim
};

// Event type colors
const EVENT_COLORS = {
  'AgentRegistered': chalk.green.bold,
  'AgentStatusUpdated': chalk.blue,
  'ConsensusLogged': chalk.magenta.bold,
  'InsightSubmitted': chalk.cyan,
  'LogSigned': chalk.yellow,
  'ReputationUpdated': chalk.orange,
  'AgentSlashed': chalk.red.bold,
  'AgentQuarantined': chalk.red,
  'AgentBanned': chalk.red.inverse
};

class LogViewer {
  constructor(options = {}) {
    this.options = {
      logFile: options.logFile || '../blockchain.log',
      follow: options.follow !== false,
      filter: options.filter || null,
      agent: options.agent || null,
      level: options.level || null,
      interactive: options.interactive !== false,
      ...options
    };
    
    this.stats = {
      totalLogs: 0,
      errorCount: 0,
      consensusEvents: 0,
      agentEvents: 0,
      startTime: Date.now()
    };
    
    this.agents = new Set();
    this.recentEvents = [];
    this.maxRecentEvents = 100;
    
    if (this.options.interactive) {
      this.setupUI();
    }
  }

  setupUI() {
    // Create blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'C-Suite Parachain Log Viewer'
    });

    // Create grid layout
    this.grid = new contrib.grid({
      rows: 12,
      cols: 12,
      screen: this.screen
    });

    // Header
    this.headerBox = this.grid.set(0, 0, 2, 12, blessed.box, {
      label: ' C-Suite Parachain Log Viewer ',
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        label: { fg: 'white', bold: true }
      }
    });

    // Stats panel
    this.statsBox = this.grid.set(2, 0, 3, 4, blessed.box, {
      label: ' Statistics ',
      border: { type: 'line' },
      style: {
        border: { fg: 'green' },
        label: { fg: 'green' }
      }
    });

    // Agent list
    this.agentBox = this.grid.set(2, 4, 3, 4, blessed.box, {
      label: ' Active Agents ',
      border: { type: 'line' },
      style: {
        border: { fg: 'magenta' },
        label: { fg: 'magenta' }
      }
    });

    // Recent events
    this.eventsBox = this.grid.set(2, 8, 3, 4, blessed.box, {
      label: ' Recent Events ',
      border: { type: 'line' },
      style: {
        border: { fg: 'yellow' },
        label: { fg: 'yellow' }
      }
    });

    // Main log display
    this.logBox = this.grid.set(5, 0, 6, 12, blessed.log, {
      label: ' Live Logs ',
      border: { type: 'line' },
      style: {
        border: { fg: 'blue' },
        label: { fg: 'blue' }
      },
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      keys: true
    });

    // Help panel
    this.helpBox = this.grid.set(11, 0, 1, 12, blessed.box, {
      content: ' [q]uit | [f]ilter | [c]lear | [a]gents | [s]tats | [h]elp | [↑↓] scroll ',
      style: {
        fg: 'white',
        bg: 'blue'
      }
    });

    // Key bindings
    this.screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });

    this.screen.key(['f'], () => {
      this.showFilterDialog();
    });

    this.screen.key(['c'], () => {
      this.logBox.setContent('');
      this.screen.render();
    });

    this.screen.key(['h'], () => {
      this.showHelp();
    });

    this.screen.render();
    this.updateHeader();
  }

  updateHeader() {
    const title = figlet.textSync('C-Suite Logs', { 
      font: 'Small',
      horizontalLayout: 'fitted'
    });
    
    const gradientTitle = gradient.rainbow(title);
    const info = `
${gradientTitle}

🚀 Real-time Parachain Log Viewer
📊 Monitoring: ${this.options.logFile}
🔍 Filter: ${this.options.filter || 'None'}
👤 Agent: ${this.options.agent || 'All'}
📈 Level: ${this.options.level || 'All'}
`;

    this.headerBox.setContent(info);
    this.screen.render();
  }

  updateStats() {
    const uptime = moment.duration(Date.now() - this.stats.startTime).humanize();
    const content = `
📊 Total Logs: ${this.stats.totalLogs}
❌ Errors: ${this.stats.errorCount}
🤝 Consensus: ${this.stats.consensusEvents}
🤖 Agent Events: ${this.stats.agentEvents}
⏱️  Uptime: ${uptime}
📈 Rate: ${(this.stats.totalLogs / ((Date.now() - this.stats.startTime) / 1000)).toFixed(1)}/s
`;

    if (this.statsBox) {
      this.statsBox.setContent(content);
      this.screen.render();
    }
  }

  updateAgents() {
    const agentList = Array.from(this.agents).map(agent => {
      const color = AGENT_COLORS[agent] || AGENT_COLORS.Unknown;
      return `🤖 ${agent}`;
    }).join('\n');

    if (this.agentBox) {
      this.agentBox.setContent(agentList || 'No agents detected');
      this.screen.render();
    }
  }

  updateRecentEvents() {
    const eventList = this.recentEvents.slice(-10).map(event => {
      const time = moment(event.timestamp).format('HH:mm:ss');
      const color = EVENT_COLORS[event.type] || chalk.white;
      return `${time} ${event.type}`;
    }).join('\n');

    if (this.eventsBox) {
      this.eventsBox.setContent(eventList || 'No recent events');
      this.screen.render();
    }
  }

  parseLogLine(line) {
    try {
      // Try to parse as JSON first
      if (line.trim().startsWith('{')) {
        return JSON.parse(line);
      }

      // Parse standard substrate log format
      const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+(\w+)\s+(.+)$/);
      if (match) {
        return {
          timestamp: match[1],
          level: match[2],
          message: match[3],
          raw: line
        };
      }

      // Fallback for unstructured logs
      return {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: line,
        raw: line
      };
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        message: line,
        raw: line,
        parseError: true
      };
    }
  }

  extractAgentInfo(logData) {
    const message = logData.message || logData.raw || '';
    
    // Extract agent names from various patterns
    const agentPatterns = [
      /agent[_\s]*(?:id|name):\s*([A-Za-z]+)/i,
      /([A-Za-z]+)\s*agent/i,
      /"([A-Za-z]+)"/g,
      /\b(Lyra|Echo|Volt|Nexus|Sage|Iris|Zara|Kai|Nova|Orion)\b/g
    ];

    for (const pattern of agentPatterns) {
      const matches = message.match(pattern);
      if (matches) {
        if (Array.isArray(matches)) {
          matches.forEach(match => {
            const agent = match.replace(/[^A-Za-z]/g, '');
            if (agent.length > 2) {
              this.agents.add(agent);
            }
          });
        } else {
          const agent = matches[1] || matches[0];
          if (agent && agent.length > 2) {
            this.agents.add(agent);
          }
        }
      }
    }
  }

  extractEventInfo(logData) {
    const message = logData.message || logData.raw || '';
    
    // Extract event types
    const eventPatterns = Object.keys(EVENT_COLORS);
    for (const eventType of eventPatterns) {
      if (message.includes(eventType)) {
        this.recentEvents.push({
          type: eventType,
          timestamp: logData.timestamp,
          message: message
        });
        
        if (this.recentEvents.length > this.maxRecentEvents) {
          this.recentEvents.shift();
        }
        
        // Update counters
        if (eventType.includes('Consensus')) {
          this.stats.consensusEvents++;
        } else if (eventType.includes('Agent')) {
          this.stats.agentEvents++;
        }
        
        break;
      }
    }
  }

  formatLogLine(logData) {
    const timestamp = moment(logData.timestamp).format('HH:mm:ss.SSS');
    const level = logData.level || 'INFO';
    const message = logData.message || logData.raw || '';

    // Apply level coloring
    const levelColor = LOG_LEVELS[level] || chalk.white;
    const formattedLevel = levelColor(`[${level.padEnd(5)}]`);

    // Apply agent coloring if detected
    let formattedMessage = message;
    for (const [agent, color] of Object.entries(AGENT_COLORS)) {
      if (message.includes(agent)) {
        formattedMessage = formattedMessage.replace(
          new RegExp(`\\b${agent}\\b`, 'g'),
          color.bold(agent)
        );
      }
    }

    // Highlight events
    for (const [eventType, color] of Object.entries(EVENT_COLORS)) {
      if (formattedMessage.includes(eventType)) {
        formattedMessage = formattedMessage.replace(
          new RegExp(`\\b${eventType}\\b`, 'g'),
          color(eventType)
        );
      }
    }

    // Add icons based on content
    let icon = '📝';
    if (message.includes('error') || level === 'ERROR') icon = '❌';
    else if (message.includes('consensus')) icon = '🤝';
    else if (message.includes('agent')) icon = '🤖';
    else if (message.includes('block')) icon = '🧱';
    else if (message.includes('transaction')) icon = '💰';

    return `${chalk.dim(timestamp)} ${formattedLevel} ${icon} ${formattedMessage}`;
  }

  shouldShowLog(logData) {
    // Apply filters
    if (this.options.level && logData.level !== this.options.level) {
      return false;
    }

    if (this.options.agent) {
      const message = logData.message || logData.raw || '';
      if (!message.toLowerCase().includes(this.options.agent.toLowerCase())) {
        return false;
      }
    }

    if (this.options.filter) {
      const message = logData.message || logData.raw || '';
      if (!message.toLowerCase().includes(this.options.filter.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  processLogLine(line) {
    if (!line.trim()) return;

    const logData = this.parseLogLine(line);
    this.stats.totalLogs++;

    if (logData.level === 'ERROR') {
      this.stats.errorCount++;
    }

    this.extractAgentInfo(logData);
    this.extractEventInfo(logData);

    if (this.shouldShowLog(logData)) {
      const formattedLine = this.formatLogLine(logData);
      
      if (this.options.interactive) {
        this.logBox.log(formattedLine);
      } else {
        console.log(formattedLine);
      }
    }

    // Update UI periodically
    if (this.stats.totalLogs % 10 === 0 && this.options.interactive) {
      this.updateStats();
      this.updateAgents();
      this.updateRecentEvents();
    }
  }

  showFilterDialog() {
    // Simple filter implementation for now
    // In a full implementation, this would show an interactive dialog
    console.log('Filter dialog would appear here');
  }

  showHelp() {
    const helpContent = `
🚀 C-Suite Parachain Log Viewer Help

KEYBOARD SHORTCUTS:
  q, Esc, Ctrl+C  - Quit
  f               - Set filter
  c               - Clear logs
  h               - Show this help
  ↑↓              - Scroll logs

COMMAND LINE OPTIONS:
  --file <path>   - Log file to monitor
  --filter <text> - Filter logs containing text
  --agent <name>  - Show logs for specific agent
  --level <level> - Show logs of specific level
  --no-follow     - Don't follow file changes
  --no-interactive - Disable interactive UI

EXAMPLES:
  npm run logs -- --agent Lyra
  npm run logs -- --level ERROR
  npm run logs -- --filter consensus
`;

    if (this.options.interactive) {
      const helpBox = blessed.box({
        top: 'center',
        left: 'center',
        width: '80%',
        height: '80%',
        content: helpContent,
        border: { type: 'line' },
        style: {
          border: { fg: 'cyan' },
          fg: 'white'
        },
        keys: true,
        mouse: true
      });

      this.screen.append(helpBox);
      helpBox.focus();
      
      helpBox.key(['escape', 'q'], () => {
        this.screen.remove(helpBox);
        this.screen.render();
      });

      this.screen.render();
    } else {
      console.log(helpContent);
    }
  }

  start() {
    const logPath = path.resolve(this.options.logFile);
    
    if (!fs.existsSync(logPath)) {
      console.error(chalk.red(`❌ Log file not found: ${logPath}`));
      process.exit(1);
    }

    console.log(chalk.green(`🚀 Starting log viewer for: ${logPath}`));
    
    if (this.options.interactive) {
      console.log(chalk.blue('📺 Interactive mode enabled. Press "h" for help.'));
    }

    // Read existing content if not following
    if (!this.options.follow) {
      const content = fs.readFileSync(logPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach(line => this.processLogLine(line));
      return;
    }

    // Start tailing the file
    const tail = new Tail(logPath, {
      follow: true,
      fromBeginning: false
    });

    tail.on('line', (line) => {
      this.processLogLine(line);
    });

    tail.on('error', (error) => {
      console.error(chalk.red('❌ Error reading log file:'), error);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      tail.unwatch();
      if (this.screen) {
        this.screen.destroy();
      }
      console.log(chalk.yellow('\n👋 Log viewer stopped'));
      process.exit(0);
    });
  }
}

// CLI setup
const program = new Command();

program
  .name('log-viewer')
  .description('Beautiful real-time log viewer for C-Suite Parachain')
  .version('1.0.0')
  .option('-f, --file <path>', 'log file to monitor', '../blockchain.log')
  .option('--filter <text>', 'filter logs containing text')
  .option('--agent <name>', 'show logs for specific agent')
  .option('--level <level>', 'show logs of specific level (ERROR, WARN, INFO, DEBUG, TRACE)')
  .option('--no-follow', 'don\'t follow file changes')
  .option('--no-interactive', 'disable interactive UI')
  .action((options) => {
    const viewer = new LogViewer(options);
    viewer.start();
  });

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
} 