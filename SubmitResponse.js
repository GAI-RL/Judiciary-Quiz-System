// submitResponses.js
async function saveQuizData(userInfo, responses) {
  try {
    // Insert into your Supabase table
    const { data, error } = await supabase
      .from("quiz_responses") // name of your table
      .insert([
        {
          email: userInfo.email,
          name: userInfo.name,
          mobile: userInfo.mobile,
          designation: userInfo.designation,
          jurisdiction: userInfo.jurisdiction,
          experience: userInfo.experience,
          ai_use: userInfo.aiUse,
          civil_cases: userInfo.civilCases,
          articles: userInfo.articles,
          laws: userInfo.laws, // maybe a string or array
          time_tasks: userInfo.timeTasks,
          expertise: userInfo.expertise,
          features: userInfo.features,
          responses: responses, // jsonb field
         // submitted_at: new Date().toISOString(),
         total_score: userInfo.score
        },
      ]);

    if (error) {
      console.error(" Error saving quiz data:", error.message);
      alert("Failed to save quiz responses. Please try again.");
      return;
    }

    console.log(" Quiz data saved successfully:", data);
    alert("Your quiz responses have been submitted successfully!");
  } catch (err) {
    console.error(" Unexpected error:", err);
  }
}

// Export it globally
window.saveQuizData = saveQuizData;
