"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  MapPin, Search, Plus, Users, MessageSquare, Calendar,
  Heart, ArrowRight, Shield, CheckCircle, Clock, Star,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";
import { useToast } from "@/components/providers/toast-provider";

interface LocalitySummary {
  id: string; name: string; slug: string; city: string; state: string | null;
  country: string; pinCode: string | null; description: string | null;
  myRole?: string; myDisplayName?: string;
  _count: { members: number; posts: number; events: number };
}
interface Post { id: string; type: string; title: string; content: string; authorName: string; likes: number; isPinned: boolean; createdAt: string }
interface Event { id: string; title: string; description: string; type: string; location: string | null; dateTime: string; duration: number; isFree: boolean; host: { name: string }; _count: { rsvps: number }; rsvps: { status: string }[] }
interface LocalityDetail { locality: LocalitySummary; isMember: boolean; posts?: Post[]; events?: Event[] }

const EVENT_TYPES = [
  { id: "MEETUP", label: "General Meetup" },
  { id: "YOGA", label: "Yoga" },
  { id: "WALK", label: "Walking Group" },
  { id: "MEDITATION", label: "Meditation Circle" },
  { id: "WORKSHOP", label: "Workshop" },
  { id: "BOOK_CLUB", label: "Book Club" },
  { id: "SUPPORT_CIRCLE", label: "Support Circle" },
];

export default function MyLocalityPage() {
  const { status } = useSession();
  const toast = useToast();
  const [myLocalities, setMyLocalities] = useState<LocalitySummary[]>([]);
  const [searchResults, setSearchResults] = useState<LocalitySummary[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [activeLocality, setActiveLocality] = useState<LocalityDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "events">("posts");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [showNewEvent, setShowNewEvent] = useState(false);

  // Create form
  const [createForm, setCreateForm] = useState({ name: "", city: "", state: "", pinCode: "", description: "" });
  // Post form
  const [postForm, setPostForm] = useState({ title: "", content: "", type: "DISCUSSION", isAnonymous: true });
  // Event form
  const [eventForm, setEventForm] = useState({ title: "", description: "", type: "MEETUP", location: "", dateTime: "", duration: "60" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/locality?my=true").then((r) => r.json()).then(setMyLocalities).catch(console.error).finally(() => setLoading(false));
    }
  }, [status]);

  const search = async () => {
    if (!searchQ.trim()) return;
    const res = await fetch(`/api/locality?q=${encodeURIComponent(searchQ)}`);
    setSearchResults(await res.json());
  };

  const openLocality = async (id: string) => {
    const tab = activeTab;
    const res = await fetch(`/api/locality/${id}?tab=${tab}`);
    const data = await res.json();
    setActiveLocality(data);
  };

  const joinLocality = async (localityId: string) => {
    await fetch("/api/locality", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "join", localityId }) });
    toast.success("Joined! Welcome to the community.");
    setActiveLocality(null);
    const res = await fetch("/api/locality?my=true");
    setMyLocalities(await res.json());
  };

  const createLocality = async () => {
    setSubmitting(true);
    const res = await fetch("/api/locality", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...createForm }) });
    if (res.ok) { toast.success("Community created! You are the admin."); setShowCreate(false); const d = await fetch("/api/locality?my=true"); setMyLocalities(await d.json()); }
    else { const d = await res.json(); toast.error(d.error || "Could not create"); }
    setSubmitting(false);
  };

  const createPost = async () => {
    if (!activeLocality || !postForm.title.trim()) return;
    setSubmitting(true);
    await fetch("/api/locality", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "post", localityId: activeLocality.locality.id, ...postForm }) });
    toast.success("Post published");
    setShowNewPost(false);
    setPostForm({ title: "", content: "", type: "DISCUSSION", isAnonymous: true });
    openLocality(activeLocality.locality.id);
    setSubmitting(false);
  };

  const createEvent = async () => {
    if (!activeLocality || !eventForm.title.trim()) return;
    setSubmitting(true);
    await fetch("/api/locality", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "event", localityId: activeLocality.locality.id, ...eventForm, duration: parseInt(eventForm.duration) }) });
    toast.success("Event created");
    setShowNewEvent(false);
    setEventForm({ title: "", description: "", type: "MEETUP", location: "", dateTime: "", duration: "60" });
    setActiveTab("events");
    openLocality(activeLocality.locality.id);
    setSubmitting(false);
  };

  const rsvp = async (eventId: string) => {
    await fetch("/api/locality", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "rsvp", eventId }) });
    toast.success("You are going!");
    openLocality(activeLocality!.locality.id);
  };

  useEffect(() => { if (activeLocality) openLocality(activeLocality.locality.id); }, [activeTab]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  // Detail view
  if (activeLocality) {
    const loc = activeLocality.locality;
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveLocality(null)} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to my communities</button>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center"><MapPin className="w-5 h-5 mr-2 text-primary-500" />{loc.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{loc.city}{loc.state ? `, ${loc.state}` : ""} &middot; {loc._count.members} members</p>
          </div>
          <div className="flex gap-2">
            {!activeLocality.isMember && <Button onClick={() => joinLocality(loc.id)}>Join Community</Button>}
            {activeLocality.isMember && <Button variant="outline" onClick={() => setShowNewPost(true)}><Plus className="w-4 h-4 mr-2" /> Post</Button>}
            {activeLocality.isMember && <Button variant="outline" onClick={() => setShowNewEvent(true)}><Calendar className="w-4 h-4 mr-2" /> Event</Button>}
          </div>
        </div>
        {loc.description && <Card className="p-4 text-sm text-gray-600 dark:text-gray-300">{loc.description}</Card>}

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl max-w-xs">
          <button onClick={() => setActiveTab("posts")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium ${activeTab === "posts" ? "bg-white dark:bg-gray-700 shadow-sm text-primary-700" : "text-gray-500"}`}>Posts</button>
          <button onClick={() => setActiveTab("events")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium ${activeTab === "events" ? "bg-white dark:bg-gray-700 shadow-sm text-primary-700" : "text-gray-500"}`}>Events</button>
        </div>

        {/* New post form */}
        {showNewPost && (
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">New Post</h3>
            <div className="space-y-3">
              <input type="text" value={postForm.title} onChange={(e) => setPostForm((p) => ({ ...p, title: e.target.value }))} placeholder="Post title" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
              <textarea rows={3} value={postForm.content} onChange={(e) => setPostForm((p) => ({ ...p, content: e.target.value }))} placeholder="What would you like to share?" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={postForm.isAnonymous} onChange={(e) => setPostForm((p) => ({ ...p, isAnonymous: e.target.checked }))} /> Post anonymously</label>
                <select value={postForm.type} onChange={(e) => setPostForm((p) => ({ ...p, type: e.target.value }))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                  <option value="DISCUSSION">Discussion</option><option value="TIP">Wellness Tip</option><option value="RESOURCE">Local Resource</option><option value="QUESTION">Question</option><option value="SUPPORT">Support Request</option>
                </select>
              </div>
              <div className="flex gap-2"><Button onClick={createPost} loading={submitting}>Publish</Button><Button variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button></div>
            </div>
          </Card>
        )}

        {/* New event form */}
        {showNewEvent && (
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Create Event</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" value={eventForm.title} onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))} placeholder="Event title" className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
              <select value={eventForm.type} onChange={(e) => setEventForm((p) => ({ ...p, type: e.target.value }))} className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                {EVENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <input type="text" value={eventForm.location} onChange={(e) => setEventForm((p) => ({ ...p, location: e.target.value }))} placeholder="Location (park, center, etc.)" className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              <input type="datetime-local" value={eventForm.dateTime} onChange={(e) => setEventForm((p) => ({ ...p, dateTime: e.target.value }))} className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              <textarea rows={2} value={eventForm.description} onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the event" className="md:col-span-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none" />
            </div>
            <div className="flex gap-2 mt-3"><Button onClick={createEvent} loading={submitting}>Create Event</Button><Button variant="outline" onClick={() => setShowNewEvent(false)}>Cancel</Button></div>
          </Card>
        )}

        {/* Posts list */}
        {activeTab === "posts" && (
          <div className="space-y-3">
            {(activeLocality.posts || []).map((p) => (
              <Card key={p.id} className={`p-5 ${p.isPinned ? "border-l-4 border-l-primary-500" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge variant="default" className="text-xs mb-1">{p.type}</Badge>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{p.title}</h3>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{p.content}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">{p.authorName}</span>
                  <span className="text-xs text-gray-400 flex items-center"><Heart className="w-3 h-3 mr-1" /> {p.likes}</span>
                </div>
              </Card>
            ))}
            {(activeLocality.posts || []).length === 0 && (
              <Card className="p-10 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-700 font-semibold mb-1">No posts yet</p>
                <p className="text-sm text-gray-400 mb-4">Be the first to share something with your neighbourhood.</p>
                {activeLocality.isMember && <Button onClick={() => setShowNewPost(true)}><Plus className="w-4 h-4 mr-2" /> Write a Post</Button>}
              </Card>
            )}
          </div>
        )}

        {/* Events list */}
        {activeTab === "events" && (
          <div className="space-y-3">
            {(activeLocality.events || []).map((ev) => {
              const myRsvp = ev.rsvps?.[0]?.status;
              return (
                <Card key={ev.id} className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>{ev.type.replace(/_/g, " ")}</Badge>
                        {ev.isFree && <Badge variant="success">Free</Badge>}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{ev.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{ev.description}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(ev.dateTime).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{new Date(ev.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} &middot; {ev.duration} min</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {ev.location && <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{ev.location}</span>}
                      <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{ev._count.rsvps} going</span>
                      <span>Hosted by {ev.host.name}</span>
                    </div>
                    {myRsvp ? <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Going</Badge> : activeLocality.isMember && <Button size="sm" onClick={() => rsvp(ev.id)}>RSVP</Button>}
                  </div>
                </Card>
              );
            })}
            {(activeLocality.events || []).length === 0 && (
              <Card className="p-10 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-700 font-semibold mb-1">No events scheduled</p>
                <p className="text-sm text-gray-400 mb-4">Organise a park yoga, walking group, or meditation circle for your neighbours.</p>
                {activeLocality.isMember && <Button onClick={() => setShowNewEvent(true)}><Plus className="w-4 h-4 mr-2" /> Create an Event</Button>}
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  // My communities list
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            My Neighbourhood
            <Tooltip maxWidth={340} content="Join your local community to connect with neighbours around wellness. Share tips, attend local events, and form support circles. Your exact address is never shown — only the area name you choose. Anonymous posting is on by default." />
          </h1>
          <p className="text-gray-500 mt-1">Wellness starts at home — connect with people near you.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" /> Create Community</Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="Search by area name, city, or pin code..." className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
          </div>
          <Button onClick={search}>Search</Button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-400">{searchResults.length} communities found</p>
            {searchResults.map((loc) => (
              <div key={loc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{loc.name}</p>
                  <p className="text-xs text-gray-500">{loc.city}{loc.pinCode ? ` — ${loc.pinCode}` : ""} &middot; {loc._count.members} members</p>
                </div>
                <Button size="sm" onClick={() => openLocality(loc.id)}>View</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create form */}
      {showCreate && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Your Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} placeholder="Area name (e.g. Koramangala 4th Block)" className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            <input type="text" value={createForm.city} onChange={(e) => setCreateForm((p) => ({ ...p, city: e.target.value }))} placeholder="City" className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            <input type="text" value={createForm.state} onChange={(e) => setCreateForm((p) => ({ ...p, state: e.target.value }))} placeholder="State (optional)" className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            <input type="text" value={createForm.pinCode} onChange={(e) => setCreateForm((p) => ({ ...p, pinCode: e.target.value }))} placeholder="Pin code (optional)" className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            <textarea rows={2} value={createForm.description} onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe your community (optional)" className="md:col-span-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none" />
          </div>
          <div className="flex gap-2 mt-4"><Button onClick={createLocality} loading={submitting}>Create</Button><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button></div>
        </Card>
      )}

      {/* My communities */}
      {myLocalities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myLocalities.map((loc) => (
            <Card key={loc.id} hover className="p-6 cursor-pointer" onClick={() => openLocality(loc.id)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white"><MapPin className="w-6 h-6" /></div>
                {loc.myRole === "ADMIN" && <Badge variant="info">Admin</Badge>}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{loc.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{loc.city}{loc.pinCode ? ` — ${loc.pinCode}` : ""}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{loc._count.members} members</span>
                <span className="flex items-center"><MessageSquare className="w-3 h-3 mr-1" />{loc._count.posts} posts</span>
                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{loc._count.events} events</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
          <MapPin className="w-14 h-14 text-primary-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No community yet</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-5 leading-relaxed">
            Search for your neighbourhood above, or create one. Once neighbours join, you can share wellness tips, organise park yoga, walking groups, meditation circles — and support each other through life.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" /> Create Your Community</Button>
            <Button variant="outline" onClick={() => document.querySelector("input")?.focus()}><Search className="w-4 h-4 mr-2" /> Search by Area</Button>
          </div>
        </Card>
      )}

      <Card className="p-5 bg-gray-50 dark:bg-gray-900/50">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center"><Shield className="w-4 h-4 mr-2 text-green-500" /> Privacy in your community</h3>
        <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Your exact address is never shown — only the area name you choose</li>
          <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Posts are anonymous by default — use your name only if you want to</li>
          <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> All posts are moderated for safety — crisis signals are escalated</li>
        </ul>
      </Card>
    </div>
  );
}
