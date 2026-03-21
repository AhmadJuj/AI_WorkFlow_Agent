import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const workflows = await prisma.workflow.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
  });

  if (workflows.length > 0) {
    console.log(workflows[0].flowObject);
  } else {
    console.log('No workflows found');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
