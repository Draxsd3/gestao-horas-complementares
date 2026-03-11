-- AlterTable
ALTER TABLE "Usuario"
ADD COLUMN "professorId" INTEGER;

-- AlterTable
ALTER TABLE "Certificado"
ADD COLUMN "analisadoPorId" INTEGER,
ADD COLUMN "dataAnalise" TIMESTAMP(3),
ADD COLUMN "horasValidadas" INTEGER,
ADD COLUMN "observacaoProfessor" TEXT;

-- AddForeignKey
ALTER TABLE "Usuario"
ADD CONSTRAINT "Usuario_professorId_fkey"
FOREIGN KEY ("professorId") REFERENCES "Usuario"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificado"
ADD CONSTRAINT "Certificado_analisadoPorId_fkey"
FOREIGN KEY ("analisadoPorId") REFERENCES "Usuario"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
