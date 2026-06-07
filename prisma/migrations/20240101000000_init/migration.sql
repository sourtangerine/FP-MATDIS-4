-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR', 'KOORDINATOR_LAPANGAN');

-- CreateEnum
CREATE TYPE "Urgensi" AS ENUM ('TINGGI', 'SEDANG', 'RENDAH');

-- CreateEnum
CREATE TYPE "StatusTitik" AS ENUM ('MENUNGGU', 'SEDANG_DIKIRIM', 'SELESAI', 'TERTUNDA');

-- CreateEnum
CREATE TYPE "StatusKendaraan" AS ENUM ('TERSEDIA', 'BERTUGAS', 'TIDAK_TERSEDIA');

-- CreateEnum
CREATE TYPE "StatusDistribusi" AS ENUM ('BERJALAN', 'SELESAI', 'TERTUNDA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TitikBantuan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kelurahan" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "urgensi" "Urgensi" NOT NULL DEFAULT 'SEDANG',
    "status" "StatusTitik" NOT NULL DEFAULT 'MENUNGGU',
    "jenisBantuan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TitikBantuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kendaraan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "platNomor" TEXT NOT NULL,
    "kapasitas" DOUBLE PRECISION NOT NULL,
    "status" "StatusKendaraan" NOT NULL DEFAULT 'TERSEDIA',

    CONSTRAINT "Kendaraan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distribusi" (
    "id" TEXT NOT NULL,
    "titikBantuanId" TEXT NOT NULL,
    "kendaraanId" TEXT NOT NULL,
    "beratBantuan" DOUBLE PRECISION NOT NULL,
    "status" "StatusDistribusi" NOT NULL DEFAULT 'BERJALAN',
    "waktuMulai" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waktuSelesai" TIMESTAMP(3),
    "rutePath" JSONB,
    "jarakAwal" DOUBLE PRECISION,
    "jarakOptimal" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Distribusi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraphNode" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "isDepot" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GraphNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraphEdge" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GraphEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Kendaraan_platNomor_key" ON "Kendaraan"("platNomor");

-- AddForeignKey
ALTER TABLE "Distribusi" ADD CONSTRAINT "Distribusi_titikBantuanId_fkey" FOREIGN KEY ("titikBantuanId") REFERENCES "TitikBantuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distribusi" ADD CONSTRAINT "Distribusi_kendaraanId_fkey" FOREIGN KEY ("kendaraanId") REFERENCES "Kendaraan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphEdge" ADD CONSTRAINT "GraphEdge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "GraphNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphEdge" ADD CONSTRAINT "GraphEdge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "GraphNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
