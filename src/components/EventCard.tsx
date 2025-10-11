// @ts-nocheck
"use client"

import React from 'react';
import { Fugaz_One } from 'next/font/google';

const fugazOne = Fugaz_One({
    weight: '400',
    subsets: ['latin'],
  });


function EventCard({ event, linkToVenue = true, showVenue = true, showDate = false }) {

  console.log(event);

  const cardId = React.useId(); // Generate a unique ID for this card instance
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef(null);

  // Only allow one audio preview at a time
  React.useEffect(() => {
    if (!isPlaying) return;
    // Pause all other audio elements
    document.querySelectorAll('audio.audio-preview').forEach((audio) => {
      if (audio !== audioRef.current) {
        audio.pause();
      }
    });
  }, [isPlaying]);

  const handleSpotifyPlayPause = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Pause when audio ends
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Pause if unmounting
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div
      id={cardId}
      className={`
        flex 
        flex-row
        block
        w-full 
        max-w-screen-lg
        relative
        mx-auto
        shadow-xl 
        shadow-black/40 
        transition-all 
        duration-200
        overflow-hidden
      `}
    >
      <div
        className={`flex-1 rounded-b-2xl transition-colors duration-200 p-2 sm:p-3`}
      >
        <div className={`text-xl font-bold mb-1 text-white ${fugazOne.className}`}>
          <a href={`/event/${event.slug}`} className="line-clamp-2 sm:line-clamp-1 hover:underline">{event.name}</a>
        </div>
        <div className="flex justify-between text-md text-zinc-400">
          <span>
            {event.dateString && showDate && (
              <>
              <span className="inline">
                {new Date(event.dateString).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric'
                })}
              </span>
              <span className="inline"> • </span>
              </>
            )}
            {event.setTimes && event.setTimes.length > 0 ? (
              <>
                {event.setTimes.map((timeString, index) => {
                  const currentTime = new Date(`2000-01-01T${timeString}`);
                  const nextTime = event.setTimes[index + 1] ? new Date(`2000-01-01T${event.setTimes[index + 1]}`) : null;
                  
                  // Show AM/PM if:
                  // 1. It's the last time, OR
                  // 2. The next time has a different AM/PM period
                  const showAMPM = index === event.setTimes.length - 1 || 
                    (nextTime && currentTime.getHours() < 12 !== nextTime.getHours() < 12);
                  
                  return (
                    <React.Fragment key={timeString}>
                      {currentTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }).replace(showAMPM ? '' : /[AP]M/, '')}
                      {index < event.setTimes.length - 1 && ' & '}
                    </React.Fragment>
                  );
                })}
                {' '}
                <span className="text-zinc-400">ET</span>
              </>
            ) : (
              <span className="text-zinc-400">Time TBA</span>
            )}
            {event.venue?.name && showVenue && (
              <>
                <span className="inline"> • </span>
                <span className="inline">
             {
                linkToVenue ? (
                  <a 
                    href={`/venue/${event.venue.slug}`} 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-300 hover:underline transition-colors"
                >
                  {event.venue.name}
                </a>
              ) : (
                event.venue.name
              )}</span>
              </>
            )}
          </span>
        </div>
        <div className="flex justify-between text-md text-zinc-400 pt-1">
          {event.artist?.appleMusicPreviews?.length > 0 && event.artist?.appleMusicPreviews[0]?.appleMusicUrl && (
            <a
              href={event.artist.appleMusicPreviews[0].appleMusicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              <img 
                src="/Apple_Music_Icon_wht_sm_073120.svg"
                alt="Apple Music"
                className="w-4 h-4"
              />
              <span>Listen on Apple Music</span>
            </a>
          )}
        </div>
      </div>
      {/* Tickets Button + Spotify Button */}
      <div className="flex items-start justify-center py-3 px-1 sm:p-4 sm:p-0 sm:pr-6 sm:gap-2">
        {/* Spotify Play Button */}
        {(event.artist?.appleMusicPreviews?.length > 0 && event.artist?.appleMusicPreviews[0]?.previewUrl) && (
          <>
            <button
              onClick={handleSpotifyPlayPause}
              className="sm:flex rounded-full bg-blue-200 hover:bg-blue-300 transition-colors w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
            >
              {isPlaying ? (
                // Pause icon
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="6" width="5" height="16" rx="2" fill="#2563eb" />
                  <rect x="17" y="6" width="5" height="16" rx="2" fill="#2563eb" />
                </svg>
              ) : (
                // Play icon
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="14" fill="#bfdbfe" />
                  <polygon points="11,8 22,14 11,20" fill="#2563eb" />
                </svg>
              )}
            </button>
            <audio
              ref={audioRef}
              className="audio-preview"
              src={event.artist?.appleMusicPreviews[0]?.previewUrl}
              preload="none"
              onEnded={handleAudioEnded}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onError={() => {
                console.warn("Apple Music preview failed to load");
                setIsPlaying(false);
              }}
            />
          </>
        )}
        <a
          href={`/event/${event.slug}`}
          className={`${fugazOne.className} hidden sm:flex items-center justify-center bg-zinc-100 text-black font-bold rounded-xl h-10 sm:h-12 sm:px-8 text-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400`}
          onClick={e => e.stopPropagation()}
        >
          Tickets
        </a>
      </div>
    </div>
  );
}

export default EventCard; 