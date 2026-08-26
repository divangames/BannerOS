import type { WorkspaceRef } from "@banneros/common";

export interface WorkspaceDraft { name: string; root: string; }

export function createWorkspaceRef(draft: WorkspaceDraft): WorkspaceRef {
  const name = draft.name.trim();
  if (!name) throw new Error("Workspace name is required");
  if (!draft.root.trim()) throw new Error("Workspace root is required");
  return { id: crypto.randomUUID(), name, root: draft.root.trim() };
}
