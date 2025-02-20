const API_BASE_URL = "https://mapjiri.site";

  document.getElementById("loginForm").addEventListener("submit", function(event){
    event.preventDefault();
    const formData = new FormData(this);
    const data = {
      email: formData.get("email"),
      password: formData.get("password")
    };

    fetch(`${API_BASE_URL}/api/v1/user/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("로그인 실패");
      }
      return response.json();
    })
    .then(result => {
      console.log("로그인 성공", result);
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("refreshToken", result.refreshToken);
      // 예: 로그인 성공 후 홈 화면으로 이동
      window.location.href = "/";
    })
    .catch(error => {
      console.error("에러 발생:", error);
      alert("로그인에 실패했습니다.");
    });
  });