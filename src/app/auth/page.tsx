"use client";

import { signIn } from "next-auth/react";

export default function AuthPage() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <div style={{ maxWidth: 420, width: "100%", padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          SkillUp.AI
        </h1>

        <p style={{ marginBottom: 16 }}>
          Sign in to save your progress.
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/home" })}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
