import { google } from "googleapis";
import path from "path";
import { promisify } from "util";

export async function saveNomination(data: any) {
  const auth = new google.auth.GoogleAuth({
    keyFile: "/app/secret/biedubot-312c6f1e5bea.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = process.env.GOOGLE_SHEETS_ID; // ← мы зададим это в .env

  const row = [
    new Date().toISOString(),
    data.authorFullname || "",
    data.authorSchool || "",
    data.colleagueFullName || "",
    data.colleagueSchool || "",
    data.colleaguePosition || "",
    data.description || "",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}
