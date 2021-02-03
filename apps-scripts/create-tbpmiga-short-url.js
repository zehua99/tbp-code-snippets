/**
 * Create or update the tbpmi.ga short URL upon user's form submission
 * 
 * @trigger Form submission
 */
async function updateShortURL(e) {
  const SECRET = '[REDACTED]'

  // Read form data
  const lastResponse = e.response
  const lastAnswers = lastResponse.getItemResponses()

  const email = lastResponse.getRespondentEmail()
  const destination = lastAnswers[0].getResponse()
  const key = lastAnswers[1].getResponse()

  // Check whether the user is an officer
  let isOfficer = isMemberOf(email, 'tbp.officers@umich.edu')

  // Check whether the user is an undergrad active
  if (isOfficer || isMemberOf(email, 'tbp.ug.actives@umich.edu')) {
    return UrlFetchApp.fetch('https://tbpmi.ga/_update', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        secret: SECRET,
        key,
        destination,
        isOfficer,
      })
    })  
  }
}

// Helper function that checks whether a user belongs to a group.
// Note that the App Script authorizer must be a member of the group,
// otherwise it will not return the correct answer.
function isMemberOf(email, groupEmail) {
  const group = GroupsApp.getGroupByEmail(groupEmail)
  if (group.hasUser(email)) {
    return true
  }
  for (const subgroup of group.getGroups()) {
    if (isMemberOf(email, subgroup.getEmail())) {
      return true
    }
  }
  return false
}
