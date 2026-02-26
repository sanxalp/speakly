"use client";

import { Task, updateTaskStatus, delayTask, deleteTask } from "@/app/actions/tasks";
import { format, isPast, parseISO, addDays } from "date-fns";
import { Calendar, CheckCircle2, Circle, Clock, MoreVertical, XCircle, Trash2 } from "lucide-react";
import { useState } from "react";

export default function TaskList({ tasks, onTaskUpdate }: { tasks: Task[], onTaskUpdate: () => void }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, currentStatus: string, newStatus: Task["status"]) => {
    if (currentStatus === newStatus) return;
    setLoadingId(id);
    try {
      await updateTaskStatus(id, newStatus);
      onTaskUpdate();
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelay = async (task: Task) => {
    setLoadingId(task.id);
    try {
      // Delay by pushing due date 1 day into the future from current date or its existing due date
      const baseDate = task.due_date ? parseISO(task.due_date) : new Date();
      // If the base date is in the past, push it 1 day from NOW. If in future, push 1 day from IT.
      const dateToPushFrom = isPast(baseDate) ? new Date() : baseDate;
      const newDate = addDays(dateToPushFrom, 1).toISOString();
      
      await delayTask(task.id, task.delay_count, newDate);
      onTaskUpdate();
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this task?")) return;
    setLoadingId(id);
    try {
      await deleteTask(id);
      onTaskUpdate();
    } finally {
      setLoadingId(null);
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center p-8 md:p-16 bg-[#242424] border border-[#333333] rounded flex flex-col items-center">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mb-4 md:mb-6">
          <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-[#d4af37]/50" />
        </div>
        <h3 className="text-lg md:text-xl font-light text-[#f5f5f5] mb-2 md:mb-3">All caught up</h3>
        <p className="text-[#a8a8a8] font-light text-sm md:text-base">Use the microphone to add a new task.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {tasks.map((task) => {
        const isCompleted = task.status === "COMPLETED";
        const isCancelled = task.status === "CANCELLED";
        const hasDueDate = !!task.due_date;
        const isOverdue = hasDueDate && task.status === "PENDING" && isPast(parseISO(task.due_date!));

        return (
          <div 
            key={task.id} 
            className={`p-4 md:p-6 rounded border transition-all group ${
              isCompleted ? "bg-[#8b9f85]/5 border-[#8b9f85]/20" :
              isCancelled ? "bg-[#242424]/60 border-[#333333] opacity-60" :
              isOverdue ? "bg-[#c9a961]/5 border-[#c9a961]/30" :
              "bg-[#1a1a1a] border-[#333333] hover:border-[#444444]"
            }`}
          >
            <div className="flex items-start gap-3 md:gap-4">
              
              {/* Checkbox */}
              <button 
                disabled={loadingId === task.id || isCancelled}
                onClick={() => handleStatusChange(task.id, task.status, isCompleted ? "PENDING" : "COMPLETED")}
                className="mt-1 flex-shrink-0 focus:outline-none disabled:opacity-50 touch-target"
              >
                {isCompleted ? (
                   <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#8b9f85]" />
                ) : (
                   <Circle className="w-5 h-5 md:w-6 md:h-6 text-[#707070] group-hover:text-[#d4af37] transition-colors" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm md:text-base font-light truncate ${isCompleted || isCancelled ? "text-[#707070] line-through" : "text-[#f5f5f5]"}`}>
                  {task.title}
                </h4>
                
                {task.description && (
                  <p className={`mt-2 text-xs md:text-sm leading-relaxed font-light ${isCompleted || isCancelled ? "text-[#707070]" : "text-[#a8a8a8]"}`}>
                    {task.description}
                  </p>
                )}
                
                {/* Meta info row */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3 md:mt-4 text-xs font-light">
                  {hasDueDate && (
                    <span className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded ${
                        isCompleted ? "bg-[#242424] text-[#707070]" :
                        isOverdue ? "bg-[#c9a961]/10 text-[#d9b875] border border-[#c9a961]/30" :
                        "bg-[#242424] text-[#a8a8a8] border border-[#333333]"
                    }`}>
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="hidden md:inline">{format(parseISO(task.due_date!), "MMM d, h:mm a")}</span>
                      <span className="md:hidden">{format(parseISO(task.due_date!), "MMM d")}</span>
                      {isOverdue && !isCompleted && <span className="hidden md:inline"> (OD)</span>}
                    </span>
                  )}
                  
                  {task.delay_count > 0 && (
                    <span className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded bg-[#7a9daa]/10 text-[#8db3c5] border border-[#7a9daa]/30 font-light text-xs">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="hidden md:inline">Delayed {task.delay_count}x</span>
                      <span className="md:hidden">{task.delay_count}x</span>
                    </span>
                  )}

                  {task.status === "CANCELLED" && (
                      <span className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded bg-[#a8736b]/10 text-[#c9a8a0] border border-[#a8736b]/30 font-light text-xs">
                          <XCircle className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" /> <span className="hidden md:inline">Cancelled</span>
                      </span>
                  )}
                </div>
              </div>

              {/* Actions Dropdown / Buttons */}
              {!isCompleted && !isCancelled && (
                 <div className="flex items-center gap-1 md:gap-2 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity flex-shrink-0">
                    <button 
                        onClick={() => handleDelay(task)}
                        disabled={loadingId === task.id}
                        title="Delay (Push back 1 day)"
                        className="p-1.5 md:p-2 text-[#a8a8a8] hover:text-[#7a9daa] hover:bg-[#7a9daa]/10 rounded transition-all duration-200 cursor-pointer touch-target"
                    >
                        <Clock className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleStatusChange(task.id, task.status, "CANCELLED")}
                        disabled={loadingId === task.id}
                        title="Cancel task"
                        className="p-1.5 md:p-2 text-[#a8a8a8] hover:text-[#c9a8a0] hover:bg-[#a8736b]/10 rounded transition-all duration-200 cursor-pointer touch-target"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(task.id)}
                        disabled={loadingId === task.id}
                        title="Delete task completely"
                        className="p-1.5 md:p-2 text-[#a8a8a8] hover:text-[#a8736b] hover:bg-[#a8736b]/10 rounded transition-all duration-200 cursor-pointer touch-target"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              )}

              {/* Restore button for Cancelled tasks */}
              {isCancelled && (
                  <button 
                    onClick={() => handleStatusChange(task.id, task.status, "PENDING")}
                    disabled={loadingId === task.id}
                    className="text-xs px-2 md:px-3 py-1.5 md:py-2 bg-[#242424] hover:bg-[#333333] text-[#a8a8a8] rounded transition-all duration-200 border border-[#333333] font-light flex-shrink-0"
                  >
                      Restore
                  </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
