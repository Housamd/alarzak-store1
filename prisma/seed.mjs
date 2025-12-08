import 'dotenv/config';import bcrypt from 'bcryptjs';import { PrismaClient } from '@prisma/client';const prisma=new PrismaClient();async function main(){await prisma.customer.upsert({where:{number:'1001'},update:{},create:{number:'1001',codeHash:await bcrypt.hash('alrazak1',10),name:'Al-Razak Foods Ltd.',email:'wholesale@example.com',isActive:true}});await prisma.customer.upsert({where:{number:'2002'},update:{},create:{number:'2002',codeHash:await bcrypt.hash('alrazak2',10),name:'Retail Testing',email:'retail@example.com',isActive:true}});const products=[{sku:'BR-5KG',nameEn:'Premium Basmati Rice 5kg',retailPriceGBP:14.99,wholesalePriceGBP:11.20},{sku:'BR-10KG',nameEn:'Premium Basmati Rice 10kg',retailPriceGBP:27.99,wholesalePriceGBP:22.50},{sku:'RW-500',nameEn:'Rose Water 500ml',retailPriceGBP:2.49,wholesalePriceGBP:1.85}];for(const p of products){await prisma.product.upsert({where:{sku:p.sku},update:{},create:{...p}})}console.log('Seeded customers & products.')}main().catch(e=>console.error(e)).finally(async()=>await prisma.$disconnect())
// Admin user
await prisma.customer.upsert({
  where: { number: '9999' },
  update: {},
  create: {
    number: '9999',
    codeHash: await bcrypt.hash('admin123', 10),
    name: 'Store Admin',
    email: 'admin@example.com',
    isActive: true,
    isAdmin: true,
  },
})
