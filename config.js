
const SUPABASE_CONFIG = {
  URL: "https://esfqdflazhhnuqbcmgdu.supabase.co",
  KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZnFkZmxhemhobnVxYmNtZ2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExODQ5NTUsImV4cCI6MjA3Njc2MDk1NX0.qaBSY9vDB-V-6tao_KO-a-vjKI86ElDVTAKTsZvHpMA",
};

const QUIZ_SETTINGS = {
  TOTAL_TIME: 300,   // total time in seconds (5 minutes)
  TOTAL_QUESTIONS: 30,
  SHOW_PROGRESS_BAR: true,
  RANDOMIZE_QUESTIONS: true,
};


let questions = [];
let currentIndex = 0;
let score = 0;
let timer = QUIZ_SETTINGS.TOTAL_TIME;
let timerInterval;
let selectedOption = null;
