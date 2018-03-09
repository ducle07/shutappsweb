# ShutAppsWeb
Diese mobile web-basierte Anwendung ist entstanden im Rahmen meiner Bachelorarbeit. Die Idee dieser Bachelorarbeit wurde aus den vorhandenen Problemen, die nach Abschluss des [Praxisprojekts](https://github.com/ducle07/shutapps) noch nicht gelöst werden konnten, abgeleitet. Das Thema meiner Bachelorarbeit lautet "Konzeption und Implementierung einer mobilen web-basierten App zur Einschränkung der Smartphonenutzung bei Gruppenaktivitäten."

Das Ziel meiner Bachelorarbeit ist es, die technische Machbarkeit einer mobilen web-basierten Anwendung zu untersuchen im Hinblick auf die Einschränkung der Smartphone-Nutzung bei Gruppenaktivitäten. 
* Was ist mit einer web-basierten Anwendung technisch möglich im Vergleich zu nativen Anwendungen?
* Welche Web-Technologien sind zur Problemlösung geeignet?

Quellcode: [Client-Hauptseite](https://github.com/ducle07/shutappsweb/blob/master/index.html), [Client-Nebenseiten](https://github.com/ducle07/shutappsweb/tree/master/public/html) & [Server](https://github.com/ducle07/shutappsweb/blob/master/app.js)

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
