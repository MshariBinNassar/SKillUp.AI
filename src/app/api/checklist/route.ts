import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // ✅ Require authenticated user (production-like)
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to generate a checklist",
          },
        },
        { status: 401 }
      );
    }

    // ✅ Ensure a real User exists (create/update on first use)
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {
        name: session.user.name ?? undefined,
        image: session.user.image ?? undefined,
      },
      create: {
        email: session.user.email,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      },
    });

    const body = await req.json();
    const { careerPathSlug } = body as { careerPathSlug?: string };

    if (!careerPathSlug) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "careerPathSlug is required",
          },
        },
        { status: 400 }
      );
    }

    const careerPath = await prisma.careerPath.findUnique({
      where: { slug: careerPathSlug },
    });

    if (!careerPath) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PATH_NOT_FOUND",
            message: "Career path not found",
          },
        },
        { status: 404 }
      );
    }

    // 🔹 Mock checklist items (later replaced by AI)
    const checklistItems = [
      { type: "TECH_SKILL", name: "Fundamentals", priority: 1 },
      { type: "TECH_SKILL", name: "Tools & Platforms", priority: 2 },
      { type: "CERTIFICATION", name: "Entry-level Certification", priority: 3 },
      { type: "SOFT_SKILL", name: "Problem Solving", priority: 4 },
    ] as const;

    const checklist = await prisma.checklist.create({
      data: {
        userId: user.id, // ✅ real FK
        careerPathId: careerPath.id,
        title: `${careerPath.name} Readiness Checklist`,
        summary: "Checklist based on current market requirements.",
        items: {
          create: checklistItems.map((item) => ({
            type: item.type as any,
            name: item.name,
            priority: item.priority,
          })),
        },
      },
      include: {
        items: true,
        careerPath: true,
      },
    });

    return NextResponse.json({ success: true, data: checklist });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate checklist",
        },
      },
      { status: 500 }
    );
  }
}
