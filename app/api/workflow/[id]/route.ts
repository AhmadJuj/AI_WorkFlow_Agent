import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workflow = await prisma.workflow.findUnique({
      where: { 
        id,
        userId: user.id // Ensure user can only access their own workflows
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch workflow",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workflow = await prisma.workflow.update({
      where: { 
        id,
        userId: user.id
      },
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update workflow",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.workflow.delete({
      where: { 
        id,
        userId: user.id
      },
    });

    return NextResponse.json({
      success: true,
      message: "Workflow deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete workflow",
      },
      { status: 500 }
    );
  }
}
