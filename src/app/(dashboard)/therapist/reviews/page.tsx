"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Star, MessageSquare } from "lucide-react";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  patient: { name: string };
  appointment: { dateTime: string };
}

export default function TherapistReviews() {
  const { status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/therapist/reviews")
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setReviews(data); })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Reviews</h1>

      {reviews.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageSquare className="w-14 h-14" />}
            title="No reviews yet"
            description="Reviews appear here after patients rate their completed sessions with you. The more sessions you complete, the more reviews you collect — they help build trust with new patients."
          />
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</p>
                <div className="flex mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviews.filter((r) => r.rating === stars).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center space-x-2 text-sm">
                      <span className="w-3">{stars}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                      {review.patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{review.patient.name}</p>
                      <p className="text-xs text-gray-500">Session on {new Date(review.appointment.dateTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">{review.comment}</p>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
