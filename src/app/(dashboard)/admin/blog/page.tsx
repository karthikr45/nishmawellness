"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";

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

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", author: "",
    category: "Mental Health", tags: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/blog").then((r) => r.json()).then(setPosts).catch(console.error);
  }, []);

  const createPost = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          publishedAt: new Date().toISOString().split("T")[0],
          readTime: Math.ceil(form.content.split(" ").length / 200),
        }),
      });
      if (res.ok) {
        const post = await res.json();
        setPosts((prev) => [post, ...prev]);
        setShowModal(false);
        setForm({ title: "", slug: "", excerpt: "", content: "", author: "", category: "Mental Health", tags: "" });
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-500 mt-1">{posts.length} articles published</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Article
        </Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Article</th>
              <th className="px-6 py-3 font-medium">Author</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Published</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{post.excerpt}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">{post.author}</td>
                <td className="px-6 py-4"><Badge>{post.category}</Badge></td>
                <td className="px-6 py-4 text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(post.publishedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-blue-500" /></button>
                    <button className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Blog Article" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <Input label="Slug (auto-generated)" value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            placeholder="leave-blank-for-auto" />
          <Input label="Author" value={form.author}
            onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
              <option>Mental Health</option>
              <option>Wellness</option>
              <option>Career</option>
              <option>Nutrition</option>
              <option>Mindfulness</option>
              <option>Relationships</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea rows={2} value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea rows={8} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="Write your article in markdown..." />
          </div>
          <Input label="Tags (comma-separated)" value={form.tags}
            onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
            placeholder="e.g., anxiety, coping, wellness" />
          <Button onClick={createPost} loading={saving} className="w-full">Publish Article</Button>
        </div>
      </Modal>
    </div>
  );
}
