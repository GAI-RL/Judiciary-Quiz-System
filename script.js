
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


 quizPage.classList.remove("active");
quizPage.style.display = "none";

 resultPage.classList.remove("active");
resultPage.style.display = "none";


// Fetch questions
async function fetchQuestions() {
 // const { data, error } = await supabase.from("questions").select("*");
 // const { data, error } = await supabase
 //  .from("questions")
 //  .select("*")
 //  .order("id", { ascending: false }).limit(2);

  const { data, error } = await supabase
    .from("questions")
    .select("*");

  if (error) {
    console.error("Error fetching questions:", error);
    return [];
  }

  //  Shuffle the questions randomly (Fisher–Yates)
  data.sort(() => Math.random() - 0.5);

  //  Optional: limit how many you want
  return data.slice(0, data.length); // show only 5 random questions


 
}



// === Start Quiz Button (with form validation) ===
document.getElementById("start-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  console.log(" Start button clicked!");
 // Count only MCQs that have correct answers
// totalScorableQuestions = questions.filter(q => 
//   Array.isArray(q.options) && q.options.length > 0 && q.answer
// ).length;

// document.getElementById("score-total").textContent = totalScorableQuestions;



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
   
    showAlert("error", "Please fill in all required fields before starting the quiz!")
   
   return;
  }

 
  try {
    questions = await fetchQuestions();



    if (!questions || questions.length === 0) {
     // alert("No questions found in the database!");
       showAlert("warning", "No questions found in the database!");
      return;
    }

    console.log(`📋 Loaded ${questions.length} questions`);
   document.getElementById("quiz-total").textContent =questions.length ;
   console.log("total questions in render function: " + document.getElementById("quiz-total").textContent);
  } catch (err) {
    console.error(" error fetching questions:", err);
   
     showAlert("error", "Failed to load questions. Please try again later");
    return;
  }

  startPage.classList.remove("active");
startPage.style.display = "none";

quizPage.classList.add("active");
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
    
// Update unit dynamically
const timeUnit = document.getElementById("time-unit");
if (timer < 60) {
  timeUnit.textContent = "seconds";
} else {
  timeUnit.textContent = "minutes";
}

    if (timer <= 0)
      {clearInterval(timerInterval); 
         finishQuiz();}
  }, 1000);
}

// === Render Question ===
function renderQuestion() {
  
  const q = questions[currentIndex];
  document.getElementById("current").textContent = currentIndex + 1;
//   if (currentIndex === questions.length - 1) {
//   nextBtn.textContent = "Submit";
//   nextBtn.classList.remove("btn-primary");
//   nextBtn.classList.add("btn-success");
// } else {
//   nextBtn.textContent = "Next";
//   nextBtn.classList.remove("btn-success");
//   nextBtn.classList.add("btn-primary");
// }
if (currentIndex === questions.length - 1) {
  // Last question → Submit button with check icon
  nextBtn.innerHTML = `Submit <i class="bi bi-check-circle ms-1"></i>`;
  nextBtn.classList.remove("btn-primary");
  nextBtn.classList.add("btn-success");
} else {
  // Otherwise → Next button with forward arrow
  nextBtn.innerHTML = `Next <i class="bi bi-arrow-right-circle ms-1"></i>`;
  nextBtn.classList.remove("btn-success");
  nextBtn.classList.add("btn-primary");
}

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
 if (
  q.question.toLowerCase().includes("upload your case file") ||
  q.type === "file"
) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "case-file-upload";
  fileInput.className = "form-control mb-3";
  fileInput.accept = ".pdf,.doc,.docx,.txt,.png,.jpg";

  const gistArea = document.createElement("textarea");
  gistArea.id = "case-gist";
  gistArea.className = "form-control";
  gistArea.rows = 4;
  gistArea.placeholder = "Write a brief gist of your case here...";

  
  function updateFileAnswer() {
    const file = fileInput.files[0];
    const gist = gistArea.value.trim();

    // Only set if at least one is provided
    if (file || gist) {
      selectedOption = { file, gist };
      userAnswers[currentIndex] = {
        question_no: currentIndex + 1,
        question: q.question,
        selectedOption,
        correctAnswer: null,
        type: q.type || "file",
      };
    }
  }

  fileInput.addEventListener("change", updateFileAnswer);
  gistArea.addEventListener("input", updateFileAnswer);

  optionsDiv.appendChild(fileInput);
  optionsDiv.appendChild(gistArea);
  return;
}


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
const backBtn = document.getElementById("back-btn");

backBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();

    // restore previously selected answer if exists
    const previousAnswer = userAnswers[currentIndex];
    if (previousAnswer) {
      selectedOption = previousAnswer.selectedOption;

      // highlight previously chosen option
      const optionButtons = document.querySelectorAll(".option-btn");
      optionButtons.forEach(btn => {
        if (btn.textContent.trim() === selectedOption) {
          btn.classList.add("option-selected");
        }
      });

      // restore text answers if applicable
      const textarea = document.getElementById("text-answer");
      if (textarea && typeof selectedOption === "string") {
        textarea.value = selectedOption;
      }
    }
  }
});

// === Next Button ===
nextBtn.addEventListener("click", () => {
  const q = questions[currentIndex];


    const questionContainer = document.getElementById("question-container");

  if (!selectedOption || selectedOption === "") {
    showFieldError(questionContainer, "Please select an answer before continuing.");
    return;
  }

  // Score only if answer exists
  if (q.options && q.answer && selectedOption === q.answer) {
    score += 2;
    console.log("Score is " + score);
  }

  currentIndex++;
  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
});





function getSelectedLaws() {
  return Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
    .map(el => el.value);
}

async function saveFile() {
  const caseAnswer = userAnswers.find((ans) => ans.type === "file");

  if (!caseAnswer || !caseAnswer.selectedOption?.file) {
 
    showAlert("error", "No file upload question found or no file selected!");

    return null;
  }

  const file = caseAnswer.selectedOption.file;
  const fileName = `${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from("case_files")
    .upload(fileName, file);

  if (error) {
    console.error(" File upload failed:", error);
    showAlert("error", "File upload failed:" + error);

    return null;
  }

  const { data: urlData } = supabase.storage
    .from("case_files")
    .getPublicUrl(fileName);

  const fileUrl = urlData.publicUrl;
  caseAnswer.selectedOption.fileUrl = fileUrl;
  console.log(" File uploaded successfully:", fileUrl);
  showAlert("info", "File uploaded successfully");

  return fileUrl;
}
function showFieldError(container, message) {
  if (!container) return; // safety check
  let errorDiv = container.querySelector(".error-message");

  // If .error-message doesn't exist (e.g., dynamically generated question)
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "error-message text-danger small mt-1";
    container.appendChild(errorDiv);
  }

  errorDiv.textContent = message || "";
}

function showAlert(type, message) {
  const container = document.getElementById("alert-container");
  if (!container) {
    console.warn("⚠️ Alert container not found in DOM");
    return;
  }

  const icons = {
    success: '<i class="bi bi-check-circle-fill"></i>',
    error: '<i class="bi bi-x-circle-fill"></i>',
    warning: '<i class="bi bi-exclamation-triangle-fill"></i>',
    info: '<i class="bi bi-info-circle-fill"></i>'
  };

  // Clear previous alerts (optional — can remove if you want stacking)
  container.innerHTML = "";

  const alert = document.createElement("div");
  alert.className = `custom-alert ${type}`;
  alert.innerHTML = `${icons[type] || ""} <span>${message}</span>`;

  // Add smooth fade-in
  alert.style.opacity = "0";
  alert.style.transition = "opacity 0.4s ease";

  container.appendChild(alert);

  // Trigger fade-in after slight delay
  requestAnimationFrame(() => {
    alert.style.opacity = "1";
  });

  // Timing constants
  const DISPLAY_DURATION = 5000; // time before fade starts
  const FADE_DURATION = 500; // fade-out time

  setTimeout(() => {
    alert.style.opacity = "0"; // start fade-out
    setTimeout(() => alert.remove(), FADE_DURATION);
  }, DISPLAY_DURATION);
}




async function finishQuiz() {
  const nextBtn = document.getElementById("next-btn");

  // Disable button to prevent double clicks
  if (nextBtn) {
    nextBtn.disabled = true;
    questionContainer.disabled =true;
    nextBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Submitting...`;
  }
   if (quizPage) {
    quizPage.style.pointerEvents = "none";
    quizPage.style.opacity = "0.6";
  }

  try {
  let fileUrl = null;

// Check if user has a file-type question AND uploaded a file
const fileAnswer = userAnswers.find(ans => ans.type === "file" && ans.selectedOption?.file);

if (fileAnswer) {
  showAlert("info", "Uploading your file...");
  fileUrl = await saveFile();
  
  if (fileUrl) {
    console.log(" File uploaded:", fileUrl);
    showAlert("success", "File uploaded successfully!");
    await new Promise(resolve => setTimeout(resolve, 2000));
  } else {
    showAlert("warning", "File was not uploaded properly.");
  }
} else {
  console.log(" No file question found or user did not upload a file — skipping upload.");
}
    // Step 3: Prepare quiz data
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
      laws: getSelectedLaws(),
      timeTasks: document.getElementById("time-tasks").value,
      expertise: document.getElementById("expertise").value,
      features: document.getElementById("features").value,
      score: score,
      caseFileUrl: fileUrl,
    };

    const responses = userAnswers.map((r, i) => ({
      question_no: i + 1,
      question: r.question,
      selected: r.selectedOption,
      correct: r.correctAnswer,
    }));

    // Step 4: Save quiz data (alerts shown inside)
    await saveQuizData(userInfo, responses);

    quizPage.classList.remove("active");
    quizPage.style.display = "none";
    resultPage.classList.add("active");
    resultPage.style.display = "block";
    document.getElementById("score").textContent = score;
   // document.getElementById("score-total").textContent = totalScorableQuestions;

  } catch (err) {
    console.error(" Error finishing quiz:", err);
    showAlert("error", "An error occurred while finishing your quiz. Please try again.");
  } finally {
    clearInterval(timerInterval);
  }
}
// document.querySelectorAll('#user-form input, #user-form textarea').forEach(field => {
//   field.addEventListener('input', () => {
//     const max = field.getAttribute('maxlength');
//     if (max && field.value.length > max) {
//       showAlert("warning", `${field.previousElementSibling.textContent.trim()} cannot exceed ${max} characters.`);
//       field.value = field.value.slice(0, max); // Trim extra input
//     }
//   });
// });





