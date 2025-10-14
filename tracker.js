// State
let ACTIVE_TAB = 'loss';
let DATA = {
  loss: [],
  gain: [],
  food: [],
  activity: []
};
let GOALS = {
  loss: { start: 145, target: 125 },
  gain: { start: 60, target: 70 },
  calorie: { intake: 2000, burn: 500 }
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
    document.getElementById('activityDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('modalActivity').classList.add('active');
  } else {
    document.getElementById('modalWeightTitle').textContent = 
      ACTIVE_TAB === 'loss' ? 'Add Weight Entry (Loss)' : 'Add Weight Entry (Gain)';
    document.getElementById('weightDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('modalWeight').classList.add('active');
  }
};

// Food & Activity buttons
document.getElementById('addFoodBtn').onclick = () => {
  document.getElementById('foodDate').value = new Date().toISOString().slice(0,10);
  document.getElementById('modalFood').classList.add('active');
};

document.getElementById('addActivityBtn').onclick = () => {
  document.getElementById('activityDate').value = new Date().toISOString().slice(0,10);
  document.getElementById('modalActivity').classList.add('active');
};

// Modal close handlers
document.getElementById('closeWeightModal').onclick = () => 
  document.getElementById('modalWeight').classList.remove('active');
document.getElementById('closeFoodModal').onclick = () => 
  document.getElementById('modalFood').classList.remove('active');
document.getElementById('closeActivityModal').onclick = () => 
  document.getElementById('modalActivity').classList.remove('active');
document.getElementById('closeGoalModal').onclick = () => 
  document.getElementById('modalGoal').classList.remove('active');

document.getElementById('modalWeight').onclick = (e) => {
  if(e.target.id === 'modalWeight') 
    document.getElementById('modalWeight').classList.remove('active');
};
document.getElementById('modalFood').onclick = (e) => {
  if(e.target.id === 'modalFood') 
    document.getElementById('modalFood').classList.remove('active');
};
document.getElementById('modalActivity').onclick = (e) => {
  if(e.target.id === 'modalActivity') 
    document.getElementById('modalActivity').classList.remove('active');
};
document.getElementById('modalGoal').onclick = (e) => {
  if(e.target.id === 'modalGoal') 
    document.getElementById('modalGoal').classList.remove('active');
};

// Food item change handler
document.getElementById('foodItem').onchange = function(){
  const customGroup = document.getElementById('customFoodGroup');
  const customCalGroup = document.getElementById('customFoodCalGroup');
  
  if(this.value === 'custom'){
    customGroup.style.display = 'block';
    customCalGroup.style.display = 'block';
  } else {
    customGroup.style.display = 'none';
    customCalGroup.style.display = 'none';
  }
  
  updateFoodCaloriePreview();
};

document.getElementById('portionSize').onchange = updateFoodCaloriePreview;
document.getElementById('customFoodCal').oninput = updateFoodCaloriePreview;

function updateFoodCaloriePreview(){
  const foodItem = document.getElementById('foodItem');
  const portion = parseFloat(document.getElementById('portionSize').value) || 1;
  
  let baseCal = 0;
  
  if(foodItem.value === 'custom'){
    baseCal = parseFloat(document.getElementById('customFoodCal').value) || 0;
  } else if(foodItem.value){
    const selectedOption = foodItem.options[foodItem.selectedIndex];
    baseCal = parseFloat(selectedOption.dataset.cal) || 0;
  }
  
  const totalCal = Math.round(baseCal * portion);
  document.getElementById('estimatedFoodCalories').textContent = totalCal;
}

// Activity type change handler
document.getElementById('activityType').onchange = function(){
  const customGroup = document.getElementById('customActivityGroup');
  const customCalGroup = document.getElementById('customCalGroup');
  
  if(this.value === 'custom'){
    customGroup.style.display = 'block';
    customCalGroup.style.display = 'block';
  } else {
    customGroup.style.display = 'none';
    customCalGroup.style.display = 'none';
  }
  
  updateCaloriePreview();
};

document.getElementById('activityDuration').oninput = updateCaloriePreview;
document.getElementById('activityIntensity').onchange = updateCaloriePreview;
document.getElementById('customCalPerMin').oninput = updateCaloriePreview;

function updateCaloriePreview(){
  const activityType = document.getElementById('activityType');
  const duration = parseFloat(document.getElementById('activityDuration').value) || 0;
  const intensity = parseFloat(document.getElementById('activityIntensity').value) || 1;
  
  let calPerMin = 0;
  
  if(activityType.value === 'custom'){
    calPerMin = parseFloat(document.getElementById('customCalPerMin').value) || 0;
  } else if(activityType.value){
    const selectedOption = activityType.options[activityType.selectedIndex];
    calPerMin = parseFloat(selectedOption.dataset.cal) || 0;
  }
  
  const totalCal = Math.round(calPerMin * duration * intensity);
  document.getElementById('estimatedCalories').textContent = totalCal;
}

// Goal buttons
document.getElementById('setGoalLoss').onclick = () => openGoalModal('loss');
document.getElementById('setGoalGain').onclick = () => openGoalModal('gain');
document.getElementById('setGoalCalorie').onclick = () => openGoalModal('calorie');

function openGoalModal(type){
  const modal = document.getElementById('modalGoal');
  const body = document.getElementById('goalModalBody');
  document.getElementById('modalGoalTitle').textContent = 
    type === 'calorie' ? 'Set Calorie Goals' : `Set ${type === 'loss' ? 'Weight Loss' : 'Weight Gain'} Goal`;
  
  if(type === 'calorie'){
    body.innerHTML = `
      <div class="input-group">
        <label>Daily Calorie Intake Goal (kcal)</label>
        <input type="number" id="goalCalorieIntake" value="${GOALS.calorie.intake}" placeholder="2000">
      </div>
      <div class="input-group">
        <label>Daily Calorie Burn Goal (kcal)</label>
        <input type="number" id="goalCalorieBurn" value="${GOALS.calorie.burn}" placeholder="500">
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
    const intake = parseFloat(document.getElementById('goalCalorieIntake').value);
    const burn = parseFloat(document.getElementById('goalCalorieBurn').value);
    if(!intake || !burn) return alert('Please enter both goals');
    GOALS.calorie = { intake, burn };
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

// Save food entry
document.getElementById('saveFood').onclick = () => {
  const date = document.getElementById('foodDate').value;
  const mealType = document.getElementById('mealType').value;
  const foodItem = document.getElementById('foodItem');
  const portion = parseFloat(document.getElementById('portionSize').value);
  
  if(!date || !foodItem.value) {
    return alert('Please select date and food item');
  }
  
  let foodName = '';
  let baseCal = 0;
  
  if(foodItem.value === 'custom'){
    foodName = document.getElementById('customFoodName').value;
    baseCal = parseFloat(document.getElementById('customFoodCal').value);
    if(!foodName || !baseCal) {
      return alert('Please enter custom food name and calories');
    }
  } else {
    const selectedOption = foodItem.options[foodItem.selectedIndex];
    foodName = selectedOption.text;
    baseCal = parseFloat(selectedOption.dataset.cal);
  }
  
  const totalCalories = Math.round(baseCal * portion);
  
  // Create portion label
  let portionLabel = '';
  if(portion === 0.5) portionLabel = ' (Small)';
  else if(portion === 1) portionLabel = '';
  else if(portion === 1.5) portionLabel = ' (Large)';
  else if(portion === 2) portionLabel = ' (XL)';
  
  DATA.food.push({
    Date: date,
    MealType: mealType,
    FoodName: foodName,
    Portion: portion,
    Calories: totalCalories,
    Description: mealType + ': ' + foodName + portionLabel
  });
  
  DATA.food.sort((a,b) => a.Date.localeCompare(b.Date));
  localStorage.setItem('fittrack_data_food', JSON.stringify(DATA.food));
  
  // Reset form
  document.getElementById('foodItem').value = '';
  document.getElementById('portionSize').value = '1';
  document.getElementById('customFoodName').value = '';
  document.getElementById('customFoodCal').value = '';
  document.getElementById('customFoodGroup').style.display = 'none';
  document.getElementById('customFoodCalGroup').style.display = 'none';
  document.getElementById('estimatedFoodCalories').textContent = '0';
  document.getElementById('modalFood').classList.remove('active');
  
  render('calorie');
  alert('Food entry added successfully');
};

// Save activity entry
document.getElementById('saveActivity').onclick = () => {
  const date = document.getElementById('activityDate').value;
  const activityType = document.getElementById('activityType');
  const duration = parseFloat(document.getElementById('activityDuration').value);
  const intensity = parseFloat(document.getElementById('activityIntensity').value);
  
  if(!date || !activityType.value || !duration) {
    return alert('Please enter date, activity type, and duration');
  }
  
  let activityName = '';
  let calPerMin = 0;
  
  if(activityType.value === 'custom'){
    activityName = document.getElementById('customActivityName').value;
    calPerMin = parseFloat(document.getElementById('customCalPerMin').value);
    if(!activityName || !calPerMin) {
      return alert('Please enter custom activity name and calories per minute');
    }
  } else {
    const selectedOption = activityType.options[activityType.selectedIndex];
    activityName = selectedOption.text;
    calPerMin = parseFloat(selectedOption.dataset.cal);
  }
  
  const totalCalories = Math.round(calPerMin * duration * intensity);
  
  DATA.activity.push({
    Date: date,
    Activity: activityName,
    Duration: duration,
    Intensity: intensity,
    CaloriesPerMin: calPerMin,
    TotalCalories: totalCalories
  });
  
  DATA.activity.sort((a,b) => a.Date.localeCompare(b.Date));
  localStorage.setItem('fittrack_data_activity', JSON.stringify(DATA.activity));
  
  // Reset form
  document.getElementById('activityType').value = '';
  document.getElementById('activityDuration').value = '30';
  document.getElementById('activityIntensity').value = '1';
  document.getElementById('customActivityName').value = '';
  document.getElementById('customCalPerMin').value = '';
  document.getElementById('customActivityGroup').style.display = 'none';
  document.getElementById('customCalGroup').style.display = 'none';
  document.getElementById('estimatedCalories').textContent = '0';
  document.getElementById('modalActivity').classList.remove('active');
  
  render('calorie');
  alert('Activity added successfully');
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
  const foodData = DATA.food;
  const activityData = DATA.activity;
  const intakeGoal = GOALS.calorie.intake;
  const burnGoal = GOALS.calorie.burn;
  
  // Calculate today's totals
  const today = new Date().toISOString().slice(0,10);
  const todayFood = foodData.filter(e => e.Date === today);
  const todayActivity = activityData.filter(e => e.Date === today);
  
  const todayIntake = todayFood.reduce((sum, e) => sum + e.Calories, 0);
  const todayBurned = todayActivity.reduce((sum, e) => sum + e.TotalCalories, 0);
  const todayNet = todayIntake - todayBurned;
  const todayActiveMinutes = todayActivity.reduce((sum, e) => sum + e.Duration, 0);
  
  const balance = intakeGoal - burnGoal;
  const balancePercent = balance > 0 ? ((todayNet / balance) * 100).toFixed(0) : 0;
  
  // Calculate streak
  const uniqueDates = [...new Set([...foodData.map(e => e.Date), ...activityData.map(e => e.Date)])];
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
  document.getElementById('calorieIntake').textContent = todayIntake;
  document.getElementById('calorieBurned').textContent = todayBurned;
  document.getElementById('calorieNet').textContent = todayNet;
  document.getElementById('calorieBalance').textContent = balancePercent + '%';
  document.getElementById('calorieIntakeGoal').textContent = intakeGoal;
  document.getElementById('calorieBurnGoal').textContent = burnGoal;
  document.getElementById('activeMinutes').textContent = todayActiveMinutes;
  document.getElementById('calorieStreak').textContent = streak;
  
  // Render today's activities
  renderActivitiesList(todayActivity);
  
  // Render today's food entries
  renderFoodList(todayFood);
  
  // Render chart
  renderCalorieChart();
}

function renderActivitiesList(activities){
  const list = document.getElementById('activitiesList');
  if(activities.length === 0){
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">🏃</div><div class="empty-text">No activities today</div></div>';
  } else {
    list.innerHTML = activities.map(a => `
      <div class="calorie-entry">
        <div class="calorie-entry-header">
          <div class="calorie-entry-time">${a.Activity}</div>
          <div class="calorie-entry-calories">${a.TotalCalories} kcal</div>
        </div>
        <div class="calorie-entry-desc" style="font-size:12px;color:#9ca3af;margin-top:4px">
          ${a.Duration} min • ${a.Intensity === 1 ? 'Normal' : a.Intensity === 0.8 ? 'Light' : a.Intensity === 1.2 ? 'High' : 'Very High'} intensity
        </div>
      </div>
    `).join('');
  }
}

function renderFoodList(food){
  const list = document.getElementById('calorieEntriesList');
  if(food.length === 0){
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">🍽️</div><div class="empty-text">No food entries today</div></div>';
  } else {
    // Group by meal type
    const meals = {
      'Breakfast': [],
      'Lunch': [],
      'Dinner': [],
      'Snack': [],
      'Drink': []
    };
    
    food.forEach(f => {
      const mealType = f.MealType || 'Snack';
      if(meals[mealType]) {
        meals[mealType].push(f);
      } else {
        meals['Snack'].push(f);
      }
    });
    
    let html = '';
    Object.keys(meals).forEach(mealType => {
      if(meals[mealType].length > 0){
        const mealIcon = mealType === 'Breakfast' ? '🌅' : 
                        mealType === 'Lunch' ? '☀️' : 
                        mealType === 'Dinner' ? '🌙' : 
                        mealType === 'Drink' ? '🥤' : '🍪';
        
        const mealTotal = meals[mealType].reduce((sum, f) => sum + f.Calories, 0);
        
        html += `
          <div style="margin-bottom:20px">
            <div style="font-size:13px;font-weight:700;color:#6b7280;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
              <span>${mealIcon} ${mealType}</span>
              <span style="color:#f59e0b">${mealTotal} kcal</span>
            </div>
            ${meals[mealType].map(f => `
              <div class="calorie-entry">
                <div class="calorie-entry-header">
                  <div class="calorie-entry-time">${f.FoodName || f.Description}</div>
                  <div class="calorie-entry-calories">${f.Calories} kcal</div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
    });
    
    list.innerHTML = html;
  }
}

function renderCalorieChart(){
  // Get last 7 days
  const days = [];
  const intakeData = [];
  const burnData = [];
  
  for(let i = 6; i >= 0; i--){
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0,10);
    
    const dayFood = DATA.food.filter(e => e.Date === dateStr);
    const dayActivity = DATA.activity.filter(e => e.Date === dateStr);
    
    const intake = dayFood.reduce((sum, e) => sum + e.Calories, 0);
    const burn = dayActivity.reduce((sum, e) => sum + e.TotalCalories, 0);
    
    days.push(formatDate(dateStr));
    intakeData.push(intake);
    burnData.push(burn);
  }
  
  const ctx = document.getElementById('chartCalorie').getContext('2d');
  
  if(CHARTS.calorie) CHARTS.calorie.destroy();
  CHARTS.calorie = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: 'Intake',
        data: intakeData,
        backgroundColor: '#f59e0b',
        borderRadius: 6,
        barThickness: 20
      },{
        label: 'Burned',
        data: burnData,
        backgroundColor: '#ef4444',
        borderRadius: 6,
        barThickness: 20
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
          callbacks: {
            label: (context) => context.dataset.label + ': ' + context.parsed.y + ' kcal'
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
  DATA.food = JSON.parse(localStorage.getItem('fittrack_data_food') || '[]');
  DATA.activity = JSON.parse(localStorage.getItem('fittrack_data_activity') || '[]');
  
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
