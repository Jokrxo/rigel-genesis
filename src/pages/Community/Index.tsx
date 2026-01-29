import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Globe, Mail, Phone, Users, MapPin, Briefcase } from "lucide-react";

export default function CommunityPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rigel Community</h1>
          <p className="text-muted-foreground">Connect with other businesses and manage your public profile.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            {/* Main Content */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Business Profile</CardTitle>
                        <CardDescription>Manage how your business appears in the directory.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-6">
                            <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <Label>Company Logo</Label>
                                <p className="text-sm text-muted-foreground">Upload your company logo to build trust.</p>
                                <Button variant="outline" size="sm">Upload Logo</Button>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input placeholder="e.g. Acme Innovations" />
                            </div>
                            <div className="space-y-2">
                                <Label>Industry</Label>
                                <Input placeholder="e.g. Technology" />
                            </div>
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Input placeholder="https://" />
                            </div>
                            <div className="space-y-2">
                                <Label>Size</Label>
                                <Input placeholder="e.g. 10-50 Employees" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Tell the community about your business..." />
                        </div>

                        <Button>Save Profile</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Directory Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg p-4 flex gap-4 items-center bg-card">
                            <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                AI
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold">Acme Innovations</h4>
                                        <p className="text-sm text-muted-foreground">Technology • Johannesburg</p>
                                    </div>
                                    <Badge variant="secondary">Verified</Badge>
                                </div>
                                <p className="text-sm mt-2 line-clamp-2">Leading provider of AI-driven financial solutions for SMEs in South Africa.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Network Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Profile Views</span>
                            <span className="font-bold">124</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Connections</span>
                            <span className="font-bold">45</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Search Rank</span>
                            <span className="font-bold text-green-600">Top 10%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Suggested Connections</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>B{i}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium truncate">Business {i}</p>
                                    <p className="text-xs text-muted-foreground truncate">Retail • Cape Town</p>
                                </div>
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Users className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
