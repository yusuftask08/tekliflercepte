"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function ErrorText({ error }) {
  if (!error) return null;
  return <div className="mt-1.5 text-xs text-danger">{error}</div>;
}

function NewCategoryForm({ parentId, onDone }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), parentId: parentId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kategori eklenemedi");
        return;
      }
      setName("");
      onDone?.();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-2 flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={parentId ? "Alt kategori adı" : "Ana kategori adı"}
        className="flex-1 rounded-md border border-border bg-bg px-2.5 py-1.5 text-xs"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-text-on-brand disabled:opacity-50"
      >
        Ekle
      </button>
      {error && <ErrorText error={error} />}
    </form>
  );
}

function EditCategoryForm({ category, onDone }) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [questionsText, setQuestionsText] = useState(
    category.questions ? JSON.stringify(category.questions, null, 2) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    let questions;
    if (questionsText.trim()) {
      try {
        questions = JSON.parse(questionsText);
      } catch {
        setError("Sorular geçerli bir JSON değil");
        return;
      }
    } else {
      questions = null;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), questions }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kaydedilemedi");
        return;
      }
      onDone?.();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-2 flex flex-col gap-2 rounded-md border border-border bg-bg p-2.5">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs"
      />
      <textarea
        value={questionsText}
        onChange={(e) => setQuestionsText(e.target.value)}
        rows={5}
        placeholder="Kalifikasyon soruları (JSON, opsiyonel)"
        className="rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-[11px]"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-text-on-brand disabled:opacity-50"
        >
          Kaydet
        </button>
        <button type="button" onClick={onDone} className="text-xs font-semibold text-text-muted">
          Vazgeç
        </button>
      </div>
      <ErrorText error={error} />
    </form>
  );
}

function DeleteButton({ categoryId }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const del = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Silinemedi");
        setConfirming(false);
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <ErrorText error={error} />;

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-xs font-semibold text-danger">
        Sil
      </button>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs">
      Emin misin?
      <button onClick={del} disabled={submitting} className="font-semibold text-danger">
        Evet
      </button>
      <button onClick={() => setConfirming(false)} className="text-text-muted">
        Vazgeç
      </button>
    </span>
  );
}

function CategoryRow({ category }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <EditCategoryForm category={category} onDone={() => setEditing(false)} />;
  return (
    <li className="flex items-center justify-between gap-2 rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">
      {category.name}
      <span className="flex gap-1.5">
        <button onClick={() => setEditing(true)} className="font-semibold text-brand-700 underline">
          Düzenle
        </button>
        <DeleteButton categoryId={category.id} />
      </span>
    </li>
  );
}

export function CategoryManager({ categories }) {
  const [addingTop, setAddingTop] = useState(false);
  const [addingSubFor, setAddingSubFor] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);

  return (
    <div>
      <div className="mb-4">
        {addingTop ? (
          <NewCategoryForm onDone={() => setAddingTop(false)} />
        ) : (
          <button
            onClick={() => setAddingTop(true)}
            className="rounded-md border border-border bg-surface px-3.5 py-2 text-sm font-semibold shadow-sm"
          >
            + Yeni Ana Kategori
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((group) => (
          <div key={group.id} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="font-bold">{group.name}</div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setEditingGroup(editingGroup === group.id ? null : group.id)}
                  className="text-xs font-semibold text-primary"
                >
                  Düzenle
                </button>
                <DeleteButton categoryId={group.id} />
              </div>
            </div>
            {editingGroup === group.id && (
              <EditCategoryForm category={group} onDone={() => setEditingGroup(null)} />
            )}
            <div className="mt-1 text-xs text-text-muted">{group.children.length} alt kategori</div>
            {group.questions && (
              <div className="mt-1 text-xs text-text-muted">{group.questions.length} kalifikasyon sorusu</div>
            )}
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {group.children.map((sub) => (
                <CategoryRow key={sub.id} category={sub} />
              ))}
            </ul>

            {addingSubFor === group.id ? (
              <NewCategoryForm parentId={group.id} onDone={() => setAddingSubFor(null)} />
            ) : (
              <button
                onClick={() => setAddingSubFor(group.id)}
                className="mt-3 text-xs font-semibold text-primary"
              >
                + Alt Kategori Ekle
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
