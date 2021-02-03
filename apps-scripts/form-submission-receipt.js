/**
 * Automatically send out an email to those who submit the form response
 * 
 * @trigger Form submission
 */
function sendReceipt(e) {
  // Read form data
  const lastResponse = e.response
  const lastAnswers = lastResponse.getItemResponses()

  const name = lastAnswers[0].getResponse()
  const email = lastAnswers[1].getResponse()

  GmailApp.sendEmail(
    email,
    '[TBP] Thank you for signing up for our tutoring service',
`Hi ${name},

Thank you for signing up for TBP’s tutoring service. We will reach out to you again once we have a tutoring session that meets your need. In the meantime, please encourage your friends to sign up too at https://tbpmi.ga/AP. Also, feel free to send us an email if you have any questions, either AP-related or about our tutoring events.

Best wishes,

Erik and Simon
K-12 Outreach Officers, Tau Beta Pi-Michigan Gamma
tbp.k12outreach@umich.edu

Atishay and Angela
Campus Outreach Team, Tau Beta Pi-Michigan Gamma
tbp.campusoutreach@umich.edu`,
    {
      from: 'tbp.k12outreach@umich.edu',
      name: 'Outreach Quadruplets of TBP MI-G'
    }
  )
}
