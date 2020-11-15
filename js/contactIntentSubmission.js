const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");
const submissionErrorText = document.getElementById("submissionError");
const submissionSuccessText = document.getElementById("submissionSuccess");
const submitBtn = document.getElementById("submit");
const btnStatusIndicator = document.getElementById("btnStatus");

// Development endpoint
// const serverlessApiEndpoint = `http://localhost:9000/sendEmail`;
// Production endpoint
const serverlessApiEndpoint = `/.netlify/functions/sendEmail`;

async function submitContactIntent(e) {
  e.preventDefault();
  submitBtn.disabled = true;
  showButtonLoading(true);
  try {
    // Send submission data to back end
    const [email, message] = getSubmission();
    const res = await fetch(serverlessApiEndpoint, {
      method: "POST",
      body: JSON.stringify({ email, message }),
    });

    // Interpret data
    const data = await res.json();

    if (!data.success) {
      // Fail
      submitBtn.disabled = false;
      if (res.status === 400) {
        const unknownErrorMsg =
          "Please double check your submission for errors and try again.";
        showValidationText(data.error || unknownErrorMsg, "fail");
      } else {
        throw Error();
      }
    } else {
      // Success!
      showValidationText("Submission successful!", "success");
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
    console.error(err);

    // Most likely a network request timeout
    const caughtErrorMsg = "Unable to submit right now... try again later.";
    showValidationText(caughtErrorMsg, "fail");

    submitBtn.disabled = false;
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
  const Text = capitalizeFirstLetter(text);
  if (type === "success") {
    submissionErrorText.classList.add("d-none");
    submissionErrorText.innerText = "";

    submissionSuccessText.classList.remove("d-none");
    submissionSuccessText.innerText = Text;
  } else if (type === "fail") {
    submissionErrorText.classList.remove("d-none");
    submissionErrorText.innerText = Text;

    submissionSuccessText.classList.add("d-none");
    submissionSuccessText.innerText = "";
  }
}

function showButtonLoading(loading = false) {
  const readyBtn = `<i class="far fa-paper-plane"></i>`;
  const loadingBtn = `<div class="spinner-border spinner-border-sm" role="status">
    <span class="sr-only">Loading...</span>
  </div>`;

  btnStatusIndicator.innerHTML = loading ? loadingBtn : readyBtn;
}
