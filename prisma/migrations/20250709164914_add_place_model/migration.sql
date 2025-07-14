-- CreateEnum
CREATE TYPE "placeType" AS ENUM ('RESTAURANTE', 'BAR', 'HOTEL');

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "placeType" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "images" JSONB[],

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);
