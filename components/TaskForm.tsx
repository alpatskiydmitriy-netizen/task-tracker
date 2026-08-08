"use client";

import { useState } from "react";
import { STATUSES, LEVELS } from "@/lib/constants";
import type { TaskDTO, CategoryDTO } from "@/lib/types";

interface Props {
  task: TaskDTO | null; // null = создание новой
  categories: CategoryDTO[];
  onClose: () => void;
  onSaved: () => void;
  onCategoryCreated: (c: CategoryDTO) => void;
}

export function TaskForm({ task, categories, onClose, onSaved, onCategoryCreated }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState(task?.status ?? "not_started");
  const [importance, setImportance] = useState(task?.importance ?? "mid");
  const [urgency, setUrgency] = useState(task?.urgency ?? "mid");
  const [categoryId, setCategoryId] = useState<number | "">(task?.categoryId ?? "");
  const [newCategory, setNewCategory] = useState("");
  const [assignee, setAssignee] = useState(task?.assignee ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Название обязательно");
      return;
    }

    setSaving(true);
    try {
      let finalCategoryId = categoryId === "" ? null : categoryId;

      // Если пользователь ввёл новую категорию — создаём её
      if (newCategory.trim()) {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategory.trim() }),
        });
        const created = await res.json();
        finalCategoryId = created.id;
        onCategoryCreated(created);
      }

      const payload = {
        title,
        description: description || null,
        status,
        importance,
        urgency,
        categoryId: finalCategoryId,
        assignee: assignee || null,
        dueDate: dueDate || null,
      };

      const url = task ? `/api/tasks/${task.id}` : "/api/tasks";
      const method = task ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка сохранения");
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            {task ? "Редактировать задачу" : "Новая задача"}
          </h2>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Название *</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Статус</label>
              <select
                className="w-full border rounded px-2 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Важность</label>
              <select
                className="w-full border rounded px-2 py-2 text-sm"
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Срочность</label>
              <select
                className="w-full border rounded px-2 py-2 text-sm"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Категория</label>
              <select
                className="w-full border rounded px-2 py-2 text-sm"
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(e.target.value === "" ? "" : Number(e.target.value))
                }
              >
                <option value="">— не выбрана —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                className="w-full border rounded px-3 py-1.5 text-sm mt-1"
                placeholder="...или новая категория"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ответственный</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Срок</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 text-sm"
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
