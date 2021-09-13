const SECRET = '[REDACTED]'

function adjust(e) {
  const form = FormApp.openById('[REDACTED]')
  const items = form.getItems()
  const lastResponse = e.response

  const email = lastResponse.getRespondentEmail()

  const lowerBoundRes = lastResponse.getResponseForItem(items[0])
  const upperBoundRes = lastResponse.getResponseForItem(items[1])
  
  const lowerBound = lowerBoundRes ? lowerBoundRes.getResponse() : 1
  const upperBound = upperBoundRes ? upperBoundRes.getResponse() : -1

  if (!isMemberOf(email, 'tbp.officers@umich.edu')) return;

  return UrlFetchApp.fetch('http://cluster-manage.tbpmi.ga:1885', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        secret: SECRET,
        lowerBound,
        upperBound,
      })
    })
}

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
