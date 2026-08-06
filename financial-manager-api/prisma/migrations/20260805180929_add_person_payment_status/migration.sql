-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('ONE_TIME', 'MONTHLY');

-- AlterTable
ALTER TABLE "people" ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_paid_period" TEXT,
ADD COLUMN     "payment_frequency" "PaymentFrequency" NOT NULL DEFAULT 'ONE_TIME';
