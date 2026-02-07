"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

type SessionShape = {
  user?: { email?: string };
};

type ChecklistListItem = {
  id: string;
  title: string;
  summary?: string | null;
  updatedAt: string;
  careerPathName: string;
  itemsCount: number;
};

type ApiResponse =
  | { success: true; data: { checklists: ChecklistListItem[] } }
  | { success: false; error: { code: string; message: string } };

// 🔹 badge color حسب المسار
function careerBadgeStyle(name: string) {
  const n = name.toLowerCase();
  if (n.includes("cyber")) return "bg-red-50 text-red-700 border-red-200";
  if (n.includes("software")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (n.includes("data")) return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function ChecklistsClient() {
  const [session, setSession] = useState<SessionShape | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(setSession);

    fetch("/api/checklists")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Checklists</h1>
        <p className="text-sm text-gray-500">
          Signed in as {session?.user?.email}
        </p>
      </div>

      {/* Cards */}
      {!data ? (
        <p>Loading…</p>
      ) : !data.success ? (
        <p className="text-red-600">{data.error.message}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.data.checklists.map((c) => (
            <a
              key={c.id}
              href={`/checklists/${c.id}`}
              className="group block transition hover:-translate-y-0.5"
            >
              <Card className="h-full">
                <CardHeader className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold group-hover:underline">
                      {c.title}
                    </h2>

                    <span
                      className={[
                        "rounded-full border px-3 py-1 text-xs font-semibold",
                        careerBadgeStyle(c.careerPathName),
                      ].join(" ")}
                    >
                      {c.careerPathName}
                    </span>
                  </div>

                  {c.summary && (
                    <p className="text-sm text-gray-600">{c.summary}</p>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{c.itemsCount} items</span>
                    <span>
                      Updated{" "}
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
