/* Author:*/

$(function($) {
	var socket = io.connect('http://localhost:3000/');
	var latlng = new google.maps.LatLng( 28.88316,-38.012695 );
	var options = {
		zoom: 2,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		scaleControl : false,
		navigationControl : false,
		streetViewControl : false
	};
	map = new google.maps.Map(document.getElementById("map_container"), options);
	var markers = [];
	var initializeMap = true;
	var searching = false;
	var currentSelected = null

	/**************************************************************************
	** UI STUFFS
	**************************************************************************/
	function cleanMap(){
		if (markers) {
			for (i in markers) {
				markers[i].setMap(null);
			}
			markers.length = 0;
		}
	}
	function centerMap (job) {
		var location = job.tweet.place.full_name +', '+ job.tweet.place.country;
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': location}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				map.setCenter( results[0].geometry.location );
				map.setZoom( 15 );
			}
	    });
	}

	function create_tweets(jobs) {
		if( !jobs.tweets.length ){
			$('#status').addClass('error').html('Sorry, No results.').fadeIn('slow');
			$('#keyword').trigger('blur');
			searching = false;
			return;
		}
		var latlng = new Array();
		$('.jobs').html('');
		cleanMap();
		if (!initializeMap) {
			centerMap(jobs.tweets[0]);
			$('#status').addClass('success').html('Showing results - click here to show all.').fadeIn('slow');
		}
		$.each( jobs.tweets, function(index, job){
			$('.jobs').prepend(draw_tweet( job.tweet ));
			$('#'+job.tweet.id).fadeIn('slow');
			$('#'+job.tweet.id).click(addTweetListener);

			var lat, lon, location;
			location = job.tweet.place.full_name +', '+ job.tweet.place.country;
			if( job.tweet.geo != null ){
				var point = new google.maps.LatLng( job.tweet.geo.coordinates[0], job.tweet.geo.coordinates[1] );
			}else
			{
				var location = job.tweet.place.full_name +', '+ job.tweet.place.country;
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode( { 'address': location}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						var marker = new google.maps.Marker({
				            map: map,
				            position: results[0].geometry.location
				        });
				        markers.push( marker );
					}
			    });
			}
			latlng.push( {point:point, id:job.tweet.id} );
		});
		init_map(latlng)
	}
	function draw_tweet(tweet)
	{
		var lat, lon, location;
		location = tweet.place.full_name +', '+ tweet.place.country;
		if( tweet.geo != null ){
			lat = tweet.geo.coordinates[0];
			lon = tweet.geo.coordinates[1];
		}
		var out =  '<div class="tweet back hide" id="'+tweet.id+'" data-lat="'+lat+'" data-lon="'+lon+'" data-location="'+location+'">';
		out += '	<div class="inner">';
		out += '		<img src="'+tweet.user.profile_image_url+'">';
		out += '		<p class="title">'+tweet.user.screen_name+'</p>';
		out += '		<p>'+ findLinks( tweet.text )	+'</p>';
		out += '		<div class="clear"></div>';
		out += '	</div>';
		out += '	<div class="metadata right">';
		out += '		<p class="date">From '+tweet.place.full_name+', '+ tweet.place.country +' <a href="'+create_tweet_url( tweet )+'">'+H( tweet.created_at )+'</a></p>';
		out += '	</div>';
		out += '	<div class="clear"></div>';
		out += '</div>';
		return out;
	}
	function create_tweet_url(tweet){
		return "http://twitter.com/#!/"+tweet.user.screen_name+"/status/"+tweet.id
	}
	function addTweetListener (e) {
		if (currentSelected != null){
			if (currentSelected.attr('id') == $(this).attr('id')) { return};
			currentSelected.removeClass('selected');
		};
		$(this).addClass('selected');
		currentSelected = $(this);
		if ( $(this).attr('data-lat') != 'undefined' ){
			var latlng = new google.maps.LatLng( $(this).attr('data-lat'), $(this).attr('data-lon') );
			map.panTo(latlng);
			map.setZoom(15);
		}else{
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode( { 'address': $(this).attr('data-location')}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					map.panTo(results[0].geometry.location);
					map.setZoom(15);
				}
		    });
		}
		$('html,body').animate({scrollTop: $(this).offset().top - 65},'slow');

	}
	/**************************************************************************
	** MAP
	**************************************************************************/
	function init_map(lats){
		$.each( lats, function(index, point){
			var marker = new google.maps.Marker({
		        position: point.point,
		        map: map,
		        tweet_id:point.id
		    });
		    markers.push( marker );
		    google.maps.event.addListener(marker, 'click', function(){
		    	$('#'+marker.tweet_id).trigger('click')
		    	$('html,body').animate({scrollTop: $("#"+marker.tweet_id).offset().top - 65},'slow');
		    });
		});
	}
	/**************************************************************************
	** UI CALLBACKS
	**************************************************************************/
	$('#search').submit(function(event) {
		event.preventDefault();
		searching = true;
		key = $.trim( $('#keyword').val() );
		if( ! key.length ){
			$('#status').addClass('error').html('Please write something.').fadeIn('slow');
			$('#keyword').trigger('blur');
			searching = false;
			return;
		}
		$('#keyword').trigger('blur');
		initializeMap = false;
		socket.emit('search', {keyword:key})
	});
	$('#keyword').focus(function(event){
		if( !searching ){
			$('#status').hide('slow').removeClass('error').html('');
		}
	});

	$('#status').click(function(event) {
		$('#status').hide().removeClass('success').removeClass('error').html('');
		searching = false;
		initializeMap = true;
		socket.emit('star_over');
		$('#keyword').val('')
		map.setZoom(2)
	});
	/**************************************************************************
	** SOCKET
	**************************************************************************/
	socket.on('tweet', function(job){
		if( searching ){return};
	    $('.jobs').prepend(draw_tweet( job.tweet ));
	    $('#'+job.tweet.id).fadeIn('slow');

	    var lat, lon, location, point;
		location = job.tweet.place.full_name +', '+ job.tweet.place.country;
		if( job.tweet.geo != null ){
			point = new google.maps.LatLng( job.tweet.geo.coordinates[0], job.tweet.geo.coordinates[1] );
		}else
		{
			var location = job.tweet.place.full_name +', '+ job.tweet.place.country;
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode( { 'address': location}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					point = results[0].geometry.location
				}
		    });
		}
		var marker = new google.maps.Marker({
            map: map,
            position: point,
            tweet_id:job.tweet.id
        });
        google.maps.event.addListener(marker, 'click', function(){
	    	$('#'+marker.tweet_id).trigger('click')
	    	$('html,body').animate({scrollTop: $("#"+marker.tweet_id).offset().top - 50},'slow');
	    });
        markers.push( marker );
	});
	socket.on('lasts', create_tweets);
	socket.on('results', create_tweets);

	/**************************************************************************
	** HELPERS from http://widgets.twimg.com/j/1/widget.js
	**************************************************************************/
	function findLinks(text) {
	    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	    return text.replace(exp,"<a href='$1'>$1</a>"); 
	}
	var K = function () {
	    var a = navigator.userAgent;
	    return {
	        ie: a.match(/MSIE\s([^;]*)/)
	    }
	}();

	var H = function (a)
	{
	    var b = new Date();
	    var c = new Date(a);
	    if (K.ie) {c = Date.parse(a.replace(/( \+)/, ' UTC$1'))}
	    var d = b - c;
	    var e = 1000,
	        minute = e * 60,
	        hour = minute * 60,
	        day = hour * 24,
	        week = day * 7;

	    if (isNaN(d) || d < 0) {return ""}
	    if (d < e * 7) {return "right now"}
	    if (d < minute) {return Math.floor(d / e) + " seconds ago"}
	    if (d < minute * 2) {return "about 1 minute ago"}
	    if (d < hour) {return Math.floor(d / minute) + " minutes ago"}
	    if (d < hour * 2) {return "about 1 hour ago"}
	    if (d < day) {return Math.floor(d / hour) + " hours ago"}
	    if (d > day && d < day * 2) {return "yesterday"}
	    if (d < day * 365) {return Math.floor(d / day) + " days ago"}else{return "over a year ago"}
	};
});



























