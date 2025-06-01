// ----------------------------------------------------------------------------
//  File:        consensus-replay.js
//  Project:     Celaya Solutions (C-Suite Blockchain)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Interactive consensus replay viewer with IPFS integration
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import chalk from 'chalk';
import { Command } from 'commander';
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

// Mock IPFS integration (in production, this would connect to real IPFS)
class IPFSMockClient {
  constructor() {
    this.consensusEvents = [];
    this.loadMockData();
  }

  loadMockData() {
    // Simulate consensus events stored in IPFS DAG
    this.consensusEvents = [
      {
        id: 'QmV1X2Y3Z...',
        timestamp: moment().subtract(10, 'minutes').toISOString(),
        type: 'consensus_proposal',
        proposer: 'Lyra',
        proposal: {
          action: 'approve_budget',
          data: { amount: 50000, department: 'engineering' }
        },
        participants: ['Lyra', 'Echo', 'Volt', 'Nexus'],
        votes: [
          { agent: 'Lyra', vote: 'approve', timestamp: moment().subtract(9, 'minutes').toISOString() },
          { agent: 'Echo', vote: 'approve', timestamp: moment().subtract(8, 'minutes').toISOString() },
          { agent: 'Volt', vote: 'approve', timestamp: moment().subtract(7, 'minutes').toISOString() },
          { agent: 'Nexus', vote: 'approve', timestamp: moment().subtract(6, 'minutes').toISOString() }
        ],
        status: 'approved',
        links: ['QmABC123...', 'QmDEF456...']
      },
      {
        id: 'QmA4B5C6...',
        timestamp: moment().subtract(5, 'minutes').toISOString(),
        type: 'consensus_proposal',
        proposer: 'Echo',
        proposal: {
          action: 'deploy_contract',
          data: { contract: 'reputation_v2', network: 'parachain' }
        },
        participants: ['Echo', 'Volt', 'Sage', 'Iris'],
        votes: [
          { agent: 'Echo', vote: 'approve', timestamp: moment().subtract(4, 'minutes').toISOString() },
          { agent: 'Volt', vote: 'approve', timestamp: moment().subtract(3, 'minutes').toISOString() },
          { agent: 'Sage', vote: 'reject', timestamp: moment().subtract(2, 'minutes').toISOString() },
          { agent: 'Iris', vote: 'approve', timestamp: moment().subtract(1, 'minutes').toISOString() }
        ],
        status: 'approved',
        links: ['QmGHI789...']
      },
      {
        id: 'QmZ9Y8X7...',
        timestamp: moment().subtract(2, 'minutes').toISOString(),
        type: 'agent_status_change',
        agent: 'Volt',
        old_status: 'online',
        new_status: 'maintenance',
        reason: 'scheduled_update',
        approved_by: ['Lyra', 'Echo'],
        status: 'completed'
      }
    ];
  }

  async getConsensusEvents() {
    // Simulate async IPFS query
    return new Promise(resolve => {
      setTimeout(() => resolve(this.consensusEvents), 100);
    });
  }

  async getEventDetails(eventId) {
    const event = this.consensusEvents.find(e => e.id === eventId);
    return event || null;
  }
}

class ConsensusReplayViewer {
  constructor(options = {}) {
    this.options = {
      ipfsEndpoint: options.ipfsEndpoint || 'http://localhost:5001',
      interactive: options.interactive !== false,
      ...options
    };
    
    this.ipfs = new IPFSMockClient();
    this.events = [];
    this.currentEventIndex = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1;
    
    if (this.options.interactive) {
      this.setupUI();
    }
  }

  setupUI() {
    // Create blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'C-Suite Consensus Replay Viewer'
    });

    // Create grid layout
    this.grid = new contrib.grid({
      rows: 12,
      cols: 12,
      screen: this.screen
    });

    // Header
    this.headerBox = this.grid.set(0, 0, 2, 12, blessed.box, {
      label: ' Consensus Replay Viewer ',
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        label: { fg: 'white', bold: true }
      }
    });

    // Event timeline
    this.timelineBox = this.grid.set(2, 0, 2, 12, blessed.box, {
      label: ' Event Timeline ',
      border: { type: 'line' },
      style: {
        border: { fg: 'green' },
        label: { fg: 'green' }
      }
    });

    // Current event details
    this.detailsBox = this.grid.set(4, 0, 4, 8, blessed.box, {
      label: ' Event Details ',
      border: { type: 'line' },
      style: {
        border: { fg: 'yellow' },
        label: { fg: 'yellow' }
      },
      scrollable: true,
      alwaysScroll: true
    });

    // Participants panel
    this.participantsBox = this.grid.set(4, 8, 4, 4, blessed.box, {
      label: ' Participants ',
      border: { type: 'line' },
      style: {
        border: { fg: 'magenta' },
        label: { fg: 'magenta' }
      }
    });

    // Controls
    this.controlsBox = this.grid.set(8, 0, 3, 12, blessed.box, {
      label: ' Playback Controls ',
      border: { type: 'line' },
      style: {
        border: { fg: 'blue' },
        label: { fg: 'blue' }
      }
    });

    // Help panel
    this.helpBox = this.grid.set(11, 0, 1, 12, blessed.box, {
      content: ' [Space] play/pause | [←/→] navigate | [↑/↓] speed | [r]eset | [q]uit ',
      style: {
        fg: 'white',
        bg: 'blue'
      }
    });

    // Key bindings
    this.screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });

    this.screen.key(['space'], () => {
      this.togglePlayback();
    });

    this.screen.key(['left'], () => {
      this.previousEvent();
    });

    this.screen.key(['right'], () => {
      this.nextEvent();
    });

    this.screen.key(['up'], () => {
      this.increaseSpeed();
    });

    this.screen.key(['down'], () => {
      this.decreaseSpeed();
    });

    this.screen.key(['r'], () => {
      this.reset();
    });

    this.screen.render();
    this.updateHeader();
  }

  updateHeader() {
    const title = figlet.textSync('Consensus Replay', { 
      font: 'Small',
      horizontalLayout: 'fitted'
    });
    
    const gradientTitle = gradient.rainbow(title);
    const info = `
${gradientTitle}

🔄 Interactive Consensus Event Replay
📊 Events: ${this.events.length}
⏯️  Status: ${this.isPlaying ? 'Playing' : 'Paused'}
⚡ Speed: ${this.playbackSpeed}x
📍 Position: ${this.currentEventIndex + 1}/${this.events.length}
`;

    this.headerBox.setContent(info);
    this.screen.render();
  }

  updateTimeline() {
    if (!this.events.length) return;

    let timeline = '';
    const maxWidth = 100;
    const eventSpacing = Math.max(1, Math.floor(maxWidth / this.events.length));
    
    for (let i = 0; i < this.events.length; i++) {
      const event = this.events[i];
      const isCurrent = i === this.currentEventIndex;
      const isPast = i < this.currentEventIndex;
      
      let marker = '○';
      let color = chalk.gray;
      
      if (isCurrent) {
        marker = '●';
        color = chalk.yellow.bold;
      } else if (isPast) {
        marker = '●';
        color = chalk.green;
      }
      
      const timeStr = moment(event.timestamp).format('HH:mm');
      timeline += color(`${marker} ${timeStr}`).padEnd(eventSpacing);
    }
    
    this.timelineBox.setContent(timeline);
    this.screen.render();
  }

  updateEventDetails() {
    if (!this.events.length || this.currentEventIndex >= this.events.length) return;

    const event = this.events[this.currentEventIndex];
    let details = '';

    details += chalk.cyan.bold('Event ID: ') + event.id + '\n';
    details += chalk.cyan.bold('Timestamp: ') + moment(event.timestamp).format('YYYY-MM-DD HH:mm:ss') + '\n';
    details += chalk.cyan.bold('Type: ') + event.type + '\n\n';

    if (event.type === 'consensus_proposal') {
      details += chalk.yellow.bold('=== PROPOSAL ===') + '\n';
      details += chalk.white('Proposer: ') + chalk.magenta(event.proposer) + '\n';
      details += chalk.white('Action: ') + event.proposal.action + '\n';
      details += chalk.white('Data: ') + JSON.stringify(event.proposal.data, null, 2) + '\n\n';

      details += chalk.yellow.bold('=== VOTING ===') + '\n';
      event.votes.forEach(vote => {
        const voteColor = vote.vote === 'approve' ? chalk.green : chalk.red;
        const time = moment(vote.timestamp).format('HH:mm:ss');
        details += `${voteColor(vote.vote.toUpperCase())} ${chalk.magenta(vote.agent)} at ${time}\n`;
      });

      details += '\n' + chalk.yellow.bold('Status: ') + 
        (event.status === 'approved' ? chalk.green(event.status.toUpperCase()) : chalk.red(event.status.toUpperCase()));
    } else if (event.type === 'agent_status_change') {
      details += chalk.yellow.bold('=== STATUS CHANGE ===') + '\n';
      details += chalk.white('Agent: ') + chalk.magenta(event.agent) + '\n';
      details += chalk.white('From: ') + chalk.gray(event.old_status) + '\n';
      details += chalk.white('To: ') + chalk.cyan(event.new_status) + '\n';
      details += chalk.white('Reason: ') + event.reason + '\n';
      if (event.approved_by) {
        details += chalk.white('Approved by: ') + event.approved_by.map(a => chalk.magenta(a)).join(', ') + '\n';
      }
    }

    if (event.links && event.links.length > 0) {
      details += '\n' + chalk.blue.bold('=== IPFS LINKS ===') + '\n';
      event.links.forEach(link => {
        details += chalk.blue(link) + '\n';
      });
    }

    this.detailsBox.setContent(details);
    this.screen.render();
  }

  updateParticipants() {
    if (!this.events.length || this.currentEventIndex >= this.events.length) return;

    const event = this.events[this.currentEventIndex];
    let participants = '';

    if (event.participants) {
      participants += chalk.cyan.bold('Participants:\n\n');
      event.participants.forEach(participant => {
        const hasVoted = event.votes && event.votes.find(v => v.agent === participant);
        const status = hasVoted ? 
          (hasVoted.vote === 'approve' ? chalk.green('✓ Approved') : chalk.red('✗ Rejected')) :
          chalk.gray('⏳ Pending');
        
        participants += `${chalk.magenta(participant)}\n${status}\n\n`;
      });
    } else if (event.agent) {
      participants += chalk.cyan.bold('Agent:\n\n');
      participants += chalk.magenta(event.agent) + '\n';
    }

    this.participantsBox.setContent(participants);
    this.screen.render();
  }

  updateControls() {
    const controls = `
⏯️  Playback: ${this.isPlaying ? chalk.green('Playing') : chalk.yellow('Paused')}
⚡ Speed: ${this.playbackSpeed}x
📍 Event: ${this.currentEventIndex + 1} / ${this.events.length}

${chalk.cyan('Controls:')}
• Space: Play/Pause
• ← →: Navigate events
• ↑ ↓: Adjust speed
• R: Reset to beginning
• Q: Quit
`;

    this.controlsBox.setContent(controls);
    this.screen.render();
  }

  updateUI() {
    if (!this.options.interactive) return;
    
    this.updateHeader();
    this.updateTimeline();
    this.updateEventDetails();
    this.updateParticipants();
    this.updateControls();
  }

  togglePlayback() {
    this.isPlaying = !this.isPlaying;
    
    if (this.isPlaying) {
      this.play();
    } else {
      this.pause();
    }
    
    this.updateUI();
  }

  play() {
    if (this.playInterval) clearInterval(this.playInterval);
    
    const intervalTime = 2000 / this.playbackSpeed; // Base 2 seconds per event
    
    this.playInterval = setInterval(() => {
      if (this.currentEventIndex < this.events.length - 1) {
        this.nextEvent();
      } else {
        this.pause();
      }
    }, intervalTime);
  }

  pause() {
    this.isPlaying = false;
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
  }

  nextEvent() {
    if (this.currentEventIndex < this.events.length - 1) {
      this.currentEventIndex++;
      this.updateUI();
    }
  }

  previousEvent() {
    if (this.currentEventIndex > 0) {
      this.currentEventIndex--;
      this.updateUI();
    }
  }

  increaseSpeed() {
    this.playbackSpeed = Math.min(this.playbackSpeed * 2, 8);
    if (this.isPlaying) {
      this.play(); // Restart with new speed
    }
    this.updateUI();
  }

  decreaseSpeed() {
    this.playbackSpeed = Math.max(this.playbackSpeed / 2, 0.25);
    if (this.isPlaying) {
      this.play(); // Restart with new speed
    }
    this.updateUI();
  }

  reset() {
    this.pause();
    this.currentEventIndex = 0;
    this.updateUI();
  }

  async loadEvents() {
    console.log(chalk.blue('🔄 Loading consensus events from IPFS...'));
    
    try {
      this.events = await this.ipfs.getConsensusEvents();
      console.log(chalk.green(`✅ Loaded ${this.events.length} consensus events`));
      
      if (this.options.interactive) {
        this.updateUI();
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to load events:'), error);
    }
  }

  async exportEvents(format = 'json') {
    const filename = `consensus_events_${moment().format('YYYY-MM-DD_HH-mm-ss')}.${format}`;
    
    if (format === 'json') {
      fs.writeFileSync(filename, JSON.stringify(this.events, null, 2));
    } else if (format === 'csv') {
      // Simple CSV export
      let csv = 'ID,Timestamp,Type,Status,Participants\n';
      this.events.forEach(event => {
        const participants = event.participants ? event.participants.join(';') : event.agent || '';
        csv += `${event.id},${event.timestamp},${event.type},${event.status || ''},${participants}\n`;
      });
      fs.writeFileSync(filename, csv);
    }
    
    console.log(chalk.green(`📄 Events exported to ${filename}`));
  }

  printSummary() {
    console.log(chalk.cyan.bold('\n=== CONSENSUS EVENTS SUMMARY ===\n'));
    
    const proposalEvents = this.events.filter(e => e.type === 'consensus_proposal');
    const statusEvents = this.events.filter(e => e.type === 'agent_status_change');
    
    console.log(`📊 Total Events: ${this.events.length}`);
    console.log(`🗳️  Proposals: ${proposalEvents.length}`);
    console.log(`🔄 Status Changes: ${statusEvents.length}`);
    
    if (proposalEvents.length > 0) {
      const approved = proposalEvents.filter(e => e.status === 'approved').length;
      const rejected = proposalEvents.filter(e => e.status === 'rejected').length;
      
      console.log(`✅ Approved: ${approved}`);
      console.log(`❌ Rejected: ${rejected}`);
    }
    
    console.log('\n' + chalk.yellow.bold('Recent Events:'));
    this.events.slice(-5).forEach(event => {
      const time = moment(event.timestamp).format('HH:mm:ss');
      const status = event.status ? `[${event.status}]` : '';
      console.log(`  ${time} ${chalk.cyan(event.type)} ${status}`);
    });
  }

  async start() {
    await this.loadEvents();
    
    if (!this.options.interactive) {
      this.printSummary();
      return;
    }
    
    console.log(chalk.green('🚀 Starting interactive consensus replay viewer...'));
    console.log(chalk.blue('📺 Use arrow keys to navigate, space to play/pause, "h" for help.'));
    
    // Initial UI update
    this.updateUI();
  }
}

// CLI setup
const program = new Command();

program
  .name('consensus-replay')
  .description('Interactive consensus replay viewer with IPFS integration')
  .version('1.0.0')
  .option('--ipfs-endpoint <url>', 'IPFS API endpoint', 'http://localhost:5001')
  .option('--no-interactive', 'disable interactive UI (summary only)')
  .option('--export <format>', 'export events to file (json|csv)')
  .action(async (options) => {
    const viewer = new ConsensusReplayViewer(options);
    await viewer.start();
    
    if (options.export) {
      await viewer.exportEvents(options.export);
    }
  });

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}

export default ConsensusReplayViewer; 