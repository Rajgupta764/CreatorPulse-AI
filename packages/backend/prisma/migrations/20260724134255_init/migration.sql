-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "daily_limit" INTEGER NOT NULL DEFAULT 3,
    "lemon_customer_id" TEXT,
    "lemon_subscription_id" TEXT,
    "subscription_status" TEXT,
    "trial_ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "input_title" TEXT NOT NULL,
    "niche" TEXT,
    "analysis" JSONB NOT NULL,
    "generated_titles" JSONB NOT NULL,
    "generated_description" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_usage" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title_a" TEXT NOT NULL,
    "title_b" TEXT NOT NULL,
    "winner_title" TEXT NOT NULL,
    "winner_score" INTEGER NOT NULL,
    "loser_score" INTEGER NOT NULL,
    "analysis" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_analyses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "input_comments" TEXT NOT NULL,
    "analysis" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hooks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "input_title" TEXT NOT NULL,
    "niche" TEXT,
    "analysis" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readiness_scores" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "input" JSONB NOT NULL,
    "analysis" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "readiness_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_gaps" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "input_urls" TEXT,
    "input_topics" TEXT,
    "analysis" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_gaps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "generations_user_id_idx" ON "generations"("user_id");

-- CreateIndex
CREATE INDEX "generations_created_at_idx" ON "generations"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "daily_usage_user_id_date_key" ON "daily_usage"("user_id", "date");

-- CreateIndex
CREATE INDEX "battles_user_id_idx" ON "battles"("user_id");

-- CreateIndex
CREATE INDEX "battles_created_at_idx" ON "battles"("created_at");

-- CreateIndex
CREATE INDEX "comment_analyses_user_id_idx" ON "comment_analyses"("user_id");

-- CreateIndex
CREATE INDEX "comment_analyses_created_at_idx" ON "comment_analyses"("created_at");

-- CreateIndex
CREATE INDEX "hooks_user_id_idx" ON "hooks"("user_id");

-- CreateIndex
CREATE INDEX "readiness_scores_user_id_idx" ON "readiness_scores"("user_id");

-- CreateIndex
CREATE INDEX "content_gaps_user_id_idx" ON "content_gaps"("user_id");

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_usage" ADD CONSTRAINT "daily_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battles" ADD CONSTRAINT "battles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_analyses" ADD CONSTRAINT "comment_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hooks" ADD CONSTRAINT "hooks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_scores" ADD CONSTRAINT "readiness_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_gaps" ADD CONSTRAINT "content_gaps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
