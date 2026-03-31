"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Calendar, ArrowRight, Search, Tag } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetch("/api/blog").then((r) => r.json()).then(setPosts).catch(console.error);
  }, []);

  const categories = ["All", ...new Set(posts.map((p) => p.category))];
  const filtered = posts
    .filter((p) => category === "All" || p.category === category)
    .filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Wellness Blog</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expert insights, tips, and research on mental health and holistic wellness
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat ? "bg-primary-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"
                }`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search articles..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 w-64" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((post) => (
            <Card key={post.id} hover className="overflow-hidden">
              <div className="h-2 gradient-bg" />
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Badge>{post.category}</Badge>
                  <span className="text-xs text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {post.readTime} min read
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">#{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {post.author.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.author}</p>
                      <p className="text-xs text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Read <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No articles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
