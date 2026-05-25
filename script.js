 // =========================
  // DATA
  // =========================

  let counts = [0,0,0,0,0];
  const starLabels = ['★★★★★','★★★★','★★★','★★','★'];

  const checklists = {
    Design: ['Exceeded Time Estimate','Missing Checklist','Brand Guidelines Not Followed','Weak Concept / Strategic Alignment','Poor Layout / Visual Hierarchy','Typography Issues','Color / Contrast Issues','Style Inconsistencies','Low Craft / Execution','Creative Drift / Unrequested Changes','Requirements Not Followed','Accessibility Issues','Missing Variants / States / Formats','Poorly Written Progress Report','Late Delivery','Slow Execution','Poor File Hygiene / Naming Structure','Incorrect Component / Auto-Layout Usage'],
    Dev: ['Exceeded Time Estimate','Missing Checklist','Requirements Not Followed','Accessibility Issues','Missing Variants / States / Formats','Poorly Written Progress Report','Late Delivery','Slow Execution','Poor File Hygiene / Naming Structure','Design–Dev Mismatch','Responsiveness Issues','Broken Functionality','Poor Code Quality','Performance Issues','Cross-Browser / Cross-Device Issues','Incorrect CMS / Platform Setup','SEO / Metadata Issues','Version Control Issues']
  };

  let checklistCounts = {};
  let currentCategory = 'Design';

  // =========================
  // TEXTAREA IDS
  // =========================
  const textFields = {
    needsCoaching: 'needsCoaching',
    notes: 'notes',
    blockers: 'blockers'
  };

  // =========================
  // DEBOUNCE (auto-save optimization)
  // =========================
  let saveTimeout;

  function debouncedSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveData, 400);
  }

  // =========================
  // LOCAL STORAGE
  // =========================

  function saveData() {
    localStorage.setItem('qa_counts', JSON.stringify(counts));
    localStorage.setItem('qa_checklist', JSON.stringify(checklistCounts));
    localStorage.setItem('qa_category', currentCategory);

    // Save textareas
    localStorage.setItem('qa_needsCoaching', document.getElementById(textFields.needsCoaching)?.value || '');
    localStorage.setItem('qa_notes', document.getElementById(textFields.notes)?.value || '');
    localStorage.setItem('qa_blockers', document.getElementById(textFields.blockers)?.value || '');
  }

  function loadData() {
    const savedCounts = localStorage.getItem('qa_counts');
    const savedChecklist = localStorage.getItem('qa_checklist');
    const savedCategory = localStorage.getItem('qa_category');

    if (savedCounts) counts = JSON.parse(savedCounts);
    if (savedChecklist) checklistCounts = JSON.parse(savedChecklist);
    if (savedCategory) currentCategory = savedCategory;

    // Load textareas safely
    const needsCoaching = localStorage.getItem('qa_needsCoaching') || '';
    const notes = localStorage.getItem('qa_notes') || '';
    const blockers = localStorage.getItem('qa_blockers') || '';

    const el1 = document.getElementById(textFields.needsCoaching);
    const el2 = document.getElementById(textFields.notes);
    const el3 = document.getElementById(textFields.blockers);

    if (el1) el1.value = needsCoaching;
    if (el2) el2.value = notes;
    if (el3) el3.value = blockers;
  }

  // =========================
  // STARS
  // =========================

  function renderStars() {
    const column = document.getElementById('counterColumn');
    column.innerHTML = '';

    counts.forEach((count,index) => {
      const card = document.createElement('div');
      card.className = 'starCard';
      card.innerHTML = `
        <span class='starLabel'>${starLabels[index]}</span>
        <div>
          <button class='subtract' onclick='updateCount(${index},-1)'>-</button>
          <span class='starCount'>${count}</span>
          <button class='add' onclick='updateCount(${index},1)'>+</button>
        </div>
      `;
      column.appendChild(card);
    });

    renderSummary();
  }

  function updateCount(index,value) {
    counts[index] = Math.max(0, counts[index] + value);
    saveData();
    renderStars();
  }

  // =========================
  // CATEGORY SWITCH
  // =========================

  function switchCategory(category) {
    currentCategory = category;

    document.getElementById('designBtn')
      .classList.toggle('active', category === 'Design');

    document.getElementById('devBtn')
      .classList.toggle('active', category === 'Dev');

    saveData();
    renderChecklist();
  }

  // =========================
  // CHECKLIST
  // =========================

  function renderChecklist() {
    const column = document.getElementById('checklistColumn');
    column.innerHTML = '';

    checklistCounts[currentCategory] =
      checklistCounts[currentCategory] || {};

    checklists[currentCategory].forEach(item => {

      if (!(item in checklistCounts[currentCategory])) {
        checklistCounts[currentCategory][item] = 0;
      }

      const row = document.createElement('div');
      row.className = 'checkItemRow';

      row.innerHTML = `
        <span>${item}</span>
        <div>
          <button class='subtract' onclick="updateChecklist('${item}',-1)">-</button>
          <span class='checklistCount'>${checklistCounts[currentCategory][item]}</span>
          <button class='add' onclick="updateChecklist('${item}',1)">+</button>
        </div>
      `;

      column.appendChild(row);
    });

    renderSummary();
  }

  function updateChecklist(item,value){
    checklistCounts[currentCategory][item] =
      Math.max(0, checklistCounts[currentCategory][item] + value);

    saveData();
    renderChecklist();
  }

  // =========================
  // SUMMARY
  // =========================

  function renderSummary(){
    const total = counts.reduce((a,b)=>a+b,0);
    const passed = counts[0] + counts[1];
    const reworked = counts[2] + counts[3] + counts[4];

    document.getElementById('total').textContent = total;
    document.getElementById('passed').textContent = passed;
    document.getElementById('reworked').textContent = reworked;

    document.getElementById('r5').textContent = counts[0];
    document.getElementById('r4').textContent = counts[1];
    document.getElementById('r3').textContent = counts[2];
    document.getElementById('r2').textContent = counts[3];
    document.getElementById('r1').textContent = counts[4];

    let issuesHTML = '';

    for(const cat in checklistCounts){
      for(const item in checklistCounts[cat]){
        const val = checklistCounts[cat][item];
        if(val > 0){
          issuesHTML += `${item} x${val}<br>`;
        }
      }
    }

    document.getElementById('issuesSummary').innerHTML = issuesHTML;
  }

  // =========================
  // COPY SUMMARY
  // =========================

function copySummary(){
  let text = `Tasks checked: ${document.getElementById('total').textContent}\n`;
  text += `Passed: ${document.getElementById('passed').textContent}\n`;
  text += `Reworked: ${document.getElementById('reworked').textContent}\n\nRatings:\n`;

  text += `★★★★★ x${document.getElementById('r5').textContent}\n`;
  text += `★★★★ x${document.getElementById('r4').textContent}\n`;
  text += `★★★ x${document.getElementById('r3').textContent}\n`;
  text += `★★ x${document.getElementById('r2').textContent}\n`;
  text += `★ x${document.getElementById('r1').textContent}\n\nIssues flagged:\n`;

  text += document.getElementById('issuesSummary').innerText;

  // ✅ ADD THIS SECTION (TEXTAREAS)
  text += `\nNeeds Coaching:\n`;
  text += document.getElementById('needsCoaching')?.value || '';

  text += `\n\nNotes:\n`;
  text += document.getElementById('notes')?.value || '';

  text += `\n\nBlockers / Risks:\n`;
  text += document.getElementById('blockers')?.value || '';

  navigator.clipboard.writeText(text)
    .then(()=>alert('Summary copied to clipboard!'));
}

  // =========================
  // RESET
  // =========================

function resetAll(){
  counts = [0,0,0,0,0];
  checklistCounts = {};

  // clear storage
  localStorage.clear();

  // reset UI counters
  renderStars();
  renderChecklist();

  // ✅ CLEAR TEXTAREAS (IMPORTANT FIX)
  const needsCoachingEl = document.getElementById('needsCoaching');
  const notesEl = document.getElementById('notes');
  const blockersEl = document.getElementById('blockers');

  if (needsCoachingEl) needsCoachingEl.value = '';
  if (notesEl) notesEl.value = '';
  if (blockersEl) blockersEl.value = '';
}

  // =========================
  // TEXTAREA AUTO SAVE
  // =========================

  function attachTextListeners() {
    ['needsCoaching', 'notes', 'blockers'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener('input', debouncedSave);
    });
  }

  // =========================
  // INIT
  // =========================

  loadData();

  renderStars();
  switchCategory(currentCategory);

  attachTextListeners();
