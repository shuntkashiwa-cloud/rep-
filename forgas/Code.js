function doPost(e) {
  if (e.postData.contents === "{}") {
    return deleteTriggers();
  } else {
    return makeTrigger(e);
  }
}

function deleteTriggers() {
  const now = new Date();
  const current = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 1000 / 60 / 60 / 24) + Number(new Date(now.getFullYear(), 2, 0).getDate() == 28 && now.getMonth() >= 2);

  let deleteIds = new Set();
  const oldlog = JSON.parse(PropertiesService.getScriptProperties().getProperty('SAVED_TRIGGER_DATA') || "[]");
  let newlog = new Array();
  for (let i = 0; i < oldlog.length; i++) {
    if (oldlog[i][0] >= current) {
      newlog.push(oldlog[i]);
    }
  }
  PropertiesService.getScriptProperties().setProperty('SAVED_TRIGGER_DATA', JSON.stringify(newlog));

  const output = ContentService.createTextOutput(JSON.stringify({ result: "Deleted" }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function makeTrigger(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const a = e.postData.contents;
  const pd = JSON.parse(a)
  let month = 0;
  let sum = 0;
  const days = [0, ...new Array(12).fill(0).map((_, index) => sum += new Date(2024, (index + 1) % 12, 0).getDate())];
  const now = new Date();
  let logg = new Array();
  let wildel = new Set();
  const oldlog = JSON.parse(PropertiesService.getScriptProperties().getProperty('SAVED_TRIGGER_DATA') || "[]");
  let placeold = 0;

  for (let i = 0; i < pd.length; i++) {
    while (days[month + 1] < (pd[i].id + 1)) {
      month += 1;
    }
    let wheen = new Date(now.getFullYear() + Number(month < now.getMonth()), month, pd[i].id + 1 - days[month], 0, 0);
    if ((wheen.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(), 0, 0).getTime()) / 1000 / 60 / 60 / 24 < 7.5) {
      wheen.setHours(Math.floor(pd[i].time / 60) - 1);
      wheen.setMinutes(pd[i].time % 60);
      while (placeold < oldlog.length && oldlog[placeold][0] < pd[i].id) {
        logg.push(oldlog[placeold]);
        placeold += 1;
      }
      let idisfalse = false;
      if (placeold < oldlog.length && oldlog[placeold][0] == pd[i].id) {
        if (oldlog[placeold][1]) {
          wildel.add(oldlog[placeold][1]);
        } else {
          idisfalse = true;
        }
        placeold += 1;
      }
      if ((wheen.getTime() - now.getTime()) / 1000 / 60 > 10) {
        if (pd[i].time !== false && !idisfalse) {
          const trig = ScriptApp.newTrigger('sendMail').timeBased().at(wheen).create();
          logg.push([pd[i].id, trig.getUniqueId()])
        }
      } else if (wheen.getDate() === now.getDate() && now.getHours() < [18, 17][(Math.floor((now.getDay() + 6) % 7 / 4.5))] && !idisfalse) sendMail();
    }
  }
  while (placeold < oldlog.length) {
    logg.push(oldlog[placeold]);
    placeold += 1;
  }
  PropertiesService.getScriptProperties().setProperty('SAVED_TRIGGER_DATA', JSON.stringify(logg));
  
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (wildel.has(triggers[i].getUniqueId())) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  const output = ContentService.createTextOutput(JSON.stringify({ result: "Ok" }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function myfunc() {
  console.log(PropertiesService.getScriptProperties().getProperty('SAVED_TRIGGER_DATA'));
}

function sendMail(e) {
  const props = PropertiesService.getScriptProperties();
  const now = new Date();

  const { gene, rusers } = JSON.parse(UrlFetchApp.fetch(props.getProperty('VERCEL_ENDPOINT'), {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ emoji: '7123456'[now.getDay()] + '\uFE0F\u20E3' }),
    muteHttpExceptions: true,
  }).getContentText());

  if (rusers.length <= 1) { Logger.log('リアクション不足'); return; }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = ss.getSheets()[0];
  const meibo = ss.getSheets()[1].getDataRange().getValues();
  const idToRow = Object.fromEntries(meibo.map((row, i) => [String(row[6]), i]).slice(1));

  const baseIdx = 2026 - 76 - new Date(now.getFullYear(), now.getMonth() - 3, 1).getFullYear();
  const nizus = gene.reduce((acc, c) => {
    const idx = c == null ? -1 : c + baseIdx;
    if (idx >= 0 && idx < 5) acc[idx]++;
    return acc;
  }, [0, 0, 0, 0, 0]);

  const memberRows = rusers.map(id => idToRow[String(id)]).filter(r => r !== undefined).sort((a, b) => a - b);
  const buildRow = r => [meibo[r][0], '-', meibo[r][1], 'No.', meibo[r][2], '氏名', meibo[r][3]];

  formSheet.getRangeList(['C10:I39', 'L10:R39', 'A11', 'A13', 'A15', 'A17', 'A19', 'A21', 'A23', 'A25']).clearContent();

  const leftCount = Math.min(memberRows.length, 30);
  if (leftCount > 0) formSheet.getRange(10, 3, leftCount, 7).setValues(memberRows.slice(0, leftCount).map(buildRow));
  if (memberRows.length > 30) formSheet.getRange(10, 12, memberRows.length - 30, 7).setValues(memberRows.slice(30).map(buildRow));

  nizus.forEach((n, j) => formSheet.getRange(`A${j * 2 + 17}`).setValue(`${n}人`));
  const total = nizus.reduce((a, b) => a + b, 0);
  formSheet.getRange('A11').setValue(`${total}人`);
  formSheet.getRange('A13').setValue(`${nizus[0] + nizus[1]}人`);
  formSheet.getRange('A15').setValue(`${nizus[2] + nizus[3] + nizus[4]}人`);

  const wd = '日月火水木金土'[now.getDay()];
  formSheet.getRange('B2').setValue(now.getFullYear());
  formSheet.getRange('E2').setValue(now.getMonth() + 1);
  formSheet.getRange('G2').setValue(now.getDate());
  formSheet.getRange('I2').setValue(`(${wd})`);
  SpreadsheetApp.flush();

  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日(${wd})`;
  GmailApp.sendEmail(
    props.getProperty('MAIL_TO'),
    `筑駒音楽部 残留届 ${dateStr}`,
    `お世話になっております。\n\n${dateStr}の残留届を送付いたします。\n本日の残留人数: ${total}人\n\n添付ファイルをご確認ください。\n`,
    {
      attachments: [UrlFetchApp.fetch(`https://docs.google.com/spreadsheets/d/${ss.getId()}/export?format=xlsx`, {
        headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
      }).getBlob().setName(`筑駒音楽部残留届_${Utilities.formatDate(now, 'Asia/Tokyo', 'yyyyMMdd')}.xlsx`)],
      from: GmailApp.getAliases()[0]
    }
  );

  if (e && e.triggerUid) {
    const oldlog = JSON.parse(props.getProperty('SAVED_TRIGGER_DATA') || "[]");
    const i = oldlog.findIndex(item => item[1] === e.triggerUid);
    if (i >= 0) oldlog[i][1] = false;
    props.setProperty('SAVED_TRIGGER_DATA', JSON.stringify(oldlog));
    ScriptApp.deleteTriggers(e.triggerUid);
  }
}
//先週の日曜日
//トリガーでsavedtriggerが更新されない
//setdisですでにメッセージがあるかのチェック
//即時実行でsaved triggerに追加
//updatedisでmessageidがnullだった時の処理→libに
//discord api429対応→lib