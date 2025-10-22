let questions = [];
let currentIndex = 0;
let score = 0;
let timer = 300;
let timerInterval;
let selectedOption = null;

// Fetch questions
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data.sort(() => 0.5 - Math.random()).slice(0, 30);
    document.getElementById("total").textContent = questions.length;
  });

const startPage = document.getElementById("start-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");
const questionContainer = document.getElementById("question-container");
const progressBar = document.getElementById("progress-bar");
const timeEl = document.getElementById("time");
const nextBtn = document.getElementById("next-btn");

document.getElementById("start-btn").addEventListener("click", () => {
  startPage.classList.remove("active");
  quizPage.classList.add("active");
  startTimer();
  renderQuestion();
});

function startTimer() {
  timerInterval = setInterval(() => {
    timer--;
    timeEl.textContent = timer;
    if (timer <= 0) finishQuiz();
  }, 1000);
}

function renderQuestion() {
  const q = questions[currentIndex];
  document.getElementById("current").textContent = currentIndex + 1;
  progressBar.style.width = `${((currentIndex) / questions.length) * 100}%`;

  questionContainer.innerHTML = `
    <h4 class="mb-4">${q.question}</h4>
    <div id="options" class="d-grid gap-3"></div>
  `;

  const optionsDiv = document.getElementById("options");
  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary text-start w-100 p-3 option-btn";
    btn.innerHTML = option;
    btn.addEventListener("click", () => selectOption(btn, option));
    optionsDiv.appendChild(btn);
  });
}

function selectOption(btn, option) {
  document.querySelectorAll(".option-btn").forEach(b => {
    b.classList.remove("option-selected");
  });

  btn.classList.add("option-selected");
  selectedOption = option;
}

nextBtn.addEventListener("click", () => {
  if (!selectedOption) return alert("Please select an option!");

  if (selectedOption === questions[currentIndex].answer) score++;

  currentIndex++;
  if (currentIndex < questions.length) {
    selectedOption = null;
    renderQuestion();
  } else {
    finishQuiz();
  }
});

function finishQuiz() {
  clearInterval(timerInterval);
  quizPage.classList.remove("active");
  resultPage.classList.add("active");
  document.getElementById("score").textContent = score;
}
