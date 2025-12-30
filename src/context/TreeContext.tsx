import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { TreeNode, TreeState, TreeAction, Message, ApiTreeNode } from '@/types/tree';
import { api } from '@/api/restClient';
import { socketOn, socketOff, socketEmit, getSocket } from '@/api/socketClient';

// Convert flat API nodes to nested tree structure
function buildTreeFromFlat(flatNodes: ApiTreeNode[]): TreeNode[] {
  // Create a map for quick lookup
  const nodeMap = new Map<string, TreeNode>();

  // First pass: create TreeNode objects
  flatNodes.forEach(apiNode => {
    nodeMap.set(apiNode.id, {
      id: apiNode.id,
      label: apiNode.label,
      icon: apiNode.icon,
      type: apiNode.type,
      parentId: apiNode.parentId,
      childIds: apiNode.children,
      hasMessages: apiNode.hasMessages,
      hasSummary: apiNode.hasSummary,
      hasArtifacts: apiNode.hasArtifacts,
      hasPrompt: apiNode.hasPrompt,
      dateCreated: apiNode.dateCreated,
      dateModified: apiNode.dateModified,
      summary: apiNode.summary,
      messages: [],
      children: [],
    });
  });

  // Second pass: build hierarchy
  const rootNodes: TreeNode[] = [];

  nodeMap.forEach(node => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  // Sort children by dateModified (newest first) or by original order
  const sortChildren = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        // Sort by original childIds order if available
        if (node.childIds && node.childIds.length > 0) {
          node.children.sort((a, b) => {
            const aIdx = node.childIds!.indexOf(a.id);
            const bIdx = node.childIds!.indexOf(b.id);
            return aIdx - bIdx;
          });
        }
        sortChildren(node.children);
      }
    });
  };

  sortChildren(rootNodes);

  return rootNodes;
}

// Initial state
const initialState: TreeState = {
  tree: [],
  selectedId: null,
  expanded: {},
  loading: false,
  error: null,
};

// Reducer
function treeReducer(state: TreeState, action: TreeAction): TreeState {
  switch (action.type) {
    case 'SET_TREE':
      return { ...state, tree: action.payload, loading: false, error: null };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SELECT_NODE':
      return { ...state, selectedId: action.payload };

    case 'TOGGLE_EXPAND':
      return {
        ...state,
        expanded: {
          ...state.expanded,
          [action.payload]: !state.expanded[action.payload],
        },
      };

    case 'SET_EXPANDED':
      return { ...state, expanded: action.payload };

    case 'ADD_NODE': {
      const { parentId, node } = action.payload;
      if (!parentId) {
        // Add to root level
        return { ...state, tree: [...state.tree, node] };
      }
      // Add to parent's children
      return {
        ...state,
        tree: addNodeToTree(state.tree, parentId, node),
      };
    }

    case 'UPDATE_NODE': {
      const { nodeId, updates } = action.payload;
      return {
        ...state,
        tree: updateNodeInTree(state.tree, nodeId, updates),
      };
    }

    case 'DELETE_NODE':
      return {
        ...state,
        tree: deleteNodeFromTree(state.tree, action.payload),
        selectedId: state.selectedId === action.payload ? null : state.selectedId,
      };

    case 'UPDATE_MESSAGES': {
      const { nodeId, messages } = action.payload;
      return {
        ...state,
        tree: updateNodeInTree(state.tree, nodeId, { messages }),
      };
    }

    default:
      return state;
  }
}

// Helper functions for tree manipulation
function addNodeToTree(tree: TreeNode[], parentId: string, node: TreeNode): TreeNode[] {
  return tree.map(n => {
    if (n.id === parentId) {
      return { ...n, children: [...(n.children || []), node] };
    }
    if (n.children) {
      return { ...n, children: addNodeToTree(n.children, parentId, node) };
    }
    return n;
  });
}

function updateNodeInTree(tree: TreeNode[], nodeId: string, updates: Partial<TreeNode>): TreeNode[] {
  return tree.map(n => {
    if (n.id === nodeId) {
      return { ...n, ...updates };
    }
    if (n.children) {
      return { ...n, children: updateNodeInTree(n.children, nodeId, updates) };
    }
    return n;
  });
}

function deleteNodeFromTree(tree: TreeNode[], nodeId: string): TreeNode[] {
  return tree
    .filter(n => n.id !== nodeId)
    .map(n => {
      if (n.children) {
        return { ...n, children: deleteNodeFromTree(n.children, nodeId) };
      }
      return n;
    });
}

// Find node by ID
function findNodeById(tree: TreeNode[], nodeId: string): TreeNode | null {
  for (const node of tree) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findNodeById(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

// Context type
interface TreeContextType extends TreeState {
  dispatch: React.Dispatch<TreeAction>;
  loadTree: () => Promise<void>;
  selectNode: (nodeId: string | null) => void;
  toggleExpand: (nodeId: string) => void;
  createNode: (node: Partial<TreeNode>) => Promise<void>;
  updateNode: (nodeId: string, updates: Partial<TreeNode>) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  saveMessages: (nodeId: string, messages: Message[]) => Promise<void>;
  getSelectedNode: () => TreeNode | null;
  findNode: (nodeId: string) => TreeNode | null;
}

const TreeContext = createContext<TreeContextType | null>(null);

// Provider component
export function TreeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(treeReducer, initialState);

  // Load tree from API
  const loadTree = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    const result = await api.getTree();
    console.log('API getTree result:', result);
    console.log('result.data:', result.data);
    console.log('result.data.tree:', (result.data as any)?.tree);
    console.log('result.data.tree?.nodes:', (result.data as any)?.tree?.nodes);

    if (result.success && result.data) {
      // API format: { success: true, tree: { version, lastModified, nodes: [...] } }
      // restClient wraps as: { success: true, data: <api_response> }
      // So actual API response may have: data.success, data.tree.nodes
      const responseData = result.data as any;
      let flatNodes: ApiTreeNode[] = [];

      // Try different paths to find nodes
      if (responseData.tree?.nodes) {
        console.log('Found at: responseData.tree.nodes');
        flatNodes = responseData.tree.nodes;
      } else if (responseData.success && responseData.tree?.nodes) {
        console.log('Found at: responseData.tree.nodes (with success)');
        flatNodes = responseData.tree.nodes;
      } else if (Array.isArray(responseData.nodes)) {
        console.log('Found at: responseData.nodes');
        flatNodes = responseData.nodes;
      } else if (Array.isArray(responseData)) {
        console.log('Found at: responseData (array)');
        flatNodes = responseData;
      } else {
        console.log('Could not find nodes. Keys:', Object.keys(responseData));
      }

      console.log('Flat nodes from API:', flatNodes);

      // Build nested tree from flat nodes
      const treeData = buildTreeFromFlat(flatNodes);
      console.log('Built tree:', treeData);

      dispatch({ type: 'SET_TREE', payload: treeData });

      // Auto-expand first level
      const expanded: Record<string, boolean> = {};
      treeData.forEach((node: TreeNode) => {
        expanded[node.id] = true;
      });
      dispatch({ type: 'SET_EXPANDED', payload: expanded });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to load tree' });
    }
  }, []);

  // Select node
  const selectNode = useCallback((nodeId: string | null) => {
    dispatch({ type: 'SELECT_NODE', payload: nodeId });
    if (nodeId) {
      socketEmit.selectNode(nodeId);
    }
  }, []);

  // Toggle expand
  const toggleExpand = useCallback((nodeId: string) => {
    dispatch({ type: 'TOGGLE_EXPAND', payload: nodeId });
  }, []);

  // Create node
  const createNode = useCallback(async (node: Partial<TreeNode>) => {
    const result = await api.createNode(node);
    if (result.success && result.data) {
      dispatch({
        type: 'ADD_NODE',
        payload: { parentId: node.parentId || null, node: result.data.node },
      });
    }
  }, []);

  // Update node
  const updateNode = useCallback(async (nodeId: string, updates: Partial<TreeNode>) => {
    const result = await api.createNode({ id: nodeId, ...updates });
    if (result.success) {
      dispatch({ type: 'UPDATE_NODE', payload: { nodeId, updates } });
    }
  }, []);

  // Delete node
  const deleteNode = useCallback(async (nodeId: string) => {
    const result = await api.deleteNode(nodeId);
    if (result.success) {
      dispatch({ type: 'DELETE_NODE', payload: nodeId });
    }
  }, []);

  // Save messages
  const saveMessages = useCallback(async (nodeId: string, messages: Message[]) => {
    const result = await api.saveMessages(nodeId, messages);
    if (result.success) {
      dispatch({ type: 'UPDATE_MESSAGES', payload: { nodeId, messages } });
    }
  }, []);

  // Get selected node
  const getSelectedNode = useCallback(() => {
    if (!state.selectedId) return null;
    return findNodeById(state.tree, state.selectedId);
  }, [state.selectedId, state.tree]);

  // Find node
  const findNode = useCallback((nodeId: string) => {
    return findNodeById(state.tree, nodeId);
  }, [state.tree]);

  // Setup socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Listen for real-time updates
    socketOn.treeLoaded((data) => {
      dispatch({ type: 'SET_TREE', payload: data.tree });
    });

    socketOn.nodeCreated((data) => {
      dispatch({
        type: 'ADD_NODE',
        payload: { parentId: data.node.parentId || null, node: data.node },
      });
    });

    socketOn.nodeUpdated((data) => {
      dispatch({
        type: 'UPDATE_NODE',
        payload: { nodeId: data.node.id, updates: data.node },
      });
    });

    socketOn.nodeDeleted((data) => {
      dispatch({ type: 'DELETE_NODE', payload: data.nodeId });
    });

    socketOn.error((data) => {
      dispatch({ type: 'SET_ERROR', payload: data.message });
    });

    return () => {
      socketOff.treeLoaded();
      socketOff.nodeCreated();
      socketOff.nodeUpdated();
      socketOff.nodeDeleted();
      socketOff.error();
    };
  }, []);

  const value: TreeContextType = {
    ...state,
    dispatch,
    loadTree,
    selectNode,
    toggleExpand,
    createNode,
    updateNode,
    deleteNode,
    saveMessages,
    getSelectedNode,
    findNode,
  };

  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
}

// Hook to use tree context
export function useTree() {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
}
