-- CreateTable
CREATE TABLE "ComplaintView" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComplaintView_complaintId_adminId_key" ON "ComplaintView"("complaintId", "adminId");

-- AddForeignKey
ALTER TABLE "ComplaintView" ADD CONSTRAINT "ComplaintView_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintView" ADD CONSTRAINT "ComplaintView_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
