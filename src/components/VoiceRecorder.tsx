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
        <div className="flex flex-col items-center space-y-8">
          <button
            onClick={toggleRecording}
            className={`relative group flex items-center justify-center w-32 h-32 rounded-full shadow-2xl transition-all duration-300 ${
              isRecording
                ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 scale-110 animate-pulse"
                : "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:scale-105 hover:shadow-emerald-500/20"
            }`}
          >
            {isRecording ? (
              <Square className="w-12 h-12 text-white fill-current relative z-10" />
            ) : (
              <Mic className="w-14 h-14 text-white relative z-10" />
            )}
            
            {/* Ripple effect when recording */}
            {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-red-400 opacity-50 animate-ping"></div>
            )}
          </button>
          
          <p className="text-[#a8a8b0] font-medium h-6 text-center">
            {isRecording ? "Listening... Click to stop." : "Tap mic to record a new task"}
          </p>

          {/* Transcript Preview */}
          {(transcript || isRecording) && (
            <div className="w-full p-6 bg-[#262630] border border-[#3a3a47] rounded-xl italic text-emerald-400 text-center min-h-[5rem] flex items-center justify-center">
              <span className="text-lg">"{transcript || "…"}"</span>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isProcessing && !parsedTask && (
        <div className="flex flex-col items-center space-y-4 text-emerald-500 mt-8">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-[#a8a8b0] animate-pulse">AI is parsing your task...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#fca5a5] rounded-lg w-full text-center text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="underline hover:no-underline text-xs ml-4">Dismiss</button>
        </div>
      )}

      {/* Review Card */}
      {parsedTask && !isProcessing && (
        <div className="w-full bg-[#1a1a21] border border-[#3a3a47] rounded-2xl p-8 shadow-2xl animate-in slide-in-from-bottom-4 fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Check className="text-emerald-400 w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#f5f5f7]">
              Confirm Task Details
            </h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#a8a8b0] mb-2">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-[#262630] border border-[#3a3a47] rounded-lg px-4 py-3 text-[#f5f5f7] placeholder-[#6f7178] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#a8a8b0] mb-2">Description</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-[#262630] border border-[#3a3a47] rounded-lg px-4 py-3 text-[#f5f5f7] placeholder-[#6f7178] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a8a8b0] mb-2">Due Date & Time</label>
              <input
                type="datetime-local"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full bg-[#262630] border border-[#3a3a47] rounded-lg px-4 py-3 text-[#f5f5f7] placeholder-[#6f7178] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => { setParsedTask(null); setTranscript(""); }}
              className="flex-1 bg-[#262630] hover:bg-[#3a3a47] text-[#f5f5f7] font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-[#3a3a47]"
            >
              <X className="w-5 h-5" /> Cancel
            </button>
            <button
              onClick={saveTask}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
            >
              <Check className="w-5 h-5" /> Save Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
