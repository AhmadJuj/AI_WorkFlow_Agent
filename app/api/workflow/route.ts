import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getKindeServerSession();
    const user = await session.getUser();

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
        error: error instanceof Error ? error.message : "Failed to fetch workflows",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();
    
    const session = await getKindeServerSession();
    const user = await session.getUser();

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
        error: error instanceof Error ? error.message : "Failed to create workflow",
      },
      { status: 500 }
    );
  }
}
