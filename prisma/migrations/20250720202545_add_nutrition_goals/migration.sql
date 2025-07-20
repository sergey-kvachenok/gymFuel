-- AlterTable
ALTER TABLE "Consumption" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "calories" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "NutritionGoals" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dailyCalories" DOUBLE PRECISION NOT NULL,
    "dailyProtein" DOUBLE PRECISION NOT NULL,
    "dailyFat" DOUBLE PRECISION NOT NULL,
    "dailyCarbs" DOUBLE PRECISION NOT NULL,
    "goalType" TEXT NOT NULL DEFAULT 'maintain',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionGoals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NutritionGoals_userId_key" ON "NutritionGoals"("userId");

-- AddForeignKey
ALTER TABLE "NutritionGoals" ADD CONSTRAINT "NutritionGoals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
