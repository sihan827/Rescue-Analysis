LAT = 36.549573238761305
LON = 126.82379877732677

let code = {
    cc: '충청남도', gr: '계룡시', gj: '공주시', gs: '금산군', ns: '논산시', 
    dj: '당진시', br: '보령시', by: '부여군', ss: '서산시', sc: '서천군', 
    as: '아산시', ys: '예산군', caes: '천안시 동남구', cawn: '천안시 서북구', 
    cy: '청양군', ta: '태안군', hs: '홍성군'
};

let container = document.getElementById('map');
let options = {
    center: new kakao.maps.LatLng(LAT, LON),
    level: 11
};
            
let area_init = document.getElementById('area');
let dam_init = document.getElementById('damcheck');
let death_init = document.getElementById('deathcheck');
let area_info = document.getElementById('area_info');

let selected_area_init = area_init.options[area_init.selectedIndex].value;
let dam_check_init = dam_init.checked;
let death_check_init = death_init.checked;

let map = new kakao.maps.Map(container, options);
let customOverlay = new kakao.maps.CustomOverlay({})

let polygons = [];
let areas = [];

init('web_data/emd_pp.json', selected_area_init, dam_check_init, death_check_init)

function ChangeValue(){
    removePolygon();
    var area_list = document.getElementById('area');
    var dam = document.getElementById('damcheck');
    var death = document.getElementById('deathcheck');
    selected_area = area_list.options[area_list.selectedIndex].value;
    dam_check = dam.checked;
    death_check = death.checked;
    init('web_data/emd_pp.json', selected_area, dam_check, death_check);
};

function removePolygon() { 
    for (let i = 0; i < polygons.length; i++) {
        polygons[i].setMap(null);
    }    
        
    areas = [];
    polygons = [];
}

function init(path, area_name, is_dam, is_death) {
    //path 경로의 json 파일 파싱
    $.getJSON(path, function (geojson) {
        var units = geojson.features; // json key값이 "features"인 것의 value를 통으로 가져온다.
        $.each(units, function (index, unit) { // 1개 지역씩 꺼내서 사용. val은 그 1개 지역에 대한 정보를 담는다
            var coordinates = []; // 좌표 저장할 배열
            var name = ''; // 지역 이름
            var cd_location = ''; // 법정동코드
            var prob = 0.0; // 출동발생확률
            var dam_cnt = 0; // 댐 개방 여부
            var death_cnt = 0; // 사망자 여부
            var polygon_type = ''; // 일반 폴리곤인가 멀티 폴리곤인가
            var death_reason = '';
            coordinates = unit.geometry.coordinates; // 1개 지역의 영역을 구성하는 다각형의 모든 좌표 배열
            polygon_type = unit.geometry.type;
            name = unit.properties.EMD_KOR_NM; // 1개 지역의 이름
            cd_location = unit.properties.EMD_CD;
            prob = unit.properties.RESCUE_PROB;
            dam_cnt = unit.properties.DAM;
            death_cnt = unit.properties.DEATH;
            death_reason = unit.properties.DEATH_REASON;

            var ob = new Object();
            ob.name = name;
            ob.path = [];
            ob.location = cd_location;
            ob.polygon_type = polygon_type;
            ob.prob = prob;
            ob.dam_cnt = dam_cnt;
            ob.death_cnt = death_cnt;
            ob.death_reason = death_reason;

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
                    ob.path.push(p);
                })
            }

            areas[index] = ob;
        });//each

        for (var i = 0, len = areas.length; i < len; i++) {
            displayArea(areas[i]);
        }
    });//getJSON

    function displayArea(area) {
        var stroke_color = '';
        var stroke_weight = 0;
        var fill_color = '';
        var opacity = 0.0;

        // 테두리 색 결정
        if (code[area_name].includes('충청남도')){
            stroke_color = '#004c80';
            stroke_weight = 2;
        } else {
            if (area.name.includes(code[area_name])){
                stroke_color = '#ed1515';
                stroke_weight = 3.5;
            } else {
                stroke_color = '#004c80';
                stroke_weight = 2;
            }
        }

        // 면 색 결정
        if (is_dam && is_death) {
            if (area.dam_cnt > 0 && area.death_cnt > 0) {
                fill_color = '#ba13ed'; // 보라색
                opacity = 0.7;
            } else if (area.dam_cnt > 0 && area.death_cnt == 0) {
                fill_color = '#156bed'; // 파란색
                opacity = 0.7;
            } else if (area.dam_cnt == 0 && area.death_cnt > 0) {
                fill_color = '#f36a6a'; // 주황색
                opacity = 0.7;
            } else {
                fill_color = '#0fa345'; // 초록색
                opacity = area.prob;
            }
        } else if (is_dam && !is_death) {
            if (area.dam_cnt > 0) {
                fill_color = '#156bed'; // 파란색
                opacity = 0.7;
            } else {
                fill_color = '#0fa345'; // 초록색
                opacity = area.prob;
            }
        } else if (!is_dam && is_death) {
            if (area.death_cnt > 0) {
                fill_color = '#f36a6a'; // 주황색
                opacity = 0.7;
            } else {
                fill_color = '#0fa345'; // 초록색
                opacity = area.prob;
            }      
        } else {
            fill_color = '#0fa345'; // 초록색
            opacity = area.prob;
        }
        
        opacity = 0.95 * opacity + 0.001

        if (area.polygon_type == 'Polygon'){
            var polygon = new kakao.maps.Polygon({
                map: map,
                path: area.path,
                strokeWeight: stroke_weight,
                strokeColor: stroke_color,
                strokeOpacity: 0.8,
                fillColor: fill_color,
                fillOpacity: opacity
            });
            polygons.push(polygon);
            polygon.setMap(map);
            displayAreaName(polygon, fill_color, opacity);
        } else {
            for (var j = 0, len = area.path.length; j < len; j++) {
                var polygon = new kakao.maps.Polygon({
                    map: map,
                    path: area.path[j],
                    strokeWeight: stroke_weight,
                    strokeColor: stroke_color,
                    strokeOpacity: 0.8,
                    fillColor: fill_color,
                    fillOpacity: opacity
                });
                polygons.push(polygon);
                polygon.setMap(map);
                displayAreaName(polygon, fill_color, opacity);
            }
        }

        function displayAreaName(section, originalColor, originalOpacity) {
            kakao.maps.event.addListener(section, 'mouseover', function () {
                section.setOptions({
                    fillColor: '#09f',
                    fillOpacity: 0.8
                });
            });

            kakao.maps.event.addListener(section, 'mouseout', function () {
                section.setOptions({
                    fillColor: originalColor,
                    fillOpacity: originalOpacity
                });
            });

            kakao.maps.event.addListener(section, 'click', function (mouseEvent) {
                console.log(mouseEvent.latLng);
                area_info.innerHTML = '<div>' + area.name +'</div>';
                area_info.innerHTML += '<div>' + '출동확률: '+ Math.ceil(area.prob * 10000) / 100 +'%</div>';
                if (area.death_cnt > 0) {
                    area_info.innerHTML += '<div>' + '사망자수: ' + area.death_cnt + '</div>';
                    area_info.innerHTML += '<div>' + '사망원인: ' + area.death_reason + '</div>';          
                } else {
                    area_info.innerHTML += '<div>&emsp;</div>'
                    area_info.innerHTML += '<div>&emsp;</div>'
                }
            });
        }     
    }
}
