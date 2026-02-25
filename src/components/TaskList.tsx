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
      <div className="text-center p-12 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col items-center">
        <CheckCircle2 className="w-16 h-16 text-neutral-800 mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">All caught up!</h3>
        <p className="text-neutral-400">You have no tasks currently. Use the microphone above to add one.</p>
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
            className={`p-5 rounded-2xl border transition-all ${
              isCompleted ? "bg-emerald-500/5 border-emerald-500/20" :
              isCancelled ? "bg-red-500/5 border-red-500/20 opacity-70" :
              isOverdue ? "bg-orange-500/5 border-orange-500/30" :
              "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
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
                   <Circle className="w-6 h-6 text-neutral-500 hover:text-emerald-500" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className={`text-lg font-medium truncate ${isCompleted || isCancelled ? "text-neutral-500 line-through" : "text-white"}`}>
                  {task.title}
                </h4>
                
                {task.description && (
                  <p className={`mt-1 text-sm ${isCompleted || isCancelled ? "text-neutral-600" : "text-neutral-400"}`}>
                    {task.description}
                  </p>
                )}
                
                {/* Meta info row */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-medium">
                  {hasDueDate && (
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${
                        isCompleted ? "bg-neutral-800 text-neutral-500" :
                        isOverdue ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                        "bg-neutral-800 text-neutral-300"
                    }`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {format(parseISO(task.due_date!), "MMM d, h:mm a")}
                      {isOverdue && !isCompleted && " (Overdue)"}
                    </span>
                  )}
                  
                  {task.delay_count > 0 && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      Delayed {task.delay_count} {task.delay_count > 1 ? "times" : "time"}
                    </span>
                  )}

                  {task.status === "CANCELLED" && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-500 border border-red-500/20">
                          <XCircle className="w-3.5 h-3.5" /> Cancelled
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
                        className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <Clock className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleStatusChange(task.id, task.status, "CANCELLED")}
                        disabled={loadingId === task.id}
                        title="Cancel task"
                        className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(task.id)}
                        disabled={loadingId === task.id}
                        title="Delete task completely"
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
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
                    className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors"
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
