/*
  Warnings:

  - The values [Reviewed] on the enum `ComplaintStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ComplaintStatus_new" AS ENUM ('Pending', 'Seen', 'Resolved');
ALTER TABLE "public"."Complaint" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Complaint" ALTER COLUMN "status" TYPE "ComplaintStatus_new" USING (
    CASE "status"::text
        WHEN 'Reviewed' THEN 'Seen'::"ComplaintStatus_new"
        ELSE "status"::text::"ComplaintStatus_new"
    END
);
ALTER TYPE "ComplaintStatus" RENAME TO "ComplaintStatus_old";
ALTER TYPE "ComplaintStatus_new" RENAME TO "ComplaintStatus";
DROP TYPE "public"."ComplaintStatus_old";
ALTER TABLE "Complaint" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;
