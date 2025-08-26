import React, { useState, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { SONGS } from './Lyrics';

// The main App component
const App = () => {
  // Define the songs and their lyrics, with BPM and a new lyrics data structure
  const songs = SONGS;
  // State variables for the app
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1); // -1 for "title screen"
  const [lineDuration, setLineDuration] = useState(1500); // Initial duration in milliseconds
  const [scrolling, setScrolling] = useState(false);
  const timerRef = useRef(null); // Changed from intervalRef to timerRef for setTimeout
  const lineRefs = useRef([]);
  const containerRef = useRef(null);

  // Get the current song
  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    // set initial line duration for the current song
    // can be changed by future lines
    setLineDuration(currentSong.avgLineDuration)
  }, [currentSong])

  // Function to start the scrolling timer
  const startTimer = (index) => {
    if (scrolling && index < currentSong.lyrics.length) {
      // Clear any existing timer to prevent race conditions or unexpected behavior
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      let newLineDuration = lineDuration;
      // If a specific duration is provided as an object property, use it directly
      const line = currentSong.lyrics[index];
      if (typeof line === 'object') {
        if (line.lineDuration) {
          // Update the current line's duration to be different than the song duration
          newLineDuration = line.lineDuration;
        }
        if (line.songDuration) {
          // Update the overall song's duration per line going forwards
          setLineDuration(line.songDuration)
        }
      }

      // Set a new timer to advance the line after the calculated line duration
      timerRef.current = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
      }, newLineDuration);
    }
  };

  // Effect for handling keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Prevent default browser behavior for arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', ' ', 'n', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      switch (e.key.toLowerCase()) {
        case ' ': // Space bar to start/pause
          if (currentLineIndex === -1) {
            // Start the song from the beginning if it's on the title screen
            setCurrentLineIndex(0);
            setScrolling(true);
          } else {
            // Toggle scrolling
            setScrolling(prev => !prev);
          }
          break;
        case 'arrowup': // Speed up scrolling by decreasing the duration
          setLineDuration(prev => Math.max(200, prev - 100)); // Ensure it doesn't go below a certain point
          break;
        case 'arrowdown': // Slow down scrolling by increasing the duration
          setLineDuration(prev => Math.min(5000, prev + 100)); // Ensure it doesn't go above a certain point
          break;
        case 'arrowright': // Immediately jump to next line
          if (scrolling) {
            // Clear the current timer and immediately advance the line
            if (timerRef.current) {
              clearTimeout(timerRef.current);
            }
            setCurrentLineIndex(prev => Math.min(prev + 1, currentSong.lyrics.length));
          }
          break;
        case 'arrowleft': // Jump to previous line
          if (scrolling) {
            if (timerRef.current) {
              clearTimeout(timerRef.current);
            }
            setCurrentLineIndex(prev => Math.max(0, prev - 1));
          }
          break;
        case 'n': // Navigate to the next song
          // Stop any current scrolling timer first
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          // Move to the next song, looping back to the start if at the end
          const nextSongIndex = (currentSongIndex + 1) % songs.length;
          setCurrentSongIndex(nextSongIndex);
          // Reset speed and line index for the new song
          setLineDuration(1500);
          setCurrentLineIndex(-1);
          setScrolling(false);
          break;
        case 'p': // Navigate to the previous song
          // Stop any current scrolling timer first
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          // Move to the previous song, looping to the end if at the start
          const prevSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
          setCurrentSongIndex(prevSongIndex);
          // Reset speed and line index for the new song
          setLineDuration(1500);
          setCurrentLineIndex(-1);
          setScrolling(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentLineIndex, songs.length, currentSongIndex, songs, scrolling, currentSong, lineDuration]);

  // Effect for managing the scrolling timer
  useEffect(() => {
    if (scrolling) {
      startTimer(currentLineIndex);
    } else {
      // If the song has ended or is paused, clear the timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }

    // Cleanup function to clear the timer when the component unmounts or dependencies change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [scrolling, currentLineIndex, currentSong, lineDuration]);

  // Effect to handle smooth scrolling of the lyrics
  useEffect(() => {
    // Only attempt to scroll if we are in the lyrics view and there's a valid line to scroll to
    if (currentLineIndex >= 0 && lineRefs.current[currentLineIndex] && containerRef.current) {
      const lineElement = lineRefs.current[currentLineIndex];

      // Use scrollIntoView to center the element
      lineElement.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
    }
  }, [currentLineIndex]);

  // CSS classes using Tailwind for styling
  const containerClass = "flex flex-col items-center justify-center h-screen bg-gray-900 text-white font-sans overflow-hidden transition-all duration-1000 ease-in-out bg-gradient-to-br from-indigo-900 to-purple-900";
  const titleContainerClass = "text-center text-4xl sm:text-6xl md:text-8xl font-bold transition-opacity duration-1000 ease-in-out";
  const songTitleClass = "text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]";
  const bandNameClass = "text-white text-opacity-80 mt-4 text-2xl sm:text-4xl md:text-5xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]";
  const lyricsContainerClass = "text-center transition-all duration-1000 ease-in-out w-full max-w-7xl h-full overflow-y-scroll px-4 mt-8 no-scrollbar scroll-smooth";
  const lineClass = (index) => {
    // Merge classes to avoid conflicts
    const baseClasses = "text-center font-semibold my-4 transition-all duration-500 ease-in-out";
    if (index === currentLineIndex) {
      // Currently active line, with a fun animation
      // We use scale to avoid reformatting the layout
      return twMerge(baseClasses, "text-xl sm:text-3xl md:text-4xl font-bold text-yellow-400 animate-pulse-once drop-shadow-[0_4px_8px_rgba(255,255,0,0.7)] transform scale-150 transform-origin-center");
    }
    // Lines that have already been sung
    if (index < currentLineIndex) {
      return twMerge(baseClasses, "text-lg sm:text-xl md:text-2xl text-white text-opacity-40");
    }
    // Upcoming lines
    return twMerge(baseClasses, "text-lg sm:text-xl md:text-2xl text-white");
  };
  const instructionsClass = "absolute bottom-8 text-white text-opacity-50 text-sm sm:text-base md:text-lg font-mono tracking-wide";

  // Render the teleprompter based on the current line index
  return (
    <div className={containerClass}>
      {currentLineIndex === -1 ? (
        // Title screen display
        <div className={titleContainerClass}>
          <h1 className={songTitleClass}>{currentSong.title}</h1>
          <h2 className={bandNameClass}>by {currentSong.band}</h2>
        </div>
      ) : (
        // Lyrics display
        <div className={lyricsContainerClass} ref={containerRef}>
          {currentSong.lyrics.map((line, index) => (
            <p key={index} ref={el => lineRefs.current[index] = el} className={lineClass(index)}>
              {typeof line === 'string' ? line : line.text}
            </p>
          ))}
        </div>
      )}

      {/* Instructions on how to use the app */}
      <div className={instructionsClass}>
        <p>Press 'Space' to start/pause. Use '↑' / '↓' to speed up/slow down. Use '→' to jump to the next line. Use '←' to go back one line. Press 'n' for next song. Press 'p' for previous song.</p>
      </div>
    </div>
  );
};

export default App;
