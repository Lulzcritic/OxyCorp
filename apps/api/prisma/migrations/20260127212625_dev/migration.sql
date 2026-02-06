-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('REFINING_VAT', 'LOGISTICS_HUB', 'COMMAND_ARRAY');

-- CreateEnum
CREATE TYPE "QuestType" AS ENUM ('MINING', 'REFINING', 'COMBAT');

-- CreateEnum
CREATE TYPE "QuestStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "JobType" ADD VALUE 'REFINING';

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "data" JSONB,
ADD COLUMN     "sector_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "skill_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "specialization" TEXT,
ADD COLUMN     "xp" BIGINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "user_skills" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bunker_facilities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "FacilityType" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bunker_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "QuestType" NOT NULL,
    "target" JSONB NOT NULL,
    "reward" JSONB NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "QuestStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_skills_userId_skillId_key" ON "user_skills"("userId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "bunker_facilities_userId_type_key" ON "bunker_facilities"("userId", "type");

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bunker_facilities" ADD CONSTRAINT "bunker_facilities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
