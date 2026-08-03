-- CreateEnum
CREATE TYPE "ProfileScope" AS ENUM ('personal', 'business');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "scope" "ProfileScope";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "cost_center_id" TEXT;

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "scope" "ProfileScope" NOT NULL DEFAULT 'personal';

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
