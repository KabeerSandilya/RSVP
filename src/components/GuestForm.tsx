import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Minus, Plus, Send } from 'lucide-react';
import { addGuest } from '@/lib/db';
import { toast } from 'sonner';

export function GuestForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    adults: 1,
    children: 0,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await addGuest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        adults: formData.adults,
        children: formData.children,
        message: formData.message || null,
      });

      toast.success('RSVP submitted successfully! We look forward to seeing you!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        adults: 1,
        children: 0,
        message: '',
      });
    } catch (error: any) {
      console.error('RSVP submission error:', error);
      toast.error(error.message || 'Failed to submit RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCounter = (field: 'adults' | 'children', delta: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(field === 'adults' ? 1 : 0, prev[field] + delta),
    }));
  };

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            RSVP
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6" />
          <p className="text-muted-foreground text-lg">
            We would be honored by your presence. Please let us know if you can join us.
          </p>
        </div>

        <Card className="p-8 md:p-12 shadow-2xl border-2 border-border bg-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Kabeer Sandilya"
                required
                className="text-lg"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="justaddyouremail@gmail.com"
                required
                className="text-lg"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-card-foreground">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 1234567890"
                className="text-lg"
              />
            </div>

            {/* Guest Count */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Adults */}
              <div className="space-y-2">
                <Label className="text-card-foreground">Number of Adults *</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateCounter('adults', -1)}
                    disabled={formData.adults <= 1}
                    className="h-12 w-12"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-bold text-primary">{formData.adults}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateCounter('adults', 1)}
                    className="h-12 w-12"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Children */}
              <div className="space-y-2">
                <Label className="text-card-foreground">Number of Children</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateCounter('children', -1)}
                    disabled={formData.children <= 0}
                    className="h-12 w-12"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-bold text-primary">{formData.children}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateCounter('children', 1)}
                    className="h-12 w-12"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-card-foreground">Special Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Share your congratulations or any wishes here..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full text-lg h-14 gap-2"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit RSVP
                </>
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              * Required fields
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
}
