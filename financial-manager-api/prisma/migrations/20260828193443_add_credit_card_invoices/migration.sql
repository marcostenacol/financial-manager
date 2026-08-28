-- AlterTable
ALTER TABLE "wallets" ADD COLUMN "closing_day" INTEGER;
ALTER TABLE "wallets" ADD COLUMN "due_day" INTEGER;

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "reference_month" TEXT NOT NULL,
    "closing_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_payments" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "invoice_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "invoices_wallet_id_reference_month_key" ON "invoices"("wallet_id", "reference_month");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
