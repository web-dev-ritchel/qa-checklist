  // Stars Column
  let counts = [0,0,0,0,0];
  const starLabels = ['★★★★★','★★★★','★★★','★★','★'];

  // Checklist Items
  const checklists = {
    Design: ['Exceeded Time Estimate','No Tracked Time','Missing Checklist','Brand Guidelines Not Followed','Weak Concept / Strategic Alignment','Poor Layout / Visual Hierarchy','Typography Issues','Color / Contrast Issues','Style Inconsistencies','Low Craft / Execution','Creative Drift / Unrequested Changes','Requirements Not Followed','Accessibility Issues','Missing Variants / States / Formats','Poorly Written Progress Report','Late Delivery','Slow Execution','Poor File Hygiene / Naming Structure','Incorrect Component / Auto-Layout Usage'],
    Dev: ['Exceeded Time Estimate','No Tracked Time','Missing Checklist','Requirements Not Followed','Accessibility Issues','Missing Variants / States / Formats','Poorly Written Progress Report','Late Delivery','Slow Execution','Poor File Hygiene / Naming Structure','Design–Dev Mismatch','Responsiveness Issues','Broken Functionality','Poor Code Quality','Performance Issues','Cross-Browser / Cross-Device Issues','Incorrect CMS / Platform Setup','SEO / Metadata Issues','Version Control Issues']
  };

  let checklistCounts = {};
  let currentCategory = 'Design';

  // =========================
  // LOCAL STORAGE
  // =========================

  function saveData() {
    localStorage.setItem('qa_counts', JSON.stringify(counts));
    localStorage.setItem('qa_checklist', JSON.stringify(checklistCounts));
    localStorage.setItem('qa_category', currentCategory);
  }

  function loadData() {
    const savedCounts = localStorage.getItem('qa_counts');
    const savedChecklist = localStorage.getItem('qa_checklist');
    const savedCategory = localStorage.getItem('qa_category');

    if (savedCounts) {
      counts = JSON.parse(savedCounts);
    }

    if (savedChecklist) {
      checklistCounts = JSON.parse(savedChecklist);
    }

    if (savedCategory) {
      currentCategory = savedCategory;
    }
  }

  // Stars Column
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
    counts[index] = Math.max(0, counts[index]+value);
    saveData();
    renderStars();
  }

  function switchCategory(category) {
    currentCategory = category;

    document.getElementById('designBtn')
      .classList.toggle('active', category==='Design');

    document.getElementById('devBtn')
      .classList.toggle('active', category==='Dev');

    saveData();
    renderChecklist();
  }

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
      Math.max(0, checklistCounts[currentCategory][item]+value);

    saveData();
    renderChecklist();
  }

  function renderSummary(){
    const total = counts.reduce((a,b)=>a+b,0);
    const passed = counts[0]+counts[1];
    const reworked = counts[2]+counts[3]+counts[4];

    document.getElementById('total').textContent = total;
    document.getElementById('passed').textContent = passed;
    document.getElementById('reworked').textContent = reworked;

    document.getElementById('r5').textContent = counts[0];
    document.getElementById('r4').textContent = counts[1];
    document.getElementById('r3').textContent = counts[2];
    document.getElementById('r2').textContent = counts[3];
    document.getElementById('r1').textContent = counts[4];

    let issuesHTML='';

    for(const cat in checklistCounts){
      for(const item in checklistCounts[cat]){
        const val=checklistCounts[cat][item];

        if(val>0){
          issuesHTML += `${item} x${val}<br>`;
        }
      }
    }

    document.getElementById('issuesSummary').innerHTML = issuesHTML;
  }

  function copySummary(){
    let text = `Tasks checked: ${document.getElementById('total').textContent}\n`;

    text += `Passed: ${document.getElementById('passed').textContent}\n`;

    text += `Reworked: ${document.getElementById('reworked').textContent}\n\nRatings:\n`;

    text += `:star::star::star::star::star: x${document.getElementById('r5').textContent}\n`;

    text += `:star::star::star::star: x${document.getElementById('r4').textContent}\n`;

    text += `:star::star::star: x${document.getElementById('r3').textContent}\n`;

    text += `:star::star: x${document.getElementById('r2').textContent}\n`;

    text += `:star: x${document.getElementById('r1').textContent}\n\nIssues flagged:\n`;

    text += document.getElementById('issuesSummary').innerText;

    navigator.clipboard.writeText(text)
      .then(()=>alert('Summary copied to clipboard!'));
  }

  function resetAll(){
    counts=[0,0,0,0,0];
    checklistCounts={};

    localStorage.removeItem('qa_counts');
    localStorage.removeItem('qa_checklist');
    localStorage.removeItem('qa_category');

    renderStars();
    renderChecklist();
  }

  // INITIAL LOAD
  loadData();

  renderStars();
  switchCategory(currentCategory);