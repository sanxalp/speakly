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
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Mic Button */}
      {!parsedTask && (
        <div className="flex flex-col items-center space-y-8 md:space-y-12">
          <button
            onClick={toggleRecording}
            className={`relative group flex items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-full shadow-2xl transition-all duration-500 ${
              isRecording
                ? "bg-[#a8736b] hover:bg-[#b8836b] scale-110 animate-pulse"
                : "bg-[#d4af37] hover:bg-[#e8c547] hover:scale-105 hover:shadow-[#d4af37]/30"
            }`}
          >
            {isRecording ? (
              <Square className="w-10 h-10 md:w-14 md:h-14 text-[#0a0a0a] fill-current relative z-10" />
            ) : (
              <Mic className="w-12 h-12 md:w-16 md:h-16 text-[#0a0a0a] relative z-10" />
            )}
            
            {/* Ripple effect when recording */}
            {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-[#a8736b]/40 opacity-50 animate-ping"></div>
            )}
          </button>
          
          <p className="text-[#a8a8a8] font-light text-base md:text-lg h-8 text-center tracking-wide">
            {isRecording ? "Listening..." : "Tap to speak"}
          </p>

          {/* Transcript Preview */}
          {(transcript || isRecording) && (
            <div className="w-full p-4 md:p-8 bg-[#242424] border border-[#333333] rounded text-[#d4af37] text-center min-h-[5rem] md:min-h-[6rem] flex items-center justify-center">
              <span className="text-base md:text-lg font-light italic">"{transcript || "…"}"</span>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isProcessing && !parsedTask && (
        <div className="flex flex-col items-center space-y-4 md:space-y-6 mt-8 md:mt-12">
          <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
          <p className="text-[#a8a8a8] animate-pulse font-light text-sm md:text-base">Processing your task...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 md:mt-6 p-4 md:p-5 bg-[#a8736b]/10 border border-[#a8736b]/30 text-[#d9a8a0] rounded w-full text-center text-xs md:text-sm flex items-center justify-between font-light">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="underline hover:no-underline text-xs ml-4">Dismiss</button>
        </div>
      )}

      {/* Review Card */}
      {parsedTask && !isProcessing && (
        <div className="w-full bg-[#1a1a1a] border border-[#333333] rounded p-6 md:p-10 shadow-2xl animate-in slide-in-from-bottom-4 fade-in">
          <div className="mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-light text-[#f5f5f5] mb-2">
              Review Task
            </h3>
            <div className="w-12 h-1 bg-[#d4af37]" />
          </div>
          
          <div className="space-y-5 md:space-y-6">
            <div>
              <label className="block text-xs font-light text-[#a8a8a8] mb-2 md:mb-3 uppercase tracking-wide">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-[#242424] border border-[#333333] rounded px-4 py-2 md:py-3 text-[#f5f5f5] placeholder-[#707070] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all font-light text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-light text-[#a8a8a8] mb-2 md:mb-3 uppercase tracking-wide">Description</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-[#242424] border border-[#333333] rounded px-4 py-2 md:py-3 text-[#f5f5f5] placeholder-[#707070] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all min-h-[100px] md:min-h-[120px] font-light text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-light text-[#a8a8a8] mb-2 md:mb-3 uppercase tracking-wide">Due Date & Time</label>
              <input
                type="datetime-local"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full bg-[#242424] border border-[#333333] rounded px-4 py-2 md:py-3 text-[#f5f5f5] placeholder-[#707070] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all font-light text-sm [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex gap-3 md:gap-4 mt-6 md:mt-10 flex-col md:flex-row">
            <button
              onClick={() => { setParsedTask(null); setTranscript(""); }}
              className="flex-1 bg-transparent border border-[#333333] hover:border-[#a8a8a8] text-[#a8a8a8] hover:text-[#f5f5f5] font-light py-2 md:py-3 rounded transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={saveTask}
              className="flex-1 bg-[#d4af37] hover:bg-[#e8c547] text-[#0a0a0a] font-light py-2 md:py-3 rounded transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/30 text-sm md:text-base"
            >
              <Check className="w-4 h-4" /> Save Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
