BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "Tickets" (
	"ticket_id"	INTEGER,
	"status"	TEXT DEFAULT 'open',
	"category"	TEXT,
	"owner_id"	INTEGER,
	"title"	TEXT,
	"timestamp"	TEXT,
	PRIMARY KEY("ticket_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "TicketBlocks" (
	"block_id"	INTEGER,
	"ticket_id"	INTEGER,
	"content"	TEXT,
	"timestamp"	TEXT,
	"author_id"	INTEGER,
	PRIMARY KEY("block_id" AUTOINCREMENT),
	FOREIGN KEY("author_id") REFERENCES "Users"("user_id"),
	FOREIGN KEY("ticket_id") REFERENCES "Tickets"("ticket_id")
);
CREATE TABLE IF NOT EXISTS "Users" (
	"user_id"	INTEGER NOT NULL,
	"username"	TEXT UNIQUE,
	"hash"	TEXT NOT NULL,
	"is_admin"	INTEGER DEFAULT 0,
	"salt"	TEXT NOT NULL,
	PRIMARY KEY("user_id" AUTOINCREMENT)
);
INSERT INTO "Tickets" VALUES (1,'open','inquiry',1,'Issue with login','2024-06-11 12:00:00');
INSERT INTO "Tickets" VALUES (2,'open','maintenance',2,'Server downtime','2024-06-10 10:30:00');
INSERT INTO "Tickets" VALUES (3,'closed','new feature',1,'Add dark mode','2024-06-09 14:45:00');
INSERT INTO "Tickets" VALUES (4,'closed','administrative',3,'Billing inquiry','2024-06-08 09:15:00');
INSERT INTO "Tickets" VALUES (11,'open','administrative',4,'Change Configuration of DB','2024-06-14 15:37:01');
INSERT INTO "TicketBlocks" VALUES (1,1,'Issue seems to be related to password recovery.','2024-06-11 12:10:00',1);
INSERT INTO "TicketBlocks" VALUES (2,2,'Server rebooted, issue resolved.','2024-06-10 11:00:00',3);
INSERT INTO "TicketBlocks" VALUES (3,3,'Dark mode implemented successfully.','2024-06-09 15:00:00',1);
INSERT INTO "TicketBlocks" VALUES (4,4,'Billing issue resolved.','2024-06-08 10:00:00',4);
INSERT INTO "TicketBlocks" VALUES (18,1,'I Love Akita ','2024-06-14 15:30:59',2);
INSERT INTO "TicketBlocks" VALUES (19,1,'Me Too!!','2024-06-14 15:31:21',3);
INSERT INTO "TicketBlocks" VALUES (20,2,'The Polito Server Exploded','2024-06-14 15:31:39',3);
INSERT INTO "TicketBlocks" VALUES (21,2,'OMG!!!','2024-06-14 15:33:16',5);
INSERT INTO "TicketBlocks" VALUES (22,11,'Text About this 

Its Like Boring','2024-06-14 15:41:04',3);
INSERT INTO "TicketBlocks" VALUES (23,11,'test

123','2024-06-14 17:46:17',1);
INSERT INTO "Users" VALUES (1,'user1','15d3c4fca80fa608dcedeb65ac10eff78d20c88800d016369a3d2963742ea288',0,'72e4eeb14def3b21');
INSERT INTO "Users" VALUES (2,'user2','1d22239e62539d26ccdb1d114c0f27d8870f70d622f35de0ae2ad651840ee58a',0,'a8b618c717683608');
INSERT INTO "Users" VALUES (3,'admin1','34455e54333e82780f6afb75b5f685d4071cc434dd38ea6e7d999dd02293cd84',1,'786d7e8f9a1b234');
INSERT INTO "Users" VALUES (4,'admin2','61ed132df8733b14ae5210457df8f95b987a7d4b8cdf3daf2b5541679e7a0622',1,'e818f0647b4e1fe0');
INSERT INTO "Users" VALUES (5,'user3','92e62890260814ba6d4783d24f4ebfa7cd7f2b35ebb260b94576b0e20759f9c9',0,'5c6d7e8f9a1b2c3');
COMMIT;
