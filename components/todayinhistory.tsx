import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ExternalLink, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface HistoricalEvent {
  year: number;
  event: string;
  category?: string;
  links?: string[];
}

interface HistoricalEventProps extends HistoricalEvent {
  isEven: boolean;
}

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

interface DateNavigationProps {
  date: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
}

interface APIResponse {
  success: boolean;
  events: HistoricalEvent[];
  error?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onSelectCategory }) => (
  <div className="mb-8 bg-gray-900/5 backdrop-blur-sm p-6 border border-gray-800/20">
    <div className="flex items-center gap-2 mb-4">
      <Filter size={18} className="text-gray-700" />
      <span className="text-sm text-gray-700 font-serif italic">Chronicle by Era:</span>
    </div>
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 text-sm font-serif tracking-wide transition-all duration-500 border ${
          selectedCategory === null
            ? 'bg-gray-900 text-gray-50 border-gray-900 shadow-lg'
            : 'bg-white/80 text-gray-800 border-gray-400 hover:bg-gray-900 hover:text-white'
        }`}
      >
        All Chronicles
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 text-sm font-serif tracking-wide transition-all duration-500 border ${
            selectedCategory === category
              ? 'bg-gray-900 text-gray-50 border-gray-900 shadow-lg'
              : 'bg-white/80 text-gray-800 border-gray-400 hover:bg-gray-900 hover:text-white'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
);

const HistoricalEventCard: React.FC<HistoricalEventProps> = ({ year, event, category, links }) => (
  <div className="group relative pl-12 pb-12 animate-fadeIn">
    <div className="absolute left-0 top-0 h-full w-px bg-gray-300 group-hover:bg-gray-600 transition-colors duration-500"/>
    <div className="absolute left-0 top-2 w-8 h-8 -translate-x-1/2 rounded-full border-4 border-white bg-gray-100 shadow-xl group-hover:scale-110 transition-transform duration-500"/>
    
    <div className="relative overflow-hidden bg-white border border-gray-300 shadow-xl transition-all duration-500 hover:shadow-2xl group-hover:border-gray-400">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] opacity-25 [background-size:16px_16px] pointer-events-none"/>
      <div className="relative p-8">
        <div className="flex items-baseline gap-4 mb-4">
          <span className="text-4xl font-serif font-bold text-gray-800 tracking-tight">{year}</span>
          {category && (
            <span className="px-3 py-1 text-xs font-serif italic bg-gray-100 text-gray-700 border border-gray-300">
              {category}
            </span>
          )}
        </div>
        
        <p className="font-serif text-xl leading-relaxed text-gray-700 mb-4 italic first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
          {event}
        </p>
        
        {links && links.length > 0 && (
          <div className="flex gap-3 flex-wrap mt-6 pt-6 border-t border-gray-200">
            {links.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-300 transition-all duration-300 hover:shadow-md"
              >
                <ExternalLink size={14} />
                Explore Archives
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const DateNavigation: React.FC<DateNavigationProps> = ({ date, onPrevDay, onNextDay }) => (
  <div className="relative overflow-hidden bg-gray-50 border border-gray-300 rounded-none shadow-xl p-6">
    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] opacity-25 [background-size:16px_16px] pointer-events-none"/>
    <div className="relative flex items-center justify-between">
      <button
        onClick={onPrevDay}
        className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 hover:border-gray-400 transition-all duration-300 shadow-md hover:shadow-xl"
      >
        <ChevronLeft size={20} />
        <span className="font-serif tracking-wide">Previous Day</span>
      </button>
      
      <div className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-300 shadow-lg">
        <Calendar size={24} className="text-gray-700" />
        <span className="font-serif text-2xl text-gray-800 tracking-wide">{date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })}</span>
      </div>
      
      <button
        onClick={onNextDay}
        className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 hover:border-gray-400 transition-all duration-300 shadow-md hover:shadow-xl"
      >
        <span className="font-serif tracking-wide">Next Day</span>
        <ChevronRight size={20} />
      </button>
    </div>
  </div>
);

const TodayInHistory: React.FC = () => {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoricalEvent[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchEvents = async (date: Date): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      const response = await fetch(`/api/events?month=${month}&day=${day}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical events');
      }

      const data: APIResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch events');
      }
      
      const eventsWithCategories = data.events.map((event: HistoricalEvent) => ({
        ...event,
        category: event.category || `${Math.floor(event.year/100 + 1)}th Century`
      }));

      setEvents(eventsWithCategories);
      
      const uniqueCategories = Array.from(
        new Set(
          eventsWithCategories
            .map(event => event.category)
            .filter((category): category is string => !!category)
        )
      ).sort();
      
      setCategories(uniqueCategories);
      setSelectedCategory(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(date);
  }, [date]);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredEvents(events.filter(event => event.category === selectedCategory));
    } else {
      setFilteredEvents(events);
    }
  }, [selectedCategory, events]);

  const handlePrevDay = (): void => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    setDate(newDate);
  };

  const handleNextDay = (): void => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative bg-gray-900 text-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#4b5563_1px,transparent_1px)] [background-size:32px_32px] opacity-30"/>
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="text-center">
            <h1 className="text-7xl font-serif font-bold mb-6 tracking-tight">
              Chronicles of Time
            </h1>
            <div className="w-32 h-1 bg-gray-400 mx-auto mb-6"/>
            <p className="text-2xl font-serif text-gray-300 italic tracking-wide">
              Echoes of Yesterday, Whispers of Tomorrow
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="mb-12">
          <DateNavigation
            date={date}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-8 mb-8 font-serif text-red-700 text-center text-lg italic">
            {error}
          </div>
        )}
        
        {!loading && categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Clock className="animate-spin text-gray-400" size={48} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-32 bg-white border border-gray-300 shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] opacity-25 [background-size:16px_16px]"/>
            <p className="relative text-2xl text-gray-600 font-serif italic">
              {selectedCategory 
                ? `No historical records found in "${selectedCategory}" for this date.`
                : 'No historical records found for this date.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredEvents.map((event, index) => (
              <HistoricalEventCard
                key={index}
                {...event}
                isEven={index % 2 === 0}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="mt-32 bg-gray-900 text-gray-50">
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="absolute inset-0 bg-[radial-gradient(#4b5563_1px,transparent_1px)] [background-size:32px_32px] opacity-30"/>
          <div className="relative text-center">
            <p className="font-serif text-xl italic">
              &quot;History, despite its wrenching pain, cannot be unlived,
              <br />but if faced with courage, need not be lived again.&quot;
              <span className="block mt-4 text-sm text-gray-400">— Maya Angelou</span>
            </p>
          </div>
        </div>
      </footer> 
    </div>
  );
};

export default TodayInHistory;