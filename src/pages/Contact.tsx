
import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Phone, MapPin, Send, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const Contact = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChat = () => {
    window.dispatchEvent(new CustomEvent('open-chatbot'));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Message Sent Successfully",
      description: "We've received your message and will get back to you shortly.",
    });
    
    setContactForm({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <MainLayout>
      <div className="container max-w-5xl mx-auto space-y-8 py-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're here to help. Reach out to us for support, inquiries, or feedback about Rigel Genesis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="h-full border-primary/10 shadow-md">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Find us through these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:support@rigelgenesis.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      support@rigelgenesis.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Phone</p>
                    <a href="tel:+27111234567" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      +27 (0) 11 123 4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Office</p>
                    <p className="text-sm text-muted-foreground">
                      123 Business Park Drive<br />
                      Sandton, Johannesburg<br />
                      2196, South Africa
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Hours</p>
                    <p className="text-sm text-muted-foreground">
                      Mon - Fri: 08:00 - 17:00<br />
                      Sat - Sun: Closed
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="pt-2">
                  <Button variant="outline" className="w-full gap-2" onClick={handleOpenChat}>
                    <MessageSquare className="h-4 w-4" />
                    Start Live Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-md border-primary/10">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and our team will respond within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        value={contactForm.name} 
                        onChange={e => setContactForm({...contactForm, name: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john@company.com" 
                        value={contactForm.email} 
                        onChange={e => setContactForm({...contactForm, email: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      placeholder="How can we help?" 
                      value={contactForm.subject} 
                      onChange={e => setContactForm({...contactForm, subject: e.target.value})} 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Please describe your inquiry in detail..." 
                      className="min-h-[150px]" 
                      value={contactForm.message} 
                      onChange={e => setContactForm({...contactForm, message: e.target.value})} 
                      required 
                    />
                  </div>

                  <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
