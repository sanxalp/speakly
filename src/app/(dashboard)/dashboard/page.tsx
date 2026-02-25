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
      <div className="pt-8 pb-12 border-b border-neutral-900">
        <VoiceRecorder onTaskAdded={fetchTasks} />
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center justify-between">
            Active Tasks
            <span className="bg-neutral-800 text-neutral-400 text-sm px-2.5 py-1 rounded-full">{pendingTasks.length}</span>
          </h2>
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 text-neutral-600 animate-spin" /></div>
          ) : (
            <TaskList tasks={pendingTasks} onTaskUpdate={fetchTasks} />
          )}
        </div>

        {completedTasks.length > 0 && (
          <div className="pt-8 border-t border-neutral-900">
            <h2 className="text-lg font-medium text-neutral-500 mb-6 flex items-center justify-between">
              Completed Tasks
              <span className="text-sm">{completedTasks.length}</span>
            </h2>
             <TaskList tasks={completedTasks} onTaskUpdate={fetchTasks} />
          </div>
        )}
      </div>
    </div>
  );
}
