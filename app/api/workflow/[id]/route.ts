import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Edge, Node as ReactFlowNode } from "@xyflow/react";

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

    const workflow = await prisma.workflow.findFirst({
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nodes, edges } = (await req.json()) as {
      nodes: ReactFlowNode[];
      edges: Edge[];
    };

    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user || !user.id) throw new Error("Unauthorized");

    const workflow = await prisma.workflow.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        {
          error: "Workflow not found",
        },
        { status: 404 }
      );
    }

    const updatedWorkflow = await prisma.workflow.update({
      where: {
        id,
      },
      data: {
        flowObject: JSON.stringify({ nodes, edges }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedWorkflow,
    });

  } catch (error) {
    console.error("Error replacing/updating workflow:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update workflow",
      },
      { status: 500 }
    );
  }
}

// export async function PATCH(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const body = await req.json();
//     const session = await getKindeServerSession();
//     const user = await session.getUser();

//     if (!user || !user.id) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { nodes, edges } = body;

//     const updatedWorkflow = await prisma.workflow.update({
//       where: { 
//         id,
//         userId: user.id
//       },
//       data: {
//         definition: JSON.stringify({ nodes, edges }),
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       data: {
//         id: updatedWorkflow.id,
//         name: updatedWorkflow.name,
//         flowObject: JSON.parse(updatedWorkflow.definition),
//       },
//     });
//   } catch (error) {
//     console.error("Error updating workflow:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to update workflow",
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const session = await getKindeServerSession();
//     const user = await session.getUser();

//     if (!user || !user.id) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     await prisma.workflow.delete({
//       where: { 
//         id,
//         userId: user.id
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Workflow deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting workflow:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to delete workflow",
//       },
//       { status: 500 }
//     );
//   }
// }