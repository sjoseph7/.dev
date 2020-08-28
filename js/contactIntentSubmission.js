const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");
const submissionErrorText = document.getElementById("submissionError");
const submissionSuccessText = document.getElementById("submissionSuccess");
const submitBtn = document.getElementById("submit");
const btnStatusIndicator = document.getElementById("btnStatus");
const backEndUri = `https://sjoseph7-dev-back-end.herokuapp.com`;

fetch(`${backEndUri}/api/v1/page-views`, { method: "POST" });

async function submitContactIntent() {
  submitBtn.disabled = true;
  showButtonLoading(true);
  try {
    // Send submission data to back end
    const [email, message] = getSubmission();
    const res = await fetch(`${backEndUri}/api/v1/submissions`, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message })
    });

    // Interpret data
    const data = await res.json();
    if (!data.success) {
      // Fail
      submitBtn.disabled = false;
      showValidationText(capitalizeFirstLetter(data.error), "fail");
    } else {
      // Success!
      showValidationText("Submission successful!", "success");
      clearSubmissionForm();
      submitBtn.disabled = true;

      // Close Modal
      setTimeout(() => {
        $("#contactInfoModal").modal("hide");
        setTimeout(() => {
          resetSubmissionForm();
        }, 250); // Delay added so content doesn't update while modal is fading out
      }, 1500);
    }
  } catch (err) {
    // Timeout
    showValidationText(
      "Unable to submit aright now... try again later.",
      "fail"
    );
  } finally {
    showButtonLoading(false);
  }
}

function getSubmission() {
  return [emailInput.value, messageInput.value];
}

function clearSubmissionForm() {
  emailInput.value = "";
  messageInput.value = "";
}

function resetSubmissionForm() {
  submissionSuccessText.innerText = "";
  submissionErrorText.innerText = "";
  submitBtn.disabled = false;
  clearSubmissionForm();
  showButtonLoading(false);
}

function capitalizeFirstLetter(word = "") {
  return `${(word.slice(0, 1) || "").toUpperCase()}${word.slice(1)}`;
}

function showValidationText(text, type = "success") {
  if (type === "success") {
    submissionErrorText.classList.add("d-none");
    submissionErrorText.innerText = "";

    submissionSuccessText.classList.remove("d-none");
    submissionSuccessText.innerText = text;
  } else if (type === "fail") {
    submissionErrorText.classList.remove("d-none");
    submissionErrorText.innerText = text;

    submissionSuccessText.classList.add("d-none");
    submissionSuccessText.innerText = "";
  }
}

function showButtonLoading(loading = false) {
  if (!loading) {
    btnStatusIndicator.innerHTML = '<i class="far fa-paper-plane"></i>';
  } else {
    btnStatusIndicator.innerHTML = `<div class="spinner-border spinner-border-sm" role="status">
      <span class="sr-only">Loading...</span>
    </div>`;
  }
}
