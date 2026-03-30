"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, DollarSign } from "lucide-react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";

interface Program {
  id: string;
  title: string;
  category: string;
  duration: string;
  level: string;
  price: number;
  isActive: boolean;
  _count: { enrollments: number };
}

export default function AdminPrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    fetch("/api/programs").then((r) => r.json()).then(setPrograms).catch(console.error);
  }, []);

  const totalRevenue = programs.reduce((sum, p) => sum + p.price * p._count.enrollments, 0);
  const totalEnrollments = programs.reduce((sum, p) => sum + p._count.enrollments, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Program Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
              <p className="text-xs text-gray-500">Total Programs</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
              <p className="text-xs text-gray-500">Total Enrollments</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Estimated Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Program</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Level</th>
              <th className="px-6 py-3 font-medium">Duration</th>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="px-6 py-3 font-medium">Enrollments</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{p.title}</td>
                <td className="px-6 py-4"><Badge>{p.category.replace("_", " ")}</Badge></td>
                <td className="px-6 py-4"><Badge variant="info">{p.level}</Badge></td>
                <td className="px-6 py-4 text-gray-600">{p.duration}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">${p.price}</td>
                <td className="px-6 py-4 text-gray-600">{p._count.enrollments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
