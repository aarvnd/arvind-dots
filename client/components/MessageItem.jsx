'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FiX } from 'react-icons/fi';

function formatMsgTime(createdAt) {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function MessageItem({ message }) {
  const isUser = message.sender === 'user';
  const isError = message.isError || message.text?.toLowerCase().startsWith('error:');
  const formattedTime = formatMsgTime(message.created_at);

  if (isUser) {
    return (
      <div className="flex justify-end my-2">
        <div className="max-w-md rounded-card rounded-br-md bg-bg-3 border border-line px-4 py-2.5 text-sm text-fg">
          {message.image_url && (
            <img
              src={message.image_url}
              alt="Uploaded image attachment"
              className="max-w-full max-h-56 rounded-control object-cover border border-line mb-2"
            />
          )}
          <div className="flex justify-end gap-3">
            <span className="break-words">{message.text}</span>
            {formattedTime && (
              <span className="text-[10px] text-fg-3 font-mono flex-shrink-0 self-end ml-auto">
                {formattedTime}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-start my-2">
        <div className="notice notice-danger max-w-md font-mono text-xs items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <FiX className="text-danger text-sm flex-shrink-0" />
            <span className="truncate">{message.text}</span>
          </div>
          {formattedTime && (
            <span className="text-[10px] text-fg-3 font-mono flex-shrink-0">{formattedTime}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start my-2">
      <div className="max-w-2xl px-1 py-1 text-sm leading-7 text-fg overflow-hidden">
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => <div className="mb-2 last:mb-0" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-semibold text-fg" {...props} />,
            code: ({ node, inline, className, children, ...props }) => {
              const isInline = inline || (!className && typeof children === 'string' && !children.includes('\n'));
              if (isInline) {
                return (
                  <code className="rounded bg-bg-2 border border-line px-1.5 py-0.5 font-mono text-[12px] text-info" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <pre className="my-2 overflow-x-auto rounded-control border border-line bg-bg-1 p-3 font-mono text-[12px] text-fg-2">
                  <code {...props}>{children}</code>
                </pre>
              );
            },
            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-1 text-fg-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-1 text-fg-2" {...props} />,
          }}
        >
          {message.text}
        </ReactMarkdown>
        {formattedTime && (
          <div className="mt-1 text-right font-mono text-[10px] text-fg-3">
            {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
}
