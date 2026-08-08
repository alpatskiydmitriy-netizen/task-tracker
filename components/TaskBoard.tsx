"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "./Badge";
import { TaskForm } from "./TaskForm";
import { STATUSES, LEVELS, statusInfo, levelInfo } from "@/lib/constants";
import type { TaskDTO, CategoryDTO } from "@/lib/types";

export function TaskBoard() {
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TaskDTO | null | "new">(null);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterImportance, setFilterImportance] = useState("");
  const [search, setSearch] = useState("");

  async function loadAll() {
    setLoading(true);
    const [tRes, cRes] = await Promise.all([fetch("/api/tasks"), fetch("/api/categories")]);
    setTasks(await tRes.json());
    setCategories(await cRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Удалить задачу?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    loadAll();
  }

  async function handleStatusChange(id: number, status: string) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadAll();
  }

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterImportance && t.importance !== filterImportance) return false;
      if (filterCategory && String(t.categoryId) !== filterCategory) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filterStatus, filterImportance, filterCategory, search]);

  const isOverdue = (dueDate: string | null, status: string) =>
    dueDate && status !== "done" && status !== "cancelled" && new Date(dueDate) < new Date(new Date().toDateString());

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Мои задачи</h1>
        <button
          onClick={() => setEditing("new")}
          className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
        >
          + Новая задача
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded px-2 py-1.5 text-sm"
        >
          <option value="">Все статусы</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={filterImportance}
          onChange={(e) => setFilterImportance(e.target.value)}
          className="border rounded px-2 py-1.5 text-sm"
        >
          <option value="">Вся важность</option>
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border rounded px-2 py-1.5 text-sm"
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">Задач нет. Создай первую.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-3 py-2">Задача</th>
                <th className="px-3 py-2">Статус</th>
                <th className="px-3 py-2">Важность</th>
                <th className="px-3 py-2">Срочность</th>
                <th className="px-3 py-2">Категория</th>
                <th className="px-3 py-2">Ответственный</th>
                <th className="px-3 py-2">Срок</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const si = statusInfo(t.status);
                const ii = levelInfo(t.importance);
                const ui = levelInfo(t.urgency);
                const overdue = isOverdue(t.dueDate, t.status);
                return (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <button
                        className="font-medium text-left hover:underline"
                        onClick={() => setEditing(t)}
                      >
                        {t.title}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        className="text-xs border-none bg-transparent cursor-pointer"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <div>
                        <Badge label={si.label} color={si.color} />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge label={ii.label} color={ii.color} />
                    </td>
                    <td className="px-3 py-2">
                      <Badge label={ui.label} color={ui.color} />
                    </td>
                    <td className="px-3 py-2 text-gray-600">{t.categoryName ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-600">{t.assignee ?? "—"}</td>
                    <td className={`px-3 py-2 ${overdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                      {t.dueDate ?? "—"} {overdue && "⚠"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-gray-400 hover:text-red-600 text-xs"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <TaskForm
          task={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={loadAll}
          onCategoryCreated={(c) => setCategories((prev) => [...prev, c])}
        />
      )}
    </div>
  );
}
