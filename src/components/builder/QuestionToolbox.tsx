"use client";

/**
 * Question builder — left column toolbox.
 *
 * Lists every registered question type grouped by category. Items can be
 * clicked to append, or dragged onto the canvas to insert at a position.
 */

import { useMemo, useState } from "react";
import { getTypesByCategory, type QuestionTypeConfig } from "@/lib/questions";

export const TOOLBOX_DRAG_TYPE = "application/x-eventkh-question-type";

export default function QuestionToolbox({
  onAdd,
  onDragStartType,
  onDragEndType,
}: {
  onAdd: (fieldType: string) => void;
  onDragStartType?: (fieldType: string) => void;
  onDragEndType?: () => void;
}) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => getTypesByCategory(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        types: g.types.filter(
          (t) =>
            t.label.toLowerCase().includes(q) || t.value.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.types.length > 0);
  }, [groups, query]);

  const total = filtered.reduce((n, g) => n + g.types.length, 0);

  const renderItem = (t: QuestionTypeConfig) => (
    <button
      key={t.value}
      type="button"
      className="qb-tb-item"
      draggable
      onClick={() => onAdd(t.value)}
      onDragStart={(e) => {
        e.dataTransfer.setData(TOOLBOX_DRAG_TYPE, t.value);
        e.dataTransfer.effectAllowed = "copy";
        onDragStartType?.(t.value);
      }}
      onDragEnd={() => onDragEndType?.()}
      title={`Add "${t.label}" — click or drag onto the form`}
    >
      <span className="qb-tb-icon" aria-hidden="true">
        {t.icon}
      </span>
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
        {t.label}
      </span>
    </button>
  );

  return (
    <div className="qb-col">
      <div className="qb-col-head">
        <span>Toolbox</span>
        <span style={{ fontWeight: 600, color: "var(--gray-400)" }}>{total}</span>
      </div>
      <div className="qb-col-body">
        <div className="qb-tb-search">
          <input
            className="form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Type to search…"
            style={{ fontSize: "0.83rem", padding: "0.45rem 0.6rem" }}
            aria-label="Search question types"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="qb-tb-empty">No question types match “{query}”.</p>
        ) : (
          filtered.map((group) => (
            <div className="qb-tb-group" key={group.category}>
              <div className="qb-tb-group-label">{group.label}</div>
              {group.types.map(renderItem)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
