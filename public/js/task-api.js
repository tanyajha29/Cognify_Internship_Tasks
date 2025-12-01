// public/js/tasks-api.js
// Lightweight module to manage tasks via REST API and update DOM
// Uses Materialize toast for feedback

const TasksAPI = (function() {
  const base = '/api/tasks';

  // util: show toast (Materialize)
  function toast(msg, classes = '') {
    if (window.M && typeof M.toast === 'function') {
      M.toast({ html: msg, classes });
    } else {
      alert(msg);
    }
  }

  // fetch all tasks and call render callback
  async function fetchTasks() {
    const res = await fetch(base);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return await res.json();
  }

  // create task
  async function createTask(title, description) {
    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({ error: 'Error' }));
      throw new Error(err.error || 'Create failed');
    }
    return await res.json();
  }

  // update task
  async function updateTask(id, data) {
    const res = await fetch(`${base}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({ error: 'Error' }));
      throw new Error(err.error || 'Update failed');
    }
    return await res.json();
  }

  // delete
  async function deleteTask(id) {
    const res = await fetch(`${base}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(()=>({ error: 'Error' }));
      throw new Error(err.error || 'Delete failed');
    }
    return await res.json();
  }

  return { fetchTasks, createTask, updateTask, deleteTask, toast };
})();
