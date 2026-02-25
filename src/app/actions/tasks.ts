"use server";

import { getSupabaseServer } from "@/lib/supabase-server";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  delay_count: number;
  created_at: string;
};

export async function getTasks() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
  return data as Task[];
}

export async function createTask(task: {
  title: string;
  description?: string | null;
  due_date?: string | null;
}) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert([{ ...task, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    throw error;
  }
  return data as Task;
}

export async function updateTaskStatus(id: string, status: Task["status"]) {
  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}

export async function delayTask(id: string, currentCount: number, newDueDate: string) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase
      .from("tasks")
      .update({ 
          due_date: newDueDate,
          delay_count: currentCount + 1
      })
      .eq("id", id);
  
    if (error) {
      console.error("Error delaying task:", error);
      throw error;
    }
  }

export async function deleteTask(id: string) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);
  
    if (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }
