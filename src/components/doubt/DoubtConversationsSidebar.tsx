import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Edit3,
  Archive,
  Trash2,
  Check,
  X,
  Clock,
  Zap,
  BookOpen
} from 'lucide-react';
import type { DoubtConversation } from '../../services/doubtConversationService';

interface DoubtConversationsSidebarProps {
  conversations: DoubtConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onToggleArchive: (id: string, currentArchived: boolean, e: React.MouseEvent) => void;
  savedDoubtsCount: number;
  onOpenSavedHistory: () => void;
  onCloseMobileDrawer?: () => void;
}

export function DoubtConversationsSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRename,
  onDelete,
  onToggleArchive,
  savedDoubtsCount,
  onOpenSavedHistory,
  onCloseMobileDrawer,
}: DoubtConversationsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchQuery =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTab = activeTab === 'archived' ? c.isArchived : !c.isArchived;
      return matchQuery && matchTab;
    });
  }, [conversations, searchQuery, activeTab]);

  const activeCount = useMemo(() => conversations.filter((c) => !c.isArchived).length, [conversations]);
  const archivedCount = useMemo(() => conversations.filter((c) => c.isArchived).length, [conversations]);

  const startRename = (conv: DoubtConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const submitRename = (convId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editingTitle.trim()) {
      onRename(convId, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-4 text-left">
      {/* 1. New Chat Button */}
      <button
        type="button"
        onClick={() => {
          onNewChat();
          if (onCloseMobileDrawer) onCloseMobileDrawer();
        }}
        className="w-full py-3.5 px-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-700/20 transition-all hover:scale-101"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>+ नया चैट शुरू करें (New Chat)</span>
      </button>

      {/* 2. Search & Tab Filter Box */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="टॉपिक या विषय खोजें..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-3xs font-extrabold">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-1 rounded-lg text-center cursor-pointer transition-colors ${
              activeTab === 'active' ? 'bg-white text-blue-800 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            सक्रिय ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archived')}
            className={`flex-1 py-1 rounded-lg text-center cursor-pointer transition-colors ${
              activeTab === 'archived' ? 'bg-white text-blue-800 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            संग्रहित ({archivedCount})
          </button>
        </div>
      </div>

      {/* 3. Conversation List */}
      <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>विषय-वार चैट्स ({filteredConversations.length})</span>
          </h3>
          <span className="text-3xs font-bold text-slate-400">लगातार बातचीत</span>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="py-7 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-slate-600 text-xs font-bold">
              {searchQuery ? 'कोई मिलता-जुलता टॉपिक नहीं मिला।' : 'कोई पुरानी बातचीत नहीं है।'}
            </p>
            <p className="text-slate-400 text-3xs leading-relaxed max-w-[200px] mx-auto">
              ऊपर '+ नया चैट' दबाकर किसी भी विषय का सवाल पूछें।
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectConversation(conv.id);
                      if (onCloseMobileDrawer) onCloseMobileDrawer();
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 group text-left ${
                    isActive
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                      : 'bg-slate-50/80 hover:bg-blue-50/40 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {isEditing ? (
                    <form
                      onSubmit={(e) => submitRename(conv.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1"
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded-lg bg-white font-bold"
                        autoFocus
                      />
                      <button type="submit" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-3xs font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                            {conv.subject}
                          </span>
                          <span className="text-3xs font-bold text-slate-500 bg-slate-200 px-1 py-0.5 rounded">
                            {conv.classLevel.replace('class-', 'Cl-')}
                          </span>
                          <span className="text-3xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            💬 {conv.messageCount || 1}
                          </span>
                        </div>

                        {/* Action buttons on hover */}
                        <div className="flex items-center gap-0.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => startRename(conv, e)}
                            className="p-1 text-slate-400 hover:text-blue-700 rounded hover:bg-slate-200 transition-colors"
                            title="नाम बदलें (Rename)"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => onToggleArchive(conv.id, conv.isArchived, e)}
                            className="p-1 text-slate-400 hover:text-amber-700 rounded hover:bg-slate-200 transition-colors"
                            title={conv.isArchived ? 'सक्रिय करें' : 'संग्रहित करें (Archive)'}
                          >
                            <Archive className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => onDelete(conv.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200 transition-colors"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-900 text-xs font-black line-clamp-1 group-hover:text-blue-900">
                        {conv.title}
                      </p>

                      {conv.lastSnippet && (
                        <p className="text-slate-500 text-3xs font-medium line-clamp-1">
                          {conv.lastSnippet}
                        </p>
                      )}

                      <div className="text-4xs text-slate-400 font-semibold text-right">
                        {new Date(conv.lastMessageAt).toLocaleDateString('hi-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Saved Doubts Snapshot History Link */}
        {savedDoubtsCount > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onOpenSavedHistory}
              className="w-full py-2 text-center text-xs font-black text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>पुराना हल इतिहास (Saved Doubts - {savedDoubtsCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Tips Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-5 space-y-3 border border-indigo-900 shadow-xs">
        <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-4 h-4 fill-amber-400" />
          <span>लगातार बातचीत (ChatGPT-Style)</span>
        </h4>
        <ul className="space-y-2 text-2xs text-slate-300 font-medium leading-relaxed">
          <li className="flex items-start gap-1.5">
            <span className="text-amber-400 font-bold">•</span>
            <p><strong>एक ही टॉपिक:</strong> उसी चैट में अगला सवाल पूछें, AI पिछले संदर्भ और समीकरणों को याद रखता है।</p>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-amber-400 font-bold">•</span>
            <p><strong>नया टॉपिक:</strong> नया विषय शुरू करने के लिए ऊपर '+ नया चैट' बटन दबाएं।</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
