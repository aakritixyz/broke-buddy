let expenses = JSON.parse(localStorage.getItem("expenses")) || [
  {name:"Mess Charges",amount:2000,category:"Food"},
  {name:"Coffee",amount:120,category:"Food"},
  {name:"Auto Fare",amount:80,category:"Travel"},
  {name:"Books",amount:450,category:"Personal"},
  {name:"Snacks",amount:250,category:"Food"}
];

let bills = JSON.parse(localStorage.getItem("bills")) || [
  {name:"Electricity",total:1200,perPerson:400,status:"pending"},
  {name:"Wi-Fi",total:600,perPerson:200,status:"pending"},
  {name:"Mess Charges",total:1500,perPerson:500,status:"pending"}
];

let dues = JSON.parse(localStorage.getItem("dues")) || [
  {person:"Rahul",amount:400,type:"you_get"},
  {person:"Neha",amount:250,type:"you_owe"},
  {person:"Simran",amount:300,type:"you_get"}
];

let budget = 8000;

function updateDashboard(){
  const spent = expenses.reduce((s,e)=>s+e.amount,0)+bills.reduce((s,b)=>s+b.total,0);
  const remaining = budget-spent;
  const percent = Math.min((spent/budget)*100,100);
  document.querySelectorAll(".stat-card h2")[0].innerText=`₹${budget}`;
  document.querySelectorAll(".stat-card h2")[1].innerText=`₹${spent}`;
  document.querySelectorAll(".stat-card h2")[2].innerText=`₹${remaining}`;
  const bar=document.querySelector(".progress-bar");
  if(bar) bar.style.width=percent+"%";
}

function addExpense(){
  const inputs=document.querySelectorAll("input");
  const name=inputs[0].value;
  const amount=Number(inputs[1].value);
  const category=document.querySelector("select").value;
  if(!name||amount<=0) return alert("Enter valid expense");
  expenses.push({name,amount,category});
  localStorage.setItem("expenses",JSON.stringify(expenses));
  location.reload();
}

function renderExpenses(){
  const list=document.getElementById("expensesList");
  if(!list) return;
  list.innerHTML="";
  expenses.slice(-5).reverse().forEach(e=>{
    const li=document.createElement("li");
    li.innerHTML=`${e.name} <span>₹${e.amount}</span>`;
    list.appendChild(li);
  });

  const totals=document.getElementById("categoryTotals");
  if(totals){
    totals.innerHTML="";
    const categories=["Food","Utilities","Travel","Personal"];
    categories.forEach(c=>{
      const total=expenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0);
      const li=document.createElement("li");
      li.innerHTML=`${c} <span>₹${total}</span>`;
      totals.appendChild(li);
    });
  }
}

function splitBill(){
  const inputs=document.querySelectorAll("input");
  const name=inputs[0].value;
  const total=Number(inputs[1].value);
  const roommates=Number(inputs[2].value);
  if(!name||total<=0||roommates<=0) return alert("Invalid bill");
  const perPerson=Math.round(total/roommates);
  bills.push({name,total,perPerson,status:"pending"});
  for(let i=0;i<roommates;i++) dues.push({person:`Roommate ${i+1}`,amount:perPerson,type:"you_get"});
  localStorage.setItem("bills",JSON.stringify(bills));
  localStorage.setItem("dues",JSON.stringify(dues));
  renderBills();
}

function renderBills(){
  const list=document.getElementById("billsList");
  if(!list) return;
  list.innerHTML="";
  bills.forEach((b,i)=>{
    const li=document.createElement("li");
    li.innerHTML=`${b.name} <span>${b.status==='pending'?`₹${b.perPerson} (Pending)`:`₹${b.perPerson} (Paid)`}</span>
      <button onclick="markBillPaid(${i})">Mark Paid</button>`;
    list.appendChild(li);
  });
}

function markBillPaid(i){
  bills[i].status="paid";
  localStorage.setItem("bills",JSON.stringify(bills));
  renderBills();
}

function renderDues(){
  const container=document.getElementById("duesContainer");
  if(!container) return;
  container.innerHTML="";
  dues.forEach((d,i)=>{
    const div=document.createElement("div");
    div.className="panel warning";
    div.innerHTML=`<p>${d.type==='you_get'?d.person+' owes you':'You owe '+d.person} ₹${d.amount}</p>
      <button onclick="settleDue(${i})">Mark Paid</button>`;
    container.appendChild(div);
  });
}

function settleDue(i){
  dues.splice(i,1);
  localStorage.setItem("dues",JSON.stringify(dues));
  renderDues();
}

function renderCategoryChart(){
  const ctx=document.getElementById("categoryChart");
  if(!ctx) return;
  const categories=["Food","Utilities","Travel","Personal"];
  const totals=categories.map(c=>expenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0));
  new Chart(ctx,{
    type:"pie",
    data:{labels:categories,datasets:[{data:totals,backgroundColor:["#22c55e","#2dd4bf","#34d399","#6ee7b7"]}]},
    options:{plugins:{legend:{position:"bottom"}}}
  });
}

updateDashboard();
renderExpenses();
renderBills();
renderDues();
renderCategoryChart();