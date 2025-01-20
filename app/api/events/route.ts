/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

interface HistoricalEvent {
  year: number;
  event: string;
  category?: string;
  links?: string[];
}
function determineCategory(event: string, year: number): string {
  const lowerEvent = event.toLowerCase();
  if (lowerEvent.includes('war') || lowerEvent.includes('battle') || lowerEvent.includes('military')) {
    return 'Military & War';
  }
  if (lowerEvent.includes('invention') || lowerEvent.includes('discovery') || lowerEvent.includes('science')) {
    return 'Science & Technology';
  }
  if (lowerEvent.includes('president') || lowerEvent.includes('king') || lowerEvent.includes('government')) {
    return 'Politics & Leadership';
  }
  if (lowerEvent.includes('art') || lowerEvent.includes('music') || lowerEvent.includes('literature')) {
    return 'Arts & Culture';
  }
  return `${Math.floor(year/100 + 1)}th Century`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const day = searchParams.get('day');

    if (!month || !day) {
      return NextResponse.json(
        { error: 'Month and day parameters are required' },
        { status: 400 }
      );
    }

    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    if (
      isNaN(monthNum) || 
      isNaN(dayNum) || 
      monthNum < 1 || 
      monthNum > 12 || 
      dayNum < 1 || 
      dayNum > 31
    ) {
      return NextResponse.json(
        { error: 'Invalid month or day values' },
        { status: 400 }
      );
    }
    const response = await fetch(
      `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${monthNum}/${dayNum}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WIKI_API_KEY}`,
          'Api-User-Agent': 'Today In History App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    const data = await response.json();
    const transformedEvents: HistoricalEvent[] = data.events
      .map((event: any) => {
        const transformedEvent = {
          year: event.year,
          event: event.text,
          category: determineCategory(event.text, event.year),
          links: event.links?.map((link: any) => link.url) || []
        };
        return transformedEvent;
      })
      .sort((a: HistoricalEvent, b: HistoricalEvent) => b.year - a.year);

    return NextResponse.json({
      date: `${monthNum}-${dayNum}`,
      events: transformedEvents,
      success: true
    });

  } catch (error) {
    console.error('Error fetching historical events:', error);
    if (process.env.NODE_ENV === 'development') {
      const url = new URL(request.url);
      
      return NextResponse.json({
        date: `${url.searchParams.get('month')}-${url.searchParams.get('day')}`,
        events: [
          { 
            year: 1776, 
            event: "United States Declaration of Independence is adopted",
            category: "Politics & Leadership"
          },
          { 
            year: 1802, 
            event: "The United States Military Academy opens",
            category: "Military & War"
          },
          { 
            year: 1886, 
            event: "First transcontinental train arrives in Port Moody, BC",
            category: "Science & Technology"
          }
        ],
        success: true
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch historical events' },
      { status: 500 }
    );
  }
}