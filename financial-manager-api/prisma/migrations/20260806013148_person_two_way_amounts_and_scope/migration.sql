/*
  Warnings:

  - You are about to drop the column `amount_owed` on the `people` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "people" DROP CONSTRAINT "people_user_id_fkey";

-- AlterTable
ALTER TABLE "people" DROP COLUMN "amount_owed",
ADD COLUMN     "i_owe_them" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "organization_id" TEXT,
ADD COLUMN     "scope" "ProfileScope" NOT NULL DEFAULT 'personal',
ADD COLUMN     "they_owe_me" DECIMAL(15,2) NOT NULL DEFAULT 0,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
