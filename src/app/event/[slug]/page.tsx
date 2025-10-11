import prisma from '../../../../lib/prisma';
import { notFound } from 'next/navigation'
import { Fugaz_One } from 'next/font/google';
import ShowsList from '../../artist/[id]/ShowsList';
import { EVENT_CONFIG } from '@/config/constants';
import { Metadata } from 'next';
import ShareButton from '@/components/ShareButton';
import React from 'react';
import JsonLd from '@/components/JsonLd';
import { formatInTimeZone } from 'date-fns-tz';

const fugazOne = Fugaz_One({
  weight: '400',
  subsets: ['latin'],
});

// Helper function to get the correct ET offset
function getETOffset(date: string): string {
  const dateObj = new Date(date);
  const isDST = dateObj.getTimezoneOffset() < new Date(dateObj.getFullYear(), 0, 1).getTimezoneOffset();
  return isDST ? '-04:00' : '-05:00';
}

type PageProps = {
  params: Promise<{ slug: string }>
}

// Define the YouTube video type
type YouTubeVideo = {
  url: string;
  videoId: string;
}

// Extend the artist type to include youtubeVideos
type ArtistWithVideos = {
  youtubeUrls: string[];
  youtubeVideos?: YouTubeVideo[];
  [key: string]: any;
}

// Define the event type with the extended artist type
type EventWithArtist = {
  id: string;
  slug: string;
  name: string;
  dateString: string;
  url: string;
  logline?: string;
  artist: ArtistWithVideos | null;
  venue: { name: string; slug: string; id: string; description: string; gMapsUrl: string; url: string; streetAddress: string; addressLocality: string; postalCode: string; addressRegion: string; addressCountry: string };
  performers?: { performer: { name: string; instrument: string } }[];
  setTimes?: string[];
};

// Define the other event type
type OtherEvent = {
  id: string;
  name: string;
  slug: string;
  dateString: string;
  venue: {
    name: string;
    slug: string;
  };
}

type MetadataProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      name: true,
      logline: true,
      artist: {
        select: {
          name: true
        }
      },
      venue: {
        select: {
          name: true,
          description: true,
          slug: true,
          url: true,
        }
      }
    }
  });

  if (!event) return {};

  return {
    title: `${event.name} at ${event.venue.name} | Atrium Jazz`,
    description: event.logline || `Join ${event.artist?.name || 'us'} at ${event.venue.name} for an unforgettable jazz experience.`,
    openGraph: {
      title: `${event.name} at ${event.venue.name} | Atrium Jazz`,
      description: event.logline || `Join ${event.artist?.name || 'us'} at ${event.venue.name} for an unforgettable jazz experience.`,
      url: `https://www.atriumjazz.com/event/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.name} at ${event.venue.name} | Atrium Jazz`,
      description: event.logline || `Join ${event.artist?.name || 'us'} at ${event.venue.name} for an unforgettable jazz experience.`,
    }
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      dateString: true,
      url: true,
      logline: true,
      artist: {
        select: {
          id: true,
          name: true,
          youtubeUrls: true,
          biography: true,
          website: true,
          instagram: true,
          events: {
            select: {
              id: true,
              slug: true,
              name: true,
              dateString: true,
              setTimes: true,
              venue: {
                select: {
                  name: true,
                  slug: true,
                }
              }
            },
            where: {
              dateString: {
                gte: new Date().toISOString().split('T')[0],
                lt: new Date(Date.now() + EVENT_CONFIG.DAYS_AHEAD * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              },
              NOT: {
                slug: slug
              }
            },
            orderBy: {
              dateString: 'asc'
            }
          }
        }
      },
      venue: {
        select: {
          name: true,
          slug: true,
          id: true,
          description: true,
          url: true,
          streetAddress: true,
          addressLocality: true,
          postalCode: true,
          addressRegion: true,
          addressCountry: true,
        }
      },
      performers: {
        select: {
          performer: {
            select: {
              name: true,
              instrument: true,
            }
          }
        }
      },
      setTimes: true
    }
  }) as EventWithArtist | null;

  if (!event) {
    notFound();
  }

  return (
    <>
      <JsonLd json={{
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.name,
        "description": event.logline || `Join ${event.artist?.name || 'us'} at ${event.venue.name} for an unforgettable jazz experience.`,
        "startDate": event.setTimes && event.setTimes.length > 0
          ? `${event.dateString}T${event.setTimes[0]}:00${getETOffset(event.dateString)}`
          : formatInTimeZone(new Date(`${event.dateString}T00:00:00`), 'America/New_York', "yyyy-MM-dd'T'HH:mm:ssXXX"),
        "endDate": event.setTimes && event.setTimes.length > 0
          ? (() => {
            const [hours, minutes] = event.setTimes[event.setTimes.length - 1].split(':').map(Number);
            const endTime = new Date(`${event.dateString}T${hours}:${minutes}:00`);
            endTime.setMinutes(endTime.getMinutes() + 90);
            return `${event.dateString}T${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}:00${getETOffset(event.dateString)}`;
          })()
          : undefined,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
          "@type": "Place",
          "name": event.venue.name,
          "url": event.venue.gMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(event.venue.name)}`,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": event.venue.streetAddress || "",
            "addressLocality": event.venue.addressLocality || "",
            "addressRegion": event.venue.addressRegion || "",
            "postalCode": event.venue.postalCode || "",
            "addressCountry": event.venue.addressCountry || ""
          }
        },
        "performer": event.artist ? {
          "@type": "MusicGroup",
          "name": event.artist.name
        } : undefined,
        "organizer": {
          "@type": "Organization",
          "name": event.venue.name,
          "url": event.venue.url
        }
      }} />
      <div className="max-w-4xl mx-auto p-6 pb-[calc(1.5rem+88px)] md:pb-6">
        {/* Event Header Section */}
        <div className="rounded-lg mb-8 flex justify-between items-start">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${fugazOne.className}`}>
              {event.name}
            </h1>

            <div className="flex justify-between text-md text-zinc-400">
              <span>
                {new Date(event.dateString).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC'
                })} • {' '}
                {event.setTimes && event.setTimes.length > 0 ? (
                  <>
                    {event.setTimes!.map((timeString, index) => (
                      <React.Fragment key={timeString}>
                        {new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                        {index < event.setTimes!.length - 1 && ' & '}
                      </React.Fragment>
                    ))}
                    {' '}
                    <span className="text-zinc-400">ET</span>
                  </>
                ) : (
                  <span className="text-zinc-400">Time TBA</span>
                )}
                {event.venue?.name && (
                  <>
                    <span className="hidden md:inline"> • </span>
                    <span className="block md:inline mt-2 md:mt-0">
                      <svg className="inline-block w-4 h-4 mr-1 md:hidden" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      Live at {
                        <a
                          href={`/venue/${event.venue.slug}`}
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:underline transition-colors"
                        >
                          {event.venue.name}
                        </a>
                      }</span>
                  </>
                )}
              </span>
            </div>



          </div>
          <div className="flex flex-row items-stretch gap-2 ml-4">
            <ShareButton url={`https://www.atriumjazz.com/event/${slug}`} className="w-16 h-16 p-0 text-xl font-bold rounded-lg flex items-center justify-center hidden md:flex" showText={false} />
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:block bg-white text-black px-8 py-4 rounded-lg text-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Tickets
            </a>
          </div>
        </div>

        {/* Mobile CTA with background */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black p-6 z-50 flex flex-row gap-2">
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white text-black py-3 text-lg font-bold hover:bg-gray-200 transition-colors text-center rounded-lg"
          >
            Tickets
          </a>
          <ShareButton url={`https://www.atriumjazz.com/event/${slug}`} className="w-14 h-14 p-0 text-xl font-bold rounded-lg flex items-center justify-center bg-blue-300 text-black" showText={false} />
        </div>

        <div className="border-t pt-8">


          {event.venue && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">About {event.venue.name}</h3>
              <p>{event.venue.description}</p>
            </div>
          )}


        </div>

        {/* Upcoming Events Section */}
        {event.artist?.events && event.artist.events.length > 0 && (
          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-bold mb-6">More Dates</h2>
            <ShowsList events={event.artist.events.filter((event: OtherEvent) => {
              const eventDate = new Date(event.dateString);
              const cutoffDate = new Date(Date.now() + EVENT_CONFIG.DAYS_AHEAD * 24 * 60 * 60 * 1000);
              return eventDate <= cutoffDate;
            })} />
          </div>
        )}
      </div>
    </>
  )
}