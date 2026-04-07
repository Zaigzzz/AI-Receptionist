-- AlterTable
ALTER TABLE "User" ADD COLUMN     "forwardingSetup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "vapiPhoneNumber" TEXT;
