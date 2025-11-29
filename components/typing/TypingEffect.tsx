"use client";

import React, { useEffect, useState } from 'react';

type Props = {
  text: string;
  speed?: number; // ms per char
  className?: string;
  loop?: boolean; // repeat typing
  erase?: boolean; // erase before retyping when looping
  pause?: number; // pause after finish / after erase in ms
};

export default function TypingEffect({ text, speed = 60, className = '', loop = false, erase = false, pause = 800 }: Props) {
  const [display, setDisplay] = useState('');
  const [caret, setCaret] = useState(true);

  useEffect(() => {
    const content = String(text ?? '');
    if (content.length === 0) return;

    let index = 0;
    let typingInterval: ReturnType<typeof setInterval> | null = null;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    const startTyping = () => {
      typingInterval = setInterval(() => {
        if (typeof content[index] === 'undefined') {
          if (typingInterval) clearInterval(typingInterval);
          typingInterval = null;
          // finished typing
          if (loop) {
            timeoutHandle = setTimeout(() => {
              if (erase) startErasing();
              else {
                // restart typing cycle
                setDisplay('');
                index = 0;
                startTyping();
              }
            }, pause);
          }
          return;
        }
        const char = String(content[index] ?? '');
        setDisplay((d) => (d + char).replace(/undefined/g, ''));
        index++;
      }, speed);
    };

    const startErasing = () => {
      let erasingIndex = content.length - 1;
      typingInterval = setInterval(() => {
        setDisplay((d) => d.slice(0, -1).replace(/undefined/g, ''));
        erasingIndex--;
        if (erasingIndex < 0) {
          if (typingInterval) clearInterval(typingInterval);
          typingInterval = null;
          timeoutHandle = setTimeout(() => {
            // restart typing
            setDisplay('');
            index = 0;
            startTyping();
          }, pause);
        }
      }, speed);
    };

    // init
    setDisplay('');
    index = 0;
    startTyping();

    return () => {
      if (typingInterval) clearInterval(typingInterval);
      if (timeoutHandle) clearTimeout(timeoutHandle);
    };
  }, [text, speed, loop, erase, pause]);

  useEffect(() => {
    const c = setInterval(() => setCaret((v) => !v), 500);
    return () => clearInterval(c);
  }, []);

  return (
    <div className={`mt-4 flex items-center gap-1 ${className}`}>
      <span>{display}</span>
      <span
        aria-hidden
        className="ml-1"
        style={{ opacity: display.length > 0 && caret ? 1 : 0 }}
      >
        |
      </span>
    </div>
  );
}
