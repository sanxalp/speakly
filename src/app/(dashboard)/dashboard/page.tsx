"use client";

import { useEffect, useState } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import TaskList from "@/components/TaskList";
import { getTasks, Task } from "@/app/actions/tasks";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
       console.error("Failed to load tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const pendingTasks = tasks.filter(t => t.status === "PENDING" || t.status === "CANCELLED");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");

  return (
    <div className="space-y-12">
      <div className="pt-8 pb-12 border-b border-[#3a3a47]">
        <VoiceRecorder onTaskAdded={fetchTasks} />
      </div>

      <div className="space-y-10">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#f5f5f7]">
              Active Tasks
            </h2>
            <span className="bg-emerald-500/20 text-emerald-400 text-sm px-3 py-1.5 rounded-full border border-emerald-500/30 font-medium">{pendingTasks.length}</span>
          </div>
          {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-[#6f7178] animate-spin" /></div>
          ) : (
            <TaskList tasks={pendingTasks} onTaskUpdate={fetchTasks} />
          )}
        </div>

        {completedTasks.length > 0 && (
          <div className="pt-10 border-t border-[#3a3a47]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#a8a8b0]">
                Completed
              </h2>
              <span className="text-[#6f7178] text-sm font-medium">{completedTasks.length}</span>
            </div>
             <TaskList tasks={completedTasks} onTaskUpdate={fetchTasks} />
          </div>
        )}
      </div>
    </div>
  );
}
