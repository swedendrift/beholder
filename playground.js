var map; // Global declaration of the map
var iw = new google.maps.InfoWindow(); // Global declaration of the infowindow
var lat_longs = new Array();
var markers = new Array();
var drawingManager;

function initialize() {
  var myLatlng = new google.maps.LatLng(40.9403762, -74.1318096);
  var myOptions = {
      zoom: 13,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON]
      },
      polygonOptions: {
          editable: true
      }
  });
  drawingManager.setMap(map);

  google.maps.event.addListener(drawingManager, "overlaycomplete", function(event) {
      var newShape = event.overlay;
      newShape.type = event.type;
  });

  google.maps.event.addListener(drawingManager, "overlaycomplete", function(event) {
      overlayClickListener(event.overlay);
      var erick = document.getElementById('erick')
      erick.value = event.overlay.getPath().getArray()
      $('#vertices').val(event.overlay.getPath().getArray());
  });
}

function overlayClickListener(overlay) {
    google.maps.event.addListener(overlay, "mouseup", function(event) {
        $('#vertices').val(overlay.getPath().getArray());
    });
}
initialize();
