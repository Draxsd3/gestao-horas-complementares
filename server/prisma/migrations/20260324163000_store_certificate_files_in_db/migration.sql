-- AlterTable
ALTER TABLE "Certificado"
ADD COLUMN "arquivoNomeOriginal" TEXT,
ADD COLUMN "arquivoMimeType" TEXT,
ADD COLUMN "arquivoConteudo" BYTEA;
