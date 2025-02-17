    /* script.js */

    // 전역 변수 및 지도 초기화
    var markers = [];
    var mapContainer = document.getElementById('map'),
        mapOption = {
            center: new kakao.maps.LatLng(36.3504, 127.3845), // 대전광역시 중심
            level: 3
        };

    var map = new kakao.maps.Map(mapContainer, mapOption);
    var ps = new kakao.maps.services.Places();
    var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

    const accessToken = localStorage.getItem("accessToken");

    // 전역 변수 (키워드 검색 결과를 7개씩 나누어 표시하기 위한 변수)
    var placesResult = [];
    var currentPageFeature1 = 1;
    var itemsPerPageFeature1 = 7;

    /* --- API 데이터를 로드하는 함수들 --- */

    // 위치(구) 목록 로드
    function loadLocationKeywords() {
      fetch('/api/v1/locations/gu', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken
        }
      })
      .then(response => {
        if (!response.ok) throw new Error('네트워크 응답 오류');
        return response.json();
      })
      .then(data => {
        const select = document.getElementById('regionKeyword');
        select.innerHTML = '<option value="">선택하세요</option>';
        data.data.forEach(keyword => {
          const option = document.createElement('option');
          option.value = keyword;
          option.text = keyword;
          select.appendChild(option);
        });
      })
      .catch(error => {
        console.error('위치 키워드 로딩 실패:', error);
      });
    }

    // 동(구에 따른) 목록 로드
    function loadDongKeywords(gu) {
      fetch('/api/v1/locations/dong?gu=' + encodeURIComponent(gu), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken
        }
      })
      .then(response => {
        if (!response.ok) throw new Error('네트워크 응답 오류');
        return response.json();
      })
      .then(data => {
        const select = document.getElementById('dongKeyword');
        select.innerHTML = '<option value="">선택하세요</option>';
        data.data.forEach(dong => {
          const option = document.createElement('option');
          option.value = dong;
          option.text = dong;
          select.appendChild(option);
        });
      })
      .catch(error => {
        console.error('동 키워드 로딩 실패:', error);
      });
    }

    // 음식 메뉴 타입 로드
    function loadFoodMenuTypes() {
      fetch('/api/v1/menu/type', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken
        }
      })
      .then(response => {
        if (!response.ok) throw new Error('네트워크 응답 오류');
        return response.json();
      })
      .then(data => {
        const types = data.data;
        const select1 = document.getElementById('foodCategory');
        const select2 = document.getElementById('foodCategory2');
        select1.innerHTML = select2.innerHTML = '<option value="">선택하세요</option>';
        types.forEach(type => {
          const option1 = document.createElement('option');
          option1.value = type;
          option1.text = type;
          select1.appendChild(option1);

          const option2 = document.createElement('option');
          option2.value = type;
          option2.text = type;
          select2.appendChild(option2);
        });
      })
      .catch(error => {
        console.error('음식 메뉴 타입 로딩 실패:', error);
      });
    }

    // 음식 메뉴 이름(서브카테고리) 로드
    function loadFoodMenuNames(foodType, targetSelectId) {
      fetch('/api/v1/menu/name?menuType=' + encodeURIComponent(foodType), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken
        }
      })
      .then(response => {
        if (!response.ok) throw new Error('네트워크 응답 오류');
        return response.json();
      })
      .then(data => {
        const names = data.data;
        const select = document.getElementById(targetSelectId);
        select.innerHTML = '<option value="">선택하세요</option>';
        names.forEach(name => {
          const option = document.createElement('option');
          option.value = name;
          option.text = name;
          select.appendChild(option);
        });
      })
      .catch(error => {
        console.error('음식 메뉴 이름 로딩 실패:', error);
      });
    }

    /* --- 이벤트 리스너 --- */

    // 구 선택 시 동 목록 로드
    document.getElementById('regionKeyword').addEventListener('change', function() {
      const selectedGu = this.value;
      if (selectedGu) {
        loadDongKeywords(selectedGu);
      } else {
        document.getElementById('dongKeyword').innerHTML = '<option value="">선택하세요</option>';
      }
    });

    // 탭 전환 로직
    document.querySelectorAll('.tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        var tabName = this.getAttribute('data-tab');
        document.querySelectorAll('.tab').forEach(function(t) {
          t.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(function(content) {
          content.classList.remove('active');
        });
        this.classList.add('active');
        document.getElementById(tabName).classList.add('active');
      });
    });

    // 음식 서브카테고리 업데이트 (각 탭)
    function updateFoodSubcategories() {
      var foodCategory = document.getElementById('foodCategory').value;
      if (foodCategory) {
        loadFoodMenuNames(foodCategory, 'foodSubcategory');
      } else {
        document.getElementById('foodSubcategory').innerHTML = '<option value="">선택하세요</option>';
      }
    }

    function updateFoodSubcategoriesForFilter() {
      var foodCategory = document.getElementById('foodCategory2').value;
      if (foodCategory) {
        loadFoodMenuNames(foodCategory, 'foodSubcategory2');
      } else {
        document.getElementById('foodSubcategory2').innerHTML = '<option value="">선택하세요</option>';
      }
    }

    /* --- 즐겨찾기 기능 --- */

    // 장소 즐겨찾기 목록 로드
    function loadPlaceFavorites() {
      fetch("/api/v1/star/place", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log("장소 즐겨찾기:", data);
        updatePlaceFavoritesUI(data.data);
      })
      .catch(error => {
        console.error("장소 즐겨찾기 로딩 실패:", error);
      });
    }

    // 메뉴 즐겨찾기 목록 로드
    function loadMenuFavorites() {
      fetch("/api/v1/star/menu", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log("메뉴 즐겨찾기:", data);
        updateMenuFavoritesUI(data.data);
      })
      .catch(error => {
        console.error("메뉴 즐겨찾기 로딩 실패:", error);
      });
    }

    /* 즐겨찾기 UI 업데이트 (장소) */
    function updatePlaceFavoritesUI(favorites) {
      const lists = [];
      const el1 = document.getElementById('favoritesPlaceList');
      if (el1) lists.push(el1);
      const el2 = document.getElementById('favoritesPlaceList2');
      if (el2) lists.push(el2);

      lists.forEach(function(listEl) {
        listEl.innerHTML = "";
        favorites.forEach(keyword => {
          const li = document.createElement('li');
          li.innerHTML = `<span onclick="selectFavorite('${keyword}', 'place')">${keyword}</span>
                          <button type="button" class="fav-star" onclick="removeFavorite('${keyword}', 'place')">★</button>`;
          listEl.appendChild(li);
        });
      });
    }

    /* 즐겨찾기 UI 업데이트 (메뉴) */
    function updateMenuFavoritesUI(favorites) {
      const lists = [];
      const el1 = document.getElementById('favoritesMenuList');
      if (el1) lists.push(el1);
      const el2 = document.getElementById('favoritesMenuList2');
      if (el2) lists.push(el2);

      lists.forEach(function(listEl) {
        listEl.innerHTML = "";
        favorites.forEach(keyword => {
          const li = document.createElement('li');
          li.innerHTML = `<span onclick="selectFavorite('${keyword}', 'menu')">${keyword}</span>
                          <button type="button" class="fav-star" onclick="removeFavorite('${keyword}', 'menu')">★</button>`;
          listEl.appendChild(li);
        });
      });
    }

    /* 아코디언 토글 함수 */
    function toggleAccordion(headerElement) {
      var content = headerElement.nextElementSibling;
      content.style.display = (content.style.display === 'block') ? 'none' : 'block';
    }

    // 즐겨찾기 추가 (지역)
    function addRegionFavorite() {
      const region = document.getElementById('dongKeyword').value;
      if (!region) {
        alert('지역을 선택해주세요.');
        return;
      }
      fetch("/api/v1/star/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken
        },
        body: JSON.stringify({ dong : region })
      })
      .then(response => {
        if (!response.ok) throw new Error("즐겨찾기 추가 실패");
        return response.json();
      })
      .then(data => {
        alert('지역 즐겨찾기 추가 성공');
        loadPlaceFavorites();
      })
      .catch(error => {
        console.error("즐겨찾기 추가 오류:", error);
        alert("즐겨찾기 추가 실패");
      });
    }

    // 즐겨찾기 추가 (음식 - 키워드 검색 탭)
    function addFoodFavorite() {
      const food = document.getElementById('foodSubcategory').value;
      if (!food) {
        alert('음식을 선택해주세요.');
        return;
      }
      fetch("/api/v1/star/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken
        },
        body: JSON.stringify({ menuKeyword: food })
      })
      .then(response => {
        if (!response.ok) throw new Error("즐겨찾기 추가 실패");
        return response.json();
      })
      .then(data => {
        alert('음식 즐겨찾기 추가 성공');
        loadMenuFavorites();
      })
      .catch(error => {
        console.error("즐겨찾기 추가 오류:", error);
        alert("즐겨찾기 추가 실패");
      });
    }

    // 즐겨찾기 삭제
    function removeFavorite(keyword, type) {
      let url = "";
      if (type === "place") {
        url = "/api/v1/star/place?placeKeyword=" + encodeURIComponent(keyword);
      } else if (type === "menu") {
        url = "/api/v1/star/menu?menuKeyword=" + encodeURIComponent(keyword);
      }
      fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken
        }
      })
      .then(response => {
        if (!response.ok) throw new Error("즐겨찾기 삭제 실패");
        return response.json();
      })
      .then(data => {
        alert("즐겨찾기 삭제 성공");
        if (type === "place") {
          loadPlaceFavorites();
        } else if (type === "menu") {
          loadMenuFavorites();
        }
      })
      .catch(error => {
        console.error("즐겨찾기 삭제 오류:", error);
        alert("즐겨찾기 삭제 실패");
      });
    }

function selectFavorite(keyword, type) {
  if (type === "place") {
    // 장소 즐겨찾기인 경우 기존 로직 유지
    fetch('/api/v1/locations/find-gu?dong=' + keyword, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + accessToken
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.data) {
        document.getElementById('regionKeyword').value = data.data;
        loadDongKeywords(data.data);
        setTimeout(() => {
          document.getElementById('dongKeyword').value = keyword;
        }, 50);
      } else {
        alert("해당 동에 맞는 구 정보를 찾을 수 없습니다.");
      }
    })
    .catch(error => console.error("동 키워드 조회 실패:", error));
  } else if (type === "menu") {
    // 음식 즐겨찾기인 경우, API로 음식 타입을 조회한 후 어느 탭이 활성화되었는지에 따라 검색 필드 업데이트
    fetch('/api/v1/menu/find-type?menuName=' + keyword, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + accessToken
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.data) {
        // 현재 활성화된 탭의 컨텐츠를 가져와서, 탭 id가 'tab3'이면 탭 3용 검색 필드를 업데이트
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === 'tab-filter') {
          const foodCategorySelect = document.getElementById('foodCategory2');
          const foodSubcategorySelect = document.getElementById('foodSubcategory2');
          foodCategorySelect.value = data.data;
          loadFoodMenuNames(data.data, 'foodSubcategory2');
          setTimeout(() => {
            foodSubcategorySelect.value = keyword;
          }, 50);
        } else {
          // 기본 탭(예: 키워드 검색 탭) 업데이트
          const foodCategorySelect = document.getElementById('foodCategory');
          const foodSubcategorySelect = document.getElementById('foodSubcategory');
          foodCategorySelect.value = data.data;
          loadFoodMenuNames(data.data, 'foodSubcategory');
          setTimeout(() => {
            foodSubcategorySelect.value = keyword;
          }, 100);
        }
      } else {
        alert("해당 메뉴에 맞는 음식 타입을 찾을 수 없습니다.");
      }
    })
    .catch(error => console.error("음식 키워드 조회 실패:", error));
  }
}



    /* --- 기능 1: 키워드 검색 (결과를 7개씩 표시) --- */
    function searchPlaces() {
      var gu = document.getElementById('regionKeyword').value;
      var dong = document.getElementById('dongKeyword').value;
      var foodCategory = document.getElementById('foodCategory').value;
      var foodSubcategory = document.getElementById('foodSubcategory').value;
      var keyword = (gu + " " + dong + " " + foodSubcategory).trim();
      if (!keyword) {
        alert('검색 조건을 선택해주세요!');
        return;
      }
      ps.keywordSearch(keyword, placesSearchCB);
    }

    function placesSearchCB(data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        placesResult = data;  // 전체 결과 저장
        currentPageFeature1 = 1;
        displayPlacesPage(currentPageFeature1);
        displayCustomPagination();
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
      } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 중 오류가 발생했습니다.');
      }
    }

    function displayPlacesPage(page) {
      var listEl = document.getElementById('placesList'),
          menuEl = document.getElementById('menu_wrap'),
          fragment = document.createDocumentFragment(),
          bounds = new kakao.maps.LatLngBounds();

      removeAllChildNodes(listEl);
      removeMarker();

      var startIdx = (page - 1) * itemsPerPageFeature1;
      var currentPlaces = placesResult.slice(startIdx, startIdx + itemsPerPageFeature1);

      currentPlaces.forEach(function(place, i) {
        var index = startIdx + i;
        var placePosition = new kakao.maps.LatLng(place.y, place.x);
        var marker = addMarker(placePosition, index);
        var itemEl = getListItem(index, place);
        bounds.extend(placePosition);

        (function(marker, title) {
          kakao.maps.event.addListener(marker, 'mouseover', function() {
            displayInfowindow(marker, title);
          });
          kakao.maps.event.addListener(marker, 'mouseout', function() {
            infowindow.close();
          });
          itemEl.onmouseover = function() {
            displayInfowindow(marker, title);
          };
          itemEl.onmouseout = function() {
            infowindow.close();
          };
        })(marker, place.place_name);

        fragment.appendChild(itemEl);
      });

      listEl.appendChild(fragment);
      menuEl.scrollTop = 0;
      map.setBounds(bounds);
    }

    function displayCustomPagination() {
      var paginationEl = document.getElementById('pagination');
      removeAllChildNodes(paginationEl);

      var totalPages = Math.ceil(placesResult.length / itemsPerPageFeature1);
      for (var i = 1; i <= totalPages; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;
        el.className = (i === currentPageFeature1) ? 'on' : '';
        el.onclick = (function(i) {
          return function() {
            currentPageFeature1 = i;
            displayPlacesPage(i);
            displayCustomPagination();
          };
        })(i);
        paginationEl.appendChild(el);
      }
    }

    /* --- 기능 2: 주변 전체 음식점 검색 --- */
    var nearbyPlaces = [];
    var currentPage = 1;
    var itemsPerPage = 7;
    var maxPages = 5;

    function displayNearbyPlaces(page) {
      var listEl = document.getElementById('placesList'),
          menuEl = document.getElementById('menu_wrap'),
          fragment = document.createDocumentFragment(),
          bounds = new kakao.maps.LatLngBounds();

      removeAllChildNodes(listEl);
      removeMarker();

      var startIdx = (page - 1) * itemsPerPage;
      var places = nearbyPlaces.slice(startIdx, startIdx + itemsPerPage);

      places.forEach(function(place, i) {
        var index = startIdx + i;
        var placePosition = new kakao.maps.LatLng(place.y, place.x);
        var marker = addMarker(placePosition, index);
        var itemEl = getListItem(index, place);
        bounds.extend(placePosition);

        (function(marker, title) {
          kakao.maps.event.addListener(marker, 'mouseover', function() {
            displayInfowindow(marker, title);
          });
          kakao.maps.event.addListener(marker, 'mouseout', function() {
            infowindow.close();
          });
          itemEl.onmouseover = function() {
            displayInfowindow(marker, title);
          };
          itemEl.onmouseout = function() {
            infowindow.close();
          };
        })(marker, place.place_name);

        fragment.appendChild(itemEl);
      });

      listEl.appendChild(fragment);
      menuEl.scrollTop = 0;
      map.setBounds(bounds);

      displayNearbyPagination();
    }

    function displayNearbyPagination() {
      var paginationEl = document.getElementById('pagination');
      removeAllChildNodes(paginationEl);

      var totalPages = Math.min(Math.ceil(nearbyPlaces.length / itemsPerPage), maxPages);
      for (var i = 1; i <= totalPages; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;
        el.className = (i === currentPage) ? 'on' : '';
        el.onclick = (function(i) {
          return function() {
            currentPage = i;
            displayNearbyPlaces(i);
          };
        })(i);
        paginationEl.appendChild(el);
      }
    }

    document.getElementById('getLocation').addEventListener('click', function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          var url = '/api/v1/search/nearby?longitude=' + encodeURIComponent(lng) +
                    '&latitude=' + encodeURIComponent(lat);

          fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + accessToken
            }
          })
          .then(function(response) {
            if (!response.ok) throw new Error('네트워크 응답에 문제가 있습니다.');
            return response.json();
          })
          .then(function(data) {
            if (data.data.restaurantLists && data.data.restaurantLists.length > 0) {
              nearbyPlaces = data.data.restaurantLists.map((place) => ({
                place_name: place.restaurantName,
                address_name: place.address,
                road_address_name: place.roadAddressName,
                phone: place.phoneNumber,
                x: place.longitude,
                y: place.latitude
              }));
              currentPage = 1;
              displayNearbyPlaces(1);
            } else {
              alert("주변 음식점 검색 결과가 없습니다.");
            }
          })
          .catch(function(error) {
            alert("서버 요청 중 오류가 발생했습니다.");
          });
        }, function(error) {
          alert('현재 위치를 가져오는데 실패하였습니다.\n오류: ' + error.message);
        });
      } else {
        alert('이 브라우저에서는 Geolocation을 지원하지 않습니다.');
      }
    });

    /* --- 기능 3: 위치+음식 검색 --- */
    var filteredPlaces = [];
    var currentFilterPage = 1;

    function renderPlaces(page, placesArray) {
      var listEl = document.getElementById('placesList'),
          menuEl = document.getElementById('menu_wrap'),
          fragment = document.createDocumentFragment(),
          bounds = new kakao.maps.LatLngBounds();

      removeAllChildNodes(listEl);
      removeMarker();

      var startIdx = (page - 1) * itemsPerPage;
      var currentPlaces = placesArray.slice(startIdx, startIdx + itemsPerPage);

      currentPlaces.forEach(function(place, i) {
        var index = startIdx + i;
        var placePosition = new kakao.maps.LatLng(place.y, place.x);
        var marker = addMarker(placePosition, index);
        var itemEl = getListItem(index, place);
        bounds.extend(placePosition);

        (function(marker, title) {
          kakao.maps.event.addListener(marker, 'mouseover', function() {
            displayInfowindow(marker, title);
          });
          kakao.maps.event.addListener(marker, 'mouseout', function() {
            infowindow.close();
          });
          itemEl.onmouseover = function() {
            displayInfowindow(marker, title);
          };
          itemEl.onmouseout = function() {
            infowindow.close();
          };
        })(marker, place.place_name);

        fragment.appendChild(itemEl);
      });

      listEl.appendChild(fragment);
      menuEl.scrollTop = 0;
      map.setBounds(bounds);
    }

    function renderPagination(placesArray, currentPage, setPageCallback) {
      var paginationEl = document.getElementById('pagination');
      removeAllChildNodes(paginationEl);

      var totalPages = Math.min(Math.ceil(placesArray.length / itemsPerPage), maxPages);
      for (var i = 1; i <= totalPages; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;
        el.className = (i === currentPage) ? 'on' : '';
        el.onclick = (function(i) {
          return function() {
            setPageCallback(i);
          };
        })(i);
        paginationEl.appendChild(el);
      }
    }

    function displayFilteredPlaces(page) {
      renderPlaces(page, filteredPlaces);
      renderPagination(filteredPlaces, currentFilterPage, function(page) {
        currentFilterPage = page;
        displayFilteredPlaces(page);
      });
    }

    document.getElementById('getLocationForFilter').addEventListener('click', function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          window.currentLat = position.coords.latitude;
          window.currentLng = position.coords.longitude;
        }, function(error) {
          alert('현재 위치를 가져오는데 실패하였습니다.\n오류: ' + error.message);
        });
      } else {
        alert('이 브라우저에서는 Geolocation을 지원하지 않습니다.');
      }
    });

    function searchPlacesWithLocation() {
      if (typeof window.currentLat === 'undefined' || typeof window.currentLng === 'undefined') {
        alert('먼저 현재 위치를 가져오세요!');
        return;
      }
      var foodCategory = document.getElementById('foodCategory2').value;
      var foodSubcategory = document.getElementById('foodSubcategory2').value;
      var foodKeyword = foodSubcategory.trim();
      if (!foodKeyword) {
        alert('음식 검색 조건을 선택해주세요!');
        return;
      }
      var lat = window.currentLat;
      var lng = window.currentLng;
      var url = '/api/v1/search/nearby?longitude=' + lng +
                '&latitude=' + lat +
                '&keyword=' + foodKeyword;

      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken
        }
      })
      .then(function(response) {
        if (!response.ok) throw new Error('네트워크 응답에 문제가 있습니다.');
        return response.json();
      })
      .then(function(data) {
        if (data.data.restaurantLists && data.data.restaurantLists.length > 0) {
          filteredPlaces = data.data.restaurantLists.map(function(place) {
            return {
              place_name: place.restaurantName,
              address_name: place.address,
              road_address_name: place.roadAddressName,
              phone: place.phoneNumber,
              x: place.longitude,
              y: place.latitude
            };
          });
          currentFilterPage = 1;
          displayFilteredPlaces(1);
        } else {
          alert("검색 결과가 없습니다.");
        }
      })
      .catch(function(error) {
        alert("서버 요청 중 오류가 발생했습니다.");
      });
    }

    /* --- 공통 유틸리티 함수 --- */
    function addMarker(position, idx) {
      var marker = new kakao.maps.Marker({
          position: position,
          map: map,
          label: {
             text: String(idx + 1),
             color: "#fff",
             fontSize: "12px",
             fontWeight: "bold"
          }
      });
      markers.push(marker);
      return marker;
    }

    function removeMarker() {
      markers.forEach(function(marker) {
        marker.setMap(null);
      });
      markers = [];
    }

    function getListItem(index, place) {
      var el = document.createElement('li'),
          restaurantName = place.place_name,
          address = place.road_address_name || place.address_name || "주소 정보 없음",
          phone = place.phone || "전화번호 없음";

      var markerStr = '<span class="markerbg marker_' + (index + 1) + '">' + (index + 1) + '</span>';
      var infoStr = '<div class="info">' +
                    '<h5><a href="javascript:void(0)" onclick="showReviews(\'' + encodeURIComponent(restaurantName) + '\')">' + restaurantName + '</a></h5>' +
                    '<span>' + address + '</span>' +
                    '<span class="tel">' + phone + '</span>' +
                    '</div>';

      el.innerHTML = markerStr + infoStr;
      el.className = 'item';
      return el;
    }

    function showReviews(restaurantName) {
      window.location.href = 'review.html?restaurant=' + restaurantName;
    }

    function removeAllChildNodes(el) {
      while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
      }
    }

    function fetchRankingList() {
      fetch('/api/v1/search/rankings', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("랭킹 데이터 로딩 실패");
        }
        return response.json();
      })
      .then(data => {
        // data.data는 [{ ranking: 1, keyword: "덮밥" }, ...] 형식임
        const rankingListEl = document.getElementById('rankingList');
        rankingListEl.innerHTML = ""; // 기존 내용 초기화

        data.data.forEach(item => {
            const li = document.createElement('li');

            // 순위 배지 생성 및 순위에 따른 클래스 추가
            const badge = document.createElement('span');
            badge.classList.add('ranking-badge');
            badge.textContent = item.ranking;
            if (item.ranking === 1) {
              badge.classList.add('gold');
            } else if (item.ranking === 2) {
              badge.classList.add('silver');
            } else if (item.ranking === 3) {
              badge.classList.add('bronze');
            }
            // 키워드 텍스트 생성
            const keywordSpan = document.createElement('span');
            keywordSpan.classList.add('ranking-keyword');
            keywordSpan.textContent = item.keyword;

            li.appendChild(badge);
            li.appendChild(keywordSpan);
            // 랭킹 항목을 클릭하면 즐겨찾기처럼 카테고리 불러오기 함수(selectFavorite)를 호출합니다.
                  li.addEventListener("click", function() {
                    // 여기서 type은 "menu"로 지정합니다.
                    selectFavorite(item.keyword, "menu");
                  });

            rankingListEl.appendChild(li);
        });
      })
      .catch(error => {
        console.error("실시간 키워드 랭킹 로딩 실패:", error);
      });
    }

    /* --- 페이지 로드 시 초기 데이터 로드 --- */
    window.addEventListener('load', function() {
      loadLocationKeywords();
      loadFoodMenuTypes();
      loadPlaceFavorites();
      loadMenuFavorites();
      fetchRankingList();
      // 30초마다 랭킹 목록 갱신
      setInterval(fetchRankingList, 10000);
    });

    document.addEventListener("DOMContentLoaded", function () {
        console.log("DOMContentLoaded 실행됨");

        // 음식 즐겨찾기 버튼 이벤트 추가 (키워드 검색 탭)
        const foodFavoriteBtn = document.getElementById("addFoodFavorite");
        if (foodFavoriteBtn) {
            foodFavoriteBtn.addEventListener("click", addFoodFavorite);
            console.log("addFoodFavorite 버튼 이벤트 추가됨");
        } else {
            console.error("addFoodFavorite 버튼을 찾을 수 없음");
        }

        // 지역 즐겨찾기 버튼 이벤트 추가 (키워드 검색 탭)
        const regionFavoriteBtn = document.getElementById("addRegionFavorite");
        if (regionFavoriteBtn) {
            regionFavoriteBtn.addEventListener("click", addRegionFavorite);
            console.log("addRegionFavorite 버튼 이벤트 추가됨");
        } else {
            console.error("addRegionFavorite 버튼을 찾을 수 없음");
        }

        // 위치+음식 검색 탭 즐겨찾기 버튼 이벤트 추가
        const filterFavoriteBtn = document.getElementById("addFavoriteForFilter");
        if (filterFavoriteBtn) {
            filterFavoriteBtn.addEventListener("click", function() {
                var foodKeyword = document.getElementById("foodSubcategory2").value;
                if (!foodKeyword) {
                  alert('검색 조건을 선택해주세요!');
                  return;
                }
                fetch("/api/v1/star/menu", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": "Bearer " + accessToken
                    },
                    body: JSON.stringify({ menuKeyword: foodKeyword })
                })
                .then(response => {
                  if (!response.ok) throw new Error("즐겨찾기 추가 실패");
                  return response.json();
                })
                .then(data => {
                  alert('즐겨찾기 추가 성공');
                  loadMenuFavorites();
                })
                .catch(error => {
                  console.error("즐겨찾기 추가 오류:", error);
                  alert("즐겨찾기 추가 실패");
                });
            });
            console.log("addFavoriteForFilter 버튼 이벤트 추가됨");
        } else {
            console.error("addFavoriteForFilter 버튼을 찾을 수 없음");
        }
    });
