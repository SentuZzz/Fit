// ===== HELPERS =====
function fmtRub(v){return '₽ '+Math.abs(v).toLocaleString('ru-RU')}
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
let currentRole='admin';
let cart=[];
let topUpClientId=null;
let historyClientId=null;
let historyFilter='all';

// ===== ROLE SELECTOR =====
$$('.role-card').forEach(card=>{
  card.addEventListener('click',()=>{
    $$('.role-card').forEach(c=>c.classList.remove('active'));
    card.classList.add('active');
    currentRole=card.dataset.role;
  });
});

// ===== AUTH TABS =====
$$('.auth-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    $$('.auth-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const isLogin=tab.dataset.tab==='login';
    $('#loginForm').style.display=isLogin?'block':'none';
    $('#signupForm').style.display=isLogin?'none':'block';
  });
});

$('#loginForm').addEventListener('submit',e=>{e.preventDefault();enterApp()});
$('#signupForm').addEventListener('submit',e=>{e.preventDefault();enterApp()});

function enterApp(){
  $('#authScreen').style.display='none';
  $('#app').classList.add('visible');
  
  // Recalculate balances from transactions for consistency
  CLIENTS.forEach(c => {
    const txns = CLIENT_TRANSACTIONS[c.id] || [];
    c.balance = txns.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -Math.abs(t.amount)), 0);
  });

  if(currentRole==='admin'){
    $('#sidebarAdmin').style.display='flex';
    $('#sidebarTrainer').style.display='none';
    initDashboard();renderClients();renderSubscriptions();renderMenu();renderFinancials();renderAdminTrainers();
    showPage('dashboard');
  } else {
    $('#sidebarAdmin').style.display='none';
    $('#sidebarTrainer').style.display='flex';
    renderTrainerClients();renderDiary();renderSchedule();
    showPage('trainerClients');
  }
}

// ===== NAVIGATION =====
function showPage(page){
  $$('.page').forEach(p=>p.classList.remove('active'));
  const titles={dashboard:'Командный центр',clients:'Управление клиентами',subscriptions:'Абонементы',adminTrainers:'Тренеры',pos:'Фитнес-бар',finance:'Финансы',adminProfile:'Профиль',trainerClients:'Мои клиенты',trainerDiary:'Дневник тренировок',trainerSchedule:'Расписание',trainerProfile:'Профиль'};
  $('#pageTitle').textContent=titles[page]||'Главная';
  const pageId='page'+page.charAt(0).toUpperCase()+page.slice(1);
  const el=document.getElementById(pageId);
  if(el)el.classList.add('active');

  // Sync sidebar active state
  $$('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
}

document.addEventListener('click',e=>{
  const navItem=e.target.closest('.nav-item');
  const actionTile=e.target.closest('.action-tile');
  const target = navItem || actionTile;
  
  if(!target)return;
  
  showPage(target.dataset.page);
});

$('#logoutBtn').addEventListener('click',()=>{
  $('#app').classList.remove('visible');
  $('#authScreen').style.display='';
  $$('.nav-item').forEach(n=>n.classList.remove('active'));
});

// ===== DASHBOARD =====
function initDashboard(){
  // 0. Hero Stats Calculations
  let totalIncome = 0;
  Object.values(CLIENT_TRANSACTIONS).forEach(txns => {
    txns.forEach(t => { if(t.type === 'credit') totalIncome += t.amount; });
  });
  
  const activeSubs = CLIENT_SUBS.filter(s => s.status === 'Активен').length;
  const totalCapacity = 40; // Realistic club capacity
  const currentInGym = LIVE_CLIENTS.length;
  const loadingPct = Math.round((currentInGym / totalCapacity) * 100);

  $('#h-income').textContent = fmtRub(totalIncome);
  $('#h-load').textContent = `${loadingPct}%`;
  $('#h-active').textContent = activeSubs;

  // 0.1 Live Clients List
  const liveList = $('#liveClientsList');
  const liveClientsData = LIVE_CLIENTS.map(id => CLIENTS.find(c => c.id === id)).filter(Boolean);
  
  liveList.innerHTML = liveClientsData.map(c => `
    <div class="live-client-item">
      <div class="lc-avatar">${c.first[0]}${c.last[0]}</div>
      <div class="lc-info">
        <div class="lc-name">${c.first} ${c.last}</div>
        <div class="lc-time">В зале • ${Math.floor(Math.random()*40)+20} мин</div>
      </div>
    </div>
  `).join('');

  // 1. Priority List (Expiring subs & Low balance)
  const priorityList = $('#priorityList');
  const priorities = [];
  
  CLIENT_SUBS.filter(s => s.status === 'Истёк').forEach(s => {
    priorities.push({ type: 'Абонемент истёк', title: s.client, desc: `Тариф: ${s.plan}`, level: 'high' });
  });
  
  CLIENTS.filter(c => c.balance < 1000 && c.balance > 0).forEach(c => {
    priorities.push({ type: 'Низкий баланс', title: `${c.first} ${c.last}`, desc: `Остаток: ${fmtRub(c.balance)}`, level: 'medium' });
  });

  priorityList.innerHTML = priorities.map(p => `
    <div class="priority-item" style="border-left-color: ${p.level === 'high' ? 'var(--red)' : 'var(--yellow)'}">
      <div class="p-type" style="color: ${p.level === 'high' ? 'var(--red)' : 'var(--yellow)'}">${p.type}</div>
      <div class="p-title">${p.title}</div>
      <div class="p-desc">${p.desc}</div>
    </div>
  `).join('');

  // 2. Activity Feed (Transactions)
  const activityFeed = $('#activityFeed');
  const allTxn = [];
  Object.keys(CLIENT_TRANSACTIONS).forEach(id => {
    const c = CLIENTS.find(cl => cl.id === parseInt(id));
    CLIENT_TRANSACTIONS[id].forEach(t => allTxn.push({ ...t, clientName: c ? c.first + ' ' + c.last : 'Клиент' }));
  });
  
  // Sort by date (descending)
  allTxn.sort((a, b) => b.date.localeCompare(a.date));

  activityFeed.innerHTML = allTxn.slice(0, 10).map(t => `
    <div class="feed-item ${t.type}">
      <div class="fi-icon">
        ${t.type === 'credit' 
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2" width="20"><path d="M12 5v14M5 12l7 7 7-7"/></svg>' 
          : '<svg viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2" width="20"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'}
      </div>
      <div class="fi-content">
        <div class="fi-header">
          <span class="fi-title">${t.clientName}</span>
          <span class="fi-time">${t.date}</span>
        </div>
        <div class="fi-body">${t.desc}</div>
        <div class="fi-footer" style="color: ${t.type === 'credit' ? 'var(--green)' : 'var(--orange)'}">
          ${t.type === 'credit' ? '+' : '-'}${fmtRub(t.amount)}
        </div>
      </div>
    </div>
  `).join('');

  // 3. Insights
  const topTrainer = ADMIN_TRAINERS.reduce((prev, current) => (prev.rating > current.rating) ? prev : current);
  $('#topTrainer').textContent = `${topTrainer.first} ${topTrainer.last[0]}.`;
  
  const cats = {};
  MENU_ITEMS.forEach(i => cats[i.cat] = (cats[i.cat] || 0) + 1);
  const topCat = Object.keys(cats).reduce((a, b) => cats[a] > cats[b] ? a : b);
  $('#topProduct').textContent = topCat;
}

// ===== CLIENTS =====
function renderClients(filter='',status=''){
  const filtered=CLIENTS.filter(c=>{
    const matchName=`${c.first} ${c.last}`.toLowerCase().includes(filter.toLowerCase());
    const matchStatus=!status||c.status===status;
    return matchName&&matchStatus;
  });
  $('#clientsTable').innerHTML=filtered.map(c=>{
    const bc=c.status==='Активен'?'active':c.status==='Истёк'?'expired':'pending';
    return `<tr><td><strong>${c.first} ${c.last}</strong></td><td>${c.email}</td><td>${c.phone}</td><td><strong>${fmtRub(c.balance)}</strong></td><td>${c.sub}</td><td><span class="badge badge-${bc}">${c.status}</span></td>
      <td><div class="action-btns"><button class="action-btn" onclick="editClient(${c.id})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Редактировать</button></div></td></tr>`;
  }).join('');
}

$('#clientSearch')?.addEventListener('input',e=>renderClients(e.target.value,$('#clientStatusFilter').value));
$('#clientStatusFilter')?.addEventListener('change',e=>renderClients($('#clientSearch').value,e.target.value));
$('#addClientBtn')?.addEventListener('click',()=>$('#addClientModal').classList.add('open'));
$('#closeClientModal')?.addEventListener('click',()=>$('#addClientModal').classList.remove('open'));
$('#cancelClientModal')?.addEventListener('click',()=>$('#addClientModal').classList.remove('open'));
$('#saveClient')?.addEventListener('click',()=>{
  const f=$('#ncFirst').value,l=$('#ncLast').value;
  if(f&&l){
    const newId=CLIENTS.length+1;
    CLIENTS.unshift({id:newId,first:f,last:l,email:$('#ncEmail').value,phone:$('#ncPhone').value,balance:parseFloat($('#ncBalance').value)||0,sub:$('#ncSub').value,status:'Активен'});
    CLIENT_TRANSACTIONS[newId]=[];
    renderClients();renderFinancials();
    $('#addClientModal').classList.remove('open');
    ['#ncFirst','#ncLast','#ncEmail','#ncPhone','#ncBalance'].forEach(s=>$(s).value='');
  }
});

// ===== EDIT CLIENT =====
window.editClient=function(id){
  const c=CLIENTS.find(cl=>cl.id===id);
  if(!c)return;
  $('#ecId').value=c.id;
  $('#ecFirst').value=c.first;
  $('#ecLast').value=c.last;
  $('#ecEmail').value=c.email;
  $('#ecPhone').value=c.phone;
  $('#ecBalance').value=c.balance;
  $('#ecSub').value=c.sub;
  $('#ecStatus').value=c.status;
  $('#editClientModal').classList.add('open');
};

$('#closeEditClientModal')?.addEventListener('click',()=>$('#editClientModal').classList.remove('open'));
$('#cancelEditClientModal')?.addEventListener('click',()=>$('#editClientModal').classList.remove('open'));
$('#saveEditClient')?.addEventListener('click',()=>{
  const id=parseInt($('#ecId').value);
  const c=CLIENTS.find(cl=>cl.id===id);
  if(c){
    c.first=$('#ecFirst').value;
    c.last=$('#ecLast').value;
    c.email=$('#ecEmail').value;
    c.phone=$('#ecPhone').value;
    c.balance=parseFloat($('#ecBalance').value)||0;
    c.sub=$('#ecSub').value;
    c.status=$('#ecStatus').value;
    renderClients();
    renderFinancials();
    $('#editClientModal').classList.remove('open');
  }
});

// ===== SUBSCRIPTIONS =====
function renderSubscriptions(){
  $('#subCards').innerHTML=SUB_TYPES.map(s=>`
    <div class="sub-card"><h4>${s.name}</h4><div class="price">${fmtRub(s.price)} <span>/ ${s.duration}</span></div>
    <ul class="features">${s.features.map(f=>`<li>${f}</li>`).join('')}</ul></div>`).join('');
  $('#clientSubsTable').innerHTML=CLIENT_SUBS.map(s=>{
    const bc=s.status==='Активен'?'active':'expired';
    return `<tr><td>${s.client}</td><td>${s.plan}</td><td>${s.start}</td><td>${s.end}</td><td><span class="badge badge-${bc}">${s.status}</span></td></tr>`;
  }).join('');
}

// ===== ADMIN TRAINERS =====
function renderAdminTrainers(filter='',spec=''){
  const filtered=ADMIN_TRAINERS.filter(t=>{
    const matchName=`${t.first} ${t.last}`.toLowerCase().includes(filter.toLowerCase());
    const matchSpec=!spec||t.spec===spec;
    return matchName&&matchSpec;
  });
  $('#trainersList').innerHTML=filtered.map(t=>{
    const initials=t.first[0]+t.last[0];
    return `<div class="trainer-card"><div class="trainer-card-top"><div class="trainer-card-avatar">${initials}</div>
    <div class="trainer-card-info"><h4>${t.first} ${t.last}</h4><p>${t.spec}</p></div></div>
    <div class="trainer-card-stats"><div class="tcs-item"><div class="tcs-value">${t.clients}</div><div class="tcs-label">Клиентов</div></div>
    <div class="tcs-item"><div class="tcs-value">${t.sessions}</div><div class="tcs-label">Тренировок</div></div>
    <div class="tcs-item"><div class="tcs-value">${t.rating}</div><div class="tcs-label">Рейтинг</div></div></div></div>`;
  }).join('');
}

$('#trainerSearch')?.addEventListener('input',e=>renderAdminTrainers(e.target.value,$('#trainerSpecFilter').value));
$('#trainerSpecFilter')?.addEventListener('change',e=>renderAdminTrainers($('#trainerSearch').value,e.target.value));

// ===== POS =====
function renderMenu(filter='',cat=''){
  const items=MENU_ITEMS.filter(i=>i.name.toLowerCase().includes(filter.toLowerCase())&&(!cat||i.cat===cat));
  $('#menuGrid').innerHTML=items.map(i=>`
    <div class="menu-item" onclick="addToCart(${i.id})"><div class="item-img"><img src="${i.img}" alt="${i.name}"></div>
    <div class="item-name">${i.name}</div><div class="item-price">${fmtRub(i.price)}</div></div>`).join('');
}

$('#menuSearch')?.addEventListener('input',e=>renderMenu(e.target.value,$('#menuCatFilter').value));
$('#menuCatFilter')?.addEventListener('change',e=>renderMenu($('#menuSearch').value,e.target.value));

window.addToCart=function(id){
  const item=MENU_ITEMS.find(i=>i.id===id);
  const existing=cart.find(c=>c.id===id);
  if(existing)existing.qty++;else cart.push({...item,qty:1});
  renderCart();
};

function renderCart(){
  if(cart.length===0){
    $('#cartItems').innerHTML='<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg></div><p>Корзина пуста</p></div>';
  } else {
    $('#cartItems').innerHTML=cart.map(c=>`
      <div class="cart-item"><div class="ci-info"><div class="ci-name"><img class="ci-img" src="${c.img}" alt="${c.name}">${c.name}</div><div class="ci-price">${fmtRub(c.price)}</div></div>
      <div class="ci-qty"><button onclick="updateQty(${c.id},-1)">−</button><span>${c.qty}</span><button onclick="updateQty(${c.id},1)">+</button></div></div>`).join('');
  }
  $('#cartTotal').textContent=fmtRub(cart.reduce((s,c)=>s+c.price*c.qty,0));
}

window.updateQty=function(id,delta){
  const item=cart.find(c=>c.id===id);
  if(item){item.qty+=delta;if(item.qty<=0)cart=cart.filter(c=>c.id!==id);}
  renderCart();
};

$$('.toggle-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    btn.parentElement.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});

$('#checkoutBtn')?.addEventListener('click',()=>{
  if(cart.length>0){alert('Покупка успешно завершена!');cart=[];renderCart();}
});

// ===== FINANCIALS =====
function renderFinancials(){
  const totalBal=CLIENTS.reduce((s,c)=>s+c.balance,0);
  let totalCredits=0,totalDebits=0;
  Object.values(CLIENT_TRANSACTIONS).forEach(txns=>txns.forEach(t=>{
    if(t.type==='credit')totalCredits+=t.amount;else totalDebits+=Math.abs(t.amount);
  }));

  $('#financeStats').innerHTML=`
    <div class="stat-card"><div class="stat-icon green"><span style="font-size:22px;font-weight:700;font-family:inherit">₽</span></div><div class="stat-value">${fmtRub(totalBal)}</div><div class="stat-label">Общий баланс клиентов</div></div>
    <div class="stat-card"><div class="stat-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div><div class="stat-value">${fmtRub(totalCredits)}</div><div class="stat-label">Пополнений за период</div></div>
    <div class="stat-card"><div class="stat-icon orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg></div><div class="stat-value">${fmtRub(totalDebits)}</div><div class="stat-label">Списаний за период</div></div>`;

  renderFinanceTable();
}

function renderFinanceTable(filter=''){
  const filtered=CLIENTS.filter(c=>`${c.first} ${c.last}`.toLowerCase().includes(filter.toLowerCase()));
  $('#financeTable').innerHTML=filtered.map(c=>{
    const txns=CLIENT_TRANSACTIONS[c.id]||[];
    const lastTxn=txns.length>0?txns[0].desc+' ('+txns[0].date+')':'—';
    const initials=c.first[0]+c.last[0];
    return `<tr><td><div class="client-balance-row"><div class="client-avatar-sm">${initials}</div><strong>${c.first} ${c.last}</strong></div></td>
    <td><strong>${fmtRub(c.balance)}</strong></td><td style="font-size:13px;color:var(--text-secondary)">${lastTxn}</td>
    <td><div class="action-btns"><button class="action-btn topup-btn" onclick="openTopUp(${c.id})">↑ Пополнить</button>
    <button class="action-btn history-btn" onclick="openHistory(${c.id})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> История</button></div></td></tr>`;
  }).join('');
}

$('#financeSearch')?.addEventListener('input',e=>renderFinanceTable(e.target.value));

// Top Up Client
window.openTopUp=function(id){
  topUpClientId=id;
  const c=CLIENTS.find(cl=>cl.id===id);
  const initials=c.first[0]+c.last[0];
  $('#topUpClientInfo').innerHTML=`<div class="mci-avatar">${initials}</div><div class="mci-details"><div class="mci-name">${c.first} ${c.last}</div><div class="mci-balance">Текущий баланс: <strong>${fmtRub(c.balance)}</strong></div></div>`;
  $('#topUpClientAmount').value='';$('#topUpClientNote').value='';
  $('#topUpClientModal').classList.add('open');
};

$('#closeTopUpClientModal')?.addEventListener('click',()=>$('#topUpClientModal').classList.remove('open'));
$('#topUpClientSubmit')?.addEventListener('click',()=>{
  const amt=parseFloat($('#topUpClientAmount').value);
  if(amt>0&&topUpClientId){
    const c=CLIENTS.find(cl=>cl.id===topUpClientId);
    c.balance+=amt;
    if(!CLIENT_TRANSACTIONS[topUpClientId])CLIENT_TRANSACTIONS[topUpClientId]=[];
    const note=$('#topUpClientNote').value;
    CLIENT_TRANSACTIONS[topUpClientId].unshift({desc:'Пополнение баланса'+(note?' — '+note:''),date:'12 мая 2026',amount:amt,type:'credit'});
    renderFinancials();renderClients();
    $('#topUpClientModal').classList.remove('open');
  }
});

// Client History
window.openHistory=function(id){
  historyClientId=id;historyFilter='all';
  $$('.history-filter-btn').forEach(b=>{b.classList.remove('active');if(b.dataset.filter==='all')b.classList.add('active');});
  renderClientHistory();
  $('#clientHistoryModal').classList.add('open');
};

function renderClientHistory(){
  const c=CLIENTS.find(cl=>cl.id===historyClientId);
  if(!c)return;
  const initials=c.first[0]+c.last[0];
  $('#historyClientInfo').innerHTML=`<div class="mci-avatar">${initials}</div><div class="mci-details"><div class="mci-name">${c.first} ${c.last}</div><div class="mci-balance">Текущий баланс: <strong>${fmtRub(c.balance)}</strong></div></div>`;
  $('#historyModalTitle').textContent='История — '+c.first+' '+c.last;
  let txns=CLIENT_TRANSACTIONS[c.id]||[];
  if(historyFilter!=='all')txns=txns.filter(t=>t.type===historyFilter);
  if(txns.length===0){
    $('#clientTxnList').innerHTML='<div class="empty-state"><p>Нет транзакций</p></div>';
  } else {
    $('#clientTxnList').innerHTML=txns.map(t=>`
      <li class="txn-item"><div class="txn-info"><div class="txn-icon ${t.type}">${t.type==='credit'?'↓':'↑'}</div>
      <div><div class="txn-desc">${t.desc}</div><div class="txn-date">${t.date}</div></div></div>
      <div class="txn-amount ${t.type==='credit'?'pos':'neg'}">${t.type==='credit'?'+':'-'}${fmtRub(t.amount)}</div></li>`).join('');
  }
}

$$('.history-filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $$('.history-filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');historyFilter=btn.dataset.filter;renderClientHistory();
  });
});

$('#closeHistoryModal')?.addEventListener('click',()=>$('#clientHistoryModal').classList.remove('open'));

// ===== TRAINER PAGES =====
function renderTrainerClients(){
  $('#assignedCount').textContent=`${TRAINER_CLIENTS.length} клиентов`;
  $('#trainerClientsTable').innerHTML=TRAINER_CLIENTS.map(c=>`
    <tr><td><strong>${c.client}</strong></td><td>${c.goal}</td><td>${c.nextSession}</td>
    <td><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;background:var(--border);border-radius:3px"><div style="width:${c.progress}%;height:100%;background:var(--orange);border-radius:3px"></div></div><span style="font-size:12px;font-weight:600">${c.progress}%</span></div></td></tr>`).join('');
}

function renderDiary(){
  $('#diaryEntries').innerHTML=DIARY.map(d=>`
    <div class="diary-entry"><div class="de-header"><strong>${d.client} — ${d.type}</strong><span>${d.date}</span></div>
    <p>${d.notes}</p><p style="margin-top:8px;color:var(--green);font-weight:500;font-size:13px;display:flex;align-items:center;gap:6px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> ${d.progress}</p></div>`).join('');
}

function renderSchedule(){
  $('#scheduleGrid').innerHTML=SCHEDULE.map(s=>{
    const bc=s.status==='Подтверждено'?'active':'pending';
    return `<div class="schedule-card"><div class="sc-time">${s.day} · ${s.time}</div><div class="sc-client">${s.client}</div>
    <div class="sc-type">${s.type}</div><div class="sc-status"><span class="badge badge-${bc}">${s.status}</span></div></div>`;
  }).join('');
}

$('#addDiaryBtn')?.addEventListener('click',()=>$('#diaryModal').classList.add('open'));
$('#closeDiaryModal')?.addEventListener('click',()=>$('#diaryModal').classList.remove('open'));
$('#cancelDiaryModal')?.addEventListener('click',()=>$('#diaryModal').classList.remove('open'));
$('#saveDiary')?.addEventListener('click',()=>{
  const notes=$('#diaryNotes').value;
  if(notes){
    DIARY.unshift({client:$('#diaryClient').value,type:$('#diaryType').value,date:'12 мая 2026',notes,progress:$('#diaryProgress').value||'Заметки отсутствуют.'});
    renderDiary();$('#diaryModal').classList.remove('open');$('#diaryNotes').value='';$('#diaryProgress').value='';
  }
});

// Close modals on overlay click
$$('.modal-overlay').forEach(ov=>{
  ov.addEventListener('click',e=>{if(e.target===ov)ov.classList.remove('open');});
});
