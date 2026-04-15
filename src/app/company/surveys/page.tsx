"use client";

import { ClipboardList, ArrowRight } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";

export default function SurveysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pulse Surveys</h1>
        <p className="text-gray-500 mt-1">Quick anonymous wellness check-ins for your team</p>
      </div>

      <Card>
        <EmptyState
          icon={<ClipboardList className="w-16 h-16" />}
          title="Pulse surveys are coming"
          description="Soon you will be able to send 1-2 question wellness check-ins to your team — weekly, biweekly, or one-off. Responses are 100% anonymous and roll up into the same dashboards as your other wellness data."
          action={
            <Button disabled>
              Available after pilot <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          }
        />
      </Card>
    </div>
  );
}
