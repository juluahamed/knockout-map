'use strict';

//Google maps variables
var map;

// Following Google documentation for custom markers 
//at https://developers.google.com/maps/documentation/javascript/custom-markers
var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
var icons = {
      restaurant: {
        icon: iconBase + 'dining.png'
      },
      cafe: {
        icon: iconBase + 'snack_bar.png'
      },
      bar: {
        icon: iconBase + 'bars.png'
      }
    };

//Foursquare API Client details
var CLIENT_ID = 'LJSK504HP3KPR3HKSWIRRMEWLANBPD4NHBIXIMU0ZLT4O2OM';
var CLIENT_SECRET = 'I5PTRMC2XW1QHLKWQWHICYC3WSQDGN0DEPCWU0GTXUTW2EMT';



// Location Data
var mapLocations = [
    {name: "Barbeque Nation", lat: 12.9255205, lng: 77.6371247, type: "restaurant"},
    {name: "Cafe Thulp", lat: 12.9293593, lng: 77.6348503, type: "cafe"},
    {name: "Prost", lat: 12.933118, lng: 77.6307065, type: "bar"},
    {name: "Costa Coffee", lat: 12.9324108, lng: 77.6314598, type:"cafe"},
    {name: "Boca Grande", lat: 12.9416834, lng: 77.6190977, type: "cafe"}
];

// Location Spot Object
function Location(l_data) {
	var self = this;

	self.name = l_data.name;
	self.lat = l_data.lat;
	self.lng = l_data.lng;
	self.type = l_data.type;
	self.id = '';
	self.website = 'N/A';
	self.checkin = 'N/A';
	self.picture = '';
	self.address = 'N/A';

	self.active = ko.observable(true);


	self.marker = new google.maps.Marker({
                            position: {lat: self.lat, lng: self.lng},
                            map: map,
                            icon: icons[self.type].icon,
                            title: self.name      
                        });

	self.show = ko.computed(function(){
		if (self.active() == true) {
			self.marker.setMap(map);
		}
		else {
			self.marker.setMap(null);
		}
	});

	self.infoWindow = new google.maps.InfoWindow({
                content: self.name
            });

	self.marker.addListener('click', function(){
		// Make Marker animate on bounce for 1 cycle
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function () {
		    self.marker.setAnimation(null);
		}, 700);
		self.infoWindow.open(map, self.marker);
	});

	self.loadInfoWindow = function(loc){
		google.maps.event.trigger(self.marker, 'click');
	}

	self.infoWindowContentCreator = function() {
		var content_string = "<p class='text-center'><strong>"+self.name+
							"</strong></p><p>Website : <a href="+ self.website +">"+
							 self.website+ "</a></p><p>Address : "+ self.address + 
							 "</p><p>Total Checkin :"+ self.checkin+"</p>"+
							 "<img class='displayImage' src="+self.picture+">" + 
							 "<p class='small'> Info provided by <a href='https://foursquare.com'>Foursquare API</a></p>";
		self.infoWindow.setContent(content_string);
			
	}

	//Foursquare API : Search for location and get photos

	var fs_search_url = "https://api.foursquare.com/v2/venues/search?ll=" + self.lat + "," +
						 self.lng + "&client_id=" + CLIENT_ID + '&client_secret=' + CLIENT_SECRET+
						  "&v=20171029"+ "&query=" +this.name;
	
	//Fire Ajax to get location info and ID
	function ajaxSearch() {
	    return $.ajax({
	        dataType: "json",
			url: fs_search_url});
	};
	ajaxSearch().done(function(result) {
		var data = result.response.venues[0];
	    self.id = data.id;
		self.website = data.url;
		self.checkin = data.stats['checkinsCount'];
		self.address = data.location['address'];
		
		var fs_search_photos = "https://api.foursquare.com/v2/venues/" + self.id +
								"/photos?client_id=" + CLIENT_ID + '&client_secret=' 
								+ CLIENT_SECRET+ "&v=20171029";
		
		// From above recieved ID, retrieve pictures of the location
		function ajaxPhoto() {
		    return $.ajax({
		        dataType: "json",
				url: fs_search_photos});
		};
		ajaxPhoto().done(function(p_result){
			self.picture = p_result.response.photos.items[0].prefix + "220x200"+
							p_result.response.photos.items[0].suffix;
			self.infoWindowContentCreator();
		}).fail(function(){
			self.picture = "><p>Could Not fetch pictures from Foursquare. Try Again</p";
			self.infoWindowContentCreator();
		});
	}).fail(function() {
		self.address = 'Unable to reach Foursquare. Try again later';
	    self.website = '# Unable to reach Foursquare. Try again later';
	    self.checkin = 'Unable to reach Foursquare. Try again later';
	    self.infoWindowContentCreator();
	});


};


// View Model function
function ListViewModel() {
	var self = this;
	var bounds = new google.maps.LatLngBounds();

	// Side Menu binding
	self.sideMenu = ko.observable(true);
	self.sideMenuToggle = function(){
		if (self.sideMenu() == false) {
	    	self.sideMenu(true);
	    }
    	else {
		 	self.sideMenu(false);
    	}
	};


	self.displayLocations = ko.observableArray([]);
	self.query = ko.observable('');
	self.matchedLocations=ko.computed(function(){
		var holderArray = ko.observableArray([]);
		ko.utils.arrayFilter(self.displayLocations(), function(item) {
			if (item.active() == true) {
				holderArray.push(item);
			}
		});
		return holderArray();
	});

	//Create Map
	map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 12.9293593, lng: 77.6348503},
			zoom: 14
		});


	
	//Store locations in observable array
	for (var location in mapLocations ) {
			bounds.extend({lat: mapLocations[location].lat, lng: mapLocations[location].lng});
			self.displayLocations.push(new Location(mapLocations[location]));
	};


	//Function to set active property to true or false
	self.renderAllLocations = function(status){
		ko.utils.arrayFilter(self.displayLocations(), function(item) {
			item.active(status);
		});
	};


	// Search Logic : after each key press, take the input string, and use indexOf function
	// to see if if input text so far is present in any of the location names. If yes, set 'active' property 
	// as true
	self.search = function(value) {
		self.renderAllLocations(false);
		if (value == '') {
			self.renderAllLocations(true);
			return;
		}
		ko.utils.arrayFilter(self.displayLocations(), function(item) {
				if (item.name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
					item.active(true);
				}
				else {
					item.active(false);
				}
				
		});
	};
	map.fitBounds(bounds);
	self.query.subscribe(self.search);
	self.renderAllLocations(true);
};

function init() {
		ko.applyBindings(new ListViewModel());
}

function gMapsError(){
	alert('Unable to load the Map. Please try again or check your internet connection');
}