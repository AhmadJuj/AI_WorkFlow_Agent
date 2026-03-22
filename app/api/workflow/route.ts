import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const getUserSafely = async () => {
  try {
    const session = await getKindeServerSession();
    const user = await session.getUser();
    return user;
  } catch (error) {
    console.error("Auth session error:", error);
    return null;
  }
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!(error instanceof Error)) return fallback;

  if (error.message.includes("DATABASE_URL")) {
    return "Database is not configured. Set DATABASE_URL in environment variables.";
  }

  return error.message || fallback;
};

export async function GET(req: Request) {
  try {
    const user = await getUserSafely();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      {
        error: getErrorMessage(error, "Failed to fetch workflows"),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();
    
    const user = await getUserSafely();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    if (!name) {
      return NextResponse.json(
        { error: "Name field required" },
        { status: 400 }
      );
    }

    const userId = user.id;

    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name,
        description: description || "",
      },
    });

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json(
      {
        error: getErrorMessage(error, "Failed to create workflow"),
      },
      { status: 500 }
    );
  }
}
