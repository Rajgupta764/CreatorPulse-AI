-- CreateTable
CREATE TABLE "validations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "idea" TEXT NOT NULL,
    "niche" TEXT,
    "analysis" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repurposes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "niche" TEXT,
    "analysis" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repurposes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "validations_user_id_idx" ON "validations"("user_id");

-- CreateIndex
CREATE INDEX "validations_created_at_idx" ON "validations"("created_at");

-- CreateIndex
CREATE INDEX "repurposes_user_id_idx" ON "repurposes"("user_id");

-- CreateIndex
CREATE INDEX "repurposes_created_at_idx" ON "repurposes"("created_at");

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repurposes" ADD CONSTRAINT "repurposes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
