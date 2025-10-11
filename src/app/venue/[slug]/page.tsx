import prisma from '../../../../lib/prisma';
import { notFound } from 'next/navigation'
import { Fugaz_One } from 'next/font/google';
import { EVENT_CONFIG } from '@/config/constants';
import { Metadata } from 'next';
import EventCard from '@/components/EventCard';
import React from 'react';

const fugazOne = Fugaz_One({
  weight: '400',
  subsets: ['latin'],
});

type PageProps = {
  params: Promise<{ slug: string }>
}

type MetadataProps = {
  params: Promise<{ slug: string }>
}

type VenueWithEvents = {
  id: string;
  slug: string;
  name: string;
  url: string;
  gMapsUrl: string | null;
  description: string | null;
  events: {
    id: string;
    name: string;
    slug: string;
    dateString: string;
    url: string;
    logline: string | null;
    setTimes: string[];
    artist: {
      id: string;
      name: string;
      youtubeUrls: string[];
      spotifyTopTrack: string | null;
      appleMusicPreviews: {
        select: {
          trackName: true,
          previewUrl: true,
          appleMusicUrl: true,
          artworkUrl: true
        }
      }
    } | null;
    venue: {
      name: string;
      url: string;
      gMapsUrl: string | null;
    };
  }[];
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { slug } = await params;
  const venue = await prisma.venue.findUnique({
    where: { slug },
    select: {
      name: true,
    }
  });

  if (!venue) return {};

  return {
    title: `${venue.name} | Atrium Jazz`,
    description: `Upcoming jazz events at ${venue.name}`,
    openGraph: {
      title: `${venue.name} | Atrium Jazz`,
      description: `Upcoming jazz events at ${venue.name}`,
      url: `https://www.atriumjazz.com/venue/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${venue.name} | Atrium Jazz`,
      description: `Upcoming jazz events at ${venue.name}`,
    }
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const venue = await prisma.venue.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      url: true,
      gMapsUrl: true,
      description: true,
      events: {
        where: {
          dateString: {
            gte: new Date().toISOString().split('T')[0],
            lte: new Date(Date.now() + EVENT_CONFIG.DAYS_AHEAD * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          dateString: true,
          url: true,
          logline: true,
          setTimes: true,
          artist: {
            select: {
              id: true,
              name: true,
              youtubeUrls: true,
              spotifyTopTrack: true,
              appleMusicPreviews: {
                select: {
                  trackName: true,
                  previewUrl: true,
                  appleMusicUrl: true,
                  artworkUrl: true
                }
              }
            }
          },
          venue: {
            select: {
              name: true,
              url: true,
              gMapsUrl: true,
              thumbnail: true
            }
          }
        },
        orderBy: [
          { dateString: 'asc' },
          { setTimes: 'asc' }
        ]
      }
    }
  }) as VenueWithEvents | null;

  if (!venue) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Venue Header Section */}
      <div className="rounded-lg mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${fugazOne.className}`}>
          {venue.name}
        </h1>
        
        <div className="flex gap-4 mt-4">
          {venue.url && (
            <a 
              href={venue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:underline flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              Website
            </a>
          )}
          {venue.gMapsUrl && (
            <a 
              href={venue.gMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:underline flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Maps
            </a>
          )}
        </div>
      </div>
      {venue.description && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Description</h2>
          <p className="text-gray-300">{venue.description}</p>
        </div>
      )}
      {/* Upcoming Events Section */}
      {venue.events.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
          <div className="grid gap-4">
            {venue.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                linkToVenue={true}
                showVenue={false}
                showDate={true}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-300">Please visit the club&apos;s <a href={venue.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">website</a> for upcoming events.</p>
      )}
    </div>
  );
} 