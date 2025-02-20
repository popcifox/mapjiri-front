    const API_BASE_URL = "https://mapjiri.site";

    // 회원가입 처리 (/api/v1/user/signup)
    document.getElementById("registerForm").addEventListener("submit", function(event) {
      event.preventDefault();
      const formData = new FormData(this);
      const data = {
        email: formData.get("mail"),
        username: formData.get("username"),
        password: formData.get("password")
      };

      fetch(`${API_BASE_URL}/api/v1/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("회원가입 실패");
        }
        return response.text();
      })
      .then(text => {
        const result = text ? JSON.parse(text) : {};
        console.log("회원가입 성공:", result);
        alert("회원가입이 완료되었습니다.");
        window.location.href = "/login";
      })
      .catch(error => {
        console.error("에러 발생:", error);
        alert("회원가입에 실패했습니다: " + error.message);
      });
    });

    // 인증번호 전송 버튼 처리 (/api/v1/user/send)
    document.getElementById("sendCodeBtn").addEventListener("click", function() {
      const email = document.querySelector('input[name="mail"]').value;
      if (!email) {
        alert("이메일을 입력하세요.");
        return;
      }
      fetch(`${API_BASE_URL}/api/v1/user/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: email })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("인증번호 전송 실패");
        }
        return response.text();
      })
      .then(text => {
        const result = text ? JSON.parse(text) : {};
        console.log("인증번호 전송 성공:", result);
        alert("인증번호가 전송되었습니다.");
      })
      .catch(error => {
        console.error("에러 발생:", error);
        alert("인증번호 전송에 실패했습니다: " + error.message);
      });
    });

    // 인증번호 검증 버튼 처리 (/api/v1/user/verify)
    document.getElementById("verifyBtn").addEventListener("click", function() {
      const email = document.querySelector('input[name="mail"]').value;
      const code = document.querySelector('input[name="verificationCode"]').value;
      if (!email || !code) {
        alert("이메일과 인증번호를 입력하세요.");
        return;
      }
      fetch(`${API_BASE_URL}/api/v1/user/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: email, code: code })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("인증번호 검증 실패");
        }
        return response.text();
      })
      .then(text => {
        const result = text ? JSON.parse(text) : {};
        console.log("인증번호 검증 성공:", result);
        alert("인증번호가 검증되었습니다.");
      })
      .catch(error => {
        console.error("에러 발생:", error);
        alert("인증번호 검증에 실패했습니다: " + error.message);
      });
    });