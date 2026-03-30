"use client";

import { Star } from "lucide-react";
import Card from "@/components/ui/card";

export default function TherapistReviews() {
  // Sample reviews data
  const reviews = [
    { id: "1", patient: "Alex T.", rating: 5, comment: "Dr. Johnson is incredibly empathetic and has helped me tremendously with my anxiety.", date: "2024-03-15" },
    { id: "2", patient: "Jane C.", rating: 5, comment: "The sessions are always productive. I feel heard and understood.", date: "2024-03-10" },
    { id: "3", patient: "Sarah M.", rating: 4, comment: "Great therapist. The TwinClone AI between sessions is very helpful.", date: "2024-03-05" },
  ];

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Patient Reviews</h1>

      <Card className="p-6">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
            <div className="flex mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const pct = (count / reviews.length) * 100;
              return (
                <div key={stars} className="flex items-center space-x-2 text-sm">
                  <span className="w-3">{stars}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                  {review.patient.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.patient}</p>
                  <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">{review.comment}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
