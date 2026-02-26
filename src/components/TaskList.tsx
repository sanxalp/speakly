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
      <div className="text-center p-12 bg-[#262630] border border-[#3a3a47] rounded-xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
        </div>
        <h3 className="text-xl font-semibold text-[#f5f5f7] mb-2">All caught up!</h3>
        <p className="text-[#a8a8b0]">You have no tasks currently. Use the microphone above to add one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const isCompleted = task.status === "COMPLETED";
        const isCancelled = task.status === "CANCELLED";
        const hasDueDate = !!task.due_date;
        const isOverdue = hasDueDate && task.status === "PENDING" && isPast(parseISO(task.due_date!));

        return (
          <div 
            key={task.id} 
            className={`p-6 rounded-xl border transition-all group ${
              isCompleted ? "bg-emerald-500/5 border-emerald-500/20" :
              isCancelled ? "bg-[#262630]/50 border-[#3a3a47] opacity-60" :
              isOverdue ? "bg-[#f59e0b]/5 border-[#f59e0b]/30" :
              "bg-[#1a1a21] border-[#3a3a47] hover:border-[#4a4a57]"
            }`}
          >
            <div className="flex items-start gap-4">
              
              {/* Checkbox */}
              <button 
                disabled={loadingId === task.id || isCancelled}
                onClick={() => handleStatusChange(task.id, task.status, isCompleted ? "PENDING" : "COMPLETED")}
                className="mt-1 flex-shrink-0 focus:outline-none disabled:opacity-50"
              >
                {isCompleted ? (
                   <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                   <Circle className="w-6 h-6 text-[#6f7178] group-hover:text-emerald-500 transition-colors" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className={`text-base font-semibold truncate ${isCompleted || isCancelled ? "text-[#6f7178] line-through" : "text-[#f5f5f7]"}`}>
                  {task.title}
                </h4>
                
                {task.description && (
                  <p className={`mt-2 text-sm leading-relaxed ${isCompleted || isCancelled ? "text-[#6f7178]" : "text-[#a8a8b0]"}`}>
                    {task.description}
                  </p>
                )}
                
                {/* Meta info row */}
                <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium">
                  {hasDueDate && (
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${
                        isCompleted ? "bg-[#262630] text-[#6f7178]" :
                        isOverdue ? "bg-[#f59e0b]/10 text-[#fbbf24] border border-[#f59e0b]/30" :
                        "bg-[#262630] text-[#a8a8b0] border border-[#3a3a47]"
                    }`}>
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      {format(parseISO(task.due_date!), "MMM d, h:mm a")}
                      {isOverdue && !isCompleted && " (Overdue)"}
                    </span>
                  )}
                  
                  {task.delay_count > 0 && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/30">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      Delayed {task.delay_count}x
                    </span>
                  )}

                  {task.status === "CANCELLED" && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#ef4444]/10 text-[#fca5a5] border border-[#ef4444]/30">
                          <XCircle className="w-4 h-4 flex-shrink-0" /> Cancelled
                      </span>
                  )}
                </div>
              </div>

              {/* Actions Dropdown / Buttons */}
              {!isCompleted && !isCancelled && (
                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                    <button 
                        onClick={() => handleDelay(task)}
                        disabled={loadingId === task.id}
                        title="Delay (Push back 1 day)"
                        className="p-2 text-[#a8a8b0] hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 rounded-lg transition-all duration-200 cursor-pointer"
                    >
                        <Clock className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleStatusChange(task.id, task.status, "CANCELLED")}
                        disabled={loadingId === task.id}
                        title="Cancel task"
                        className="p-2 text-[#a8a8b0] hover:text-[#fca5a5] hover:bg-[#ef4444]/10 rounded-lg transition-all duration-200 cursor-pointer"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(task.id)}
                        disabled={loadingId === task.id}
                        title="Delete task completely"
                        className="p-2 text-[#a8a8b0] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-all duration-200 cursor-pointer"
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
                    className="text-xs px-3 py-2 bg-[#262630] hover:bg-[#3a3a47] text-[#a8a8b0] rounded-lg transition-all duration-200 border border-[#3a3a47]"
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
