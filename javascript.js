function goTo(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');

  const buttons = document.querySelectorAll('.navbar button');
  buttons.forEach(btn => btn.classList.remove('active'));

  const activeBtn = document.querySelector(`.navbar button[onclick="goTo('${screenId}')"]`);
  if (activeBtn) activeBtn.classList.add('active');
}

function toggleLesson(id, card) {
  const content = document.getElementById(id);

  if (content.classList.contains("active")) {
    // closing → measure height, then force 0
    content.style.maxHeight = content.scrollHeight + "px"; 
    setTimeout(() => {
      content.style.maxHeight = "0";
    }, 1);

    content.classList.remove("active");
    card.classList.remove("open");
  } else {
    // opening → set to real height
    content.style.maxHeight = content.scrollHeight + "px";

    content.classList.add("active");
    card.classList.add("open");
  }
  
}

function filterLessons() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const lessonCards = document.querySelectorAll('.lesson-card');
  let hasVisible = false;

  lessonCards.forEach(card => {
    const title = card.querySelector('.lesson-title')?.textContent.toLowerCase() || '';
    const keywords = card.getAttribute('data-keywords')?.toLowerCase() || '';

    const match = title.includes(query) || keywords.includes(query);
    card.style.display = match ? 'flex' : 'none';
    if (match) hasVisible = true;
  });

  let noResults = document.getElementById('noResults');
  if (!noResults) {
    noResults = document.createElement('p');
    noResults.id = 'noResults';
    noResults.textContent = 'No lessons found.';
    noResults.style.textAlign = 'center';
    noResults.style.display = 'none';
    document.querySelector('.container').appendChild(noResults);
  }

  noResults.style.display = hasVisible ? 'none' : 'block';
}

// SUPABASE CODE

const supabaseUrl = "https://gshpbwgfehncdlcomqbl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaHBid2dmZWhuY2RsY29tcWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTA5NjgsImV4cCI6MjA3MjQ4Njk2OH0.hFF9rFyDtqBs-nxceNbu1sSUxSPgSlMdejkjszBK_jg";
const client = supabase.createClient(supabaseUrl, supabaseKey);

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
  const file  = input.files[0];
  if (!file) return;

  const { error } = await client
    .storage
    .from("Storage")
    .upload(`${subject}/${file.name}`, file);

  if (error) console.error("Upload error:", error);
  else loadFiles(subject);
}

async function loadFiles(subject) {
  const { data, error } = await client
    .storage
    .from("Storage")
    .list(subject, { limit: 100 });

  if (error) {
    console.error("Error listing files:", error);
    return;
  }

  const files = data.filter(
    item => item.id !== null && !item.name.endsWith("/")
  );

  const list = document.getElementById(`fileList-${subject}`);
  list.innerHTML = "";

  files.forEach(file => {
    const { data: urlData } = client
      .storage
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

//loadFiles("Contemp");
//loadFiles("MIL");
//loadFiles("Philo");
//loadFiles("PE");