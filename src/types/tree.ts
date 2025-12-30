// Message type
export interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: string;
  refs?: string[];
}

// Artifact (file)
export interface Artifact {
  id: string;
  name: string;
  url?: string;
  size?: number;
  source?: string;
  uploadedAt?: string;
}

// Tree node types
export type NodeType = 'theme' | 'subtopic' | 'topic';

// API node (flat structure from backend)
export interface ApiTreeNode {
  id: string;
  type: NodeType;
  label: string;
  icon: string;
  parentId: string | null;
  children: string[]; // IDs of child nodes
  hasMessages: boolean;
  dateCreated: string;
  dateModified: string;
  summary?: string;
  hasSummary?: boolean;
  hasArtifacts?: boolean;
  hasPrompt?: boolean;
}

// Tree index from API
export interface TreeIndex {
  version: string;
  lastModified: string;
  nodes: ApiTreeNode[];
}

// Tree node (full, with nested children for UI)
export interface TreeNode {
  id: string;
  label: string;
  icon: string;
  type?: NodeType;

  // Flags
  isDefault?: boolean;
  hasMessages?: boolean;
  hasSummary?: boolean;
  hasArtifacts?: boolean;
  hasPrompt?: boolean;

  // Dates
  dateCreated?: string;
  dateModified?: string;

  // Content (loaded on demand)
  messages: Message[];
  summary?: string;
  artifacts?: Artifact[];

  // Hierarchy
  parentId?: string | null;
  children?: TreeNode[];
  childIds?: string[]; // Original IDs from API

  // Settings
  prompt?: string;
}

// Tree state
export interface TreeState {
  tree: TreeNode[];
  selectedId: string | null;
  expanded: Record<string, boolean>;
  loading: boolean;
  error: string | null;
}

// Tree actions
export type TreeAction =
  | { type: 'SET_TREE'; payload: TreeNode[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SELECT_NODE'; payload: string | null }
  | { type: 'TOGGLE_EXPAND'; payload: string }
  | { type: 'SET_EXPANDED'; payload: Record<string, boolean> }
  | { type: 'ADD_NODE'; payload: { parentId: string | null; node: TreeNode } }
  | { type: 'UPDATE_NODE'; payload: { nodeId: string; updates: Partial<TreeNode> } }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'UPDATE_MESSAGES'; payload: { nodeId: string; messages: Message[] } };

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TreeResponse {
  tree: TreeNode[];
}

export interface NodeResponse {
  node: TreeNode;
}
