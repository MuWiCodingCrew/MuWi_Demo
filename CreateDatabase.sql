DROP database MuWi;
CREATE database MuWi;
CREATE table MuWi.tUser (UserID int NOT NULL AUTO_INCREMENT, EMail varchar(255), Surname varchar(255), Prename varchar(255), isStudent binary, UNIQUE(UserID), PRIMARY KEY(UserID));
CREATE table MuWi.tBook (BookID int NOT NULL AUTO_INCREMENT, Title varchar(255) NOT NULL, UserID int NOT NULL, PRIMARY KEY (BookID), FOREIGN KEY (UserID) REFERENCES tUser(UserID));
CREATE table MuWi.tChapter (ChapterID int NOT NULL AUTO_INCREMENT, Title varchar(255) NOT NULL, BookID int NOT NULL, PRIMARY KEY (ChapterID), FOREIGN KEY (BookID) REFERENCES tBook(BookID));
CREATE table MuWi.tContent (ContentID int NOT NULL AUTO_INCREMENT, Title varchar(255) NOT NULL, Description varchar(255), ContentType varchar(255) NOT NULL, ContentData varchar(255) NOT NULL, PRIMARY KEY (ContentID));
CREATE table MuWi.tTag (TagID int NOT NULL AUTO_INCREMENT, Title varchar(255) NOT NULL, PRIMARY KEY (TagID), INDEX(Title));
CREATE table MuWi.tContentClassification (ContentClassificationID int NOT NULL AUTO_INCREMENT, ContentID int NOT NULL, TagID int NOT NULL, PRIMARY KEY (ContentClassificationID), FOREIGN KEY (ContentID) REFERENCES tContent(ContentID), FOREIGN KEY (TagID) REFERENCES tTag(TagID));
CREATE table MuWi.tList (ListID int NOT NULL AUTO_INCREMENT, ChapterID int NULL, UserID int NOT NULL, ListTitle varchar(255), PRIMARY KEY (ListID), FOREIGN KEY (UserID) REFERENCES tUser(UserID), FOREIGN KEY (ChapterID) REFERENCES tChapter(ChapterID));
CREATE table MuWi.tContentAffiliation (ContentAffiliationID int NOT NULL AUTO_INCREMENT, ListID int NOT NULL, ContentID int NOT NULL, PRIMARY KEY (ContentAffiliationID), FOREIGN KEY (ContentID) REFERENCES tContent(ContentID), FOREIGN KEY (ListID) REFERENCES tList(ListID));
CREATE table MuWi.tListAffiliation (ListAffiliationID int NOT NULL AUTO_INCREMENT, ListID int NOT NULL, UserID int NOT NULL, isCreator binary, PRIMARY KEY (ListAffiliationID), FOREIGN KEY (ListID) REFERENCES tlist(ListID),FOREIGN KEY (UserID) REFERENCES tuser(UserID));
CREATE table MuWi.tContentManagement (ContentManagementID int NOT NULL AUTO_INCREMENT, ContentID int NOT NULL, UserID int NOT NULL, IsCreator binary, Rating int, UserComent varchar(255), PRIMARY KEY (ContentManagementID), FOREIGN KEY (ContentID) REFERENCES tcontent(ContentID), FOREIGN KEY (UserID) REFERENCES tuser(UserID));
CREATE VIEW MuWi.vContent AS (SELECT a.*, d.ChapterID, c.ListID, d.Title AS 'ChapterTitle' FROM (((MuWi.tcontent AS a INNER JOIN MuWi.tContentAffiliation AS b ON a.ContentID = b.ContentID) INNER JOIN MuWi.tlist as c ON b.ListID = c.ListID) LEFT JOIN MuWi.tchapter as d ON c.ChapterID = d.ChapterID));
CREATE VIEW MuWi.vTagList AS (SELECT a.*, c.tagid, c.Title AS 'tagTitle' FROM ((MuWi.vContent as a INNER JOIN MuWi.tcontentclassification as b ON a.ContentID = b.ContentID) INNER JOIN MuWi.ttag as c ON b.TagID = c.tagid));
CREATE VIEW MuWi.vChapterList AS (Select ch.ChapterID, ch.Title AS 'ChapterTitle', bo.BookID, bo.Title AS 'BookTitle', bo.UserID, us.Surname, us.Prename FROM(MuWi.tchapter AS ch INNER JOIN MuWi.tbook AS bo ON(ch.BookID=bo.BookID) INNER JOIN MuWi.tuser AS us ON(bo.UserID=us.UserID)));
CREATE VIEW MuWi.vUserToContentViaList AS (SELECT a.*, c.listid, c.ListTitle, e.* FROM MuWi.tuser AS a INNER JOIN MuWi.tlistaffiliation AS b ON a.userid = b.userid INNER JOIN MuWi.tlist AS c ON b.listid = c.listid INNER JOIN MuWi.tcontentaffiliation As d ON d.listid = c.listid INNER JOIN MuWi.tcontent AS e ON e.contentid = d.contentid);
INSERT INTO MuWi.tuser (email, surname, prename, isstudent) VALUES ("Maria.Wolff@gmx.de", "Wolff", "Maria", 1);
INSERT INTO MuWi.tuser (email, surname, prename, isstudent) VALUES ("Tim.Rosenau@gmx.de", "Rosenau", "Tim", 1);
INSERT INTO MuWi.tuser (email, surname, prename, isstudent) VALUES ("Lucas.Thielicke@gmx.de", "Thielicke", "Lucas", 1);
INSERT INTO MuWi.tuser (email, surname, prename, isstudent) VALUES ("Julien.Fitzlaff@gmx.de", "Fitzlaff", "Julien", 1);
INSERT INTO MuWi.tuser (email, surname, prename, isstudent) VALUES ("Ricardo.Rosinski@gmx.de", "Rosinski", "Ricardo", 1);
INSERT INTO MuWi.tuser (email, surname, prename, isstudent) VALUES ("Claudia.Lemke@gmx.de", "Lemke", "Claudia", 0);
INSERT INTO MuWi.tuser (email, surname, prename, isstudent) VALUES ("Gert.Faustmann@gmx.de", "Faustmann", "Gert", 0);
INSERT INTO MuWi.tuser (email, surname, prename, isstudent) VALUES ("Kathrin.Kirchner@gmx.de", "Kirchner", "Kathrin", 0);
INSERT INTO MuWi.tbook (title, userid) VALUES ("Einführung in die Wirtschaftsinformatik I", 5);
INSERT INTO MuWi.tbook (title, userid) VALUES ("Einführung in die Wirtschaftsinformatik II", 5);
INSERT INTO MuWi.tchapter (title, bookid) VALUES ("Einführung in das digitale Zeitalter", 1);
INSERT INTO MuWi.tchapter (title, bookid) VALUES ("Mensch und Gesellschaft im digitalen Zeitalter", 1);
INSERT INTO MuWi.tchapter (title, bookid) VALUES ("Infrastruktur im digitalen Zeitalter", 1);
INSERT INTO MuWi.tchapter (title, bookid) VALUES ("Informationssysteme und Daten im digitalen Zeitalter", 1);
INSERT INTO MuWi.tchapter (title, bookid) VALUES ("Zalando Radical Agility: Vom Online-Retailer zur Fashion Plattform", 2);
INSERT INTO MuWi.tchapter (title, bookid) VALUES ("Die Dominanz von Software im digitalen Zeitalter", 2);
INSERT INTO MuWi.tchapter (title, bookid) VALUES ("Für Einsteiger: Verstehen und Strukturieren von Ideen", 2);
INSERT INTO MuWi.tchapter (title, bookid) VALUES ("Für Fortgeschrittene: Programmieren und Testen von Ideen", 2);
INSERT INTO MuWi.tlist (chapterid, ListTitle, userid) VALUES (1, "Einführung in das digitale Zeitalter", 5);
INSERT INTO MuWi.tlist (chapterid, ListTitle, userid) VALUES (2, "Mensch und Gesellschaft im digitalen Zeitalter", 5);
INSERT INTO MuWi.tlist (chapterid, userid) VALUES (3, 5);
INSERT INTO MuWi.tlist (chapterid, userid) VALUES (4, 5);
INSERT INTO MuWi.tlist (chapterid, userid) VALUES (5, 5);
INSERT INTO MuWi.tlist (chapterid, userid) VALUES (6, 5);
INSERT INTO MuWi.tlist (chapterid, userid) VALUES (7, 5);
INSERT INTO MuWi.tlist (chapterid, userid) VALUES (8, 5);
INSERT INTO MuWi.ttag (title) VALUES ("Digitalisierung");
INSERT INTO MuWi.ttag (title) VALUES ("Systems of Engagement");
INSERT INTO MuWi.ttag (title) VALUES ("Systems of Record");
INSERT INTO MuWi.ttag (title) VALUES ("Geschäftsmodelle");
INSERT INTO MuWi.ttag (title) VALUES ("Wertschöpfungskette");
INSERT INTO MuWi.ttag (title) VALUES ("Wissensmanagement");
INSERT INTO MuWi.ttag (title) VALUES ("Management");
INSERT INTO MuWi.ttag (title) VALUES ("Enterprise Ressource Planing");
INSERT INTO MuWi.ttag (title) VALUES ("Supply Chain Management");
INSERT INTO MuWi.ttag (title) VALUES ("Customer Relationship Management");
INSERT INTO MuWi.ttag (title) VALUES ("Unified Modeling Language");
INSERT INTO MuWi.ttag (title) VALUES ("Objektorientierte Programmierung");
INSERT INTO MuWi.ttag (title) VALUES ("Software Engineering");
INSERT INTO MuWi.ttag (title) VALUES ("UML");
INSERT INTO MuWi.tcontent (title, description, contenttype, contentdata) VALUES ("Folien Kapitel 1", "Einige spannende Informationen", "pdf", "./upload/0_document.pdf");
INSERT INTO MuWi.tcontent (title, description, contenttype, contentdata) VALUES ("Video Kapitel 1", "Einige spannende Informationen", "mp4", "./upload/1_DB_SQL.mp4");
INSERT INTO MuWi.tcontent (title, description, contenttype, contentdata) VALUES ("Bild Kapitel 1", "Einige spannende Informationen", "jpg", "./upload/2_imageSample.jpg");
INSERT INTO MuWi.tcontent (title, description, contenttype, contentdata) VALUES ("Bild 2 Kapitel 1", "Einige spannende Informationen", "png", "./upload/3_MP3ICON.png");
INSERT INTO MuWi.tcontent (title, description, contenttype, contentdata) VALUES ("Zusatzinformationen Kapitel 1", "Einige spannende Informationen", "mp3", "./upload/4_musicSample.mp3");
INSERT INTO MuWi.tcontent (title, description, contenttype, contentdata) VALUES ("OSI Schichten Kapitel 1", "Einige spannende Informationen", "jpg", "./upload/5_OSI7Schichtenmodell.jpg");
INSERT INTO MuWi.tcontent (title, description, contenttype, contentdata) VALUES ("Rational Unified Prozess", "Einige spannende Informationen", "jpg", "./upload/6_RUP.jpg");
INSERT INTO MuWi.tcontent (title, description, contenttype, contentdata) VALUES ("Folien Kapitel 2", "Einige spannende Informationen", "pdf", "./upload/7_fol2.pdf");
INSERT INTO MuWi.tcontent (title, description, contenttype, contentdata) VALUES ("Folien Kapitel 3", "Einige spannende Informationen", "pdf", "./upload/8_fol3.pdf");
INSERT INTO MuWi.tcontentaffiliation (listid, contentid) VALUES (1, 1);
INSERT INTO MuWi.tcontentaffiliation (listid, contentid) VALUES (1, 2);
INSERT INTO MuWi.tcontentaffiliation (listid, contentid) VALUES (1, 3);
INSERT INTO MuWi.tcontentaffiliation (listid, contentid) VALUES (1, 4);
INSERT INTO MuWi.tcontentaffiliation (listid, contentid) VALUES (1, 5);
INSERT INTO MuWi.tcontentaffiliation (listid, contentid) VALUES (1, 6);
INSERT INTO MuWi.tcontentaffiliation (listid, contentid) VALUES (2, 7);
INSERT INTO MuWi.tcontentaffiliation (listid, contentid) VALUES (2, 8);
INSERT INTO MuWi.tcontentaffiliation (listid, contentid) VALUES (3, 9);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (1, 1);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (1, 2);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (1, 3);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (2, 3);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (2, 4);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (2, 5);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (3, 7);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (3, 8);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (3, 9);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (4, 1);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (4, 2);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (4, 3);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (5, 4);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (5, 5);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (5, 6);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (6, 7);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (6, 1);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (6, 2);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (7, 13);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (7, 11);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (7, 4);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (8, 13);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (8, 14);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (9, 4);
INSERT INTO MuWi.tcontentclassification (contentid, tagid) VALUES (9, 11);

DELIMITER $$
CREATE PROCEDURE MuWi.`Insert_List_With_Content`(
    IN p_listName VARCHAR(255),
    IN p_userid int,
    IN p_contentId int
)
BEGIN
	DECLARE v_ListId int;

    START TRANSACTION;

	INSERT INTO MuWi.tlist (listtitle, userid, chapterid) VALUES (p_listName, p_userid, null);
	SELECT listid INTO v_ListId FROM MuWi.tlist WHERE listtitle = p_listName;
	INSERT INTO MuWi.tlistaffiliation (ListID, UserID, isCreator) VALUES (v_ListId, p_userid, 1);
    INSERT INTO MuWi.tcontentaffiliation (ListID, ContentID) VALUES (v_ListId, p_contentId);

    COMMIT WORK;

END$$

CREATE PROCEDURE MuWi.`Update_List_With_Content`(
    IN p_listName VARCHAR(255),
    IN p_userid int,
    IN p_contentId int
)
BEGIN
	DECLARE v_ListId int;

    START TRANSACTION;

	SELECT listid INTO v_ListId FROM MuWi.tlist WHERE listtitle = p_listName;
    INSERT INTO MuWi.tcontentaffiliation (ListID, ContentID) VALUES (v_ListId, p_contentId);

    COMMIT WORK;

END$$
CREATE PROCEDURE MuWi.`Insert_Update_Tag`(
    IN p_tagTitle VARCHAR(255),
    IN p_contentID int
)
BEGIN

    DECLARE v_tagId int;

    START TRANSACTION;

	IF EXISTS( SELECT * FROM MuWi.ttag WHERE Title = p_tagTitle) THEN
		BEGIN
			SELECT tagid INTO v_tagId FROM MuWi.ttag WHERE Title = p_tagTitle;
			INSERT INTO MuWi.tcontentclassification (ContentID, TagID) VALUES (p_contentID, v_tagId);
		END;
	ELSE
		BEGIN
			INSERT INTO MuWi.ttag (Title) VALUES (p_tagTitle);
            SELECT tagid INTO v_tagId FROM MuWi.ttag WHERE Title = p_tagTitle;
			INSERT INTO MuWi.tcontentclassification (ContentID, TagID) VALUES (p_contentID, v_tagId);
		END;
	END IF;

    COMMIT WORK;

END$$
DELIMITER ;
