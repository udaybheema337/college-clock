const currentTime = document.querySelector("h1"),
      currentDate = document.querySelector("h2"),
      currentDay = document.querySelector("h3"),
      setAlarmBtn1 = document.getElementById("set-alarm1"),
      setAlarmBtn2 = document.getElementById("set-alarm2"),
      alarmTimeDisplay1 = document.getElementById("alarm-time-display1"),
      alarmTimeDisplay2 = document.getElementById("alarm-time-display2"),
      selectMenu1 = [document.getElementById("alarm1-hours"), document.getElementById("alarm1-minutes"), document.getElementById("alarm1-ampm")],
      selectMenu2 = [document.getElementById("alarm2-hours"), document.getElementById("alarm2-minutes"), document.getElementById("alarm2-ampm")],
      excelFileInput = document.getElementById("excelFile");

let alarmTime1 = "", alarmTime2 = "", isAlarmSet1 = false, isAlarmSet2 = false;
let ringtone = new Audio("iphone_alarm.mp3");
let ringtoneInterval = null;
let holidays = [];

function populateSelectMenus(selectMenu) {
    for (let i = 12; i > 0; i--) {
        i = i < 10 ? "0" + i : i;
        let option = `<option value="${i}">${i}</option>`;
        selectMenu[0].firstElementChild.insertAdjacentHTML("afterend", option);
    }

    for (let i = 59; i >= 0; i--) {
        i = i < 10 ? "0" + i : i;
        let option = `<option value="${i}">${i}</option>`;
        selectMenu[1].firstElementChild.insertAdjacentHTML("afterend", option);
    }

    for (let i = 2; i > 0; i--) {
        let ampm = i === 1 ? "AM" : "PM";
        let option = `<option value="${ampm}">${ampm}</option>`;
        selectMenu[2].firstElementChild.insertAdjacentHTML("afterend", option);
    }
}

populateSelectMenus(selectMenu1);
populateSelectMenus(selectMenu2);

setInterval(() => {
    const now = new Date();
    let h = now.getHours(),
        m = now.getMinutes(),
        s = now.getSeconds(),
        ampm = "AM";

    if (h >= 12) {
        h = h - 12;
        ampm = "PM";
    }
    if (h === 0) {
        h = 12;
    }

    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;
    currentTime.innerText = `${h}:${m}:${s} ${ampm}`;

    if (alarmTime1 == `${h}:${m} ${ampm}`) {
        ringtone.play();
        ringtone.loop = true;
    }
    if(alarmTime2 ==  `${h}:${m} ${ampm}`){
        ringtone.play();
        ringtone.loop = true;
    }

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = daysOfWeek[now.getDay()];

    const options = { year: 'numeric', day: 'numeric', month: 'long' };
    const CurrentDate = now.toLocaleDateString(undefined, options);

    currentDate.innerText = `${CurrentDate} `;
    currentDay.innerText = `${dayOfWeek}`;
 }, 1000);

 let excelData = null;

 document.getElementById('excelFile').addEventListener('change', function(event) {
     const file = event.target.files[0];
     if (file) {
         const reader = new FileReader();
         
         reader.onload = function(e) {
             const data = new Uint8Array(e.target.result);
             
             const workbook = XLSX.read(data, { type: 'array' });
             
             const sheet = workbook.Sheets[workbook.SheetNames[0]];
             const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

             const parsedData = json.map(row => {
                 const rawDate = row[0];
                 const gender = row[1];
                 let formattedDate = '';

                 if (rawDate instanceof Date) {
                     formattedDate = `${rawDate.getMonth() + 1}/${rawDate.getDate()}/${rawDate.getFullYear()}`;
                 } else if (typeof rawDate === 'string') {
                     const dateParts = rawDate.split('/');
                     if (dateParts.length === 3) {
                         const month = parseInt(dateParts[0], 10);
                         const day = parseInt(dateParts[1], 10);
                         const year = parseInt(dateParts[2], 10);
                         if (month && day && year) {
                             formattedDate = `${month}/${day}/${year}`;
                         }
                     }
                 } else if (typeof rawDate === 'number' && !isNaN(rawDate)) {
                     const excelEpochOffset = 25569;
                     const millisecondsInADay = 86400000;
                     const dateObject = new Date((rawDate - excelEpochOffset) * millisecondsInADay);
                     formattedDate = `${dateObject.getMonth() + 1}/${dateObject.getDate()}/${dateObject.getFullYear()}`;
                 }

                 return formattedDate ? { date: formattedDate, gender: gender } : null;
             }).filter(data => data !== null);

             excelData = parsedData;
             console.log("Parsed Data from Excel: ", excelData);

             compareTodaysDateWithExcelData();
         };
         
         reader.readAsArrayBuffer(file);
     }
 });

 function compareTodaysDateWithExcelData() {
     if (!excelData) {
         return;
     }

     const today = new Date();
     const formattedToday = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
     console.log("Formatted Today: ", formattedToday);

     const foundMatchingDate = excelData.some(entry => entry.date === formattedToday);

     if (foundMatchingDate) {
         console.log("Matching date found. Starting alarm...");

         ringtoneInterval = setInterval(() => {
             const now = new Date();
             const hour = now.getHours();
             const minute = now.getMinutes();
             if (hour === 14 && minute === 55) {
                 ringtone.play();
                 ringtone.loop = true;
             }
         }, 1000);
     }
 }

 document.getElementById('stopButton').addEventListener('click', () => {
     if (ringtoneInterval) {
         clearInterval(ringtoneInterval);
         ringtone.pause();
         ringtone.currentTime = 0;
         console.log("Ringtone stopped.");
     }
 });

 setAlarmBtn1.addEventListener("click", () => {
    if (isAlarmSet1) {
        clearAlarm1();
    } else {
        setAlarm1();
    }
});

function clearAlarm1() {
    alarmTime1 = "";
    ringtone.pause();
    ringtone.currentTime = 0;
    selectMenu1[0].value = "Hours";
    selectMenu1[1].value = "Minutes";
    selectMenu1[2].value = "AM/PM";
    alarmTimeDisplay1.innerText = "Not set";
    setAlarmBtn1.innerText = "Set Alarm 1";
    isAlarmSet1 = false;
    alert("Alarm 1 has been cleared and reset!");
}

function setAlarm1() {
    let time = `${selectMenu1[0].value}:${selectMenu1[1].value} ${selectMenu1[2].value}`;

    if (time.includes("Hours") || time.includes("Minutes") || time.includes("AM/PM")) {
        return alert("Please select a valid time to set Alarm 1!");
    }

    alarmTime1 = time;
    alarmTimeDisplay1.innerText = alarmTime1;
    isAlarmSet1 = true;
    setAlarmBtn1.innerText = "Clear Alarm 1";
    alert("Alarm 1 is set!");
}

setAlarmBtn2.addEventListener("click", () => {
    if (isAlarmSet2) {
        clearAlarm2();
    } else {
        setAlarm2();
    }
});

function clearAlarm2() {
    alarmTime2 = "";
    ringtone.pause();
    ringtone.currentTime = 0;
    selectMenu2[0].value = "Hours";
    selectMenu2[1].value = "Minutes";
    selectMenu2[2].value = "AM/PM";
    alarmTimeDisplay2.innerText = "Not set";
    setAlarmBtn2.innerText = "Set Alarm 2";
    isAlarmSet2 = false;
    alert("Alarm 2 has been cleared and reset!");
}

function setAlarm2() {
    let time = `${selectMenu2[0].value}:${selectMenu2[1].value} ${selectMenu2[2].value}`;

    if (time.includes("Hours") || time.includes("Minutes") || time.includes("AM/PM")) {
        return alert("Please select a valid time to set Alarm 2!");
    }

    alarmTime2 = time;
    alarmTimeDisplay2.innerText = alarmTime2;
    isAlarmSet2 = true;
    setAlarmBtn2.innerText = "Clear Alarm 2";
    alert("Alarm 2 is set!");
}
