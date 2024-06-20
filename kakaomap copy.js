LAT = 36.718902
LON = 126.799201

let container = document.getElementById('map');
let options = {
    center: new kakao.maps.LatLng(LAT, LON),
    level: 11
};
            
let ms = document.getElementById('month')
let selected_month = ms.options[ms.selectedIndex].value;

let map = new kakao.maps.Map(container, options);
let customOverlay = new kakao.maps.CustomOverlay({})

let polygons = [];
let areas = [];

init('shp/emd_simplified.json')
console.log(polygons)

function removePolygon() { 
    for (let i = 0; i < polygons.length; i++) {
        polygons[i].setMap(null);
    }
    areas = [];
    polygons = [];
}

function init(path) {
    
    //path 경로의 json 파일 파싱
    $.getJSON(path, function (geojson) {
        var units = geojson.features; // json key값이 "features"인 것의 value를 통으로 가져온다.
        $.each(units, function (index, unit) { // 1개 지역씩 꺼내서 사용. val은 그 1개 지역에 대한 정보를 담는다
            var coordinates = []; // 좌표 저장할 배열
            var name = ''; // 지역 이름
            var cd_location = ''; // 법정동코드
            var polygon_type = ''; // 일반 폴리곤인가 멀티 폴리곤인가
            coordinates = unit.geometry.coordinates; // 1개 지역의 영역을 구성하는 다각형의 모든 좌표 배열
            polygon_type = unit.geometry.type;
            name = unit.properties.EMD_KOR_NM; // 1개 지역의 이름
            cd_location = unit.properties.EMD_CD;

            var ob = new Object();
            ob.name = name;
            ob.path = [];
            ob.location = cd_location;
            ob.polygon_type = polygon_type;

            if (polygon_type == 'Polygon') {
                $.each(coordinates[0], function (index, coordinate) { 
                    ob.path.push(new kakao.maps.LatLng(coordinate[1], coordinate[0]));
                });
            } else {
                $.each(coordinates, function (index, pol){
                    var p = [];
                    $.each(pol[0], function (index, coordinate) { 
                        p.push(new kakao.maps.LatLng(coordinate[1], coordinate[0]));
                    });
                    ob.path.push(p)
                })
            }

            areas[index] = ob;
        });//each

        for (var i = 0, len = areas.length; i < len; i++) {
            displayArea(areas[i]);
        }
    });//getJSON
    console.log(areas);
    // 지도에 영역데이터를 폴리곤으로 표시
    for (var i = 0, len = areas.length; i < len; i++) {
        displayArea(areas[i]);
    }

    function displayArea(area) {
        if (area.polygon_type == 'Polygon'){
            var polygon = new kakao.maps.Polygon({
                map: map,
                path: area.path,
                strokeWeight: 2,
                strokeColor: '#004c80',
                strokeOpacity: 0.8,
                fillColor: '#fff',
                fillOpacity: 0.7
            });
            polygons.push(polygon);
            polygon.setMap(map);
            displayAreaName();
        } else {
            for (var j = 0, len = area.path.length; j < len; j++) {
                var polygon = new kakao.maps.Polygon({
                    map: map,
                    path: area.path[j],
                    strokeWeight: 2,
                    strokeColor: '#004c80',
                    strokeOpacity: 0.8,
                    fillColor: '#fff',
                    fillOpacity: 0.7
                });
                polygons.push(polygon);
                polygon.setMap(map);
                displayAreaName();
            }
        }

        function displayAreaName() {
            kakao.maps.event.addListener(polygon, 'mouseover', function (mouseEvent) {
                customOverlay.setContent('<div class="area">' + area.name + '</div>');
                customOverlay.setPosition(mouseEvent.latLng);
                customOverlay.setMap(map);
            });

            kakao.maps.event.addListener(polygon, 'mousemove', function (mouseEvent) {
                customOverlay.setPosition(mouseEvent.latLng);
            });
        }     
    }
}

// let coordRects = []
            
// DrawMap(selected_month)

// function type(d){
//     //d.month = String(d.month);
//     d.sw_lat = parseFloat(d.sw_lat);
//     d.sw_lon = parseFloat(d.sw_lon);
//     d.ne_lat = parseFloat(d.ne_lat);
//     d.ne_lon = parseFloat(d.ne_lon);
//     d.fire = parseFloat(d.fire);
//     return d;
// }

// function ChangeValue(){
//     var month_select = document.getElementById('month');
//     selected_month = month_select.options[month_select.selectedIndex].value;
//     console.log(selected_month);
//     DrawMap(selected_month);
// };

// function DrawMap(selected_month){
//     coordRects.forEach(function(rect){
//         rect.setMap(null)
//     });

//     coordRects = []

//     d3.csv("results/2023_prediction_web.csv", type, function(error, data){
//         if (error) throw error;
//         if (selected_month == "base"){
//             data.forEach(function(d){
//                 if (d.month == '7'){
//                     var coordRectangleBounds = new kakao.maps.LatLngBounds(
//                         new kakao.maps.LatLng(d.sw_lat, d.sw_lon),
//                         new kakao.maps.LatLng(d.ne_lat, d.ne_lon)
//                     );

//                     var coordRectangle = new kakao.maps.Rectangle({
//                         bounds: coordRectangleBounds, // 사각형 남서, 북동 정보
//                         strokeWeight: 1, // 선 두께
//                         strokeColor: '#2EFEC8', // 선 색깔
//                         strokeOpacity: 1, // 선 불투명도
//                         strokeStyle: 'shortdashdot', // 선 스타일
//                         fillColor: '#2EFEC8', // 채우기 색깔
//                         fillOpacity: 0.3 // 채우기 불투명도
//                     });

//                     coordRects.push(coordRectangle)
//                     coordRectangle.setMap(map);
//                 };
//             });
//         }

//         else {
//             data.forEach(function(d){
//                 if (d.month == selected_month){
//                     if (d.fire == 1.0){
//                         var coordRectangleBounds = new kakao.maps.LatLngBounds(
//                             new kakao.maps.LatLng(d.sw_lat, d.sw_lon),
//                             new kakao.maps.LatLng(d.ne_lat, d.ne_lon)
//                         );

//                         var coordRectangle = new kakao.maps.Rectangle({
//                             bounds: coordRectangleBounds, // 사각형 남서, 북동 정보
//                             strokeWeight: 1, // 선 두께
//                             strokeColor: '#FE2E2E', // 선 색깔
//                             strokeOpacity: 1, // 선 불투명도
//                             strokeStyle: 'shortdashdot', // 선 스타일
//                             fillColor: '#FE2E2E', // 채우기 색깔
//                             fillOpacity: 0.3 // 채우기 불투명도
//                         });

//                         coordRects.push(coordRectangle)
//                         coordRectangle.setMap(map);
//                     }
//                     else if (d.fire == 0.5){
//                         var coordRectangleBounds = new kakao.maps.LatLngBounds(
//                             new kakao.maps.LatLng(d.sw_lat, d.sw_lon),
//                             new kakao.maps.LatLng(d.ne_lat, d.ne_lon)
//                         );

//                         var coordRectangle = new kakao.maps.Rectangle({
//                             bounds: coordRectangleBounds, // 사각형 남서, 북동 정보
//                             strokeWeight: 1, // 선 두께
//                             strokeColor: '#FFFF00', // 선 색깔
//                             strokeOpacity: 1, // 선 불투명도
//                             strokeStyle: 'shortdashdot', // 선 스타일
//                             fillColor: '#FFFF00', // 채우기 색깔
//                             fillOpacity: 0.3 // 채우기 불투명도
//                         });

//                         coordRects.push(coordRectangle)
//                         coordRectangle.setMap(map);
//                     }
//                     else {
//                         var coordRectangleBounds = new kakao.maps.LatLngBounds(
//                             new kakao.maps.LatLng(d.sw_lat, d.sw_lon),
//                             new kakao.maps.LatLng(d.ne_lat, d.ne_lon)
//                         );

//                         var coordRectangle = new kakao.maps.Rectangle({
//                             bounds: coordRectangleBounds, // 사각형 남서, 북동 정보
//                             strokeWeight: 1, // 선 두께
//                             strokeColor: '#2EFEC8', // 선 색깔
//                             strokeOpacity: 1, // 선 불투명도
//                             strokeStyle: 'shortdashdot', // 선 스타일
//                             fillColor: '#2EFEC8', // 채우기 색깔
//                             fillOpacity: 0.3 // 채우기 불투명도
//                         });

//                         coordRects.push(coordRectangle)
//                         coordRectangle.setMap(map);
//                     };
//                 }
//             });
//         };
//     });
// };