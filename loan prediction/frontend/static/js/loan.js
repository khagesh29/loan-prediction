document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submit-btn");
  const statusDiv = document.getElementById("loan-status");

  submitBtn.addEventListener("click", async () => {

    // Collect data exactly as Flask expects
    const data = {
      education: document.getElementById("education").value,        // Graduate / Not Graduate
      employment: document.getElementById("employment").value,      // Self Employed / Salaried / Unemployed
      credit: document.getElementById("credit").value,              // 300-500 etc
      income: Number(document.getElementById("income").value),
      loan_amount: Number(document.getElementById("loan_amount").value),
      duration: Number(document.getElementById("duration").value)
    };

    // Basic frontend validation
    if (!data.income || !data.loan_amount || !data.duration) {
      statusDiv.innerHTML = "⚠️ Please fill all required numeric fields.";
      statusDiv.style.color = "orange";
      return;
    }

    statusDiv.innerHTML = "⏳ Predicting loan status...";
    statusDiv.style.color = "white";

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.status === 1) {
        statusDiv.innerHTML = `✅ <b>Loan Approved</b><br>Confidence: ${result.confidence}%`;
        statusDiv.style.color = "limegreen";
      } else {
        statusDiv.innerHTML = `❌ <b>Loan Rejected</b><br>Confidence: ${result.confidence}%`;
        statusDiv.style.color = "red";
      }

    } catch (error) {
      console.error("Prediction error:", error);
      statusDiv.innerHTML = "❌ Server error. Please try again.";
      statusDiv.style.color = "red";
    }
  });
});
