-- CreateTable
CREATE TABLE "ShortURL" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShortURL_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortURL_slug_key" ON "ShortURL"("slug");
