ALTER TABLE "VerificationToken" ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "VerificationToken"
SET "updatedAt" = "createdAt"
WHERE "updatedAt" IS NULL;

ALTER TABLE "VerificationToken" ALTER COLUMN "updatedAt" SET NOT NULL;
