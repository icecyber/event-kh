"use client";

/**
 * Question builder — center canvas.
 *
 * Renders each question as a selectable card showing a live, non-interactive
 * preview of the attendee-facing control. Supports reordering by dragging
 * cards, and insertion by dropping a type from the toolbox.
 */

import { useState } from "react";
import { getQuestionType } from "@/lib/questions";
import { QuestionRenderer } from "@/lib/questions/renderers";
import type { QuestionDraft } from "@/components/QuestionEditor";
import { TOOLBOX_DRAG_TYPE } from "./QuestionToolbox";
import { draftToPreviewField } from "./previewField";

const CARD_DRAG_TYPE = "application/x-eventkh-question-index";

export default function QuestionCanvas({
  fields,
  selectedIndex,
  onSelect,
  onRemove,
  onDuplicate,
  onMove,
  onInsertType,
  eventId,
}: {
  fields: QuestionDraft[];
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onInsertType: (fieldType: string, index: number) => void;
  eventId: string;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ index: number; after: boolean } | null>(null);
  const [zoneActive, setZoneActive] = useState(false);

  const clearDrag = () => {
    setDragIndex(null);
    setDropTarget(null);
    setZoneActive(false);
  };

  /** Resolve where a drop should land relative to the hovered card. */
  const computeTarget = (e: React.DragEvent, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    return { index, after };
  };

  const handleCardDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    const newType = e.dataTransfer.getData(TOOLBOX_DRAG_TYPE);
    const target = computeTarget(e, index);
    const insertAt = target.after ? index + 1 : index;

    if (newType) {
      onInsertType(newType, insertAt);
      clearDrag();
      return;
    }

    const raw = e.dataTransfer.getData(CARD_DRAG_TYPE);
    if (raw !== "") {
      const from = Number(raw);
      if (!Number.isNaN(from)) {
        // Removing the dragged card first shifts later indices down by one.
        let to = insertAt;
        if (from < to) to -= 1;
        if (to !== from) onMove(from, to);
      }
    }
    clearDrag();
  };

  const handleZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const newType = e.dataTransfer.getData(TOOLBOX_DRAG_TYPE);
    if (newType) onInsertType(newType, fields.length);
    clearDrag();
  };

  return (
    <>
      <div className="qb-col-head">
        <span>Form</span>
        <span style={{ fontWeight: 600, color: "var(--gray-400)" }}>
          {fields.length} question{fields.length === 1 ? "" : "s"}
        </span>
      </div>

      <div
        className="qb-canvas-body"
        onClick={() => onSelect(null)}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes(TOOLBOX_DRAG_TYPE)) {
            e.preventDefault();
            setZoneActive(true);
          }
        }}
        onDragLeave={() => setZoneActive(false)}
        onDrop={handleZoneDrop}
      >
        <div className="qb-canvas-inner">
          {fields.length === 0 ? (
            <div className={`qb-dropzone ${zoneActive ? "active" : ""}`}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🧩</div>
              <p style={{ margin: 0, fontWeight: 600 }}>Your form is empty</p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem" }}>
                Click or drag a question type from the toolbox to get started.
              </p>
            </div>
          ) : (
            <>
              {fields.map((draft, i) => {
                const config = getQuestionType(draft.fieldType);
                const previewField = draftToPreviewField(draft, i);
                const isDropBefore =
                  dropTarget?.index === i && !dropTarget.after && dragIndex !== i;
                const isDropAfter =
                  dropTarget?.index === i && dropTarget.after && dragIndex !== i;

                return (
                  <div
                    key={draft.id ?? draft._key ?? i}
                    className={[
                      "qb-card",
                      selectedIndex === i ? "selected" : "",
                      dragIndex === i ? "dragging" : "",
                      isDropBefore ? "drop-before" : "",
                      isDropAfter ? "drop-after" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(i);
                    }}
                    onDragOver={(e) => {
                      const hasType = e.dataTransfer.types.includes(TOOLBOX_DRAG_TYPE);
                      const hasCard = e.dataTransfer.types.includes(CARD_DRAG_TYPE);
                      if (!hasType && !hasCard) return;
                      e.preventDefault();
                      e.stopPropagation();
                      setDropTarget(computeTarget(e, i));
                      setZoneActive(false);
                    }}
                    onDrop={(e) => handleCardDrop(e, i)}
                  >
                    <div className="qb-card-top">
                      <span
                        className="qb-grip"
                        draggable
                        aria-label="Drag to reorder"
                        onDragStart={(e) => {
                          e.dataTransfer.setData(CARD_DRAG_TYPE, String(i));
                          e.dataTransfer.effectAllowed = "move";
                          setDragIndex(i);
                        }}
                        onDragEnd={clearDrag}
                        onClick={(e) => e.stopPropagation()}
                      >
                        ⠿
                      </span>

                      <span
                        className={`qb-card-label ${draft.label.trim() ? "" : "placeholder"}`}
                      >
                        {draft.label.trim() || "Untitled question"}
                        {draft.required && (
                          <span style={{ color: "var(--rose-500)", marginLeft: 4 }}>*</span>
                        )}
                      </span>

                      <span className="qb-type-chip">
                        {config?.label ?? draft.fieldType}
                      </span>

                      <span className="qb-card-actions">
                        <button
                          type="button"
                          className="qb-icon-btn"
                          title="Move up"
                          disabled={i === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMove(i, i - 1);
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="qb-icon-btn"
                          title="Move down"
                          disabled={i === fields.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMove(i, i + 1);
                          }}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="qb-icon-btn"
                          title="Duplicate"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(i);
                          }}
                        >
                          ⧉
                        </button>
                        <button
                          type="button"
                          className="qb-icon-btn danger"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(i);
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    </div>

                    {/* Non-interactive preview of the attendee control. */}
                    <div className="qb-card-preview" aria-hidden="true">
                      <QuestionRenderer
                        field={previewField}
                        value={undefined}
                        onChange={() => {}}
                        disabled
                        eventId={eventId}
                      />
                    </div>

                    {draft.helpText && (
                      <p
                        style={{
                          fontSize: "0.76rem",
                          color: "var(--gray-400)",
                          margin: "0.4rem 0 0",
                        }}
                      >
                        {draft.helpText}
                      </p>
                    )}
                  </div>
                );
              })}

              <div
                className={`qb-dropzone ${zoneActive ? "active" : ""}`}
                style={{ padding: "1.1rem" }}
                onDragOver={(e) => {
                  if (e.dataTransfer.types.includes(TOOLBOX_DRAG_TYPE)) {
                    e.preventDefault();
                    setZoneActive(true);
                  }
                }}
                onDrop={handleZoneDrop}
              >
                Drop a question type here to add it at the end
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
