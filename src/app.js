
$(document).ready( function() {
    new AppGEO();
});

var myPosition = L.Icon.extend({
    iconUrl: 'http://xn--b1agaay2a4ce.xn--p1ai/map/dist/images/marker-dot-red.png'
    //shadowUrl: 'my-icon-shadow.png',
    //iconSize: new L.Point(38, 95),
    //shadowSize: new L.Point(68, 95),
    //iconAnchor: new L.Point(22, 94),
    //popupAnchor: new L.Point(-3, -76)
})

var AppGEO = function() {
    
    var startPosition = new L.LatLng(45.43397, 12.3391),
        positionMarker = new L.Marker(startPosition, {icon: new myPosition()}),
        circle = new L.Circle(startPosition, 50),
        polyline = new L.Polyline(startPosition, {color: 'red'}),
        map = new L.Map('map'),
        cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
        cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18}),
        markers = {},
        watchId = null;
    
    var obj = {
        
        /**
         * 
         */
        init: function() {
            var me = this;
            
            map.addLayer(cloudmade);
            
            if (Modernizr.geolocation) {
                
                //
                map.on('locationfound', function(position) {
                    var radius = Math.round(position.accuracy / 2);
                    
                    positionMarker.setLatLng(position.latlng);
                    
                    map.addLayer(positionMarker);
                    positionMarker.bindPopup("You are within " + radius + " meters from this point").openPopup();
                    
                    circle = new L.Circle(position.latlng, radius);
                    map.addLayer(circle);
                    
                    map.addLayer(polyline);
                    
                    map.on('moveend', function(e) {
                        me.showPOIonMap();
                    });
                });
                
                map.on('locationerror', function(error) {
                    switch (error.code) {
                        case error.TIMEOUT:
                            console.log('Timeout');
                    		break;
                    	case error.POSITION_UNAVAILABLE:
                    		console.log('Position unavailable');
                    		break;
                    	case error.PERMISSION_DENIED:
                    		console.log('Permission denied');
                    		break;
                    	case error.UNKNOWN_ERROR:
                    		console.log('Unknown error');
                    		break;
                    }
                });
                
                map.locateAndSetView();
                
                if (navigator.geolocation) {
                    
                    navigator.geolocation.getCurrentPosition( function( position ) {
                        
                        startPosition = new L.LatLng(position.coords.latitude, position.coords.longitude);
                        map.setView(startPosition, 16).addLayer(cloudmade);
                        
                        me.showPOIonMap();
                        map.on('moveend', function(e) {
                            me.showPOIonMap();
                        });
                        
                    });
                    
                    watchId = navigator.geolocation.watchPosition( function( position ) {
                        var latlng = new L.LatLng(position.coords.latitude, position.coords.longitude);
                        positionMarker.setLatLng(latlng);
                        positionMarker.bindPopup("You are within " + Math.round(position.coords.accuracy / 2) + " meters from this point").openPopup();
                        circle.setLatLng(latlng);
                        //polyline.addLatLng(latlng);
                        map.panTo(latlng);
                    });
                    
                } else {
                    console.log('no geolocation');
                }
                
            } else {
                console.log("no geolocation");
            }
            
            return this;
            
        },
    
        /**
         * 
         */
        showPOIonMap: function() {
            
            var me = this;
            var ne = map.getBounds().getNorthEast();
            var sw = map.getBounds().getSouthWest();
    
            $.ajax({
                url: 'http://ws.geonames.org/wikipediaBoundingBoxJSON',
                data: {
                    north: ne.lat,
                    east: ne.lng,
                    south: sw.lat,
                    west: sw.lng
                },
                success: function( data ) {
                    if (typeof data !== "undefined" && me.typeOf(data.geonames) === "array") {
                        $.each(data.geonames, function(i, item) {
                            
                            if (typeof markers[item.rank] === "undefined") {
                                
                                markers[item.rank] = item;
                            
                                var marker = new L.Marker(new L.LatLng(item.lat, item.lng));
                                marker.bindPopup('<b>'+item.title+'</b><br/>'+item.summary);
                                map.addLayer(marker);
                                /*
                                console.log(item);
                                $("<li>")
                                    .text(item.title)
                                    .appendTo("#result");
                                */
                            }
                        });
                    }
                }  
            });
            
        },
    
        /*
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        
        map.locateAndSetView();
        
        function onLocationError(e) {
            alert(e.message);
        }
        
        function onLocationFound( e ) {
        	var radius = Math.round(e.accuracy / 2);
            map.setZoom(14);
            
            positionMarker.setLatLng(e.latlng);
            map.addLayer(positionMarker);
        	positionMarker.bindPopup("You are within " + radius + " meters from this point").openPopup();
            
        	map.addLayer(circle);
            
            map.addLayer(polyline);
        }
        
        if (navigator.geolocation) {  
            navigator.geolocation.getCurrentPosition( function( position ) {
                
                startPosition = new L.LatLng(position.coords.latitude, position.coords.longitude);
                map.setView(startPosition, 14).addLayer(cloudmade);
                
                showPOIonMap();
                map.on('moveend', function(e) {
                    showPOIonMap();
                });
                
            });
        } else {
            console.log('no geolocation');
        }
        */
    
        typeOf: function(value) {
            var s = typeof value;
            if (s === 'object') {
                if (value) {
                    if (value instanceof Array) {
                        s = 'array';
                    }
                } else {
                    s = 'null';
                }
            }
            return s;
        }
        
    };
        
    return obj.init();

};
