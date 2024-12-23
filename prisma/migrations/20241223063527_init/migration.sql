-- CreateTable
CREATE TABLE "CanvasState" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "canvasData" JSONB NOT NULL,
    "displayDimensions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvasState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CanvasState_imageId_key" ON "CanvasState"("imageId");
