-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "capacity" INTEGER,
    "bannerImageURL" TEXT,
    "badgeBackgroundURL" TEXT,
    "badgeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "badgeSize" TEXT NOT NULL DEFAULT '3*4',
    "badgeOrientation" TEXT NOT NULL DEFAULT 'vertical',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "eventType" TEXT NOT NULL DEFAULT 'STANDARD',
    "endDate" DATETIME,
    "organizerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("badgeBackgroundURL", "bannerImageURL", "capacity", "createdAt", "date", "description", "endTime", "id", "isPublished", "location", "organizerId", "startTime", "title", "updatedAt") SELECT "badgeBackgroundURL", "bannerImageURL", "capacity", "createdAt", "date", "description", "endTime", "id", "isPublished", "location", "organizerId", "startTime", "title", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE TABLE "new_Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "attendeeId" TEXT,
    "guestName" TEXT,
    "guestPhone" TEXT,
    "guestEmail" TEXT,
    "ticketTypeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "qrCodeString" TEXT,
    "checkedInAt" DATETIME,
    "badgeIssuedAt" DATETIME,
    "registrationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Registration_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Registration_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Registration" ("attendeeId", "badgeIssuedAt", "checkedInAt", "eventId", "id", "qrCodeString", "registrationDate", "status", "ticketTypeId", "updatedAt") SELECT "attendeeId", "badgeIssuedAt", "checkedInAt", "eventId", "id", "qrCodeString", "registrationDate", "status", "ticketTypeId", "updatedAt" FROM "Registration";
DROP TABLE "Registration";
ALTER TABLE "new_Registration" RENAME TO "Registration";
CREATE UNIQUE INDEX "Registration_qrCodeString_key" ON "Registration"("qrCodeString");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
