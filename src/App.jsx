import React, { useState, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { SONGS } from './Lyrics';
import { FaInfoCircle } from 'react-icons/fa';
import headerBackground from './assets/header.jpeg';

// Define the control schemes with multiple keys for each action
const CONTROL_SCHEMES = [
  {
    name: "Arrows",
    lineAdvance: ['ArrowRight'],
    lineBack: ['ArrowLeft'],
    nextSong: ['ArrowUp'],
    prevSong: ['ArrowDown'],
  },
  {
    name: "Mouse",
    lineAdvance: ['LeftClick'],
    lineBack: ['RightClick'],
    nextSong: ['DoubleClick'],
    prevSong: ['DoubleClickBack'],
  },
  {
    name: "Clicker",
    lineAdvance: ['ArrowUp', 'PageUp'],
    lineBack: ['ArrowDown', 'PageDown'],
    nextSong: ['Tab'],
    prevSong: ['ShiftTab'],
  },
  {
    name: "iPhone",
    lineAdvance: ["Right Tap"],
    lineBack: ["Left Tap"],
    nextSong: ["Double Tap"],
    prevSong: ["None"],
  }
];

// Helper function to detect if the user is on an iPhone
const isIPhone = () => {
  return /iPhone/i.test(navigator.userAgent);
};

// Opening Page Component
const IntroPage = ({ backgroundImage }) => {
  return (
    <div
      className="flex flex-col items-center justify-start h-screen text-white text-center p-4 bg-gray-900"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="p-8 rounded-lg mt-24">
        <h1 className="text-8xl font-bold font-display text-green-600 drop-shadow-[0_6px_6px_rgba(0,0,0,0.7)]">
          Don & Haley
        </h1>
        <h3 className="text-2xl font-bold font-display text-gray-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          Saturday, September 13, 2025
        </h3>
        <h3 className="text-2xl font-bold font-display text-gray-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          Fullerton, CA, USA
        </h3>
      </div>
    </div>
  );
};

// Closing Page Component
const OutroPage = ({ onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white text-center p-4">
      <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold font-display text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
        End of Set
      </h1>
      <p className="mt-4 text-xl sm:text-2xl md:text-3xl text-white text-opacity-80 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
        Thanks for using the teleprompter!
      </p>
      <button
        onClick={onRestart}
        className="mt-8 px-8 py-4 bg-yellow-400 text-gray-900 font-bold rounded-full text-lg shadow-lg hover:bg-yellow-500 transition-colors duration-200"
      >
        Restart
      </button>
    </div>
  );
};

const App = () => {
  const songs = SONGS;
  const [page, setPage] = useState('intro'); // 'intro', 'app', 'outro'
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false); // State for all fade-outs

  // Set the initial control scheme based on device detection
  const [currentSchemeIndex, setCurrentSchemeIndex] = useState(() => {
    if (isIPhone()) {
      // Find the index of the iPhone scheme
      return CONTROL_SCHEMES.findIndex(scheme => scheme.name === "iPhone");
    }
    return 0; // Default to Arrows scheme
  });

  const [isMultiLineMode, setIsMultiLineMode] = useState(false);
  const lineRefs = useRef([]);
  const containerRef = useRef(null);
  const lastClickTimeRef = useRef(0);

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

  const currentSong = songs[currentSongIndex];
  const currentScheme = CONTROL_SCHEMES[currentSchemeIndex];
  const currentSection = currentSectionIndex >= 0 ? currentSong.lyrics[currentSectionIndex] : null;

  const navigateNextSong = () => {
    setIsFadingOut(true);
    const nextSongIndex = currentSongIndex + 1;
    setTimeout(() => {
      if (nextSongIndex >= songs.length) {
        setPage('outro');
        setCurrentSongIndex(0); // Reset for next time
      } else {
        setCurrentSongIndex(nextSongIndex);
      }
      setCurrentSectionIndex(-1);
      setCurrentLineIndex(0);
      setIsFadingOut(false);
    }, 500);
  };

  const navigatePrevSong = () => {
    setIsFadingOut(true);
    const prevSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setTimeout(() => {
      setCurrentSongIndex(prevSongIndex);
      setCurrentSectionIndex(-1);
      setCurrentLineIndex(0);
      setIsFadingOut(false);
    }, 500);
  };

  const advance = () => {
    if (currentSectionIndex === -1) {
      setIsFadingOut(true);
      setTimeout(() => {
        setCurrentSectionIndex(0);
        setCurrentLineIndex(0);
        setIsFadingOut(false);
      }, 500);
      return;
    }

    if (isMultiLineMode) {
      if (currentSectionIndex < currentSong.lyrics.length - 1) {
        setCurrentSectionIndex(prev => prev + 1);
        setCurrentLineIndex(0);
      } else {
        navigateNextSong();
      }
    } else {
      if (currentLineIndex < currentSection.lines.length - 1) {
        setCurrentLineIndex(prev => prev + 1);
      } else if (currentSectionIndex < currentSong.lyrics.length - 1) {
        setCurrentSectionIndex(prev => prev + 1);
        setCurrentLineIndex(0);
      } else {
        navigateNextSong();
      }
    }
  };

  const goBack = () => {
    if (page === 'app' && currentSongIndex === 0 && currentSectionIndex === -1) {
      setPage('intro');
      return;
    }

    if (currentSectionIndex === -1) {
      setIsFadingOut(true);
      setTimeout(() => {
        const prevSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        const prevSong = songs[prevSongIndex];
        const lastSectionIndex = prevSong.lyrics.length - 1;
        const lastSection = prevSong.lyrics[lastSectionIndex];

        setCurrentSongIndex(prevSongIndex);
        setCurrentSectionIndex(lastSectionIndex);
        setCurrentLineIndex(isMultiLineMode ? 0 : lastSection.lines.length - 1);
        setIsFadingOut(false);
      }, 500);
    } else if (isMultiLineMode) {
      if (currentSectionIndex > 0) {
        setCurrentSectionIndex(prev => prev - 1);
        setCurrentLineIndex(0);
      } else {
        setIsFadingOut(true);
        setTimeout(() => {
          setCurrentSectionIndex(-1);
          setIsFadingOut(false);
        }, 500);
      }
    } else { // Single-line mode
      if (currentLineIndex > 0) {
        setCurrentLineIndex(prev => prev - 1);
      } else if (currentSectionIndex > 0) {
        // This is the new logic to go to the previous section
        setCurrentSectionIndex(prev => prev - 1);
        const prevSection = currentSong.lyrics[currentSectionIndex - 1];
        setCurrentLineIndex(prevSection.lines.length - 1);
      } else {
        // When at the first line of the first section, go back to the title page
        setIsFadingOut(true);
        setTimeout(() => {
          setCurrentSectionIndex(-1);
          setIsFadingOut(false);
        }, 500);
      }
    }
  };

  const toggleControlScheme = () => {
    setCurrentSchemeIndex(prev => (prev + 1) % CONTROL_SCHEMES.length);
  };

  const toggleMultiLineMode = () => {
    setIsMultiLineMode(prev => !prev);
    setCurrentLineIndex(0);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'c') {
        e.preventDefault();
        toggleControlScheme();
        return;
      }
      if (e.key === 'm') {
        e.preventDefault();
        toggleMultiLineMode();
        return;
      }

      if (currentScheme.name === "iPhone") {
        return;
      }

      const allKeys = Object.values(CONTROL_SCHEMES).flatMap(scheme =>
        Object.values(scheme).flat()
      );
      if (e.key === 'Tab' || e.key === 'Shift') {
        e.preventDefault();
      }
      if (allKeys.includes(e.key)) {
        e.preventDefault();
      }

      if (currentScheme.lineAdvance.includes(e.key)) {
        if (page === 'intro') {
          setPage('app');
        } else {
          advance();
        }
      } else if (currentScheme.lineBack.includes(e.key)) {
        goBack();
      } else if (currentScheme.nextSong.includes(e.key)) {
        navigateNextSong();
      } else if (currentScheme.prevSong.includes(e.key)) {
        navigatePrevSong();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentSectionIndex, currentLineIndex, currentSchemeIndex, isMultiLineMode, currentSongIndex, currentSong, page]);

  useEffect(() => {
    const handleMouseDown = (e) => {
      e.preventDefault();
      if (currentScheme.name !== "Mouse") return;

      if (e.button === 0) {
        const currentTime = new Date().getTime();
        const doubleClickThreshold = 300;
        if (currentTime - lastClickTimeRef.current < doubleClickThreshold) {
          navigateNextSong();
          lastClickTimeRef.current = 0;
        } else {
          if (page === 'intro') {
            setPage('app');
          } else {
            advance();
          }
          lastClickTimeRef.current = currentTime;
        }
      } else if (e.button === 2) {
        goBack();
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
  }, [currentSectionIndex, currentLineIndex, currentSchemeIndex, isMultiLineMode, currentSongIndex, currentSong, page]);

  useEffect(() => {
    const handleTouchStart = (e) => {
      e.preventDefault();
      if (currentScheme.name === "iPhone") {
        const touchX = e.touches[0].clientX;
        const screenWidth = window.innerWidth;

        if (e.touches.length === 1) {
          if (touchX > screenWidth / 2) {
            if (page === 'intro') {
              setPage('app');
            } else {
              advance();
            }
          } else {
            goBack();
          }
        } else if (e.touches.length === 2) {
          navigateNextSong();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [currentSectionIndex, currentLineIndex, currentSchemeIndex, isMultiLineMode, currentSongIndex, currentSong, page]);

  useEffect(() => {
    if (currentSectionIndex >= 0 && currentSection && lineRefs.current.length > 0) {
      if (!isMultiLineMode && currentLineIndex >= 0) {
        const lineElement = lineRefs.current[currentLineIndex];
        const containerElement = containerRef.current;
        if (lineElement && containerElement) {
          const containerHeight = containerElement.clientHeight;
          const lineOffsetTop = lineElement.offsetTop;
          const lineHeight = lineElement.clientHeight;
          const newScrollTop = lineOffsetTop - (containerHeight / 2) + (lineHeight / 2);
          containerElement.scrollTo({
            top: newScrollTop,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [currentSectionIndex, currentLineIndex, isMultiLineMode]);

  const containerClass = twMerge(
    "flex flex-col items-center justify-center h-screen bg-gray-900 text-white font-sans overflow-hidden transition-all duration-1000 ease-in-out bg-gradient-to-br relative",
    backgroundAnimations[currentSongIndex]
  );

  const titleContainerClass = twMerge(
    "text-center text-4xl sm:text-6xl md:text-8xl font-bold transition-opacity duration-1000 ease-in-out font-display",
    isFadingOut ? 'opacity-0' : 'opacity-100'
  );
  const songTitleClass = "text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]";
  const bandNameClass = "text-white text-opacity-80 mt-4 text-2xl sm:text-4xl md:text-5xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]";
  const lyricsContainerClass = "flex flex-col items-center justify-center w-full max-w-7xl h-auto px-2 mt-8 scroll-smooth no-scrollbar";

  const lineClass = (index) => {
    const baseClasses = "text-center font-semibold my-4 transition-all duration-500 ease-in-out";
    if (isMultiLineMode) {
      return twMerge(baseClasses, "text-[50px]");
    } else {
      if (index === currentLineIndex) {
        return twMerge(baseClasses, "text-xl sm:text-3xl md:text-4xl font-bold text-yellow-400 animate-pulse-once drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] transform scale-150 transform-origin-center");
      }
      if (index < currentLineIndex) {
        return twMerge(baseClasses, "text-xl sm:text-3xl md:text-4xl text-white text-opacity-40");
      }
      return twMerge(baseClasses, "text-xl sm:text-3xl md:text-4xl text-white");
    }
  };

  const getHelpText = () => {
    const scheme = currentScheme;
    const formatKeys = (keys) => keys.map(key => `<b>'${key}'</b>`).join(' or ');

    if (isMultiLineMode) {
      return (
        <>
          <p>Current Mode: <b>Multi-Line Advance</b></p>
          <p><b>'M'</b> to switch to single-line mode.</p>
          <p className="mt-2">Current Controls: <b>{scheme.name}</b></p>
          <p><b>'C'</b> to change scheme.</p>
          <p className="mt-2" dangerouslySetInnerHTML={{
            __html: `
            • ${formatKeys(scheme.lineAdvance)} to advance to next section.
          `}}></p>
          <p dangerouslySetInnerHTML={{
            __html: `
            • ${formatKeys(scheme.lineBack)} to go back to previous section.
          `}}></p>
          <p dangerouslySetInnerHTML={{
            __html: `
            • ${formatKeys(scheme.nextSong)} to next song.
          `}}></p>
          <p dangerouslySetInnerHTML={{
            __html: `
            • ${formatKeys(scheme.prevSong)} to previous song.
          `}}></p>
        </>
      );
    } else {
      return (
        <>
          <p>Current Mode: <b>Single-Line Advance</b></p>
          <p><b>'M'</b> to switch to multi-line mode.</p>
          <p className="mt-2">Current Controls: <b>{scheme.name}</b></p>
          <p><b>'C'</b> to change scheme.</p>
          <p className="mt-2" dangerouslySetInnerHTML={{
            __html: `
            • ${formatKeys(scheme.lineAdvance)} to advance highlight.
          `}}></p>
          <p dangerouslySetInnerHTML={{
            __html: `
            • ${formatKeys(scheme.lineBack)} to go back.
          `}}></p>
          <p dangerouslySetInnerHTML={{
            __html: `
            • ${formatKeys(scheme.nextSong)} to next song.
          `}}></p>
          <p dangerouslySetInnerHTML={{
            __html: `
            • ${formatKeys(scheme.prevSong)} to previous song.
          `}}></p>
        </>
      );
    }
  };

  if (page === 'intro') {
    return (<>
      <IntroPage backgroundImage={headerBackground} />
      <div className="absolute bottom-4 left-4 flex flex-col items-start group">
        <div className="text-white text-opacity-50 group-hover:text-opacity-100 transition-opacity duration-200">
          <FaInfoCircle size={24} />
        </div>

        <div
          className="absolute bottom-full mb-4 w-64 p-4 rounded-lg bg-gray-800 bg-opacity-70 text-white text-opacity-80 text-sm transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
        >
          {getHelpText()}
        </div>
      </div>
    </>);

  }

  if (page === 'outro') {
    return <OutroPage onRestart={() => setPage('intro')} />;
  }

  return (
    <div className={containerClass}>
      {currentSectionIndex === -1 ? (
        <div id="title-screen" className={twMerge(titleContainerClass, "flex flex-col justify-center h-screen w-full")}>
          <h1 className={songTitleClass}>{currentSong.title}</h1>
          <h2 className={bandNameClass}>by {currentSong.band}</h2>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className={twMerge(lyricsContainerClass, 'max-h-[75vh] md:max-h-[85vh]')} ref={containerRef}>
            {currentSection && currentSection.lines.map((line, index) => (
              <p key={index} ref={el => lineRefs.current[index] = el} className={lineClass(index)}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {currentSectionIndex === -1 && (
        <div className="absolute bottom-4 left-4 flex flex-col items-start group">
          <div className="text-white text-opacity-50 group-hover:text-opacity-100 transition-opacity duration-200">
            <FaInfoCircle size={24} />
          </div>

          <div
            className="absolute bottom-full mb-4 w-64 p-4 rounded-lg bg-gray-800 bg-opacity-70 text-white text-opacity-80 text-sm transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
          >
            {getHelpText()}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;