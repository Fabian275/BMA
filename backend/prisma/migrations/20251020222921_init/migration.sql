-- CreateTable
CREATE TABLE "language" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(5) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(150) NOT NULL,
    "language_id" INTEGER NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcription_info" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "location" VARCHAR(100) NOT NULL,
    "date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "transcription_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcription" (
    "id" SERIAL NOT NULL,
    "transcription_info_id" INTEGER NOT NULL,
    "transcribed_text" TEXT NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,

    CONSTRAINT "transcription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "language_code_key" ON "language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "transcription_transcription_info_id_key" ON "transcription"("transcription_info_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcription_info" ADD CONSTRAINT "transcription_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcription" ADD CONSTRAINT "transcription_transcription_info_id_fkey" FOREIGN KEY ("transcription_info_id") REFERENCES "transcription_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
