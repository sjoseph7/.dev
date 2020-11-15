require("dotenv").config();
const { MAILGUN_API_KEY, MAILGUN_DOMAIN, EMAIL_TO } = process.env;

const mailgun = require("mailgun-js");
const mg = mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });

// Light-weight wrapper around netlify callback function
function replyWith(callback) {
  // Development headers
  const headers = {
    // ! Uncomment these during development ! //
    // "Access-Control-Allow-Origin": "*",
    // "Access-Control-Allow-Headers":
    //   "Origin, X-Requested-With, Content-Type, Accept",
  };

  return function (error, data) {
    // Response boilerplate
    const response = {
      statusCode: error ? 400 : 200,
      headers,
      body: JSON.stringify({
        success: !error,
        data,
        error,
      }),
    };

    return callback(null, response);
  };
}

exports.handler = function (event, context, callback) {
  const { email, message } = JSON.parse(event.body);

  const reply = replyWith(callback);

  // Confirm email address is valid
  if (!isValidEmail(email)) return reply("Email address is not valid.");
  // return callback(null, {
  //   statusCode: 400,
  //   headers,
  //   body: JSON.stringify({
  //     success: false,
  //     data: { email, message },
  //     error: "Email address is not valid.",
  //   }),
  // });

  // Confirm message is no longer than 10000 characters
  if (message.length > 10000)
    return reply("Message exceeds 10000 character limit.");

  // Email payload
  const emailPayload = {
    /**
     * Static 'from' address that can be
     *    whitelisted in spam filter
     */
    from: "contact-me@sjoseph7.dev",
    to: EMAIL_TO,
    subject: "'Contact Me' Submission from sjoseph7.dev",
    text: `${email}: ${message}`,
  };

  function mailgunCallback(error, body) {
    // Handle Error
    if (error) console.error("MAILGUN_ERROR:", error);

    // Respond to request
    return reply(
      error &&
        "Your submission was not accepted. Your email address might be invalid, please try another one.",
      { email, message }
    );
  }

  // Send email
  mg.messages().send(emailPayload, mailgunCallback);
};

function isValidEmail(email) {
  // Help from -> https://www.w3resource.com/javascript/form/email-validation.php
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    email
  );
}
