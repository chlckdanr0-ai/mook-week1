document.addEventListener('DOMContentLoaded', () => {
    // 테마 토글 관련
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'light' ? '🌙 다크 모드' : '☀️ 라이트 모드';

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'light' ? '🌙 다크 모드' : '☀️ 라이트 모드';
    });

    // 관리자 모달 관련
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminModal = document.getElementById('admin-modal');
    const closeBtn = document.querySelector('.close-btn');
    const loginSubmit = document.getElementById('login-submit');
    const adminPasswordInput = document.getElementById('admin-password');
    const loginError = document.getElementById('login-error');

    // 모달 열기
    adminLoginBtn.addEventListener('click', () => {
        adminModal.style.display = 'block';
    });

    // 모달 닫기 (X 버튼)
    closeBtn.addEventListener('click', () => {
        adminModal.style.display = 'none';
        loginError.style.display = 'none';
        adminPasswordInput.value = '';
    });

    // 모달 닫기 (배경 클릭)
    window.addEventListener('click', (event) => {
        if (event.target == adminModal) {
            adminModal.style.display = 'none';
            loginError.style.display = 'none';
            adminPasswordInput.value = '';
        }
    });

    // 로그인 시도
    loginSubmit.addEventListener('click', () => {
        const password = adminPasswordInput.value;
        // 예시용 비밀번호 (실제 서비스에서는 서버 측 검증이 필요합니다)
        if (password === 'admin1234') {
            alert('관리자 로그인이 완료되었습니다.');
            // 관리자 페이지로 이동하거나 관리자 UI 표시 로직 추가 가능
            adminModal.style.display = 'none';
        } else {
            loginError.style.display = 'block';
        }
    });
});
