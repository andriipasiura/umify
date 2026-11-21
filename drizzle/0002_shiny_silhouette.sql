CREATE TABLE "RateLimit" (
	"key" text NOT NULL,
	"windowStart" timestamp (3) NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "RateLimit_pkey" PRIMARY KEY("key","windowStart")
);
