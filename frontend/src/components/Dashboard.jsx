import { 
  BarChart3, 
  GitCommit, 
  GitMerge, 
  AlertOctagon, 
  CopyX, 
  Network 
} from 'lucide-react';
import TreeVisualizer from './TreeVisualizer';

export default function Dashboard({ result }) {
  if (!result) return null;

  const { summary, invalid_entries, duplicate_edges, hierarchies } = result;

  return (
    <div className="space-y-6">
      
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
            <GitMerge size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Trees</p>
            <p className="text-2xl font-bold text-slate-800">{summary.total_trees}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-lg">
            <Network size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Cycles</p>
            <p className="text-2xl font-bold text-slate-800">{summary.total_cycles}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Largest Tree Root</p>
            <p className="text-2xl font-bold text-slate-800">
              {summary.largest_tree_root || '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Invalids & Duplicates ── */}
        <div className="space-y-6 lg:col-span-1">
          {invalid_entries.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
              <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center gap-2">
                <AlertOctagon size={18} className="text-red-600" />
                <h3 className="font-semibold text-red-900">Invalid Entries</h3>
                <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {invalid_entries.length}
                </span>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {invalid_entries.map((entry, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 font-mono text-sm px-2.5 py-1 rounded border border-slate-200">
                      {entry === '' ? '"" (empty)' : entry}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {duplicate_edges.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden">
              <div className="bg-orange-50 border-b border-orange-200 px-4 py-3 flex items-center gap-2">
                <CopyX size={18} className="text-orange-600" />
                <h3 className="font-semibold text-orange-900">Duplicate Edges</h3>
                <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {duplicate_edges.length}
                </span>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {duplicate_edges.map((entry, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 font-mono text-sm px-2.5 py-1 rounded border border-slate-200">
                      {entry}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Hierarchies ── */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
            <GitCommit size={20} className="text-blue-500" />
            Detected Hierarchies
          </h2>
          
          {hierarchies.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              No valid hierarchies detected from the input.
            </div>
          ) : (
            hierarchies.map((h, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 font-medium">Root Node</span>
                    <span className="bg-slate-800 text-white font-bold w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">
                      {h.root}
                    </span>
                  </div>
                  
                  {h.has_cycle ? (
                    <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Cycle Detected
                    </span>
                  ) : (
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      Depth: {h.depth}
                    </span>
                  )}
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 overflow-x-auto">
                  <TreeVisualizer tree={h.tree} />
                  {h.has_cycle && Object.keys(h.tree).length === 0 && (
                     <div className="text-sm text-slate-500 italic">Pure cycle component. No tree structure.</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
