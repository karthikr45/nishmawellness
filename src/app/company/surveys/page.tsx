"use client";

import { ClipboardList } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

export default function SurveysPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pulse Surveys</h1>
      <Card className="p-12 text-center">
        <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 mb-4">Send quick wellness check-ins to your team</p>
        <Button>Create Survey</Button>
      </Card>
    </div>
  );
}
