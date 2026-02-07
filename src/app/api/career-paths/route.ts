import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const careerPaths = await prisma.careerPath.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: careerPaths,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch career paths",
        },
      },
      { status: 500 }
    );
  }
}
