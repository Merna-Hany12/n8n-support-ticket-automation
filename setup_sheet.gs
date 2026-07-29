/**
 * Google Apps Script — Auto-Setup for n8n Support Tickets Workflow
 *
 * How to use:
 *   1. Open your Google Spreadsheet
 *   2. Extensions → Apps Script
 *   3. Paste this entire file, replacing any existing code
 *   4. Click Save (disk icon)
 *   5. In the function dropdown, select "setupAll" → click Run
 *   6. Authorize when prompted (it only accesses your spreadsheet)
 *
 * What it creates:
 *   - "Tickets" tab: 11 columns, formatting, data validation, conditional formatting
 *   - "Errors" tab: 5 columns for the centralized error workflow
 */

// =============================================================
// MAIN ENTRY POINT — Run this function
// =============================================================
function setupAll() {
  setupTicketsSheet();
  setupErrorsSheet();
}

// =============================================================
// TICKETS SHEET
// =============================================================
function setupTicketsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Get or create the Tickets sheet
  let sheet = ss.getSheetByName('Tickets');
  if (!sheet) {
    sheet = ss.insertSheet('Tickets');
  } else {
    sheet.clearContents();
    sheet.clearFormats();
    sheet.clearConditionalFormatRules();
    sheet.getDataRange().clearDataValidations();
  }

  // ── HEADERS ───────────────────────────────────────────────
  const headers = [
    'Ticket ID',       // A — TKT-{timestamp}-{random}
    'Customer Name',   // B — From request payload
    'Email',           // C — From request payload
    'Subject',         // D — From request payload
    'Message',         // E — Full message body
    'Priority',        // F — High | Medium | Low
    'Category',        // G — AI-classified
    'Summary',         // H — AI one-sentence summary
    'Sentiment',       // I — Positive | Neutral | Negative
    'Created Date',    // J — ISO 8601 timestamp
    'Status'           // K — Open | In Progress | Resolved | Closed
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);

  // Header styling
  headerRange
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#1a1a2e')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontSize(11)
    .setFontFamily('Arial');

  // Header border
  headerRange.setBorder(
    true, true, true, true, true, true,
    '#333333', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
  );

  // ── COLUMN WIDTHS ─────────────────────────────────────────
  const widths = [160, 160, 200, 240, 300, 100, 160, 280, 110, 190, 100];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  // ── FREEZE HEADER ROW ─────────────────────────────────────
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 36);

  // ── TEXT WRAPPING on Message (E) and Summary (H) ──────────
  sheet.getRange('E2:E1000').setWrap(true);
  sheet.getRange('H2:H1000').setWrap(true);

  // ── DATA VALIDATION ───────────────────────────────────────

  // Priority (col 6 = F)
  const priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['High', 'Medium', 'Low'], true)
    .setAllowInvalid(false)
    .setHelpText('Priority must be High, Medium, or Low')
    .build();
  sheet.getRange(2, 6, 999, 1).setDataValidation(priorityRule);

  // Sentiment (col 9 = I)
  const sentimentRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Positive', 'Neutral', 'Negative'], true)
    .setAllowInvalid(false)
    .setHelpText('Sentiment must be Positive, Neutral, or Negative')
    .build();
  sheet.getRange(2, 9, 999, 1).setDataValidation(sentimentRule);

  // Status (col 11 = K)
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Open', 'In Progress', 'Resolved', 'Closed'], true)
    .setAllowInvalid(false)
    .setHelpText('Status must be Open, In Progress, Resolved, or Closed')
    .build();
  sheet.getRange(2, 11, 999, 1).setDataValidation(statusRule);

  // ── CONDITIONAL FORMATTING ────────────────────────────────
  const priorityRange = sheet.getRange('F2:F1000');
  const sentimentRange = sheet.getRange('I2:I1000');
  const statusRange    = sheet.getRange('K2:K1000');
  const rules          = [];

  // Priority colors
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('High')
    .setBackground('#f44336').setFontColor('#ffffff').setBold(true)
    .setRanges([priorityRange]).build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Medium')
    .setBackground('#ff9800').setFontColor('#ffffff')
    .setRanges([priorityRange]).build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Low')
    .setBackground('#4caf50').setFontColor('#ffffff')
    .setRanges([priorityRange]).build());

  // Sentiment colors
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Negative')
    .setBackground('#ffcdd2').setFontColor('#b71c1c')
    .setRanges([sentimentRange]).build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Neutral')
    .setBackground('#fff9c4').setFontColor('#f57f17')
    .setRanges([sentimentRange]).build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Positive')
    .setBackground('#c8e6c9').setFontColor('#1b5e20')
    .setRanges([sentimentRange]).build());

  // Status colors
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Open')
    .setBackground('#e3f2fd').setFontColor('#0d47a1')
    .setRanges([statusRange]).build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('In Progress')
    .setBackground('#fff3e0').setFontColor('#e65100')
    .setRanges([statusRange]).build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Resolved')
    .setBackground('#e8f5e9').setFontColor('#2e7d32')
    .setRanges([statusRange]).build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Closed')
    .setBackground('#f5f5f5').setFontColor('#757575')
    .setRanges([statusRange]).build());

  sheet.setConditionalFormatRules(rules);

  // ── ALTERNATING ROW BANDING ───────────────────────────────
  const existingBandings = sheet.getBandings();
  existingBandings.forEach(b => b.remove());

  sheet.getRange(2, 1, 999, headers.length)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);

  Logger.log('Tickets sheet setup complete.');
}

// =============================================================
// ERRORS SHEET (for Centralized Error Workflow)
// =============================================================
function setupErrorsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName('Errors');
  if (!sheet) {
    sheet = ss.insertSheet('Errors');
  } else {
    sheet.clearContents();
    sheet.clearFormats();
  }

  const headers = [
    'Timestamp',      // A — ISO timestamp of error
    'Workflow',       // B — Workflow name
    'Node',           // C — Node where error occurred
    'Error Message',  // D — Error text
    'Input Data'      // E — Stringified JSON of node input
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);

  headerRange
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#b71c1c')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontSize(11);

  headerRange.setBorder(
    true, true, true, true, true, true,
    '#7f0000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
  );

  const widths = [190, 200, 200, 320, 360];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 36);
  sheet.getRange('D2:E1000').setWrap(true);

  Logger.log('Errors sheet setup complete.');

  // ── FINAL ALERT ───────────────────────────────────────────
  SpreadsheetApp.getUi().alert(
    'Google Sheet Setup Complete!\n\n' +
    'Tickets tab: 11 columns, validation, conditional formatting, row banding\n' +
    'Errors tab: 5 columns for centralized error logging\n\n' +
    'Next step:\n' +
    'Copy your Spreadsheet ID from the URL bar and set it as:\n\n' +
    'GOOGLE_SHEET_ID=<your-id-here>'
  );
}
