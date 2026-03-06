import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) throw new Error("Unauthorized");
    if (!name) throw new Error("Name field required");

    const userId = user.id;

    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name,
        description: description || "",
        // flowObject
      },
    });

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Failed to create workflow",
      },
      { status: 500 }
    );
  }
}