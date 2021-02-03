# TBP Code Snippets
This repository is created to document some of the techniques that are used in the engineering honor society [Tau Beta Pi (MI-Gamma)](https://tbp.engin.umich.edu)’s day-to-day operation, especially in its K-12 outreach activities. We hope that this repo can facilitate our future members’ event planning, and that they can update this repo when the chapter adopts new techniques.

## Google Apps Script
[Apps Script](https://developers.google.com/apps-script) is a useful tool to execute tasks on Google Forms or Sheets.

### Create Google Apps Script
To access a Google Form’s GAS console
1. Go to the form’s editor page.
2. Click on the “More” button right next to the “Send” button.
3. Click on “Script editor”.

### How-tos
* Read data from a form submission. [Link](https://github.com/simonzli/tbp-code-snippets/blob/99d7496ff4cd59df7afa2f6c88b3a0c42c9b4d85/apps-scripts/create-tbpmiga-short-url.js#L10-L15)
* Send emails with attachments or with a different email address. [Link 1](https://github.com/simonzli/tbp-code-snippets/blob/99d7496ff4cd59df7afa2f6c88b3a0c42c9b4d85/apps-scripts/submit-background-check-requests.js#L49-L67), [2](https://github.com/simonzli/tbp-code-snippets/blob/99d7496ff4cd59df7afa2f6c88b3a0c42c9b4d85/apps-scripts/form-submission-receipt.js#L14-L34)
* Check whether a user belongs to a user group. [Link](https://github.com/simonzli/tbp-code-snippets/blob/99d7496ff4cd59df7afa2f6c88b3a0c42c9b4d85/apps-scripts/create-tbpmiga-short-url.js#L38-L49)
* Create a Google Drive folder in a Google Sheet’s parent folder. [Link](https://github.com/simonzli/tbp-code-snippets/blob/99d7496ff4cd59df7afa2f6c88b3a0c42c9b4d85/apps-scripts/submit-background-check-requests.js#L24-L37)
* Create an CSV file. [Link](https://github.com/simonzli/tbp-code-snippets/blob/99d7496ff4cd59df7afa2f6c88b3a0c42c9b4d85/apps-scripts/submit-background-check-requests.js#L39-L46)
* Read data from a spreadsheet. [Link](https://github.com/simonzli/tbp-code-snippets/blob/99d7496ff4cd59df7afa2f6c88b3a0c42c9b4d85/apps-scripts/submit-background-check-requests.js#L7-L20)
* Update data in a spreadsheet. [Link](https://github.com/simonzli/tbp-code-snippets/blob/99d7496ff4cd59df7afa2f6c88b3a0c42c9b4d85/apps-scripts/submit-background-check-requests.js#L69-L73)

### Templates
* Automatically send out an email to those who submit the form response. [Link](https://github.com/simonzli/tbp-code-snippets/blob/master/apps-scripts/form-submission-receipt.js)
* Automatically send the background check requests to the Shared Service Center. [Link](https://github.com/simonzli/tbp-code-snippets/blob/master/apps-scripts/submit-background-check-requests.js)
* Create or update the tbpmi.ga short URL upon user's form submission. [Link](https://github.com/simonzli/tbp-code-snippets/blob/master/apps-scripts/create-tbpmiga-short-url.js)

## Cloudflare Workers
[Cloudflare Workers](https://workers.cloudflare.com) is a serverless execution environment for web applications. We use it mostly for short URL redirection. As of February 2021, it offers a quota of 100,000 free requests per day, which should be more than enough for TBP’s daily operation.

### Templates
* Redirect the user to a webpage given the short URL. [Link](https://github.com/simonzli/tbp-code-snippets/blob/master/cf-workers/tbpmiga-short-url.js)

## Licensed
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. A copy of the license is included in the repository.
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

This license must be included in any derivative work along with notifications of any change from the original source provided here.
