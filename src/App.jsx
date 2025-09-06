import React, { useState, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { SONGS } from './Lyrics';
import { FaInfoCircle } from 'react-icons/fa';

// The main App component
const App = () => {
  // Define the songs and their lyrics
  const songs = SONGS;
  // State variables for the app
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1); // -1 for "title screen"
  const lineRefs = useRef([]);
  const containerRef = useRef(null);
  const lastClickTimeRef = useRef(0);

  // Define background animations for each song index
  const backgroundAnimations = [
    "animate-pulse-bg-1",
    "animate-pulse-bg-2",
    "animate-pulse-bg-3",
    "animate-pulse-bg-4",
    "animate-pulse-bg-5",
    "animate-pulse-bg-6",
    "animate-pulse-bg-7",
    "animate-pulse-bg-8",
    "animate-pulse-bg-9",
    "animate-pulse-bg-10",
    "animate-pulse-bg-11",
    "animate-pulse-bg-12",
    "animate-pulse-bg-13",
    "animate-pulse-bg-14",
    "animate-pulse-bg-15",
    "animate-pulse-bg-16",
    "animate-pulse-bg-17",
  ];

  // Get the current song
  const currentSong = songs[currentSongIndex];

  const navigateNextSong = () => {
    const nextSongIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextSongIndex);
    setCurrentLineIndex(-1);
  };

  const navigatePrevSong = () => {
    const prevSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevSongIndex);
    setCurrentLineIndex(-1);
  };

  const advanceLine = () => {
    if (currentLineIndex >= 0) {
      setCurrentLineIndex(prev => Math.min(prev + 1, currentSong.lyrics.length));
    } else {
      setCurrentLineIndex(0);
    }
  };

  const goBackLine = () => {
    if (currentLineIndex >= 0) {
      setCurrentLineIndex(prev => Math.max(0, prev - 1));
    }
  };

  // Effect for handling keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'p'].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowRight':
          advanceLine();
          break;
        case 'ArrowLeft':
          goBackLine();
          break;
        case 'ArrowUp':
          navigateNextSong();
          break;
        case 'ArrowDown':
          navigatePrevSong();
          break;
        case 'p':
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentLineIndex, currentSongIndex, songs]);

  // Effect for handling mouse input
  useEffect(() => {
    const handleMouseDown = (e) => {
      e.preventDefault();
      if (e.button === 0) { // Left click
        const currentTime = new Date().getTime();
        const doubleClickThreshold = 300;
        if (currentTime - lastClickTimeRef.current < doubleClickThreshold) {
          navigateNextSong();
          lastClickTimeRef.current = 0;
        } else {
          advanceLine();
          lastClickTimeRef.current = currentTime;
        }
      } else if (e.button === 2) { // Right click
        goBackLine();
      }
    };
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [currentLineIndex, currentSongIndex, songs]);

  // Function to handle the smooth scrolling
  const scrollToCenter = () => {
    if (currentLineIndex >= 0 && lineRefs.current[currentLineIndex] && containerRef.current) {
      const lineElement = lineRefs.current[currentLineIndex];
      const containerElement = containerRef.current;
      const containerHeight = containerElement.clientHeight;
      const lineOffsetTop = lineElement.offsetTop;
      const lineHeight = lineElement.clientHeight;
      const newScrollTop = lineOffsetTop - (containerHeight / 2) + (lineHeight / 2);
      containerElement.scrollTo({
        top: newScrollTop,
        behavior: 'smooth'
      });
    }
  };

  // Effect to handle smooth scrolling of the lyrics
  useEffect(() => {
    scrollToCenter();
  }, [currentLineIndex]);

  const containerClass = twMerge(
    "flex flex-col items-center justify-center h-screen bg-gray-900 text-white font-sans overflow-hidden transition-all duration-1000 ease-in-out bg-gradient-to-br relative",
    backgroundAnimations[currentSongIndex]
  );
  const titleContainerClass = "text-center text-4xl sm:text-6xl md:text-8xl font-bold transition-opacity duration-1000 ease-in-out font-display";
  const songTitleClass = "text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]";
  const bandNameClass = "text-white text-opacity-80 mt-4 text-2xl sm:text-4xl md:text-5xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]";
  const lyricsContainerClass = "flex flex-col items-center justify-center w-full max-w-7xl h-auto px-4 mt-8 scroll-smooth no-scrollbar";
  const lineClass = (index) => {
    const baseClasses = "text-center font-semibold my-4 transition-all duration-500 ease-in-out";
    if (index === currentLineIndex) {
      return twMerge(baseClasses, "text-xl sm:text-3xl md:text-4xl font-bold text-yellow-400 animate-pulse-once drop-shadow-[0_4px_8px_rgba(255,255,0,0.7)] transform scale-150 transform-origin-center");
    }
    if (index < currentLineIndex) {
      return twMerge(baseClasses, "text-lg sm:text-xl md:text-2xl text-white text-opacity-40");
    }
    return twMerge(baseClasses, "text-lg sm:text-xl md:text-2xl text-white");
  };
  const getVisibleLines = () => {
    if (currentLineIndex < 0) return [];
    const lines = currentSong.lyrics;
    const windowSize = 5;
    const halfWindow = Math.floor(windowSize / 2);
    let startIndex = Math.max(0, currentLineIndex - halfWindow);
    let endIndex = startIndex + windowSize;
    if (endIndex > lines.length) {
      endIndex = lines.length;
      startIndex = Math.max(0, endIndex - windowSize);
    }
    return lines.slice(startIndex, endIndex).map((line, index) => ({
      text: line,
      originalIndex: startIndex + index,
    }));
  };
  const visibleLines = getVisibleLines();

  return (
    <div className={containerClass}>
      {currentLineIndex === -1 ? (
        <div className={titleContainerClass}>
          <h1 className={songTitleClass}>{currentSong.title}</h1>
          <h2 className={bandNameClass}>by {currentSong.band}</h2>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className={twMerge(lyricsContainerClass, 'max-h-[75vh] md:max-h-[85vh]')} ref={containerRef}>
            {visibleLines.map((line) => (
              <p key={line.originalIndex} ref={el => lineRefs.current[line.originalIndex] = el} className={lineClass(line.originalIndex)}>
                {typeof line.text === 'string' ? line.text : line.text.text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Moved the help icon container outside the title screen conditional rendering */}
      {currentLineIndex === -1 && (
        <div className="absolute bottom-4 left-4 flex flex-col items-start group">
          <div className="text-white text-opacity-50 group-hover:text-opacity-100 transition-opacity duration-200">
            <FaInfoCircle size={24} />
          </div>

          <div
            className="absolute bottom-full mb-4 w-64 p-4 rounded-lg bg-gray-800 bg-opacity-70 text-white text-opacity-80 text-sm transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
          >
            <p>Click anywhere to start.</p>
            <p>• **Left-click** to advance.</p>
            <p>• **Right-click** to go back.</p>
            <p>• **Double-click** to go to the next song.</p>
            <p className="mt-2">Keyboard:</p>
            <p>• **'→'** to advance.</p>
            <p>• **'←'** to go back.</p>
            <p>• **'↑'** to go to the next song.</p>
            <p>• **'↓'** to go to the previous song.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;