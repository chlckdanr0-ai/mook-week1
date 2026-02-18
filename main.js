// 0. Google AI 모듈 가져오기
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// 1. Google AI API 키 설정 (본인의 키로 교체해야 합니다)
const API_KEY = "AIzaSyAWS6ftTyI2YF6YaPxaEgK-o1UP5kJYyGI";

// 2. DOM 요소 가져오기
const fileUploadInput = document.getElementById("file-upload-input");
const previewImg = document.getElementById("preview");
const resultDiv = document.getElementById("result");
const nameDisplay = document.getElementById("flower-name-display");
const descriptionDisplay = document.getElementById("flower-description");

// 3. 파일 업로드 버튼에 이벤트 리스너 추가
fileUploadInput.addEventListener('change', processImage);

// 4. 이미지 처리 및 AI 분석 함수
async function processImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 이미지 미리보기 설정
    const reader = new FileReader();
    reader.onload = async function() {
        previewImg.src = reader.result;
        previewImg.style.display = "block";
        resultDiv.style.display = "block";
        nameDisplay.textContent = "꽃 이름을 분석하는 중...";
        descriptionDisplay.textContent = "인공지능이 이미지를 꼼꼼히 보고 있어요.";

        // API 키 확인
        if (API_KEY === "YOUR_API_KEY") {
            nameDisplay.textContent = "API 키를 입력해주세요!";
            descriptionDisplay.textContent = "main.js 파일에서 YOUR_API_KEY 부분을 실제 키로 교체해야 합니다.";
            return;
        }

        try {
            // Gemini AI 모델 실행 (수정된 부분)
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

            // 프롬프트 설정
            const prompt = "이 사진에 있는 꽃의 이름과 간단한 설명을 알려줘. 한국어로 대답해줘.";

            // API에 보낼 이미지 데이터 준비
            const imageParts = await Promise.all([fileToGenerativePart(file)]);

            // AI에게 질문하고 답변받기
            const result = await model.generateContent([prompt, ...imageParts]);
            const response = await result.response;
            const text = response.text();

            // 결과 표시
            displayResult(text);

        } catch (error) {
            console.error("분석 중 오류 발생:", error);
            nameDisplay.textContent = "오류 발생! 원인을 확인해주세요.";
            // 상세한 오류 내용을 화면에 직접 표시합니다.
            descriptionDisplay.textContent = `[상세 오류]: ${error.toString()}`;
        }
    };
    reader.readAsDataURL(file);
}

// 5. 파일 객체를 AI 모델이 이해하는 형식으로 변환하는 함수
async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type
        },
    };
}

// 6. 결과를 화면에 자연스럽게 타이핑하듯 표시하는 함수
function displayResult(text) {
    // Gemini가 생성한 텍스트에서 제목과 설명을 분리합니다.
    const lines = text.split('\n');
    let flowerName = "이름을 찾지 못했어요";
    let description = text; 

    if (lines.length > 0) {
        const potentialName = lines[0].replace(/\*\*/g, '').replace(/##/g, '').trim();
        if (potentialName.length < 20) {
            flowerName = potentialName;
            description = lines.slice(1).join('\n').trim();
        }
    }
    
    nameDisplay.textContent = `🌸 ${flowerName}`;

    let i = 0;
    descriptionDisplay.textContent = "";
    function typeWriter() {
        if (i < description.length) {
            descriptionDisplay.textContent += description.charAt(i);
            i++;
            setTimeout(typeWriter, 25);
        }
    }
    typeWriter();
}
