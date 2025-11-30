import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card } from './ui/card';

export function EventDetails() {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Event Details
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="p-8 text-center hover:shadow-xl transition-shadow duration-300 border-2 border-border bg-card">
            <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Date</h3>
            <p className="text-muted-foreground text-lg">Saturday, December 6, 2025</p>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl transition-shadow duration-300 border-2 border-border bg-card">
            <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Time</h3>
            <p className="text-muted-foreground text-lg">7:00 PM - 12:00 Midnight</p>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl transition-shadow duration-300 border-2 border-border bg-card">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Venue</h3>
            <p className="text-muted-foreground text-lg">Meraki Banquet Hall</p>
            <p className="text-muted-foreground text-sm">B-10, Sheikh Sarai Phase 1, Sheikh Sarai</p>
          </Card>
        </div>
      </div>
    </section>
  );
}
