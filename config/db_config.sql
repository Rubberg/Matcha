CREATE TABLE IF NOT EXISTS userdatas (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	login VARCHAR(20) NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
	email VARCHAR(50) NOT NULL,
	password VARCHAR(256) NOT NULL,
	token VARCHAR(256) NOT NULL,
    online VARCHAR(10) NOT NULL,
    sex VARCHAR(10) NOT NULL,
    birthdate VARCHAR(10) NOT NULL,
    age INT NOT NULL,
    orientation VARCHAR(10) NOT NULL,
    bio VARCHAR(256) NOT NULL,
    primpicpath VARCHAR(256) NOT NULL,
    loc TEXT NOT NULL,
    city VARCHAR( 50 ) NOT NULL,
    popularity INT NOT NULL,
    lastco VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    login VARCHAR(20) NOT NULL,
    picpath VARCHAR(256) NOT NULL,
    primpic VARCHAR(1) NOT NULL
);

CREATE TABLE IF NOT EXISTS likes (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    login VARCHAR(20) NOT NULL,
    liked VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS hobbies (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    hobbie VARCHAR(50) NOT NULL,
    login VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS visits (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    visitor VARCHAR(50) NOT NULL,
    visited VARCHAR(20) NOT NULL,
    date BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    room VARCHAR(50) NOT NULL,
    user1 VARCHAR(20) NOT NULL,
    user2 VARCHAR(20) NOT NULL,
    content TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifs (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user1 VARCHAR(20) NOT NULL,
    user2 VARCHAR(20) NOT NULL,
    content VARCHAR(255) NOT NULL,
    unread VARCHAR(1) NOT NULL
);

CREATE TABLE IF NOT EXISTS blocks (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    blocker VARCHAR(20) NOT NULL,
    blocked VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    reported VARCHAR(20) NOT NULL,
    reporter VARCHAR(20) NOT NULL
);

-- Default location at 42:
{"as":"AS12876 Online S.a.s.","city":"Paris","country":"France","countryCode":"FR","isp":"Free SAS","lat":48.8835,"lon":2.3219,"org":"ONLINE SAS","query":"62.210.32.125","region":"IDF","regionName":"Île-de-France","status":"success","timezone":"Europe/Paris","zip":"75017"}