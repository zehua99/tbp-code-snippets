/**
 * Automatically send the background check requests to the Shared Service Center
 * 
 * @trigger Weekly time trigger
 */
function submitBgcRequests() {
  // Locate the spreadsheet
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = spreadsheet.getActiveSheet()
  const lastRow = sheet.getLastRow()
  const rows = []
  const rowsIdx = []
  for (let i = 2; i <= lastRow; i++) {
    const row = sheet.getRange(i, 2, 1, 6).getValues()[0]
    // Find the requests that haven't been processed yet.
    if (!row[row.length - 1].startsWith('yes')) {
      rowsIdx.push(i)
      rows.push(row.slice(0, 5))
    }
  }

  if (rows.length === 0) return

  // Create a folder under the same path as the spreadsheet to stored the sent requests.
  const file = DriveApp.getFileById(spreadsheet.getId())
  const folders = file.getParents()
  let folder = null
  while (folders.hasNext()){
    folder = DriveApp.getFolderById(folders.next().getId())
  }
  if (!folder) return
  const children = folder.getFoldersByName('Automated Requests')
  if (children.hasNext()) {
    folder = DriveApp.getFolderById(children.next().getId())
  } else {
    folder = folder.createFolder('Automated Requests')
  }
  
  // Generate the CSV content
  let csvStr = '"Email Address","First Name","Last Name","Middle Name","Uniqname"\n'
  csvStr += rows.map(row => (
    row.map(v => `"${v}"`).join(',')
  )).join('\n')

  const filename = `TBP_Background_Check_Requests_${Date.now()}.csv`
  const csv = folder.createFile(filename, csvStr)

  // Send out the email with the CSV as attachment
  GmailApp.sendEmail(
    'ssc.hr.recruiting.employment@umich.edu',
    '[TBP] Tau Beta Pi / K12 Outreach - BACKGROUND CHECK',
    `Hello,

We would like background checks for our members listed in the attached spreadsheet. As in the past, we will have additional requests for background checks as the semester progresses. We will keep you updated as we receive those additional requests.

Thank you for your help!

Best Regards,

TBP K-12 Outreach Officers
tbp.k12outreach@umich.edu`,
    {
      from: 'tbp.k12outreach@umich.edu',
      cc: 'tbp.k12outreach@umich.edu',
      attachments: [csv.getAs('text/csv')]
    }
  )

  // Mark form submissions as processed.
  for (const idx of rowsIdx) {
    sheet.getRange(idx, 7).setValue('yes - automated')
  }
}
