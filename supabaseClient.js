// supabaseClient.js
const supabase = window.supabase.createClient(
  SUPABASE_CONFIG.URL,
  SUPABASE_CONFIG.KEY
);

window.supabaseClient = supabase; // expose globally

// ✅ Wait for DOM to finish before running async test
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const { data, error } = await supabase.from("questions").select("*").limit(5);
    if (error) {
      console.error(" Supabase connection failed:", error.message);
    } else {
      console.log(" Supabase connected successfully!");
      console.log(" Sample data:", data);
         
document.getElementById("total").textContent =
  QUIZ_SETTINGS.TOTAL_QUESTIONS;
  console.log("total questions : " + document.getElementById("total").textContent)
    }
  } catch (err) {
    console.error(" Unexpected error testing Supabase:", err);
  }
});
