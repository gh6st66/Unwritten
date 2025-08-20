import React, { useState, useEffect } from 'react';
import { useRun } from '../context/RunContext';
import { LogMessage } from '../core/types';

const BASE_VISIBLE_DURATION = 3000; // ms to keep message after it's typed
const DURATION_PER_CHAR = 1000 / 50; // ms per character, matching default typewriter speed
const FADE_OUT_DURATION = 500; // ms, should match CSS animation

const TypewriterText: React.FC<{ text: string, speed?: number }> = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    if (!text) {
        setIsTyping(false);
        return;
    };

    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 1000 / speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return (
      <>
          {displayedText}
          {isTyping && <span className="typewriter-cursor" />}
      </>
  );
};

export const LogView: React.FC = () => {
    const { state } = useRun();
    const [visibleMessages, setVisibleMessages] = useState<LogMessage[]>([]);
    const [fadingOut, setFadingOut] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Add new messages from state to our visible list
        const newMessages = state.log.filter(logMsg => !visibleMessages.some(vm => vm.id === logMsg.id));
        if (newMessages.length > 0) {
            setVisibleMessages(prev => [...prev, ...newMessages]);
        }

        // Set timers to remove old messages
        const now = Date.now();
        const timers: number[] = [];
        
        visibleMessages.forEach(msg => {
            // Check if it's already fading out
            if (fadingOut.has(msg.id)) return;
            
            const duration = BASE_VISIBLE_DURATION + msg.text.length * DURATION_PER_CHAR;
            const timeout = Math.max(0, (msg.timestamp + duration) - now);

            const timer = setTimeout(() => {
                setFadingOut(prev => new Set(prev).add(msg.id));
                
                const removeTimer = setTimeout(() => {
                    setVisibleMessages(prev => prev.filter(vm => vm.id !== msg.id));
                    setFadingOut(prev => {
                        const next = new Set(prev);
                        next.delete(msg.id);
                        return next;
                    });
                }, FADE_OUT_DURATION);
                timers.push(removeTimer as unknown as number);
            }, timeout);
            timers.push(timer as unknown as number);
        });

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [state.log, visibleMessages, fadingOut]);


    if (visibleMessages.length === 0) {
        return null;
    }

    return (
        <div className="log-view" aria-live="polite">
            {visibleMessages.map(msg => (
                <div key={msg.id} className={`log-message ${fadingOut.has(msg.id) ? 'fading-out' : ''}`}>
                    <TypewriterText text={msg.text} />
                </div>
            ))}
        </div>
    );
};
