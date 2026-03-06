import prisma from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();
    if (!user) throw new Error("Unauthorized");

    const workflow = await prisma.workflow.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const flowObject = JSON.parse(workflow.flowObject);

    return NextResponse.json({
      success: true,
      data: {
        id: workflow.id,
        name: workflow.name,
        flowObject: flowObject,
      },
    });
  } catch {

  }
}