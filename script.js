
let userAnswers = [];
// DOM elements
const startBtn = document.getElementById("start-btn");
const resultPage = document.getElementById("result-page");
const startPage = document.getElementById("start-page");
const quizPage = document.getElementById("quiz-page");
const questionContainer = document.getElementById("question-container");
const nextBtn = document.getElementById("next-btn");
const progressBar = document.getElementById("progress-bar");
const timeEl = document.getElementById("time");

const totalMinutes = Math.floor((QUIZ_SETTINGS?.TOTAL_TIME || 300) / 60);
document.getElementById("total_time").textContent = `${totalMinutes} minutes`;


// Fetch questions
async function fetchQuestions() {
  const { data, error } = await supabase.from("questions").select("*").limit(4);

  if (error) {
    console.error("Error fetching questions:", error.message);
    return [];
  }

  console.log(" Questions fetched:", data);

  return data;
}



// === Start Quiz Button (with form validation) ===
document.getElementById("start-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  console.log(" Start button clicked!");


  const requiredFields = document.querySelectorAll("#user-form [required]");
  let allFilled = true;

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      field.classList.add("is-invalid");
      allFilled = false;
    } else {
      field.classList.remove("is-invalid");
    }
  });

  if (!allFilled) {
    alert("Please fill in all required fields before starting the quiz.");
    return;
  }

 
  try {
    questions = await fetchQuestions();



    if (!questions || questions.length === 0) {
      alert("No questions found in the database!");
      return;
    }

    console.log(`📋 Loaded ${questions.length} questions`);
   document.getElementById("quiz-total").textContent =questions.length ;
   console.log("total questions in render function: " + document.getElementById("quiz-total").textContent);
  } catch (err) {
    console.error(" Error fetching questions:", err);
    alert("Failed to load questions. Please try again later.");
    return;
  }


  startPage.classList.remove("active");
  startPage.style.display = "none";
  quizPage.style.display = "block";

  currentIndex = 0;
  score = 0;
  startTimer();
  renderQuestion();
});



function startTimer() {
  timerInterval = setInterval(() => {
    timer--;

    // Convert total seconds to minutes and seconds
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    // Format with leading zero (e.g., 04:09)
    timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    if (timer <= 0) finishQuiz();
  }, 1000);
}

// === Render Question ===
function renderQuestion() {
  
  const q = questions[currentIndex];
  document.getElementById("current").textContent = currentIndex + 1;

  // Reset selected option
  selectedOption = null;

  // Update progress for questions (if enabled)
  if (QUIZ_SETTINGS.SHOW_PROGRESS_BAR) {
    const questionProgress = ((currentIndex) / questions.length) * 100;
    progressBar.style.width = `${questionProgress}%`;
  }

  // Render question text
  questionContainer.innerHTML = `
    <h4 class="mb-4">${q.question}</h4>
    <div id="options" class="d-grid gap-3"></div>
  `;

  const optionsDiv = document.getElementById("options");

  if (Array.isArray(q.options) && q.options.length > 0) {
    // Multiple choice
    q.options.forEach((option) => {
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-primary text-start w-100 p-3 option-btn";
      btn.innerHTML = option;
      btn.addEventListener("click", () => selectOption(btn, option));
      optionsDiv.appendChild(btn);
    });
  } else {
    // Open-ended question
    const textarea = document.createElement("textarea");
    textarea.className = "form-control";
    textarea.id = "text-answer";
    textarea.rows = 4;
    textarea.placeholder = "Write your answer here...";
    textarea.addEventListener("input", (e) => {
      selectedOption = e.target.value.trim();



       userAnswers[currentIndex] = {
    question_no: currentIndex + 1,
    question: q.question,
    selectedOption: selectedOption,
    correctAnswer: null, // open-ended, no correct answer
  };

    });
    optionsDiv.appendChild(textarea);
  }
}

// === Select Option ===
function selectOption(btn, option) {
  document.querySelectorAll(".option-btn").forEach((b) => {
    b.classList.remove("option-selected");
  });
  btn.classList.add("option-selected");
  selectedOption = option;

   const q = questions[currentIndex];
  userAnswers[currentIndex] = {
    question_no: currentIndex + 1,
    question: q.question,
    selectedOption: option,
    correctAnswer: q.answer || null, // optional (if quiz has correct answers)
  };
}

// === Next Button ===
nextBtn.addEventListener("click", () => {
  const q = questions[currentIndex];

  if (!selectedOption || selectedOption === "") {
    alert("Please provide your answer!");
    return;
  }

  // Score only if answer exists
  if (q.options && q.answer && selectedOption === q.answer) {
    score++;
    console.log("Score is " + score);
  }

  currentIndex++;
  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
});

// // === Finish Quiz ===
// function finishQuiz() {
//   clearInterval(timerInterval);
//   quizPage.classList.remove("active");
//   resultPage.classList.add("active");
//   document.getElementById("score").textContent = score;

// }

async function finishQuiz() {
  clearInterval(timerInterval);

  const userInfo = {
    email: document.getElementById("email").value,
    name: document.getElementById("name").value,
    mobile: document.getElementById("mobile").value,
    designation: document.getElementById("designation").value,
    jurisdiction: document.getElementById("jurisdiction").value,
    experience: document.getElementById("experience").value,
    aiUse: document.getElementById("ai-use").value,
    civilCases: document.getElementById("civil-cases").value,
    articles: document.getElementById("articles").value,
    laws: getSelectedLaws(), // function to read checked boxes
    timeTasks: document.getElementById("time-tasks").value,
    expertise: document.getElementById("expertise").value,
    features: document.getElementById("features").value,
    score: score
  };
console.log("userAnswers before mapping:", userAnswers);

  // Example: your answers array
  const responses = userAnswers.map((r, i) => ({
    question_no: i + 1,
    question: r.question,
    selected: r.selectedOption,
    correct: r.correctAnswer,
  }));

  // Save in Supabase
  await saveQuizData(userInfo, responses);

quizPage.classList.remove("active");
quizPage.style.display = "none";

resultPage.classList.add("active");
resultPage.style.display = "block";

 document.getElementById("score").textContent = score;

}

function getSelectedLaws() {
  return Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
    .map(el => el.value);
}


// // Start quiz
// startBtn.addEventListener("click", async () => {
//   console.log("🎯 Start button clicked!");

//   questions = await fetchQuestions();

//   if (questions.length === 0) {
//     alert("No questions found!");
//     return;
//   }

//   startPage.classList.remove("active");
//   startPage.style.display = "none";
//   quizPage.style.display = "block";

//   showQuestion();
// });

// function showQuestion() {
//   const q = questions[currentIndex];
//   questionContainer.innerHTML = `
//     <h4>${q.question}</h4>
//     ${q.options
//       .map(
//         (opt, i) =>
//           `<button class="btn btn-outline-primary d-block w-100 mb-2 option-btn">${opt}</button>`
//       )
//       .join("")}
//   `;
// }
