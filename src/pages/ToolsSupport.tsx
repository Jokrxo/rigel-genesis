import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { HelpResources } from "@/components/HelpCenter/HelpResources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquare, Calculator, FileText, Download, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ToolsSupport = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleOpenChat = () => {
    window.dispatchEvent(new CustomEvent('open-chatbot'));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    toast({
      title: "Message Sent",
      description: "We've received your message and will get back to you shortly.",
    });
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tools & Support</h1>
          <p className="text-muted-foreground">
            Access help resources, tools, and support channels.
          </p>
        </div>

        <Tabs defaultValue="help" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="help">Help Docs</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="help" className="mt-6">
            <HelpResources />
          </TabsContent>
          
          <TabsContent value="faq" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find answers to common questions about Rigel Genesis.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                    <AccordionContent>
                      You can reset your password by clicking on "Forgot Password" on the login page. Follow the instructions sent to your email.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I import bank statements?</AccordionTrigger>
                    <AccordionContent>
                      Go to the "Import Statement" page under Settings or Quick Actions. Upload your CSV or OFX file and follow the mapping steps.
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-3">
                    <AccordionTrigger>Is my data secure?</AccordionTrigger>
                    <AccordionContent>
                      Yes, Rigel Genesis uses industry-standard encryption and security practices to ensure your financial data is safe.
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-4">
                    <AccordionTrigger>How do I generate a report?</AccordionTrigger>
                    <AccordionContent>
                      Navigate to "Financial Reports" in the sidebar. Select the report you wish to generate (e.g., Balance Sheet, Income Statement) and choose the date range.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tools" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/tax-calculators'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Tax Calculators
                  </CardTitle>
                  <CardDescription>Calculate VAT, Income Tax, and more.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/reports'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Report Generator
                  </CardTitle>
                  <CardDescription>Create custom financial reports.</CardDescription>
                </CardHeader>
              </Card>
               <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/export-data'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Data Export
                  </CardTitle>
                  <CardDescription>Export your data in CSV or PDF format.</CardDescription>
                </CardHeader>
              </Card>
               <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={handleOpenChat}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    AI Assistant
                  </CardTitle>
                  <CardDescription>Ask our AI bot for help or analysis.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="contact" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>Fill out the form below to send us a message.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} required />
                    </div>
                     <div className="grid gap-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" value={contactForm.subject} onChange={e => setContactForm({...contactForm, subject: e.target.value})} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} required />
                    </div>
                    <Button type="submit" className="w-full">
                      <Send className="mr-2 h-4 w-4" /> Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Other Ways to Connect</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Email Us</p>
                        <p className="text-sm text-muted-foreground">support@rigelgenesis.com</p>
                      </div>
                    </div>
                     <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Live Chat</p>
                        <p className="text-sm text-muted-foreground">Available Mon-Fri, 9am - 5pm</p>
                        <Button variant="link" className="p-0 h-auto" onClick={handleOpenChat}>Start Chat</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ToolsSupport;
