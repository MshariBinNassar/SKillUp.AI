"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

type Status = "NOT_STARTED" | "IN_PROGRESS" | "DONE";

type Item = {
  id: string;
  name: string;
  description?: string | null;
  priority?: number | null;
  status: Status;
  updatedAt: string;
};

type ApiResponse =
  | {
      success: true;
      data: {
        id: string;
        title: string;
        summary?: string | null;
        groupedItems: Record<string, Item[]>;
      };
    }
  | { success: false; error: { code: string; message: string } };

function statusStyle(s: Status) {
  if (s === "DONE") return "bg-green-50 text-green-700 border-green-200";
  if (s === "IN_PROGRESS")
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function normalizeKey(type: string) {
  // Handles: "TECH_SKILL", "TECH", "TECH SKILL", etc.
  return type.replace(/\s+/g, "_").toUpperCase();
}

function displayLabel(type: string) {
  // Pretty label for UI
  return type.replaceAll("_", " ");
}

export default function ChecklistDetailsClient({ id }: { id: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/checklists/${id}`, { cache: "no-store" });
    const json = await res.json();
    setData(json);
  }

  async function updateStatus(itemId: string, status: Status) {
    setBusy(itemId);
    await fetch(`/api/checklist/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setBusy(null);
  }

  useEffect(() => {
    load();
  }, [id]);

  const overallProgress = useMemo(() => {
    if (!data || !data.success) return 0;
    const items = Object.values(data.data.groupedItems).flat();
    if (items.length === 0) return 0;
    const done = items.filter((i) => i.status === "DONE").length;
    return Math.round((done / items.length) * 100);
  }, [data]);

  const sectionProgress = useMemo(() => {
    if (!data || !data.success) {
      return [] as Array<{
        type: string;
        total: number;
        done: number;
        percent: number;
      }>;
    }

    const entries = Object.entries(data.data.groupedItems).map(
      ([type, items]) => {
        const total = items.length;
        const done = items.filter((i) => i.status === "DONE").length;
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);

        return {
          type,
          total,
          done,
          percent,
          sortKey: normalizeKey(type),
        };
      }
    );

    // Sort in a sensible order if keys exist, otherwise alphabetical
    const order = ["TECH_SKILL", "SOFT_SKILL", "CERTIFICATION"];
    entries.sort((a, b) => {
      const ai = order.indexOf(a.sortKey);
      const bi = order.indexOf(b.sortKey);
      const aRank = ai === -1 ? 999 : ai;
      const bRank = bi === -1 ? 999 : bi;
      if (aRank !== bRank) return aRank - bRank;
      return a.sortKey.localeCompare(b.sortKey);
    });

    // Remove sortKey from returned shape
    return entries.map(({ sortKey, ...rest }) => rest);
  }, [data]);

  if (!data) return <p>Loading…</p>;
  if (!data.success) return <p className="text-red-600">{data.error.message}</p>;

  return (
    <div className="space-y-6">
      <a href="/checklists" className="text-sm underline">
        ← Back to checklists
      </a>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{data.data.title}</h1>
        {data.data.summary && (
          <p className="mt-1 text-gray-600">{data.data.summary}</p>
        )}
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent>
          <div className="mb-2 text-sm font-medium">
            Progress: {overallProgress}%
          </div>
          <div className="h-2 w-full rounded bg-gray-200">
            <div
              className="h-2 rounded bg-gray-900"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section Progress (TECH / SOFT / CERT) */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Section Progress</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {sectionProgress.map((sp) => (
              <div key={sp.type} className="rounded-xl border p-3">
                <div className="text-sm text-gray-500">{displayLabel(sp.type)}</div>

                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-lg font-semibold">
                    {sp.done}/{sp.total}
                  </div>
                  <div className="text-sm text-gray-600">{sp.percent}%</div>
                </div>

                <div className="mt-2 h-2 w-full rounded bg-gray-200">
                  <div
                    className="h-2 rounded bg-gray-900"
                    style={{ width: `${sp.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      {Object.entries(data.data.groupedItems).map(([type, items]) => (
        <Card key={type}>
          <CardHeader>
            <h2 className="font-semibold">
              {displayLabel(type)} ({items.length})
            </h2>
          </CardHeader>

          <CardContent>
            <ul className="space-y-4">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-gray-500">
                      Priority: {it.priority ?? "-"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["NOT_STARTED", "IN_PROGRESS", "DONE"] as Status[]).map(
                      (s) => (
                        <button
                          key={s}
                          disabled={busy === it.id}
                          onClick={() => updateStatus(it.id, s)}
                          className={[
                            "rounded-xl border px-5 py-2 text-sm font-semibold",
                            "min-w-[120px] text-center",
                            statusStyle(s),
                            busy === it.id
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:opacity-90",
                          ].join(" ")}
                        >
                          {s.replace("_", " ")}
                        </button>
                      )
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
