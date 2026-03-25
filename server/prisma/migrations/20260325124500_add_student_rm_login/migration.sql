-- AlterTable
ALTER TABLE "Usuario"
ADD COLUMN "rm" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_rm_key" ON "Usuario"("rm");
