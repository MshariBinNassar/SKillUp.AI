import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Login required" } },
        { status: 401 }
      );
    }

    // ✅ Extract dynamic id from URL (guaranteed)
    const id = new URL(req.url).pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Missing item id" } },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body as { status?: "NOT_STARTED" | "IN_PROGRESS" | "DONE" };

    if (!status || !["NOT_STARTED", "IN_PROGRESS", "DONE"].includes(status)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Invalid status" } },
        { status: 400 }
      );
    }

    // 1) Resolve userId from session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User not found" } },
        { status: 401 }
      );
    }

    // 2) Ensure the item belongs to a checklist owned by this user
    const item = await prisma.checklistItem.findFirst({
      where: {
        id,
        checklist: {
          userId: user.id,
        },
      },
      select: { id: true },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Item not found or access denied" } },
        { status: 403 }
      );
    }

    const updated = await prisma.checklistItem.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, updatedAt: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH /api/checklist/items/:id error:", err);

    const message = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message,
          debug: String(err),
        },
      },
      { status: 500 }
    );
  }
}
