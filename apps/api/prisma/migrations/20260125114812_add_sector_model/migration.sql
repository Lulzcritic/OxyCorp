-- CreateEnum
CREATE TYPE "SectorType" AS ENUM ('EMPTY', 'BUNKER', 'RESOURCE', 'POI');

-- CreateTable
CREATE TABLE "sectors" (
    "id" TEXT NOT NULL,
    "x" BIGINT NOT NULL,
    "y" BIGINT NOT NULL,
    "type" "SectorType" NOT NULL,
    "ownerId" TEXT,
    "resources" JSONB,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sectors_x_y_key" ON "sectors"("x", "y");

-- AddForeignKey
ALTER TABLE "sectors" ADD CONSTRAINT "sectors_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
