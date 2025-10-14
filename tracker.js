// State
let ACTIVE_TAB = 'loss';
let DATA = {
  loss: [],
  gain: [],
  calorie: []
};
let GOALS = {
  loss: { start: 145, target: 125 },
  gain: { start: 60, target: 70 },
  calorie: { daily: 2000 }
};
let CHARTS = {
  loss: null,
  gain: null,
  calorie: null
};

// Load from localStorage
const savedGoals = localStorage.getItem('fittrack_goals');
if(savedGoals) GOALS = JSON.parse(savedGoals);

// Date utilities
const trim = (s) => (s == null ? '' : String(s).trim());

const parseDate = (dateStr) => {
  if(!dateStr) return '';
  const s = trim(dateStr);
  if(!s) return '';
  
  const months = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  };
  
  const parts = s.split('-');
  if(parts.length === 3){
    const day = parts[0].trim().padStart(2, '0');
    const monthStr = parts[1].trim().toLowerCase();
    let year = parts[2].trim();
    
    if(year.length === 2){
      const yearNum = parseInt(year);
      year = yearNum < 50 ? '20' + year : '19' + year;
    }
    
    const month = months[monthStr];
    if(month) return year + '-' + month + '-' + day;
  }
  
  return s;
};

const formatDate = (dateKey) => {
  if(!dateKey) return '';
  const d = new Date(dateKey);
  if(isNaN(d)) return dateKey;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    const tabName = tab.dataset.tab;
    ACTIVE_TAB = tabName;
    
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById('tab-' + tabName).classList.add('active');
    
    render(tabName);
  };
});

// Add button
document.getElementById('addBtn').onclick = () => {
  if(ACTIVE_TAB === 'calorie'){
    document.getElementById('calorieDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('modalCalorie').classList.add('active');
  } else {
    document.getElementById('modalWeightTitle').textContent = 
      ACTIVE_TAB === 'loss' ? 'Add Weight Entry (Loss)' : 'Add Weight Entry (Gain)';
    document.getElementById('weightDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('modalWeight').classList.add('active');
  }
};

// Modal close handlers
document.getElementById('closeWeightModal').onclick = () => 
  document.getElementById('modalWeight').classList.remove('active');
document.getElementById('closeCalorieModal').onclick = () => 
  document.getElementById('modalCalorie').classList.remove('active');
document.getElementById('closeGoalModal').onclick = () => 
  document.getElementById('modalGoal').classList.remove('active');

document.getElementById('modalWeight').onclick = (e) => {
  if(e.target.id === 'modalWeight') 
    document.getElementById('modalWeight').classList.remove('active');
};
document.getElementById('modalCalorie').onclick = (e) => {
  if(e.target.id === 'modalCalorie') 
    document.getElementById('modalCalorie').classList.remove('active');
};
document.getElementById('modalGoal').onclick = (e) => {
  if(e.target.id === 'modalGoal') 
    document.getElementById('modalGoal').classList.remove('active');
};

// Goal buttons
document.getElementById('setGoalLoss').onclick = () => openGoalModal('loss');
document.getElementById('setGoalGain').onclick = () => openGoalModal('gain');
document.getElementById('setGoalCalorie').onclick = () => openGoalModal('calorie');

function openGoalModal(type){
  const modal = document.getElementById('modalGoal');
  const body = document.getElementById('goalModalBody');
  document.getElementById('modalGoalTitle').textContent = 
    type === 'calorie' ? 'Set Calorie Goal' : `Set ${type === 'loss' ? 'Weight Loss' : 'Weight Gain'} Goal`;
  
  if(type === 'calorie'){
    body.innerHTML = `
      <div class="input-group">
        <label>Daily Calorie Goal (kcal)</label>
        <input type="number" id="goalCalorieDaily" value="${GOALS.calorie.daily}" placeholder="2000">
      </div>
    `;
  } else {
    body.innerHTML = `
      <div class="input-group">
        <label>Starting Weight (kg)</label>
        <input type="number" step="0.1" id="goalWeightStart" value="${GOALS[type].start}" placeholder="70">
      </div>
      <div class="input-group">
        <label>Target Weight (kg)</label>
        <input type="number" step="0.1" id="goalWeightTarget" value="${GOALS[type].target}" placeholder="80">
      </div>
    `;
  }
  
  modal.dataset.type = type;
  modal.classList.add('active');
}

// Save goal
document.getElementById('saveGoal').onclick = () => {
  const type = document.getElementById('modalGoal').dataset.type;
  
  if(type === 'calorie'){
    const daily = parseFloat(document.getElementById('goalCalorieDaily').value);
    if(!daily) return alert('Please enter daily calorie goal');
    GOALS.calorie.daily = daily;
  } else {
    const start = parseFloat(document.getElementById('goalWeightStart').value);
    const target = parseFloat(document.getElementById('goalWeightTarget').value);
    if(!start || !target) return alert('Please enter both weights');
    GOALS[type] = { start, target };
  }
  
  localStorage.setItem('fittrack_goals', JSON.stringify(GOALS));
  document.getElementById('modalGoal').classList.remove('active');
  render(type);
  alert('Goal updated successfully');
};

// Save weight entry
document.getElementById('saveWeight').onclick = () => {
  const date = document.getElementById('weightDate').value;
  const weight = parseFloat(document.getElementById('weightValue').value);
  const notes = document.getElementById('weightNotes').value;
  
  if(!date || !weight) return alert('Please enter date and weight');
  
  DATA[ACTIVE_TAB].push({
    Date: date,
    'Weight in Kg': weight,
    Notes: notes || ''
  });
  
  DATA[ACTIVE_TAB].sort((a,b) => a.Date.localeCompare(b.Date));
  localStorage.setItem('fittrack_data_' + ACTIVE_TAB, JSON.stringify(DATA[ACTIVE_TAB]));
  
  document.getElementById('weightValue').value = '';
  document.getElementById('weightNotes').value = '';
  document.getElementById('modalWeight').classList.remove('active');
  
  render(ACTIVE_TAB);
  alert('Entry added successfully');
};

// Save calorie entry
document.getElementById('saveCalorie').onclick = () => {
  const date = document.getElementById('calorieDate').value;
  const calories = parseInt(document.getElementById('calorieValue').value);
  const desc = document.getElementById('calorieDesc').value;
  
  if(!date || !calories) return alert('Please enter date and calories');
  
  DATA.calorie.push({
    Date: date,
    Calories: calories,
    Description: desc || 'Food'
  });
  
  DATA.calorie.sort((a,b) => a.Date.localeCompare(b.Date));
  localStorage.setItem('fittrack_data_calorie', JSON.stringify(DATA.calorie));
  
  document.getElementById('calorieValue').value = '';
  document.getElementById('calorieDesc').value = '';
  document.getElementById('modalCalorie').classList.remove('active');
  
  render('calorie');
  alert('Entry added successfully');
};

// Render functions
function render(type){
  if(type === 'loss' || type === 'gain') renderWeight(type);
  if(type === 'calorie') renderCalorie();
}

function renderWeight(type){
  const data = DATA[type];
  const goal = GOALS[type];
  
  if(data.length === 0){
    document.getElementById('table' + capitalize(type)).innerHTML = 
      '<tr><td colspan="3" class="empty-state"><div class="empty-icon">📊</div><div class="empty-text">No entries yet</div></td></tr>';
    return;
  }
  
  const weights = data.map(d => parseFloat(d['Weight in Kg']));
  const current = weights[weights.length - 1];
  const start = goal.start;
  const target = goal.target;
  
  const diff = type === 'loss' ? (start - current) : (current - start);
  const toGo = type === 'loss' ? (current - target) : (target - current);
  const progress = ((diff / (Math.abs(target - start))) * 100).toFixed(0);
  
  const firstDate = new Date(data[0].Date);
  const lastDate = new Date(data[data.length - 1].Date);
  const days = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
  const weeks = days / 7;
  const avg = weeks > 0 ? (diff / weeks).toFixed(1) : 0;
  
  // Update stats
  document.getElementById('startWeight' + capitalize(type)).textContent = start.toFixed(1);
  document.getElementById('currentWeight' + capitalize(type)).textContent = current.toFixed(1);
  document.getElementById('targetWeight' + capitalize(type)).textContent = target.toFixed(1);
  document.getElementById('progress' + capitalize(type)).textContent = progress + '%';
  
  if(type === 'loss'){
    document.getElementById('totalLostLoss').textContent = diff.toFixed(1);
    document.getElementById('toGoLoss').textContent = toGo.toFixed(1);
    document.getElementById('journeyDaysLoss').textContent = days;
    document.getElementById('avgLossLoss').textContent = avg;
  } else {
    document.getElementById('totalGainedGain').textContent = diff.toFixed(1);
    document.getElementById('toGoGain').textContent = toGo.toFixed(1);
    document.getElementById('journeyDaysGain').textContent = days;
    document.getElementById('avgGainGain').textContent = avg;
  }
  
  // Render table
  const tbody = document.getElementById('table' + capitalize(type));
  tbody.innerHTML = '';
  
  data.slice().reverse().forEach((entry, i) => {
    const idx = data.length - 1 - i;
    const weight = parseFloat(entry['Weight in Kg']);
    const prevWeight = idx > 0 ? parseFloat(data[idx-1]['Weight in Kg']) : start;
    const change = weight - prevWeight;
    
    const changeClass = change < 0 ? (type === 'loss' ? 'negative' : 'positive') : 
                        change > 0 ? (type === 'loss' ? 'positive' : 'negative') : 'neutral';
    const changeIcon = change < 0 ? '↓' : change > 0 ? '↑' : '→';
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(entry.Date)}</td>
      <td><span class="weight-value">${weight.toFixed(1)}</span> kg</td>
      <td><span class="weight-change ${changeClass}">${change !== 0 ? changeIcon + ' ' + Math.abs(change).toFixed(1) + ' kg' : '—'}</span></td>
    `;
    tbody.appendChild(row);
  });
  
  // Render chart
  renderWeightChart(type);
}

function renderWeightChart(type){
  const data = DATA[type];
  if(data.length === 0) return;
  
  const dates = data.map(d => formatDate(d.Date));
  const weights = data.map(d => parseFloat(d['Weight in Kg']));
  const goal = GOALS[type];
  
  const ctx = document.getElementById('chart' + capitalize(type)).getContext('2d');
  
  if(CHARTS[type]) CHARTS[type].destroy();
  CHARTS[type] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Weight',
        data: weights,
        borderColor: type === 'loss' ? '#6366f1' : '#10b981',
        backgroundColor: type === 'loss' ? 'rgba(99,102,241,0.05)' : 'rgba(16,185,129,0.05)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: type === 'loss' ? '#6366f1' : '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      },{
        label: 'Goal',
        data: Array(weights.length).fill(goal.target),
        borderColor: type === 'loss' ? '#10b981' : '#6366f1',
        borderWidth: 2,
        borderDash: [5,5],
        fill: false,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            padding: 10,
            font: {size: 11, weight: '600'},
            color: '#6b7280',
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: '#1a1a1a',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (context) => context.parsed.y.toFixed(1) + ' kg'
          }
        }
      },
      scales: {
        x: {
          grid: {display: false},
          ticks: {
            font: {size: 10, weight: '500'},
            color: '#9ca3af',
            maxRotation: 0
          }
        },
        y: {
          grid: {color: '#f3f4f6'},
          ticks: {
            font: {size: 11, weight: '600'},
            color: '#6b7280',
            callback: (value) => value + ' kg'
          }
        }
      }
    }
  });
}

function renderCalorie(){
  const data = DATA.calorie;
  const goal = GOALS.calorie.daily;
  
  // Calculate today's total
  const today = new Date().toISOString().slice(0,10);
  const todayEntries = data.filter(e => e.Date === today);
  const todayTotal = todayEntries.reduce((sum, e) => sum + e.Calories, 0);
  const remaining = goal - todayTotal;
  const progress = ((todayTotal / goal) * 100).toFixed(0);
  
  // Calculate week stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekData = data.filter(e => new Date(e.Date) >= weekAgo);
  const weekTotal = weekData.reduce((sum, e) => sum + e.Calories, 0);
  
  // Calculate averages
  const uniqueDates = [...new Set(data.map(e => e.Date))];
  const avgDaily = uniqueDates.length > 0 ? (data.reduce((sum, e) => sum + e.Calories, 0) / uniqueDates.length).toFixed(0) : 0;
  
  // Calculate streak
  let streak = 0;
  const sortedDates = [...uniqueDates].sort().reverse();
  let checkDate = new Date();
  for(const dateStr of sortedDates){
    const entryDate = new Date(dateStr);
    const diffDays = Math.floor((checkDate - entryDate) / (1000 * 60 * 60 * 24));
    if(diffDays <= 1){
      streak++;
      checkDate = entryDate;
    } else {
      break;
    }
  }
  
  // Update stats
  document.getElementById('calorieToday').textContent = todayTotal;
  document.getElementById('calorieGoal').textContent = goal;
  document.getElementById('calorieRemaining').textContent = remaining;
  document.getElementById('calorieProgress').textContent = progress + '%';
  document.getElementById('calorieWeek').textContent = weekTotal;
  document.getElementById('calorieAvg').textContent = avgDaily;
  document.getElementById('calorieDays').textContent = uniqueDates.length;
  document.getElementById('calorieStreak').textContent = streak;
  
  // Render today's entries
  const list = document.getElementById('calorieEntriesList');
  if(todayEntries.length === 0){
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">🍽️</div><div class="empty-text">No entries today</div></div>';
  } else {
    list.innerHTML = todayEntries.map(e => `
      <div class="calorie-entry">
        <div class="calorie-entry-header">
          <div class="calorie-entry-time">${e.Description}</div>
          <div class="calorie-entry-calories">${e.Calories} kcal</div>
        </div>
      </div>
    `).join('');
  }
  
  // Render chart
  renderCalorieChart();
}

function renderCalorieChart(){
  const data = DATA.calorie;
  
  // Get last 7 days
  const days = [];
  const calories = [];
  for(let i = 6; i >= 0; i--){
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0,10);
    const dayData = data.filter(e => e.Date === dateStr);
    const total = dayData.reduce((sum, e) => sum + e.Calories, 0);
    
    days.push(formatDate(dateStr));
    calories.push(total);
  }
  
  const ctx = document.getElementById('chartCalorie').getContext('2d');
  
  if(CHARTS.calorie) CHARTS.calorie.destroy();
  CHARTS.calorie = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: 'Calories',
        data: calories,
        backgroundColor: '#f59e0b',
        borderRadius: 6,
        barThickness: 24
      },{
        label: 'Goal',
        data: Array(7).fill(GOALS.calorie.daily),
        type: 'line',
        borderColor: '#10b981',
        borderWidth: 2,
        borderDash: [5,5],
        fill: false,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            padding: 10,
            font: {size: 11, weight: '600'},
            color: '#6b7280',
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: '#1a1a1a',
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (context) => context.parsed.y + ' kcal'
          }
        }
      },
      scales: {
        x: {
          grid: {display: false},
          ticks: {
            font: {size: 10, weight: '500'},
            color: '#9ca3af'
          }
        },
        y: {
          grid: {color: '#f3f4f6'},
          ticks: {
            font: {size: 11, weight: '600'},
            color: '#6b7280',
            callback: (value) => value + ' kcal'
          }
        }
      }
    }
  });
}

function capitalize(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Load data
function loadData(){
  // Load from localStorage
  DATA.loss = JSON.parse(localStorage.getItem('fittrack_data_loss') || '[]');
  DATA.gain = JSON.parse(localStorage.getItem('fittrack_data_gain') || '[]');
  DATA.calorie = JSON.parse(localStorage.getItem('fittrack_data_calorie') || '[]');
  
  // Load weight.csv for loss tracker
  Papa.parse('./weight.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (res) => {
      const csvData = res.data.map(row => ({
        Date: parseDate(row.Date),
        'Weight in Kg': parseFloat(row['Weight in Kg'])
      }));
      
      // Merge with localStorage
      DATA.loss = [...csvData, ...DATA.loss];
      DATA.loss.sort((a,b) => a.Date.localeCompare(b.Date));
      
      console.log('Weight loss data loaded:', DATA.loss.length, 'entries');
      render('loss');
    },
    error: (err) => {
      console.error('CSV load error', err);
      render('loss');
    }
  });
  
  // Render other tabs
  render('gain');
  render('calorie');
}

// Initialize
loadData();
