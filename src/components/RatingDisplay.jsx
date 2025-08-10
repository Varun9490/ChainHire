import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RatingDisplay({ userId }) {
  const [avg, setAvg] = useState(null);
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/rating/average/${userId}`)
      .then((r) => r.json())
      .then((data) => setAvg(data.avg))
      .catch(() => setAvg(0));
  }, [userId]);
  return (
    <Card className="bg-gray-900 border border-gray-800 mt-4">
      <CardHeader>
        <CardTitle className="text-white text-lg">User Rating</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl text-yellow-400">
          {avg !== null ? avg.toFixed(2) : "-"} / 5
        </div>
      </CardContent>
    </Card>
  );
}
