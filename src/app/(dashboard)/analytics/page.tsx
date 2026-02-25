"use client";

import { useEffect, useState } from "react";
import { getTasks, Task } from "@/app/actions/tasks";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Loader2, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { isPast, parseISO } from "date-fns";

export default function AnalyticsDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (e) {
        console.error("Error fetching tasks for analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // Analytics Calculations
  const totalTasks = tasks.length;
  
  // 1. Status Distribution
  const pendingCount = tasks.filter(t => t.status === "PENDING").length;
  const completedCount = tasks.filter(t => t.status === "COMPLETED").length;
  const cancelledCount = tasks.filter(t => t.status === "CANCELLED").length;

  const statusData = [
    { name: "Pending", count: pendingCount, fill: "#f59e0b" }, // Amber
    { name: "Completed", count: completedCount, fill: "#10b981" }, // Emerald
    { name: "Cancelled", count: cancelledCount, fill: "#ef4444" }, // Red
  ];

  // 2. On-Time vs Delayed (For Completed Tasks)
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");
  const completedOnTime = completedTasks.filter(t => t.delay_count === 0).length;
  const completedDelayed = completedTasks.filter(t => t.delay_count > 0).length;

  const timelinessData = [
    { name: "On Time", value: completedOnTime, fill: "#10b981" },
    { name: "Delayed", value: completedDelayed, fill: "#f59e0b" }
  ];

  // 3. Delay metrics
  const delayedTasks = tasks.filter(t => t.delay_count > 0);
  const totalDelays = delayedTasks.reduce((acc, t) => acc + t.delay_count, 0);
  
  // Current Overdue
  const currentlyOverdue = tasks.filter(t => 
    t.status === "PENDING" && t.due_date && isPast(parseISO(t.due_date))
  ).length;


  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg shadow-xl">
          <p className="text-white font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Overview</h1>
        <p className="text-neutral-400 mt-2">Track your productivity, task delays, and general completion habits.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">Total Completed</p>
              <p className="text-2xl font-bold text-white">{completedCount} <span className="text-sm text-neutral-500 font-normal">/ {totalTasks}</span></p>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">Total Delays Logged</p>
              <p className="text-2xl font-bold text-white">{totalDelays}</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">Currently Overdue</p>
              <p className="text-2xl font-bold text-white">{currentlyOverdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Timeliness Pie Chart */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
          <h3 className="text-lg font-semibold text-white mb-6">Completion Timeliness</h3>
          {completedTasks.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timelinessData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {timelinessData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-72 flex items-center justify-center text-neutral-500">
               No completed tasks yet
             </div>
          )}
          <p className="text-xs text-neutral-500 text-center mt-4">
            *Tracking on-time vs delayed tasks helps identify if you're overestimating daily capacity.
          </p>
        </div>

        {/* Status Bar Chart */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
          <h3 className="text-lg font-semibold text-white mb-6">Current Task Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{fill: '#a3a3a3'}} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#262626'}} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
