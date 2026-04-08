-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "callerName" TEXT,
    "callerPhone" TEXT,
    "callerAddress" TEXT,
    "serviceNeeded" TEXT,
    "preferredTime" TEXT,
    "notes" TEXT,
    "summary" TEXT,
    "source" TEXT NOT NULL DEFAULT 'call',
    "vapiCallId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_vapiCallId_key" ON "Booking"("vapiCallId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
