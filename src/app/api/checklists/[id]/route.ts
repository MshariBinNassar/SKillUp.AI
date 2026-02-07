import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Login required" } },
        { status: 401 }
      );
    }

    // ✅ Extract checklistId from URL (guaranteed)
    const checklistId = new URL(req.url).pathname.split("/").pop();

    if (!checklistId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Missing checklist id" } },
        { status: 400 }
      );
    }

    // Resolve userId from email
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

    // Fetch checklist only if it belongs to the user
    const checklist = await prisma.checklist.findFirst({
      where: {
        id: checklistId,
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        summary: true,
        updatedAt: true,
        careerPath: { select: { slug: true, name: true } },
        items: {
          orderBy: [{ type: "asc" }, { priority: "asc" }],
          select: {
            id: true,
            type: true,
            name: true,
            description: true,
            priority: true,
            status: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!checklist) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Checklist not found" } },
        { status: 404 }
      );
    }

    const groupedItems = checklist.items.reduce(
      (acc, item) => {
        acc[item.type].push(item);
        return acc;
      },
      {
        TECH_SKILL: [] as typeof checklist.items,
        SOFT_SKILL: [] as typeof checklist.items,
        CERTIFICATION: [] as typeof checklist.items,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: checklist.id,
        title: checklist.title,
        summary: checklist.summary,
        updatedAt: checklist.updatedAt,
        careerPathSlug: checklist.careerPath.slug,
        careerPathName: checklist.careerPath.name,
        items: checklist.items,
        groupedItems,
      },
    });
  } catch (err) {
    console.error("GET /api/checklists/:id error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
