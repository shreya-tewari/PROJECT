/**
 * ProposalAgent
 * Specialized agent for complete Scope of Work (SOW) proposal generation & version snapshotting.
 */

import { runDeveloperMatchingNode } from '../nodes/DeveloperMatchingNode';
import { runHourEstimationNode } from '../nodes/HourEstimationNode';
import { runTimelineNode } from '../nodes/TimelineNode';
import { runCostEstimationNode } from '../nodes/CostEstimationNode';
import { runCloudPricingNode } from '../nodes/CloudPricingNode';
import { runApiPricingNode } from '../nodes/ApiPricingNode';
import { runProposalNode } from '../nodes/ProposalNode';
import { runSOWNode } from '../nodes/SOWNode';
import { saveCheckpoint } from '../services/checkpointService';

export function runProposalAgent(state) {
  let currentState = state;
  currentState = runDeveloperMatchingNode(currentState);
  currentState = runHourEstimationNode(currentState);
  currentState = runTimelineNode(currentState);
  currentState = runCostEstimationNode(currentState);
  currentState = runCloudPricingNode(currentState);
  currentState = runApiPricingNode(currentState);
  currentState = runProposalNode(currentState);
  currentState = runSOWNode(currentState);

  // Save proposal state version snapshot
  saveCheckpoint(currentState.proposal?.proposalId, currentState, "SOW Proposal Generated");

  return currentState;
}
