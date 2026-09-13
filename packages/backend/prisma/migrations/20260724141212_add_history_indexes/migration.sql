-- CreateIndex
CREATE INDEX "content_gaps_created_at_idx" ON "content_gaps"("created_at");

-- CreateIndex
CREATE INDEX "hooks_created_at_idx" ON "hooks"("created_at");

-- CreateIndex
CREATE INDEX "readiness_scores_created_at_idx" ON "readiness_scores"("created_at");
