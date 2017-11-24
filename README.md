Starry Analytics
============================
This tool uses Google Analytics API to access the logged in user's analytics data (if they do use Analytics on a website or an app) and display accurately and in an interesting way, on a world map. Built with P5js.

Analytics API: https://developers.google.com/analytics/devguides/config/mgmt/v3/quickstart/web-js
P5js: https://p5js.org/

TODO
- logout not working, checked all documentation on the matter. Must be missing something
- Implement mercator equations for good representation when zooming in https://gist.github.com/shiffman/a0d2fde31f571163c730ba0da4a01c82 (latlong to pixel representation goes well, but have not succeeded with mouse coordinates to latlong)
- improve mouse interaction (elements in front of canvas create trouble)
- pinch on phones.
- improve performance
- re-query data for more than 10000 results per day. risky
- Limit data to avoid penalties on site or google?
- add other metrics/dimensions/labels?
- organise code better, comment and remove redundant stuff
