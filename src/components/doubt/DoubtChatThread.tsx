import React, { useRef, useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Loader2,
  Copy,
  Check,
  X,
  RotateCcw,
  Edit3,
  MessageSquare,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import type { DoubtConversation, DoubtMessage } from '../../services/doubtConversationService';

interface DoubtChatThreadProps {
  conversation: DoubtConversation;
  messages: DoubtMessage[];
  loading: boolean;
  loadingMessages: string[];
  loadingStep: number;
  streamingContent: string | null;
  onSendMessage: (e?: React.FormEvent, customQuestion?: string) => void;
  question: string;
  setQuestion: (q: string) => void;
  image: string | null;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  isRecording: boolean;
  recStatus: 'idle' | 'listening' | 'transcribing' | 'error' | 'unsupported';
  micError: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  error: string | null;
  onNewChat: () => void;
  onOpenMobileDrawer: () => void;
  onRenameTopic: (newTitle: string) => void;
  speakingMessageId: string | null;
  isPlayingSpeech: boolean;
  isPausedSpeech: boolean;
  onPlaySpeech: (msgId: string, content: string) => void;
  onStopSpeech: () => void;
  SolutionRendererComponent: React.ComponentType<{ text: string }>;
}

export function DoubtChatThread({
  conversation,
  messages,
  loading,
  loadingMessages,
  loadingStep,
  streamingContent,
  onSendMessage,
  question,
  setQuestion,
  imagePreview,
  onImageChange,
  onRemoveImage,
  isRecording,
  recStatus,
  micError,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  error,
  onNewChat,
  onOpenMobileDrawer,
  onRenameTopic,
  speakingMessageId,
  isPlayingSpeech,
  isPausedSpeech,
  onPlaySpeech,
  onStopSpeech,
  SolutionRendererComponent,
}: DoubtChatThreadProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(conversation.title);
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTempTitle(conversation.title);
  }, [conversation.title]);

  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [messages, streamingContent, loading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTitle.trim()) {
      onRenameTopic(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const suggestionChips = [
    '💡 क्या इसकी कोई वैकल्पिक विधि भी है?',
    '🔍 इसे एक और उदाहरण से समझाएं',
    '🎯 इस पर आधारित 2 अभ्यास प्रश्न दें',
    '📝 मुख्य सूत्र और सावधानियां बताएं',
  ];

  return (
    <div className="space-y-4 text-left">
      {/* 1. Conversation Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <button
            type="button"
            onClick={onNewChat}
            className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            title="नया चैट शुरू करें"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          <div className="space-y-0.5 flex-1">
            {isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="px-2.5 py-1 text-sm font-black border-2 border-blue-500 rounded-lg bg-white"
                  autoFocus
                />
                <button type="submit" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {conversation.title}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1 text-slate-400 hover:text-blue-700 rounded-md hover:bg-slate-100 transition-colors"
                  title="शीर्षक बदलें"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 flex-wrap text-3xs font-extrabold">
              <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                {conversation.subject}
              </span>
              <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                {conversation.classLevel.replace('class-', 'Class ')}
              </span>
              <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                💬 {messages.length} संदेश
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar toggle button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileDrawer}
            className="lg:hidden px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>सभी चैट्स</span>
          </button>
        </div>
      </div>

      {/* 2. Messages Scrollable Thread */}
      <div
        ref={chatScrollContainerRef}
        className="max-h-[580px] sm:max-h-[640px] overflow-y-auto space-y-4 p-4 sm:p-6 bg-slate-100/70 rounded-3xl border-2 border-slate-200 shadow-inner"
      >
        {messages.map((m) => {
          const isUser = m.role === 'user';

          if (isUser) {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[90%] sm:max-w-[78%] bg-blue-700 text-white rounded-2xl rounded-tr-none p-4 sm:p-5 shadow-sm space-y-2 text-left">
                  <div className="flex items-center justify-between gap-3 text-3xs font-extrabold text-blue-200 border-b border-blue-600/70 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span>👤 छात्र (You)</span>
                      {m.contentType === 'voice' && (
                        <span className="bg-blue-900/90 text-amber-300 px-1.5 py-0.2 rounded font-black">
                          🎤 वॉइस
                        </span>
                      )}
                      {m.contentType === 'image' && (
                        <span className="bg-blue-900/90 text-emerald-300 px-1.5 py-0.2 rounded font-black">
                          📷 फोटो
                        </span>
                      )}
                    </span>
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString('hi-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {m.image && (
                    <div className="rounded-xl overflow-hidden border border-white/20 bg-black/20 p-1">
                      <img
                        src={m.image}
                        alt="Question upload"
                        className="max-h-52 rounded-lg object-contain mx-auto"
                      />
                    </div>
                  )}

                  <p className="text-sm sm:text-base font-semibold leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </p>
                </div>
              </div>
            );
          }

          // Assistant Message
          const isThisSpeaking = speakingMessageId === m.id;
          const isThisCopied = copiedId === m.id;

          return (
            <div key={m.id} className="flex justify-start">
              <div className="w-full bg-white rounded-3xl border-2 border-blue-500/80 shadow-md p-5 sm:p-7 space-y-4 text-left">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-700 text-white font-black flex items-center justify-center text-xs shadow-xs">
                      RK
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900">
                        प्रिंस सर (RK STUDY CENTRE)
                      </h3>
                      <div className="text-3xs text-blue-700 font-extrabold flex items-center gap-1 uppercase">
                        <span>सत्यापित शैक्षणिक समाधान</span>
                        <span>•</span>
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString('hi-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Audio TTS & Copy */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onPlaySpeech(m.id, m.content)}
                      className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-black text-3xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="समाधान सुनें"
                    >
                      <span>
                        {isThisSpeaking && isPlayingSpeech
                          ? '⏸️ विराम'
                          : isThisSpeaking && isPausedSpeech
                          ? '▶️ जारी रखें'
                          : '🔊 सुनें'}
                      </span>
                    </button>

                    {isThisSpeaking && (
                      <button
                        type="button"
                        onClick={onStopSpeech}
                        className="px-2 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-3xs cursor-pointer"
                        title="रोकें"
                      >
                        ⏹️
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.content)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer transition-colors"
                      title="कॉपी करें"
                    >
                      {isThisCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Solution Body */}
                <div className="bg-slate-50/80 p-4 sm:p-6 rounded-2xl border border-slate-200">
                  <SolutionRendererComponent text={m.content} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Streaming Assistant card */}
        {loading && streamingContent && (
          <div className="flex justify-start animate-fadeIn">
            <div className="w-full bg-white rounded-3xl border-2 border-blue-500 shadow-md p-5 sm:p-7 space-y-4 text-left">
              <div className="flex items-center gap-2 text-xs font-black text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span>प्रिंस सर उत्तर लिख रहे हैं (Live Streaming)...</span>
              </div>
              <div className="bg-slate-50/80 p-4 sm:p-6 rounded-2xl border border-slate-200">
                <SolutionRendererComponent text={streamingContent} />
                <span className="inline-block w-2 h-4 bg-blue-700 animate-pulse ml-1 align-middle" />
              </div>
            </div>
          </div>
        )}

        {/* Loader before first chunk */}
        {loading && !streamingContent && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3.5 animate-pulse border border-slate-800">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-blue-200 text-sm font-semibold">
              {loadingMessages[loadingStep]}
            </p>
          </div>
        )}
      </div>

      {/* 3. Follow-up Suggestions Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-2xs font-bold text-slate-700">
        <span className="text-slate-400 shrink-0 text-3xs uppercase font-black">सुझाव:</span>
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(undefined, chip)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 hover:text-blue-900 shrink-0 cursor-pointer transition-all shadow-2xs font-semibold disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 4. Follow-up Question Input Dock */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-xs space-y-3">
        <form onSubmit={(e) => onSendMessage(e)} className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-2xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>इस टॉपिक पर अगला सवाल पूछें (Ask Follow-up)</span>
            </label>

            {/* Voice Recording Button */}
            <div className="flex items-center gap-2">
              {isRecording ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  <span className="text-rose-700 text-3xs font-extrabold uppercase">
                    {recStatus === 'listening' ? 'Recording...' : 'Transcribing...'}
                  </span>
                  <button
                    type="button"
                    onClick={onCancelRecording}
                    className="p-1 hover:bg-rose-100 rounded text-rose-700 text-3xs font-bold ml-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onStopRecording}
                    className="px-2 py-0.5 bg-rose-600 text-white rounded font-bold text-3xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onStartRecording}
                  className="py-1 px-2.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 text-3xs font-black flex items-center gap-1 cursor-pointer transition-all"
                  style={{ minHeight: '36px' }}
                >
                  <span>🎤 बोलकर पूछें</span>
                </button>
              )}
            </div>
          </div>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="इस टॉपिक पर कोई भी अगला प्रश्न या स्पष्टीकरण लिखें... (उदा: x² - 5x + 6 = 0 को हल करें)"
            rows={3}
            className="w-full p-3.5 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:outline-hidden font-medium text-slate-800 placeholder-slate-400 bg-slate-50/60 text-sm leading-relaxed transition-colors"
            disabled={isRecording}
          />

          {micError && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-3xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{micError}</span>
            </div>
          )}

          {/* Photo attachment + Submit button */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {!imagePreview ? (
                <label className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="hidden"
                  />
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>फोटो जोड़ें</span>
                </label>
              ) : (
                <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <span className="text-3xs font-bold text-slate-700">फोटो संलग्न</span>
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!question.trim() && !imagePreview)}
              className="py-2.5 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm flex items-center gap-2 cursor-pointer transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>हल हो रहा है...</span>
                </>
              ) : (
                <>
                  <span>भेजें</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => onSendMessage()}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-3xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>फिर प्रयास करें</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
