# ShutAppsWeb

**English version below!**

Diese mobile web-basierte Anwendung ist entstanden im Rahmen meiner Bachelorarbeit. Die Idee dieser Bachelorarbeit wurde aus den vorhandenen Problemen, die nach Abschluss des [Praxisprojekts](https://github.com/ducle07/shutapps) noch nicht gelöst werden konnten, abgeleitet. Das Thema meiner Bachelorarbeit lautet "Konzeption und Implementierung einer mobilen web-basierten App zur Einschränkung der Smartphonenutzung bei Gruppenaktivitäten."

Das Ziel meiner Bachelorarbeit ist es, die technischen Möglichkeiten einer mobilen web-basierten Anwendung zu untersuchen im Hinblick auf die Einschränkung der Smartphone-Nutzung bei Gruppenaktivitäten. 
* Was ist mit einer web-basierten Anwendung technisch möglich im Vergleich zu nativen Anwendungen?
* Welche Web-Technologien sind zur Problemlösung geeignet?

Quellcode: [Client-Hauptseite](https://github.com/ducle07/shutappsweb/blob/master/index.html), [Client-Nebenseiten](https://github.com/ducle07/shutappsweb/tree/master/public/html) & [Server](https://github.com/ducle07/shutappsweb/blob/master/app.js)

Weitere Informationen in der [Bachelorarbeit](https://github.com/ducle07/shutappsweb/blob/master/Bachelorarbeit_DucGiangLe.pdf)

## Architektur & verwendete Technologien
![Architekturdiagramm](https://github.com/ducle07/shutappsweb/blob/master/Architektur.png)
* Client-Server Architektur nach dem Architekturstil **REST**
* Client als mobiler Browser
  * **HTML**, **CSS**, **JavaScript (jQuery)**
  * **noSleep.js** als Library zum Aktivieren eines Wakelocks auf Smartphones
  * **QRious** als Library zum Generieren von QR-Codes
  * **PageVisibility API** zur Erkennung, ob Anwendung im Fokus des Browsers liegt
  * **BootStrap** zur Realisierung des User Interfaces
* Server mit **node.js** realisiert
  * **Express**-Modul zur Realisierung eines Webservers
  * Datenbankanbindung zu **MongoDB** mit dem **mongoose**-Modul
* **socket.io** zur Realisierung der Echtzeit-Kommunikation
* Datenübertragung im Datenformat **JSON** über **HTTP** und **WebSockets (TCP)**
* **Firebase Authentication** für Authentifizierungszwecke
* Einbindung des sozialen Netzwerks Facebook mit der **Facebook Graph API**

----------------
----------------

# English version

This mobile web-based application was developed as part of my bachelor thesis. The idea of this thesis was derived from the existing problems which could not be solved after completion of the [practical project](https://github.com/ducle07/shutapps). The title of my bachelor thesis is "conception and implementation of a mobile web-based application for limiting smartphone usage in group activities".

The aim of my thesis is to test the technical possibilities of a mobile web-based application in regard to the limiting of smartphone usage in group activities.
* What is technically possible with a web-based application compared to native applications?
* Which web technologies are suitable to solve the problems?

Source Code: [client-mainsite](https://github.com/ducle07/shutappsweb/blob/master/index.html), [client-other sites](https://github.com/ducle07/shutappsweb/tree/master/public/html) & [server](https://github.com/ducle07/shutappsweb/blob/master/app.js)

## Architecture and use technologies
![architecture](https://github.com/ducle07/shutappsweb/blob/master/Architektur.png)

* Client-server architecture based on the architectural style **REST**
* Client as a mobile browser
  * **HTML**, **CSS**, **JavaScript (jQuery)**
  * **noSleep.js** as a library to enable wakelocks on smartphones
  * **QRious** as a library for generating QR codes
  * **PageVisibility API** to detect if the application is in the focus of the browser
  * **BootStrap** to implement the user interface
* Server implemented with **node.js**
  * **Express** module for the implementation of the web server
  * Database connection to **MongoDB** with the **mongoose** module
* **Firebase Authentication** for authentication purposes
* Integration of the social network Facebook with the **Facebook Graph API**
