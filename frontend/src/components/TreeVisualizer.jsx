// Recursive component to render the tree with proper indentation and connecting lines
import { Network } from 'lucide-react';

export default function TreeVisualizer({ tree, depth = 0 }) {
  const nodes = Object.keys(tree);

  if (nodes.length === 0) return null;

  return (
    <ul className={`relative ${depth > 0 ? 'ml-4 pl-4 border-l-2 border-slate-100' : ''}`}>
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        const hasChildren = Object.keys(tree[node]).length > 0;

        return (
          <li key={node} className="relative py-1">
            {/* Horizontal connecting line for children */}
            {depth > 0 && (
              <div className="absolute left-[-16px] top-[14px] w-4 h-0.5 bg-slate-100"></div>
            )}
            
            <div className="flex items-center gap-2">
              <span className={`flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold shadow-sm ${
                depth === 0 
                  ? 'bg-blue-600 text-white' 
                  : hasChildren 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-slate-100 text-slate-600'
              }`}>
                {node}
              </span>
            </div>
            
            {hasChildren && (
              <TreeVisualizer tree={tree[node]} depth={depth + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
