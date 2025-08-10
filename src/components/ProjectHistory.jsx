import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProjectHistory({ userId, userType }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !userType) {
      setLoading(false);
      return;
    }
    fetch(`/api/history/${userType}/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId, userType]);

  if (loading) return <div className="text-gray-400">Loading history...</div>;

  return (
    <Card className="bg-gray-900 border border-gray-800 mt-8">
      <CardHeader>
        <CardTitle className="text-white text-lg">Project History</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-gray-400">No completed projects yet.</div>
        ) : (
          <ul className="space-y-3">
            {projects.map((p) => (
              <li key={p._id} className="text-white">
                <span className="font-bold">{p.title}</span> —{" "}
                {p.description.slice(0, 60)}...
                <span className="ml-2 text-green-400">Completed</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
