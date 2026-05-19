-- CreateTable
CREATE TABLE "Roast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerToken" TEXT NOT NULL,
    "passwordHash" TEXT,
    "length" INTEGER NOT NULL,
    "entropy" REAL NOT NULL,
    "score" INTEGER NOT NULL,
    "crackTimeSeconds" REAL NOT NULL,
    "crackTimeDisplay" TEXT NOT NULL,
    "charClasses" TEXT NOT NULL,
    "topPattern" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "roastText" TEXT NOT NULL,
    "nickname" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Roast_severity_idx" ON "Roast"("severity");

-- CreateIndex
CREATE INDEX "Roast_entropy_idx" ON "Roast"("entropy");

-- CreateIndex
CREATE INDEX "Roast_createdAt_idx" ON "Roast"("createdAt");

-- CreateIndex
CREATE INDEX "Roast_isPublic_idx" ON "Roast"("isPublic");
