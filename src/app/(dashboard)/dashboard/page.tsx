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
    <div className="space-y-16">
      <div className="pt-6 pb-14 border-b border-[#333333]">
        <VoiceRecorder onTaskAdded={fetchTasks} />
      </div>

      <div className="space-y-14">
        <div>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-light text-[#f5f5f5]">
              Active Tasks
            </h2>
            <span className="bg-[#d4af37]/20 text-[#d4af37] text-sm px-4 py-2 rounded border border-[#d4af37]/30 font-light">{pendingTasks.length}</span>
          </div>
          {loading ? (
             <div className="flex justify-center p-16"><Loader2 className="w-8 h-8 text-[#707070] animate-spin" /></div>
          ) : (
            <TaskList tasks={pendingTasks} onTaskUpdate={fetchTasks} />
          )}
        </div>

        {completedTasks.length > 0 && (
          <div className="pt-12 border-t border-[#333333]">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-light text-[#a8a8a8]">
                Completed
              </h2>
              <span className="text-[#707070] text-sm font-light">{completedTasks.length}</span>
            </div>
             <TaskList tasks={completedTasks} onTaskUpdate={fetchTasks} />
          </div>
        )}
      </div>
    </div>
  );
}
