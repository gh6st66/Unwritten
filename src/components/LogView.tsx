import React, { useState, useEffect } from 'react';
import { useRun } from '../context/RunContext';
import { LogMessage } from '../core/types';

const VISIBLE_DURATION = 5000; // 5 seconds

export const LogView: React.FC = () => {
    const { state } = useRun();
    const [visibleMessages, setVisibleMessages] = useState<LogMessage[]>([]);

    useEffect(() => {
        // Add new messages from state to our visible list
        const newMessages = state.log.filter(logMsg => !visibleMessages.some(vm => vm.id === logMsg.id));
        if (newMessages.length > 0) {
            setVisibleMessages(prev => [...prev, ...newMessages]);
        }

        // Set timers to remove old messages
        const now = Date.now();
        const timers = visibleMessages.map(msg => {
            const timeout = Math.max(0, (msg.timestamp + VISIBLE_DURATION) - now);
            return setTimeout(() => {
                setVisibleMessages(prev => prev.filter(vm => vm.id !== msg.id));
            }, timeout);
        });

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [state.log, visibleMessages]);

    if (visibleMessages.length === 0) {
        return null;
    }

    return (
        <div className="log-view" aria-live="polite">
            {visibleMessages.map(msg => (
                <div key={msg.id} className="log-message">
                    {msg.text}
                </div>
            ))}
        </div>
    );
};
