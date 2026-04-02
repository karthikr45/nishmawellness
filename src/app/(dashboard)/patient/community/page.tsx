"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  MessageSquare, Heart, ThumbsUp, Search, Plus, Users,
  Shield, Clock, ArrowUp, Tag, TrendingUp,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  replies: number;
  timeAgo: string;
  tags: string[];
  isLiked: boolean;
}

const CATEGORIES = ["All", "Anxiety", "Depression", "Mindfulness", "Relationships", "Sleep", "Motivation", "General"];

const SAMPLE_POSTS: ForumPost[] = [
  {
    id: "1", author: "Anonymous Butterfly", avatar: "AB", category: "Anxiety",
    title: "Breathing technique that actually works for panic attacks",
    content: "I've been using the 4-7-8 breathing technique for a month now and it's been life-changing. When I feel a panic attack coming on, I immediately start: inhale for 4, hold for 7, exhale for 8. After 3-4 cycles, the panic subsides significantly. Sharing in case it helps someone else.",
    likes: 47, replies: 12, timeAgo: "2 hours ago", tags: ["breathing", "panic", "coping"], isLiked: false,
  },
  {
    id: "2", author: "Quiet Storm", avatar: "QS", category: "Mindfulness",
    title: "30-day meditation challenge - who's in?",
    content: "Starting a 30-day meditation challenge! Just 10 minutes a day. I've tried before and always quit around day 5. This time I'm posting here for accountability. Drop a comment if you want to join — we can check in with each other daily.",
    likes: 83, replies: 34, timeAgo: "5 hours ago", tags: ["meditation", "challenge", "accountability"], isLiked: false,
  },
  {
    id: "3", author: "Morning Light", avatar: "ML", category: "Depression",
    title: "Small wins matter — I got out of bed today",
    content: "I know it sounds silly, but after three days of barely moving, I got out of bed, showered, and made breakfast today. It doesn't feel like much but my therapist keeps telling me to celebrate small wins. So here I am, celebrating.",
    likes: 156, replies: 45, timeAgo: "8 hours ago", tags: ["small-wins", "progress", "self-care"], isLiked: false,
  },
  {
    id: "4", author: "Ocean Waves", avatar: "OW", category: "Sleep",
    title: "What helps you fall asleep?",
    content: "Insomnia has been terrible lately. I've tried white noise, meditation, no screens — nothing works. What has actually helped you fall asleep? Open to any and all suggestions.",
    likes: 29, replies: 22, timeAgo: "1 day ago", tags: ["insomnia", "help", "sleep-tips"], isLiked: false,
  },
  {
    id: "5", author: "Gentle Soul", avatar: "GS", category: "Motivation",
    title: "One year in therapy — here's what changed",
    content: "A year ago I couldn't leave my house without a panic attack. Today I went grocery shopping, had coffee with a friend, AND joined a gym. Therapy works. If you're on the fence, take the leap. It won't be easy but it will be worth it.",
    likes: 234, replies: 67, timeAgo: "2 days ago", tags: ["progress", "therapy", "hope"], isLiked: false,
  },
];

export default function CommunityPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General", tags: "" });
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

  const toggleLike = (id: string) => {
    setPosts((prev) => prev.map((p) =>
      p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const submitPost = () => {
    const post: ForumPost = {
      id: `new-${Date.now()}`,
      author: "Anonymous " + ["Butterfly", "Star", "Cloud", "River", "Phoenix"][Math.floor(Math.random() * 5)],
      avatar: (session?.user?.name?.[0] || "A") + (session?.user?.name?.split(" ")[1]?.[0] || "N"),
      category: newPost.category,
      title: newPost.title,
      content: newPost.content,
      likes: 0, replies: 0, timeAgo: "Just now",
      tags: newPost.tags.split(",").map((t) => t.trim()).filter(Boolean),
      isLiked: false,
    };
    setPosts((prev) => [post, ...prev]);
    setNewPost({ title: "", content: "", category: "General", tags: "" });
    setShowCompose(false);
  };

  const filtered = posts
    .filter((p) => filter === "All" || p.category === filter)
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "popular" ? b.likes - a.likes : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community</h1>
          <p className="text-gray-500 mt-1">A safe space to share, support, and connect</p>
        </div>
        <Button onClick={() => setShowCompose(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      {/* Guidelines */}
      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-xl flex items-start space-x-3">
        <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800 dark:text-green-300">Community Guidelines</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            All posts are anonymous. Be kind, supportive, and respectful. No medical advice. Moderated by licensed professionals. In crisis? Use the SOS button.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === cat ? "bg-primary-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border hover:bg-gray-50"
              }`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 border rounded-lg text-sm w-48 focus:ring-2 focus:ring-primary-500" />
          </div>
          <button onClick={() => setSortBy(sortBy === "recent" ? "popular" : "recent")}
            className="flex items-center space-x-1 px-3 py-1.5 border rounded-lg text-xs text-gray-600 hover:bg-gray-50">
            {sortBy === "recent" ? <Clock className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            <span>{sortBy === "recent" ? "Recent" : "Popular"}</span>
          </button>
        </div>
      </div>

      {/* Compose */}
      {showCompose && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Share with the Community</h3>
          <p className="text-xs text-gray-400 mb-4">Your post will be anonymous. A random name will be assigned.</p>
          <div className="space-y-3">
            <input type="text" placeholder="Title" value={newPost.title} onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500" />
            <textarea rows={4} placeholder="Share your thoughts, questions, or experiences..." value={newPost.content}
              onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500" />
            <div className="flex space-x-3">
              <select value={newPost.category} onChange={(e) => setNewPost((p) => ({ ...p, category: e.target.value }))}
                className="px-4 py-2 border rounded-xl text-sm">
                {CATEGORIES.filter((c) => c !== "All").map((c) => (<option key={c}>{c}</option>))}
              </select>
              <input type="text" placeholder="Tags (comma-separated)" value={newPost.tags}
                onChange={(e) => setNewPost((p) => ({ ...p, tags: e.target.value }))}
                className="flex-1 px-4 py-2 border rounded-xl text-sm" />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setShowCompose(false)}>Cancel</Button>
              <Button onClick={submitPost} disabled={!newPost.title || !newPost.content}>Post Anonymously</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex items-start space-x-4">
              {/* Vote */}
              <div className="flex flex-col items-center space-y-1 pt-1">
                <button onClick={() => toggleLike(post.id)}
                  className={`p-1 rounded ${post.isLiked ? "text-primary-600" : "text-gray-400 hover:text-gray-600"}`}>
                  <ArrowUp className="w-5 h-5" />
                </button>
                <span className={`text-sm font-bold ${post.isLiked ? "text-primary-600" : "text-gray-500"}`}>{post.likes}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {post.avatar}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{post.author}</span>
                  <Badge variant="default">{post.category}</Badge>
                  <span className="text-xs text-gray-400">{post.timeAgo}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{post.content}</p>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full text-xs">#{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <button className="flex items-center space-x-1 hover:text-primary-600">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.replies} replies</span>
                    </button>
                    <button onClick={() => toggleLike(post.id)}
                      className={`flex items-center space-x-1 ${post.isLiked ? "text-red-500" : "hover:text-red-500"}`}>
                      <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
                      <span>{post.isLiked ? "Liked" : "Like"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
