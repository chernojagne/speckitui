/**
 * Agent Configuration
 * Configuration for AI agent context files
 * Part of 005-ui-enhancements feature
 */

import type { AgentType, AgentConfig } from '@/types';

// Agent configurations
export const agentConfigs: Record<AgentType, AgentConfig> = {
  claude: {
    id: 'claude',
    name: 'Claude',
    fileName: 'CLAUDE.md',
    relativePath: '.github/agents/CLAUDE.md',
    startMarker: '<!-- CONTEXT_START -->',
    endMarker: '<!-- CONTEXT_END -->',
    description: 'Anthropic Claude AI assistant',
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    fileName: 'copilot-instructions.md',
    relativePath: '.github/copilot-instructions.md',
    startMarker: '<!-- CONTEXT_START -->',
    endMarker: '<!-- CONTEXT_END -->',
    description: 'GitHub Copilot instructions',
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    fileName: '.cursorrules',
    relativePath: '.cursorrules',
    startMarker: '# CONTEXT_START',
    endMarker: '# CONTEXT_END',
    description: 'Cursor AI editor rules',
  },
  custom: {
    id: 'custom',
    name: 'Custom Agent',
    fileName: 'agent-context.md',
    relativePath: '.specify/memory/agent-context.md',
    startMarker: '<!-- CONTEXT_START -->',
    endMarker: '<!-- CONTEXT_END -->',
    description: 'Custom agent context file',
  },
};

// Get agent config by ID
export function getAgentConfig(agentId: AgentType): AgentConfig {
  return agentConfigs[agentId];
}

// Get all agent configs as array
export function getAllAgentConfigs(): AgentConfig[] {
  return Object.values(agentConfigs);
}

// Default template for new agent context files
export function getDefaultAgentTemplate(config: AgentConfig): string {
  return `# ${config.name} Context

This file provides context to ${config.name} for this project.

${config.startMarker}
<!-- Context will be inserted here by SpeckitUI -->
${config.endMarker}

## Additional Instructions

Add any additional instructions for ${config.name} below.
`;
}
