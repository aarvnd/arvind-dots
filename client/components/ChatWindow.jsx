'use client';

import React, { useState, useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import ApprovalCard from './ApprovalCard';
import ModelPicker from './ModelPicker';
import MascotAvatar from './MascotAvatar';
import { FiPlus, FiMic, FiMicOff, FiMonitor, FiX, FiArrowUp } from 'react-icons/fi';
import {
  sendMessage,
  subscribeToChatStream,
  uploadImage,
  respondApproval,
} from '../lib/api';

function formatHeaderDate(msgs) {
  const firstWithDate = msgs?.find((m) => m.created_at);
  if (!firstWithDate || !firstWithDate.created_at) {
    return 'Today';
  }
  const d = new Date(firstWithDate.created_at);
  if (isNaN(d.getTime())) return 'Today';

  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return 'Today';
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ChatWindow({ bot, models, messages, setMessages, onUpdateBotModel, onToggleComputer, defaultModel }) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeModel, setActiveModel] = useState(bot?.model || defaultModel || 'gpt-5-mini');
  const [selectedImage, setSelectedImage] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [toolEvents, setToolEvents] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const botTitle = bot?.name || 'Arvind Dots Assistant';

  // Initial welcome greeting fallback for the active bot
  const defaultInitialMessages = [
    {
      id: 'msg-intro',
      sender: 'bot',
      text: `Hello! I am **${botTitle}**. Ask me anything, or give me a task to work on!`,
      isError: false,
    },
  ];

  const activeMessages = messages && messages.length > 0 ? messages : defaultInitialMessages;

  useEffect(() => {
    if (bot?.model) {
      setActiveModel(bot.model);
    } else if (defaultModel) {
      setActiveModel(defaultModel);
    }
  }, [bot, defaultModel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isStreaming]);

  const handleModelChange = (newModel) => {
    setActiveModel(newModel);
    if (onUpdateBotModel && bot?.id) {
      onUpdateBotModel(bot.id, newModel);
    }
  };

  const handleApprovalResponse = async (requestId, action) => {
    await respondApproval(requestId, action);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict IMAGE ONLY validation
    if (!file.type.startsWith('image/')) {
      alert('Only image files (JPEG, PNG, WEBP, GIF, AVIF) are allowed.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImage({ file, previewUrl, isUploading: true, uploadedUrl: null, error: null });

    try {
      const res = await uploadImage(file);
      setSelectedImage((prev) => (prev ? { ...prev, isUploading: false, uploadedUrl: res.url } : null));
    } catch (err) {
      console.error('Failed to upload image:', err);
      setSelectedImage((prev) => (prev ? { ...prev, isUploading: false, error: err.message } : null));
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!inputPrompt.trim() && !selectedImage) || isStreaming) return;

    const userText = inputPrompt;
    const currentSelected = selectedImage;
    
    setInputPrompt('');
    setSelectedImage(null);

    let finalImageUrl = currentSelected?.uploadedUrl || null;

    // Ensure image upload finishes before dispatching to the inference backend
    if (currentSelected && !finalImageUrl) {
      try {
        const res = await uploadImage(currentSelected.file);
        finalImageUrl = res.url;
      } catch (err) {
        console.error('Image upload failed on send:', err);
      }
    }

    const userMsgObj = {
      id: `temp-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      image_url: currentSelected?.previewUrl || finalImageUrl,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsgObj]);

    try {
      if (bot?.id) {
        await sendMessage(bot.id, bot.id, userText, activeModel, finalImageUrl);
        setIsStreaming(true);
        let streamingMsgId = null;


        subscribeToChatStream(
          bot.id,
          activeModel,
          (event) => {
            if (event.type === 'turn.started') {
              streamingMsgId = event.botMsgId;
              setMessages((prev) => [
                ...prev,
                {
                  id: streamingMsgId,
                  sender: 'bot',
                  text: '',
                  created_at: new Date().toISOString(),
                },
              ]);
            } else if (event.type === 'request.opened') {
              setPendingApprovals((prev) => [
                ...prev.filter((approval) => approval.requestId !== event.requestId),
                event,
              ]);
            } else if (['tool.started', 'tool.completed', 'tool.failed', 'tool.denied', 'tool.expired'].includes(event.type)) {
              setToolEvents((prev) => [
                ...prev.slice(-4),
                { ...event, id: `${event.type}-${Date.now()}` },
              ]);
              if (event.type === 'tool.expired') {
                setPendingApprovals((prev) => prev.filter((approval) => approval.requestId !== event.requestId));
              }
            } else if (event.type === 'content.delta') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === streamingMsgId
                    ? { ...msg, text: msg.text + event.delta }
                    : msg
                )
              );
            } else if (event.type === 'turn.completed') {
              setIsStreaming(false);
            }
          },
          () => setIsStreaming(false)
        );
      }
    } catch (err) {
      console.error('Send message error:', err);
      setIsStreaming(false);
    }
  };


  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputPrompt((prev) => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  return (
    <div className="relative flex h-screen flex-1 flex-col overflow-hidden bg-bg text-fg">
      <header className="z-20 flex items-center justify-between border-b border-line bg-bg/80 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <MascotAvatar type={bot?.isError ? 'warning' : 'blue'} size="sm" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{botTitle}</h2>
            {bot?.role && <p className="truncate text-xs text-fg-3">{bot.role}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModelPicker models={models} currentModel={activeModel} onSelectModel={handleModelChange} />
          <button suppressHydrationWarning={true} onClick={onToggleComputer} className="btn-icon" title="Toggle Desktop Screen Preview">
            <FiMonitor className="text-base" />
          </button>
        </div>
      </header>

      <div className="relative flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl space-y-3">
          <div className="my-4 text-center">
            <span className="label">{formatHeaderDate(activeMessages)}</span>
          </div>

          {pendingApprovals.map((approval) => (
            <ApprovalCard key={approval.requestId} approval={approval} onRespond={handleApprovalResponse} />
          ))}

          {toolEvents.map((event) => (
            <div key={event.id} className="surface my-2 px-3 py-2 text-xs text-fg-2">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-info">{event.tool || 'workspace'}</span>
                <span className={`pill ${event.type === 'tool.completed' ? 'pill-ok' : 'pill-warn'}`}>{event.type.replace('tool.', '')}</span>
              </div>
              {event.error && <p className="mt-1 text-danger">{event.error}</p>}
              {event.result && (
                <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-fg-3">{JSON.stringify(event.result, null, 2)}</pre>
              )}
            </div>
          ))}

          {activeMessages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}

          {isStreaming && (
            <div className="my-3 flex items-center gap-3 animate-fade-in" role="status" aria-label="Assistant is responding">
              <MascotAvatar type={bot?.isError ? 'warning' : 'blue'} size="sm" />
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent animate-dot-pulse" style={{ animationDelay: '0s' }} />
                <span className="h-2 w-2 rounded-full bg-accent animate-dot-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="h-2 w-2 rounded-full bg-accent animate-dot-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="z-20 flex flex-col items-center bg-gradient-to-t from-bg via-bg/90 to-transparent p-4 sm:p-6">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

        {selectedImage && (
          <div className="surface-2 mb-2 flex w-full max-w-2xl items-center justify-between px-3 py-1.5 text-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <img src={selectedImage.previewUrl} alt="Selected Image Preview" className="h-9 w-9 rounded-control border border-line object-cover" />
              <div className="flex flex-col">
                <span className="max-w-[180px] truncate text-xs font-medium text-fg">{selectedImage.file.name}</span>
                <span className="text-[10px] text-fg-3">
                  {selectedImage.isUploading ? 'Uploading image…' : selectedImage.error ? `Upload notice: ${selectedImage.error}` : 'Image ready'}
                </span>
              </div>
            </div>
            <button suppressHydrationWarning={true} type="button" onClick={() => setSelectedImage(null)} className="btn-icon h-7 w-7" title="Remove image">
              <FiX className="text-sm" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex w-full max-w-2xl items-end gap-2 rounded-[22px] border border-line bg-bg-2 px-3 py-2 shadow-pop transition focus-within:border-accent">
          <button suppressHydrationWarning={true} type="button" onClick={() => fileInputRef.current?.click()} className="btn-icon flex-shrink-0" title="Upload Image (JPEG, PNG, WEBP, GIF, AVIF)">
            <FiPlus />
          </button>
          <textarea
            suppressHydrationWarning={true}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            placeholder={`Message ${botTitle}`}
            className="max-h-40 w-full resize-y bg-transparent py-1.5 text-sm text-fg placeholder-fg-3 focus:outline-none"
          />
          <button suppressHydrationWarning={true} type="button" onClick={handleVoiceToggle} className={`btn-icon flex-shrink-0 ${isListening ? 'bg-danger text-white animate-pulse' : ''}`} title="Dictate Voice Input">
            {isListening ? <FiMicOff /> : <FiMic />}
          </button>
          <button suppressHydrationWarning={true} type="submit" disabled={isStreaming || (!inputPrompt.trim() && !selectedImage)} className="btn btn-primary h-8 w-8 flex-shrink-0 rounded-full p-0" title="Send">
            <FiArrowUp />
          </button>
        </form>
        <p className="mt-2 text-[11px] text-fg-3">Enter to send · Shift+Enter for a new line · /search &lt;query&gt; for web lookup</p>
      </div>
    </div>
  );
}
