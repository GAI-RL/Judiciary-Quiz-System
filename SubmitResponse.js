


async function saveQuizData(userInfo, responses) {
  const nextBtn = document.getElementById("next-btn");

  // Step 1: Show starting alert
  showAlert("info", "Submitting your response... Please wait!");

  // Disable button
  if (nextBtn) {
    nextBtn.disabled = true;

    nextBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Submitting...`;
  }

  try {
    const { data, error } = await supabase
      .from("quiz_responses")
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
          laws: userInfo.laws,
          time_tasks: userInfo.timeTasks,
          expertise: userInfo.expertise,
          features: userInfo.features,
          responses: responses,
          total_score: userInfo.score,
          pdf_url: userInfo.caseFileUrl,
        },
      ]);

    // Allow alert visibility
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (error) {
      console.error(" Error saving quiz data:", error.message);
      showAlert("error", "Failed to save your responses. Please try again.");
      throw new Error(error.message);
    }

    console.log(" Quiz data saved successfully:", data);
    showAlert("success", "Your quiz has been submitted successfully!");

  } catch (err) {
    console.error(" Unexpected error:", err);
    showAlert("error", "Something went wrong while saving. Please try again later.");
    throw err; // rethrow to let finishQuiz handle it
  } finally {
    // Restore button
    // if (nextBtn) {
    //   nextBtn.disabled = false;
    //   nextBtn.innerHTML = "Submit";
    // }
  }
}

// Export globally
window.saveQuizData = saveQuizData;
