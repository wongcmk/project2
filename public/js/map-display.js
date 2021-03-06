/* This code borrows from http://jsfiddle.net/salman/4mtyu/ */

/*
 * declare map as a global variable
 */
let map;
let center = [-25.808678, 134.918921];
/*
 * declare array for storing marker objects
 */
const markerArray = [];
/*
 * object for storing search conditions
 */
const conditions = {};

/*
 * use google maps api built-in mechanism to attach dom events
 */
google.maps.event.addDomListener(window, "load", () => {
  /*
   * create map
   */
  // This Lat and Long is close to the centre of Australia
  // center = new google.maps.LatLng(-25.808678, 134.918921);
  center = new google.maps.LatLng(-34.9285, 138.6007);
  map = new google.maps.Map(document.getElementById("map_div"), {
    center: center,
    // ,
    // zoom 4 is most of australia, 6 is about 1 state, 10 is a full city, 14 is a suburb.
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  /*
   * create infowindow (which will be used by markers)
   */
  const infoWindow = new google.maps.InfoWindow();

  /*
   * marker creater function
   */
  function createSchoolMarker(school) {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(school.latitude, school.longitude),
      map: map
      // the icon option can be used for a custom marker
      // icon: "http://1.bp.blogspot.com/_GZzKwf6g1o8/S6xwK6CSghI/AAAAAAAAA98/_iA3r4Ehclk/s1600/marker-green.png"
    });
    const html = `
    <h6>${school.schoolName}</h6>
    <p>${school.schoolSector}, ${school.schoolType}</p>
    <button class='schoolButton' data-id='${school.id}'>Add</button>`;
    google.maps.event.addListener(marker, "click", function() {
      infoWindow.setContent(html);
      infoWindow.open(map, this);
      map.setCenter(this.position);
    });
    return marker;
  }

  /*
   * Clear all markers from the map
   */
  function clearAllMarkers() {
    markerArray.forEach(marker => marker.setMap(null));
    markerArray.length = 0;
  }

  /*
   * add markers to map
   */
  function getMarkers(conditions) {
    $.post("/api/schools/", conditions).then(schools => {
      clearAllMarkers();
      schools.forEach(school => markerArray.push(createSchoolMarker(school)));
      if (markerArray.length) {
        map.setCenter(markerArray[0].position);
      } else {
        // make an error message display
      }
    });
  }

  $("#search-button").on("click", event => {
    event.preventDefault();
    const searchTerm = $("#search-text")
      .val()
      .trim();
    const schoolType = $("#school-type").val();
    if (schoolType === "School Type") {
      delete conditions.schoolType;
    } else {
      conditions.schoolType = schoolType;
    }
    if (isNaN(parseInt(searchTerm))) {
      delete conditions.postcode;
      conditions.schoolName = searchTerm;
    } else if (searchTerm.length === 4) {
      delete conditions.schoolName;
      conditions.postcode = searchTerm;
      getMarkers(conditions);
    } else {
      // error message for missing search term
    }
  });

  if (window.location.search.match(/postcode/g)) {
    conditions.postcode = window.location.search.match(/\d{4}/g)[0];
  }
  if (window.location.search.match(/schoolType/g)) {
    conditions.schoolType = window.location.search
      .match(/schoolType=[A-Za-z]+/g)[0]
      .split("=")[1];
  }
  console.log(conditions);
  getMarkers(conditions);
});
