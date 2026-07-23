/**
 * Checkpoint & Long-Term Memory Service
 * Manages proposal state versioning, persistence, and session checkpoints.
 */

const CHECKPOINT_STORAGE_KEY = "proposalai_state_checkpoints";

export function saveCheckpoint(proposalId, state, versionNotes = "") {
  try {
    const checkpoints = loadAllCheckpoints();
    const pid = proposalId || state.proposal?.proposalId || "PROP-DEFAULT";
    const existingVersions = checkpoints[pid] || [];
    const newVersionNum = existingVersions.length + 1;
    const versionId = `${pid}_v${newVersionNum}`;

    const newCheckpoint = {
      versionId,
      proposalId: pid,
      versionNumber: newVersionNum,
      timestamp: new Date().toISOString(),
      versionNotes: versionNotes || `Version ${newVersionNum} snapshot`,
      stateSnapshot: JSON.parse(JSON.stringify(state)),
    };

    checkpoints[pid] = [...existingVersions, newCheckpoint];
    localStorage.setItem(CHECKPOINT_STORAGE_KEY, JSON.stringify(checkpoints));
    return newCheckpoint;
  } catch (e) {
    console.warn("Failed to save checkpoint to localStorage:", e);
    return null;
  }
}

export function loadAllCheckpoints() {
  try {
    const raw = localStorage.getItem(CHECKPOINT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function getProposalVersions(proposalId) {
  const checkpoints = loadAllCheckpoints();
  return checkpoints[proposalId] || [];
}

export function restoreCheckpoint(proposalId, versionNumber) {
  const versions = getProposalVersions(proposalId);
  const found = versions.find(v => v.versionNumber === versionNumber);
  return found ? found.stateSnapshot : null;
}
