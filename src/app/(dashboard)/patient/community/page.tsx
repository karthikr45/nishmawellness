"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  MessageSquare, Heart, Search, Plus, Users, Shield, Tag,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";
import { useToast } from "@/components/providers/toast-provider";

interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  isAnonymous: boolean;
  createdAt: string;
  tags: string;
  isOwn: boolean;
}

const CATEGORIES = ["All", "Anxiety", "Depression", "Mindfulness", "Relationships", "Sleep", "Motivation", "General"];

export default function CommunityPage() {
  const { status } = useSession();
  const toast = useToast();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "General",
    isAnonymous: true,
    displayName: "",
  });

  const fetchPosts = (cat?: string, q?: string) => {
    const params = new URLSearchParams();
    if (cat && cat !== "All") params.set("category", cat);
    if (q) params.set("q", q);
    fetch(`/api/community?${params}`)
      .then((r) => r.json())
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "authenticated") fetchPosts();
  }, [status]);

  const applyFilter = (cat: string) => {
    setFilter(cat);
    fetchPosts(cat, search);
  };

  const doSearch = () => fetchPosts(filter, search);

  const submitPost = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.warning("Please add a title and content.");
      return;
    }
    setComposing(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...form }),
      });
      if (!res.ok) throw new Error();
      toast.success("Post published");
      setShowCompose(false);
      setForm({ title: "", content: "", category: "General", isAnonymous: true, displayName: "" });
      fetchPosts(filter, search);
    } catch {
      toast.error("Could not publish. Please try again.");
    }
    setComposing(false);
  };

  const likePost = async (postId: string) => {
    await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like", postId }),
    });
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            Community
            <Tooltip
              maxWidth={340}
              content="A moderated forum where users share experiences and support each other. Posts default to anonymous. All posts are reviewed for safety; crisis signals are escalated to moderators."
            />
          </h1>
          <p className="text-gray-500 mt-1">A safe space to share, support, and connect</p>
        </div>
        <Button onClick={() => setShowCompose(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      {/* Compose */}
      {showCompose && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Share with the community</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              placeholder="What would you like to share?"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={(e) => setForm((p) => ({ ...p, isAnonymous: e.target.checked }))}
                />
                Post anonymously
              </label>
              {form.isAnonymous && (
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                  placeholder="Display name (optional, e.g. 'Quiet Storm')"
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={submitPost} loading={composing}>Publish</Button>
              <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => applyFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat ? "bg-primary-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Search posts..."
            className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-64 focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Privacy notice */}
      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-xl flex items-center space-x-2 text-sm text-green-700 dark:text-green-300">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span>Posts are anonymous by default. Your real name is never shown unless you choose otherwise.</span>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-700 dark:text-white font-semibold mb-1">No posts yet in {filter === "All" ? "the community" : filter}</p>
          <p className="text-sm text-gray-400 mb-5">Be the first to share something. Your experience might help someone who is going through the same thing.</p>
          <Button onClick={() => setShowCompose(true)}><Plus className="w-4 h-4 mr-2" /> Write the First Post</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const tags: string[] = (() => { try { return JSON.parse(post.tags); } catch { return []; } })();
            return (
              <Card key={post.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{post.author}</span>
                      <Badge variant="default">{post.category}</Badge>
                      <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {tags.map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs rounded-full flex items-center">
                            <Tag className="w-3 h-3 mr-1" />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                      <button onClick={() => likePost(post.id)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-pink-500 transition-colors">
                        <Heart className="w-4 h-4" /> {post.likes}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
