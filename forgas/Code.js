function doPost(e) {
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
      wheen.setHours(Math.floor(pd[i].time / 60));
      wheen.setMinutes(pd[i].time % 60);
      if (wheen.getTime() < now.getTime()) {
        if (wheen.getDate() === now.getDate() && wheen.getHours < [18, 17][(Math.floor(now.getDay() + 6) % 7 / 4.5)]) sendMail();
      } else {
        while (placeold < oldlog.length && oldlog[placeold][0] < pd[i].id) {
          logg.push(oldlog[placeold]);
          placeold += 1;
        }
        if (placeold<oldlog.length &&  oldlog[placeold][0] == pd[i].id) {
          wildel.add(oldlog[placeold][1]);
          placeold += 1;
        }
        if (pd[i].time !== false) {
          sheet.getRange(8, i + 1).setValue(`${wheen.getDate()},${wheen.getHours()}`);
          const trig = ScriptApp.newTrigger('sendMail').timeBased().at(wheen).create();
          logg.push([pd[i].id, trig.getUniqueId()])
        }
      }
    }
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

function sendMail() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.getRange(1, 1).setValue("ウン");
}

function myfunc() {
  console.log(PropertiesService.getScriptProperties().getProperty('SAVED_TRIGGER_DATA'));
} 