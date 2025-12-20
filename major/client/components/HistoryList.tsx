import { useState } from "react";
import { AnalysisResponse } from "@/lib/api";
import { AlertCircle, CheckCircle2, Calendar, Trash2, Clock, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryListProps {
  history: any[];
  onSelect?: (item: any) => void;
  onRemove?: (id: string) => void;
}

export function HistoryList({ history, onSelect, onRemove }: HistoryListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Pagination Calculations
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = history.slice(startIndex, startIndex + itemsPerPage);

  if (history.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No analysis history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900">Recent Analyses</h3>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {startIndex + 1}-{Math.min(startIndex + itemsPerPage, history.length)} of {history.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {currentItems.map((item) => {
          // Fix for data mapping: Ensure we access the nested 'analysis' object correctly
          const analysisData = item.analysis?.analysis || item.analysis;
          const isPneumonia = analysisData?.diagnosis === "PNEUMONIA";
          const confidence = analysisData?.confidence || 0;
          const date = item.analysis?.timestamp || item.timestamp;

          return (
            <div 
              key={item.id || item.filename} 
              className="group bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isPneumonia ? (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-bold text-red-600">PNEUMONIA</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-bold text-green-600">NORMAL</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="font-semibold text-gray-900 truncate text-sm mb-1">
                      {item.imageName || item.filename}
                    </p>
                    
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {date ? new Date(date).toLocaleDateString() : "Pending"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {date ? new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={cn(
                      "px-3 py-1 rounded-lg text-sm font-black",
                      isPneumonia ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                    )}>
                      {(confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => onSelect?.(item)}
                    className="flex-1 bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-3 h-3" />
                    View Details
                  </button>
                  
                  {onRemove && (
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aesthetic Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full border border-gray-200 disabled:opacity-20 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <span className="text-xs font-black text-gray-400">
            PAGE {currentPage} OF {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full border border-gray-200 disabled:opacity-20 hover:bg-gray-50 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}