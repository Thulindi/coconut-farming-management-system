import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [activeModel, setActiveModel] = useState('gemini'); 
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [healthStatus, setHealthStatus] = useState('Connecting...');

  // Voice States (Member 3 - Local AI Whisper)
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get('/chatbot/health');
        if (response.data.status === 'ok') {
          setHealthStatus('Online');
        }
      } catch (err) {
        setHealthStatus('Offline');
      }
    };
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  // Reusable send logic for Auto-Voice (Chat Tab)
  const performSendChat = async (textToSubmit) => {
    if (!textToSubmit || isThinking) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSubmit }]);
    setQuery('');
    setIsThinking(true);

    try {
      // API call to the unified backend endpoint
      const response = await axios.post('/chatbot/chat/llama', { query: textToSubmit });
      const { answer, model, latency, context } = response.data;
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: answer, 
        context: context,
        meta: `${model} \u00B7 ${latency}s` 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'Could not reach the AI assistant. Please check if the backend is running.', 
        meta: 'Error' 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendChat = () => performSendChat(query.trim());

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        setQuery('AI is transcribing... (Please wait)');
        setIsThinking(true);

        try {
          const response = await axios.post('/chatbot/voice/transcribe', formData);
          if (response.data.status === 'success') {
            const transcribedText = response.data.text;
            setQuery(transcribedText);
            performSendChat(transcribedText);
          } else {
            setQuery('AI could not understand the audio.');
          }
        } catch (err) {
          console.error('Transcription error:', err);
          setQuery('');
          alert('AI backend is busy or still loading models. Please try again in a few seconds.');
        } finally {
          setIsThinking(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setQuery('🎙️ Recording (AI English)...');

    } catch (err) {
      console.error('Mic access error:', err);
      alert('Could not access microphone.');
    }
  };

  // (context display removed - no longer needed)

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-body">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-[#346854] text-white rotate-90' : 'bg-gradient-to-tr from-[#1a2233] to-[#346854] text-white shadow-[#1a2233]/40'
        }`}
      >
        {isOpen ? (
          <span className="material-symbols-outlined">close</span>
        ) : (
          <span className="material-symbols-outlined">psychology</span>
        )}
        {!isOpen && (
           <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Chat Popup */}
      <div
        className={`absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-[#1a2233] p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#346854] rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white">eco</span>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">CocoSmart AI Assistant</h3>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${healthStatus === 'Online' ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`}></span>
                <span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">{healthStatus}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Model Info */}
            <div className="flex px-4 py-3 space-x-2 bg-slate-50/50">
              <div className="flex-1 py-2 rounded-lg text-[10px] font-bold bg-[#346854] text-white shadow-md text-center">
                CocoSmart AI · LLaMA 3.3 70B (Groq)
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-[#346854] text-white rounded-tr-none shadow-md shadow-[#346854]/20' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                    }`}>
                      {msg.text}

                    </div>
                    {msg.meta && (
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 ml-1">
                        {msg.meta}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-[#346854] rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-[#346854] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-[#346854] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 italic">Thinking...</span>
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-top border-slate-100 flex items-end space-x-3">
          {/* Member 3: Mic Button */}
          <button
            onClick={handleMicClick}
            className={`w-12 h-12 rounded-xl flex flex-shrink-0 items-center justify-center transition-all border ${
              isRecording 
                ? 'bg-red-500 text-white border-red-500 animate-pulse' 
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title="Speak (Member 3 AI)"
          >
            <span className="material-symbols-outlined">{isRecording ? 'stop_circle' : 'mic'}</span>
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChat();
                }
              }}
              placeholder="Ask something..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#346854] focus:ring-1 focus:ring-[#346854] transition-all resize-none max-h-24 min-h-[48px] custom-scrollbar"
              rows="1"
            />
          </div>
          <button
            onClick={handleSendChat}
            disabled={!query.trim() || isThinking}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              !query.trim() || isThinking ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#346854] text-white shadow-lg shadow-[#346854]/20 hover:scale-105 active:scale-95'
            }`}
          >
            {isThinking ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined">send</span>
            )}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default ChatBot;
