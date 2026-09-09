-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "person_id" TEXT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;
