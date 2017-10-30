# knockout-map
A map app that displays cafes around my locality built using knockoutjs, Google Maps API and Foursquare API

## Working and Output
This app displays map of my locality with markers to locate cafes. List menu is provided with list of available shops which can be filters based on thier names using search bar. On clicking the marker on the map or list on the side menu , we can pop up a info window that displays information fetched from Foursquare API. KnockoutJs is used as organizational library to organise the code

## Requirements
- Google Maps API
- Foursquare API
- Jquery
- Bootstrap
- KnockoutJS

## Files and Folders
- css : Contains css files for styling HTML
- js : Contains app.js (main JS file for running the app), jquery and knockoutjs files
- index.html : The HTML file

## Installation and Usage
- Clone this repository
- Run the index.html file

## Debugging
- Error capture is done. If Maps Api cant be reached, it throws an alert. It is advised to check the internet connection or firewall settings
- On modifying code, if no error is thrown and maps does not display on the window. please check the css for the 'map' div in your index. Maps api requires a value for width and height of the div to load(eg: height: 100%, width:100%, may not load the map)
- If you load the code on to a server, APIs may not work. APIs has redirect_uri that points back to http://localhost/. It is advised to create your own client API credentials and provide your server details as redirect_uri

## References
- http://knockoutjs.com/documentation/introduction.html
- http://learn.knockoutjs.com
- https://developers.google.com/maps/documentation/javascript/tutorial
- http://api.jquery.com/jQuery.ajax/
- https://developers.google.com/maps/documentation/javascript/custom-markers
