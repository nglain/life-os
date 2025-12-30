// import React from 'react';
import { useTree } from '@/context/TreeContext';
import { TreeRow } from './TreeRow';

interface TreeViewProps {
  searchQuery?: string;
  onAddChild?: (parentId: string) => void;
}

export function TreeView({ searchQuery = '', onAddChild }: TreeViewProps) {
  const { tree, loading, error } = useTree();

  // Ensure tree is always an array
  const treeArray = Array.isArray(tree) ? tree : [];

  // Filter tree based on search query
  const filteredTree = searchQuery
    ? treeArray.filter(node =>
        node.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : treeArray;

  if (loading) {
    return (
      <div className="tree-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tree-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Перезагрузить</button>
      </div>
    );
  }

  if (filteredTree.length === 0) {
    return (
      <div className="tree-empty">
        <p>Дерево пустое</p>
        <p className="tree-empty-hint">Создайте первую тему</p>
      </div>
    );
  }

  return (
    <div className="tree">
      {filteredTree.map((node) => (
        <TreeRow key={node.id} node={node} level={0} onAddChild={onAddChild} />
      ))}
    </div>
  );
}
