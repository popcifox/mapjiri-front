const API_BASE_URL = "http://localhost:8080";
const accessToken = localStorage.getItem("accessToken");

// URL에서 name과 address 가져오기
const urlParams = new URLSearchParams(window.location.search);
const restaurantName = urlParams.get("name") || "가게 이름 없음";
const restaurantAddress = urlParams.get("address") || "주소 정보 없음";

console.log("URL에서 가져온 가게 정보:", restaurantName, restaurantAddress);

// ✅ 헤더 업데이트 (실제 가게명 적용)
document.getElementById('reviewTitle').textContent = `${restaurantName} 리뷰`;

// 서버에서 리뷰 데이터 가져오기
function fetchReviews() {
    console.log("fetchReviews 실행됨!");
    console.log("요청 보낼 가게 정보:", restaurantName, restaurantAddress);

    const url = `${API_BASE_URL}/api/v1/review/restaurant?name=${encodeURIComponent(restaurantName)}&address=${encodeURIComponent(restaurantAddress)}&sort=latest&pageNumber=1`;

    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken // 필요하면 추가
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log("받아온 데이터:", data);

            if (!data.data || !Array.isArray(data.data.responseList)) {
                console.error("리뷰 데이터가 배열이 아님!", data.data);
                alert("리뷰 데이터를 불러오는 중 문제가 발생했습니다.");
                return;
            }

            updateReviewUI(data.data.responseList);
        })
        .catch(error => {
            console.error("리뷰 데이터 불러오기 오류:", error);
            alert("리뷰 데이터를 가져오는 중 문제가 발생했습니다.");
        });
}

// UI 업데이트
function updateReviewUI(reviews) {
    console.log("updateReviewUI 실행됨, 리뷰 개수:", reviews.length);

    const reviewContainer = document.getElementById('reviewContainer');
    reviewContainer.innerHTML = ""; // 기존 리뷰 초기화

    if (!reviews || reviews.length === 0) {
        reviewContainer.innerHTML = "<p style='text-align:center;'>등록된 리뷰가 없습니다.</p>";
        return;
    }

    reviews.forEach(review => {
        console.log("리뷰 추가:", review);

        // 리뷰 박스 생성
        const reviewBox = document.createElement('div');
        reviewBox.classList.add('review-box');

        // 이미지 컨테이너 생성
        const imageContainer = document.createElement('div');

        if (review.imageUrl) {
            // ✅ 실제 이미지가 있는 경우
            const image = document.createElement('img');
            image.src = review.imageUrl;
            image.alt = "리뷰 이미지";
            imageContainer.appendChild(image);
        } else {
            // ✅ 이미지가 없는 경우 빈 컨테이너 추가
            imageContainer.classList.add("no-image");
            imageContainer.textContent = "이미지 없음";
        }

        // ✅ 별점 개수 변환 (100 → ⭐⭐⭐⭐⭐, 80 → ⭐⭐⭐⭐ ...)
        const starCount = Math.floor(review.score / 20);
        const stars = "⭐".repeat(starCount) || "🥲"; // 0이면 '별 없음'

        // 리뷰 내용 컨테이너
        const content = document.createElement('div');
        content.classList.add('review-content');
        content.innerHTML = `
            <p>${review.content}</p>
            <div class="review-footer">
                <span class="review-date">${review.date}</span>
                <span class="review-score">${stars}</span>
            </div>
        `;

        // 요소 추가
        reviewBox.appendChild(imageContainer);
        reviewBox.appendChild(content);
        reviewContainer.appendChild(reviewBox);
    });
}



// ✅ 페이지 로드 시 `fetchReviews()` 실행
window.addEventListener("load", fetchReviews);
