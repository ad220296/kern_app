const form = document.getElementById('employeeForm');
const table = document.getElementById('employeeTable');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.active = true; 

  await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  form.reset();
  loadEmployees();
});

async function loadEmployees() {
  const query = document.getElementById('searchInput').value;
  const res = await fetch(`/api/employees?search=${encodeURIComponent(query)}`);
  const employees = await res.json();

  table.innerHTML = employees.map(e => `
    <tr>
      <td>${e.firstname}</td>
      <td>${e.lastname}</td>
      <td>${e.email}</td>
      <td>${e.position ?? '-'}</td>
      <td>${e.hired_date ?? '-'}</td>
      <td>${e.active ? 'Ja' : 'Nein'}</td>
    </tr>
  `).join('');
}

function showAll() {
  document.getElementById('searchInput').value = '';
  loadEmployees();
}

loadEmployees();
