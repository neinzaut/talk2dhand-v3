'use client';

import React, { useEffect, useRef, useState } from 'react';

// HTMLPoseViewerElement interface
interface HTMLPoseViewerElement extends HTMLElement {
  src: string;
  autoplay: boolean;
  width: string | number;
  duration: number;
  currentTime: number;
  playbackRate: number;
  play(): Promise<void>;
  pause(): Promise<void>;
  getPose(): Promise<any>;
  shadowRoot: ShadowRoot;
}

// Extend JSX IntrinsicElements for pose-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pose-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          autoplay?: string | boolean;
          loop?: string | boolean;
          width?: string | number;
          'aspect-ratio'?: string | number;
          background?: string;
        },
        HTMLElement
      >;
    }
  }
}

export interface SkeletonPoseViewerProps {
  /** URL or path to the .pose file or gloss text to generate pose */
  gloss: string;
  /** Start animation automatically */
  autoplay?: boolean;
  /** Loop animation continuously like a GIF */
  loop?: boolean;
  /** Width of the viewer in pixels or '100%' */
  width?: number | string;
  /** Aspect ratio (width/height) */
  aspectRatio?: number;
  /** Background color or 'transparent' */
  background?: string;
  /** Show current word/letter being signed */
  showCurrentWord?: boolean;
  /** Playback speed (0.5x, 1x, 1.5x, 2x, etc.) */
  speed?: number;
  /** Callback when first frame renders */
  onFirstRender?: () => void;
  /** Callback on each frame render */
  onRender?: () => void;
  /** Callback when animation completes */
  onEnded?: () => void;
  /** Callback when current word/letter changes */
  onCurrentWordChange?: (word: string) => void;
}

/**
 * React wrapper for the pose-viewer web component
 * Displays 2D skeleton animations for sign language gestures
 * Converts gloss text to pose animations using the sign-mt API
 */
export const SkeletonPoseViewer: React.FC<SkeletonPoseViewerProps> = ({
  gloss,
  autoplay = true,
  loop = true,
  width = 400,
  aspectRatio = 1,
  background = 'transparent',
  showCurrentWord = true,
  speed = 1,
  onFirstRender,
  onRender,
  onEnded,
  onCurrentWordChange,
}) => {
  const viewerRef = useRef<HTMLPoseViewerElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poseUrl, setPoseUrl] = useState<string>('');  const [currentWord, setCurrentWord] = useState<string>('');
  const [glossWords, setGlossWords] = useState<string[]>([]);

  // Generate pose URL from gloss text and parse words
  useEffect(() => {
    if (!gloss) return;
    
    // Parse gloss into individual words/letters
    const words = gloss.trim().split(/\s+/).filter(w => w.length > 0);
    setGlossWords(words);
    
    // Use the sign-mt API to convert gloss to pose
    // This is the same API used in the Angular version
    const url = `https://us-central1-sign-mt.cloudfunctions.net/spoken_text_to_signed_pose?text=${encodeURIComponent(gloss)}&spoken=en&signed=ase`;
    setPoseUrl(url);
  }, [gloss]);

  // Load pose-viewer custom element
  useEffect(() => {
    let mounted = true;

    const loadPoseViewer = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Import pose-viewer and define custom elements
        const poseViewer = await import('pose-viewer/loader');
        
        // Define the custom elements
        await poseViewer.defineCustomElements();
        
        if (mounted) {
          setIsLoaded(true);
          console.log('pose-viewer loaded successfully');
        }
      } catch (err) {
        console.error('Failed to load pose-viewer:', err);
        if (mounted) {
          setError('Failed to load pose viewer component');
        }
      }
    };

    loadPoseViewer();

    return () => {
      mounted = false;
    };
  }, []);

  // Update playback speed
  useEffect(() => {
    if (!isLoaded || !viewerRef.current) return;
    const viewer = viewerRef.current;
    
    // Set playback rate (speed)
    if (viewer.playbackRate !== undefined) {
      viewer.playbackRate = speed;
    }
  }, [isLoaded, speed]);

  // Set up event listeners and handle visibility changes
  useEffect(() => {
    if (!isLoaded || !viewerRef.current || !poseUrl) return;

    const viewer = viewerRef.current;
    let cleanupFunctions: (() => void)[] = [];

    // firstRender$ event - fires when first frame is rendered
    const handleFirstRender = (event: Event) => {
      console.log('First render event:', event);
      onFirstRender?.();
      
      // Reset to start
      if (viewer.currentTime > 0) {
        viewer.currentTime = 0;
      }
    };

    // render$ event - fires on each frame render
    const handleRender = (event: Event) => {
      onRender?.();
      
      // Track current word based on animation progress
      if (glossWords.length > 0 && viewer.duration > 0) {
        const progress = viewer.currentTime / viewer.duration;
        const wordIndex = Math.floor(progress * glossWords.length);
        const currentWordValue = glossWords[Math.min(wordIndex, glossWords.length - 1)];
        
        if (currentWordValue !== currentWord) {
          setCurrentWord(currentWordValue);
          onCurrentWordChange?.(currentWordValue);
        }
      }
    };

    // ended$ event - fires when animation completes
    const handleEnded = (event: Event) => {
      console.log('Animation ended');
      onEnded?.();
    };

    // Listen for custom events with $ suffix (RxJS-style events from Angular version)
    viewer.addEventListener('firstRender$', handleFirstRender);
    viewer.addEventListener('render$', handleRender);
    viewer.addEventListener('ended$', handleEnded);

    cleanupFunctions.push(() => {
      viewer.removeEventListener('firstRender$', handleFirstRender);
      viewer.removeEventListener('render$', handleRender);
      viewer.removeEventListener('ended$', handleEnded);
    });

    // Handle visibility change - pause when tab is hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        viewer.play?.();
      } else {
        viewer.pause?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    cleanupFunctions.push(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });

    return () => {
      cleanupFunctions.forEach(fn => fn());
    };
  }, [isLoaded, poseUrl, glossWords, currentWord, onFirstRender, onRender, onEnded, onCurrentWordChange]);

  if (error) {
    return (
      <div
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof width === 'number' ? `${width / aspectRatio}px` : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fee',
          borderRadius: '8px',
          padding: '1rem',
          color: '#c00',
        }}
      >
        <span>{error}</span>
      </div>
    );
  }

  if (!isLoaded || !poseUrl) {
    return (
      <div
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof width === 'number' ? `${width / aspectRatio}px` : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f0f0',
          borderRadius: '8px',
        }}
      >
        <span>Loading pose viewer...</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <pose-viewer
        ref={viewerRef as any}
        src={poseUrl}
        autoplay={autoplay ? 'true' : 'false'}
        loop={loop ? 'true' : 'false'}
        width={typeof width === 'number' ? `${width}px` : width}
        aspect-ratio={aspectRatio.toString()}
        background={background}
        style={{
          display: 'block',
          maxWidth: '100%',
        }}
      />
      
      {/* Current Word/Letter Display */}
      {showCurrentWord && currentWord && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {currentWord}
        </div>
      )}
    </div>
  );
};

export default SkeletonPoseViewer;
