import React, { useState, useEffect } from 'react';
import '../styles/rumorTicker.css';

interface Props {
  rumors: { text: string; id: string }[];
}

export const RumorTicker: React.FC<Props> = ({ rumors }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (!rumors || rumors.length === 0) {
      setIsVisible(false);
      return;
    }

    if (rumors.length > 0 && currentIndex >= rumors.length) {
      setCurrentIndex(rumors.length - 1);
    }
    
    // Make the first rumor visible immediately
    setIsVisible(true);

    const interval = setInterval(() => {
      if (!isPaused && rumors.length > 1) {
        setIsVisible(false); // Start fade out
        setTimeout(() => {
          setCurrentIndex(prevIndex => (prevIndex + 1) % rumors.length);
          setIsVisible(true); // Start fade in with new text
        }, 500); // must match css transition duration
      }
    }, 5000); // Change rumor every 5 seconds

    return () => clearInterval(interval);
  }, [rumors, isPaused, currentIndex]);

  // When new rumors arrive, immediately switch to the latest one
  useEffect(() => {
    if (rumors.length > 0) {
        setCurrentIndex(rumors.length - 1);
    }
  }, [rumors]);


  if (!rumors || rumors.length === 0) {
    return (
        <div className="rumor-ticker-container">
            <div className="rumor-text-wrapper">
                <span>The world is quiet.</span>
            </div>
        </div>
    );
  }

  return (
    <div className="rumor-ticker-container">
      <div className="rumor-text-wrapper">
        <span className={`rumor-text ${isVisible ? 'visible' : ''}`} key={rumors[currentIndex]?.id}>
          {rumors[currentIndex]?.text}
        </span>
      </div>
      <button onClick={() => setIsPaused(!isPaused)} className="rumor-pause-btn" aria-label={isPaused ? 'Play rumor ticker' : 'Pause rumor ticker'}>
        {isPaused ? '▶' : '❚❚'}
      </button>
    </div>
  );
};