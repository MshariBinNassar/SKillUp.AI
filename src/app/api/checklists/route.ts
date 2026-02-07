import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Login required" } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ success: true, data: { checklists: [] } });
    }

    const checklists = await prisma.checklist.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        summary: true,
        updatedAt: true,
        careerPath: {
          select: { slug: true, name: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        checklists: checklists.map((c) => ({
          id: c.id,
          title: c.title,
          summary: c.summary,
          updatedAt: c.updatedAt,
          careerPathSlug: c.careerPath.slug,
          careerPathName: c.careerPath.name,
          itemsCount: c._count.items,
        })),
      },
    });
  } catch (err) {
    console.error("GET /api/checklists error:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Unexpected server error" } },
      { status: 500 }
    );
  }
}
