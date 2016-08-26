# futsal
Allows administrative tasks to keep track of upcoming fixtures and scores for Futsal league tables.

Built using
* MongoDB
* Node.js / Express.js
* JQuery
* React.js
* Bootstrap 3

Provides an editable table of fixtures as a React component
* Any games that have been played in the past (assuming a game length of 90 minutes) will have a score line and be styled as a result as opposed to a fixture.
* Games that are yet to be finished are styled as upcoming fixtures and show 'vs.' instead of a scoreline.
* The games are grouped by day in the table
* They are listed with the most recent games at the bottom
* Allows the ability to add new fixtures using the bootstrap datetime plugin for setting the kick off time.
* once a game has been played (based on the current time) you can edit the score of each game.

A league table which is calculated based on the games that have been played
* Games played, goals for/against, points, games won/lost/drawn
* A stats button for each team will show a chart visualising the performance in the last n games. Showing goals for and against.
