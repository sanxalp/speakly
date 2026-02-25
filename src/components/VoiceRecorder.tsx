"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2, Check, X } from "lucide-react";
import { createTask } from "@/app/actions/tasks";
import { format, parseISO } from "date-fns";

type ParsedTask = {
  title: string;
  description: string | null;
  due_date: string | null;
};

export default function VoiceRecorder({ onTaskAdded }: { onTaskAdded: () => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedTask, setParsedTask] = useState<ParsedTask | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable fields for the review card
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Setup Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsRecording(false);
        };
      } else {
        setError("Speech recognition is not supported in this browser. Please use Chrome.");
      }
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecordingAndParse();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
        setTranscript("");
        setError(null);
        setParsedTask(null);
        setIsRecording(true);
        recognitionRef.current.start();
    }
  };

  const stopRecordingAndParse = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    if (!transcript.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            text: transcript,
            currentIsoString: new Date().toISOString()
         }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to parse task");
      }

      const data: ParsedTask = await res.json();
      setParsedTask(data);
      setEditTitle(data.title || "");
      setEditDesc(data.description || "");
      // If datetime provided, format it for input type="datetime-local"
      if (data.due_date) {
        try {
            const dateObj = parseISO(data.due_date);
            setEditDate(format(dateObj, "yyyy-MM-dd'T'HH:mm"));
        } catch (e) {
            setEditDate("");
        }
      } else {
          setEditDate("");
      }

    } catch (err: any) {
      setError(err.message || "AI failed to parse the request. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveTask = async () => {
    setIsProcessing(true);
    try {
      await createTask({
        title: editTitle,
        description: editDesc || null,
        due_date: editDate ? new Date(editDate).toISOString() : null,
      });
      setParsedTask(null);
      setTranscript("");
      onTaskAdded(); // Refresh list
    } catch (err) {
      setError("Failed to save task to database.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Mic Button */}
      {!parsedTask && (
        <div className="flex flex-col items-center space-y-6">
          <button
            onClick={toggleRecording}
            className={`relative group flex items-center justify-center w-32 h-32 rounded-full shadow-2xl transition-all duration-300 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse"
                : "bg-emerald-500 hover:bg-emerald-600 hover:scale-105"
            }`}
          >
            {isRecording ? (
              <Square className="w-12 h-12 text-white fill-current" />
            ) : (
              <Mic className="w-14 h-14 text-white" />
            )}
            
            {/* Ripple effect when recording */}
            {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-50 animate-ping"></div>
            )}
          </button>
          
          <p className="text-neutral-400 font-medium h-6">
            {isRecording ? "Listening... Click square to stop." : "Tap to speak a new task"}
          </p>

          {/* Transcript Preview */}
          {(transcript || isRecording) && (
            <div className="w-full p-4 bg-neutral-900 border border-neutral-800 rounded-2xl italic text-emerald-400 text-center min-h-[4rem]">
              "{transcript || "..."}"
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isProcessing && !parsedTask && (
        <div className="flex flex-col items-center space-y-4 text-emerald-500 mt-8">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="animate-pulse">AI is parsing your task...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl w-full text-center">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
        </div>
      )}

      {/* Review Card */}
      {parsedTask && !isProcessing && (
        <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 fade-in">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Check className="text-emerald-500" /> Confirm Task Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Due Date & Time</label>
              <input
                type="datetime-local"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => { setParsedTask(null); setTranscript(""); }}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" /> Cancel
            </button>
            <button
              onClick={saveTask}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-5 h-5" /> Save Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
