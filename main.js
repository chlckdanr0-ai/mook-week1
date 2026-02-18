// Teachable Machine 모델 URL (사용자께서 본인의 모델 URL로 교체해야 합니다)
const MODEL_URL = "YOUR_MODEL_URL/"; 
let model;

document.addEventListener('DOMContentLoaded', () => {
    // 1. 테마 토글 핸들러
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeButtonText(currentTheme);

    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButtonText(newTheme);
    });

    function updateThemeButtonText(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 다크 모드' : '☀️ 라이트 모드';
    }

    // 2. 관리자 모달 제어
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminModal = document.getElementById('admin-modal');
    const closeBtn = document.querySelector('.close-btn');
    const loginSubmit = document.getElementById('login-submit');
    const passwordInput = document.getElementById('admin-password');
    const loginError = document.getElementById('login-error');

    adminLoginBtn.addEventListener('click', () => adminModal.style.display = 'block');
    closeBtn.addEventListener('click', () => {
        adminModal.style.display = 'none';
        loginError.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === adminModal) adminModal.style.display = 'none';
    });

    loginSubmit.addEventListener('click', () => {
        if (passwordInput.value === '1234') {
            alert('관리자 모드로 진입합니다.');
            adminModal.style.display = 'none';
            // 추후 관리자 전용 대시보드 연결 가능
        } else {
            loginError.style.display = 'block';
        }
    });
});

// 3. 사진 처리 및 분석 로직
async function processImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 이미지 미리보기
    const reader = new FileReader();
    const previewImg = document.getElementById("preview");
    const resultDiv = document.getElementById("result");
    const nameDisplay = document.getElementById("flower-name-display");
    const infoDisplay = document.getElementById("drying-info-display");

    reader.onload = async function() {
        previewImg.src = reader.result;
        previewImg.style.display = "block";
        resultDiv.style.display = "block";
        
        nameDisplay.textContent = "꽃 이름을 분석하는 중...";
        infoDisplay.textContent = "인공지능이 이미지를 확인하고 있습니다.";

        try {
            // 모델 로드 및 예측
            if (!model) {
                model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
            }
            const prediction = await model.predict(previewImg);
            prediction.sort((a, b) => b.probability - a.probability);
            
            const flowerName = prediction[0].className;
            nameDisplay.textContent = `🌸 이 꽃은 '${flowerName}'인 것 같아요!`;
            
            // DB 조회 및 답변 로직
            await getDryingGuide(flowerName);

        } catch (error) {
            console.error("분석 중 오류 발생:", error);
            nameDisplay.textContent = "분석 오류";
            infoDisplay.textContent = "모델 URL을 확인하거나 나중에 다시 시도해주세요.";
        }
    };
    reader.readAsDataURL(file);
}

// 4. Firestore 데이터 기반 답변 및 자동 셋팅 로직
async function getDryingGuide(name) {
    const infoDisplay = document.getElementById("drying-info-display");
    
    try {
        const flowerRef = window.doc(window.db, "flowers", name);
        const flowerSnap = await window.getDoc(flowerRef);

        if (flowerSnap.exists()) {
            const data = flowerSnap.data();
            if (data.status === "approved") {
                // 승인된 데이터가 있는 경우: 자동 답변
                infoDisplay.innerHTML = `
                    <b>🕒 건조 기간:</b> ${data.dryingPeriod}<br>
                    <b>💡 팁:</b> ${data.tip || '준비된 팁이 없습니다.'}
                `;
            } else {
                // 아직 검토 중인 경우
                infoDisplay.textContent = "현재 관리자가 건조 기간을 확인 중인 꽃입니다. 조금만 기다려주세요!";
            }
        } else {
            // 데이터가 아예 없는 경우: 신규 등록 및 대기 안내
            await window.setDoc(flowerRef, {
                flowerName: name,
                dryingPeriod: "검토 중",
                status: "pending",
                requestCount: 1,
                lastRequested: window.serverTimestamp()
            });

            infoDisplay.innerHTML = `
                아직 이 꽃에 대한 건조 데이터가 없네요. 😅<br>
                <b>관리자가 확인 후 곧 건조 기간 정보를 추가해 드릴게요!</b><br>
                (관리자 피드백 대기 리스트에 등록되었습니다)
            `;
        }
    } catch (dbError) {
        console.error("DB 처리 중 오류:", dbError);
        infoDisplay.textContent = "데이터를 불러오는 중 문제가 발생했습니다.";
    }
}
