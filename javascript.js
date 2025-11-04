window.addEventListener("DOMContentLoaded", () => {
  const pomodoro = document.getElementById('pomodoro');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const closePomodoro = document.getElementById('closePomodoro');
  const sessionLabel = document.getElementById('sessionLabel');
  const toggleSwitch = document.getElementById("themeToggle");
  
  document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');

  const welcome = document.getElementById('Welcome');
  if (welcome) welcome.style.display = 'block';

  const aiCard = document.querySelector('.ai-card');
  if (aiCard) aiCard.style.display = 'none';

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    if (toggleSwitch) toggleSwitch.classList.add("active");
  }

  if (toggleSwitch) {
    toggleSwitch.addEventListener("click", () => {
      toggleSwitch.classList.toggle("active");
      document.body.classList.toggle("dark-mode");

      if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.setItem("theme", "light");
      }
    });
  }

  if (closePomodoro) {
    closePomodoro.addEventListener('click', () => {
      pomodoro.style.display = 'none';
      clearInterval(timer);
      isRunning = false;
      startBtn.textContent = 'Start';
    });
  }

  function toggleTimer() {
    if (isRunning) {
      clearInterval(timer);
      startBtn.textContent = 'Start';
    } else {
      timer = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
          clearInterval(timer);
          if (isWorkTime) {
            timeLeft = 5 * 60;
            sessionLabel.textContent = 'Break Time';
            alert('Work session done! Time for a 5-min break.');
          } else {
            timeLeft = 25 * 60;
            sessionLabel.textContent = 'Work Time';
            alert('Break over! Back to work.');
          }
          isWorkTime = !isWorkTime;
          updateDisplay();
        }
      }, 1000);
      startBtn.textContent = 'Pause';
    }
    isRunning = !isRunning;
  }

  function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    isWorkTime = true;
    timeLeft = 25 * 60;
    sessionLabel.textContent = 'Work Time';
    startBtn.textContent = 'Start';
    updateDisplay();
  }

  if (startBtn && resetBtn) {
    startBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);
  }

  updateDisplay();
});



const menuButton = document.getElementById('menuButton');
const sidebar = document.querySelector('.sidebar');

const overlay = document.createElement('div');
overlay.classList.add('overlay');
document.body.appendChild(overlay);

menuButton.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  overlay.classList.toggle('show');
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  overlay.classList.remove('show');
});

function goTo(screenId) {
  const welcome = document.getElementById('Welcome');
  if (welcome) welcome.style.display = 'none';

  document.querySelectorAll('.screen').forEach(screen => {
    screen.style.display = 'none';
  });

  const target = document.getElementById(screenId);
  if (target) target.style.display = 'block';

  const buttons = document.querySelectorAll('.subject-list button');
  buttons.forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.subject-list button[onclick="goTo('${screenId}')"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  };

  const aiCard = document.querySelector('.ai-card');
  if (aiCard) {
    const hideOn = ['Settings', 'About', 'Welcome'];
    if (hideOn.includes(screenId)) {
      aiCard.style.display = 'none';
    } else {
      aiCard.style.display = 'block';
    }
  }
}



function toggleLesson(id, card) {
  const content = document.getElementById(id);

  if (content.classList.contains("active")) {
    content.style.maxHeight = content.scrollHeight + "px";
    requestAnimationFrame(() => {
      content.style.maxHeight = "0";
    });

    content.classList.remove("active");
    card.classList.remove("open");
  } else {
    content.classList.add("active");
    card.classList.add("open");

    setTimeout(() => {
      content.style.maxHeight = content.scrollHeight + "px";
    }, 1);
  }
}



let timer;
let isRunning = false;
let timeLeft = 25 * 60;
let isWorkTime = true;

function openPomodoro() {
  document.getElementById('pomodoro').style.display = 'block';
}

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timerDisplay').textContent =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}



const supabaseUrl = "https://gshpbwgfehncdlcomqbl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaHBid2dmZWhuY2RsY29tcWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTA5NjgsImV4cCI6MjA3MjQ4Njk2OH0.hFF9rFyDtqBs-nxceNbu1sSUxSPgSlMdejkjszBK_jg";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  global: { fetch: (url, options) => fetch(url, { ...options, credentials: 'omit' }) }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[type="file"][id^="fileInput-"]').forEach(input => {
    const subject = input.id.replace('fileInput-', '');
    const nameSpan = document.getElementById(`fileName-${subject}`);

    if (nameSpan) {
      input.addEventListener('change', () => {
        nameSpan.textContent = input.files.length
          ? input.files[0].name
          : 'No file chosen';
      });
    }
  });
});

async function uploadFile(subject) {
  const input = document.getElementById(`fileInput-${subject}`);
  const file = input.files[0];
  if (!file) return;

  const { error } = await supabase.storage
    .from("Storage")
    .upload(`${subject}/${file.name}`, file);

  if (error) console.error("Upload error:", error);
  else loadFiles(subject);
}

async function loadFiles(subject) {
  const { data, error } = await supabase.storage
    .from("Storage")
    .list(subject, { limit: 100 });

  if (error) {
    console.error("Error listing files:", error);
    return;
  }

  const files = data.filter(item => item.id !== null && !item.name.endsWith("/"));
  const list = document.getElementById(`fileList-${subject}`);
  list.innerHTML = "";

  files.forEach(file => {
    const { data: urlData } = supabase.storage
      .from("Storage")
      .getPublicUrl(`${subject}/${file.name}`);

    const ext = file.name.split(".").pop().toLowerCase();
    let typeClass, icon;

    if (ext === "pdf") {
      typeClass = "pdf";
      icon = "pdficon.svg";
    } else if (["jpg", "jpeg", "png"].includes(ext)) {
      typeClass = "image";
      icon = "jpgicon.png";
    } else {
      typeClass = "word";
      icon = "msword.png";
    }

    const card = document.createElement("div");
    card.className = `file-card uploaded ${typeClass}`;
    card.innerHTML = `
      <span class="file-title">${file.name}</span>
      <img src="${icon}" class="file-icon" alt="${ext} icon">
    `;
    card.addEventListener("click", () =>
      window.open(urlData.publicUrl, "_blank")
    );

    list.appendChild(card);
  });
}

loadFiles("Contemp");
loadFiles("MIL");
loadFiles("Philo");
loadFiles("PE");



let startTime = Date.now();
const page = window.location.pathname;
const device = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
const respondentId = crypto.randomUUID();

document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "hidden") {
    const duration = Math.round((Date.now() - startTime) / 1000);

    const { data, error } = await supabase.from("respondent_logs").insert([
      {
        timestamp: new Date().toISOString(),
        duration_seconds: duration,
        device,
        page,
        respondent_id: respondentId,
      },
    ]);

    console.log("📊 Log inserted:", data, error);
  }
});