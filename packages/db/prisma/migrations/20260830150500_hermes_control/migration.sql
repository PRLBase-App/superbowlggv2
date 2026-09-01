CREATE TABLE "HermesRequestNonce" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HermesRequestNonce_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HermesProjectAction" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HermesProjectAction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HermesRequestNonce_service_nonce_key"
ON "HermesRequestNonce"("service", "nonce");

CREATE INDEX "HermesRequestNonce_seenAt_idx" ON "HermesRequestNonce"("seenAt");

CREATE UNIQUE INDEX "HermesProjectAction_idempotencyKey_key"
ON "HermesProjectAction"("idempotencyKey");

CREATE INDEX "HermesProjectAction_status_createdAt_idx"
ON "HermesProjectAction"("status", "createdAt");
