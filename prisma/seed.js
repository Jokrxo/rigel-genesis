const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { templates, mappings } = require('./seed-data.json')

async function main() {
  const templatesCount = await prisma.fooCoaTemplate.count()
  if (templatesCount === 0) {
    await prisma.fooCoaTemplate.createMany({
      data: templates
    })
    console.log('Seeded FOO COA templates')
  }

  const mappingsCount = await prisma.transactionTypeMapping.count()
  if (mappingsCount === 0) {
    await prisma.transactionTypeMapping.createMany({ 
      data: mappings 
    })
    console.log('Seeded transaction type mappings')
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
