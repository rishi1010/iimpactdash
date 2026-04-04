"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  savePaper,
  uploadContextImage,
  type DraftGroup,
  type DraftQuestion,
  type DraftSet,
  type DraftStandalone,
  type Section,
} from "@/actions/pyq-actions";

// ─── helpers ────────────────────────────────────────────────────────────────

function emptyQuestion(): DraftQuestion {
  return {
    text: "",
    options: ["", "", "", ""],
    answer: null,
    explanation: "",
    is_tita: false,
    tita_answer: "",
  };
}

function emptySet(): DraftSet {
  return {
    type: "set",
    label: "",
    context: "",
    context_image_urls: [],
    questions: [emptyQuestion()],
  };
}

function emptyStandalone(): DraftStandalone {
  return {
    type: "standalone",
    question: emptyQuestion(),
  };
}

// ─── question form ───────────────────────────────────────────────────────────

function QuestionForm({
  question,
  onChange,
  onDelete,
  index,
}: {
  question: DraftQuestion;
  onChange: (q: DraftQuestion) => void;
  onDelete: () => void;
  index: number;
}) {
  function setField<K extends keyof DraftQuestion>(
    key: K,
    value: DraftQuestion[K],
  ) {
    onChange({ ...question, [key]: value });
  }

  function setOption(i: number, value: string) {
    const options = [...question.options];
    options[i] = value;
    onChange({ ...question, options });
  }

  return (
    <div className="border border-border rounded-lg p-4 flex flex-col gap-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          Question {index + 1}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`tita-${index}`}
              checked={question.is_tita}
              onCheckedChange={(checked) => {
                onChange({
                  ...question,
                  is_tita: !!checked,
                  options: !!checked ? [] : ["", "", "", ""],
                  answer: null,
                });
              }}
            />
            <Label htmlFor={`tita-${index}`} className="font-mono text-xs">
              TITA
            </Label>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* question text */}
      <div className="flex flex-col gap-1.5">
        <Label className="font-mono text-xs">
          Question (Use Latex if Qa. Convert using Claude)
        </Label>
        <Textarea
          className="font-mono text-sm min-h-20 resize-y"
          placeholder="Enter question text..."
          value={question.text}
          onChange={(e) => setField("text", e.target.value)}
        />
      </div>

      {/* options or tita */}
      {question.is_tita ? (
        <div className="flex flex-col gap-1.5">
          <Label className="font-mono text-xs">TITA Answer</Label>
          <Input
            className="font-mono text-sm"
            placeholder="e.g. 1324 or 42"
            value={question.tita_answer}
            onChange={(e) => setField("tita_answer", e.target.value)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label className="font-mono text-xs">
            Options{" "}
            <span className="text-muted-foreground">
              (check the correct answer)
            </span>
          </Label>
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <Checkbox
                checked={question.answer === i}
                onCheckedChange={() =>
                  setField("answer", question.answer === i ? null : i)
                }
              />
              <Input
                className="font-mono text-sm"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* explanation */}
      <div className="flex flex-col gap-1.5">
        <Label className="font-mono text-xs">
          Explanation (Use Latex if Qa. Convert using Claude)
        </Label>
        <Textarea
          className="font-mono text-sm min-h-16 resize-y"
          placeholder="Explain the correct answer..."
          value={question.explanation}
          onChange={(e) => setField("explanation", e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── set form ────────────────────────────────────────────────────────────────

function SetForm({
  group,
  onChange,
  onDelete,
  groupIndex,
}: {
  group: DraftSet;
  onChange: (g: DraftSet) => void;
  onDelete: () => void;
  groupIndex: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [uploading, setUploading] = useState(false);

  function setField<K extends keyof DraftSet>(key: K, value: DraftSet[K]) {
    onChange({ ...group, [key]: value });
  }

  function updateQuestion(i: number, q: DraftQuestion) {
    const questions = [...group.questions];
    questions[i] = q;
    onChange({ ...group, questions });
  }

  function addQuestion() {
    onChange({ ...group, questions: [...group.questions, emptyQuestion()] });
  }

  function deleteQuestion(i: number) {
    const questions = group.questions.filter((_, idx) => idx !== i);
    onChange({ ...group, questions });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { url, error } = await uploadContextImage(file);
    setUploading(false);
    if (error) {
      toast("Failed to upload image", { description: error });
    } else if (url) {
      setField("context_image_urls", [...group.context_image_urls, url]);
      toast("Image uploaded", { description: "Context image added." });
    }
  }

  return (
    <div className="border border-border rounded-lg p-4 flex flex-col gap-4 bg-card">
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold">
          Set {groupIndex + 1}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* label */}
          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-xs">Set Label</Label>
            <Input
              className="font-mono text-sm"
              placeholder="e.g. RC Passage 1"
              value={group.label}
              onChange={(e) => setField("label", e.target.value)}
            />
          </div>

          {/* context */}
          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-xs">Context Text</Label>
            <Textarea
              className="font-mono text-sm min-h-28 resize-y"
              placeholder="Paste the RC passage or DILR setup here..."
              value={group.context}
              onChange={(e) => setField("context", e.target.value)}
            />
          </div>

          {/* context images */}
          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-xs">Context Images</Label>
            <Input
              type="file"
              accept="image/*"
              className="font-mono text-sm cursor-pointer"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {uploading && (
              <p className="text-xs text-muted-foreground font-mono">
                Uploading...
              </p>
            )}
            {group.context_image_urls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {group.context_image_urls.map((url, i) => (
                  <div key={i} className="relative group/img">
                    <img
                      src={url}
                      alt={`context-${i}`}
                      className="h-16 w-16 object-cover rounded border border-border"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setField(
                          "context_image_urls",
                          group.context_image_urls.filter(
                            (_, idx) => idx !== i,
                          ),
                        )
                      }
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-4 w-4 text-xs flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* questions */}
          <div className="flex flex-col gap-3">
            <Label className="font-mono text-xs">Questions in this Set</Label>
            {group.questions.map((q, i) => (
              <QuestionForm
                key={i}
                index={i}
                question={q}
                onChange={(updated) => updateQuestion(i, updated)}
                onDelete={() => deleteQuestion(i)}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-mono w-fit group"
              onClick={addQuestion}
            >
              <Plus className="h-3 w-3 transition-transform duration-200 group-hover:rotate-90" />
              Add Question to Set
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── standalone form ─────────────────────────────────────────────────────────

function StandaloneForm({
  group,
  onChange,
  onDelete,
  groupIndex,
}: {
  group: DraftStandalone;
  onChange: (g: DraftStandalone) => void;
  onDelete: () => void;
  groupIndex: number;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border border-border rounded-lg p-4 flex flex-col gap-4 bg-card">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold">
          Standalone {groupIndex + 1}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {!collapsed && (
        <QuestionForm
          index={0}
          question={group.question}
          onChange={(q) => onChange({ ...group, question: q })}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function NewPaperPage() {
  const router = useRouter();
  const [section, setSection] = useState<Section | "">("");
  const [year, setYear] = useState("");
  const [slot, setSlot] = useState("");
  const [groups, setGroups] = useState<DraftGroup[]>([]);
  const [saving, setSaving] = useState(false);

  function addSet() {
    setGroups((prev) => [...prev, emptySet()]);
  }

  function addStandalone() {
    setGroups((prev) => [...prev, emptyStandalone()]);
  }

  function updateGroup(i: number, g: DraftGroup) {
    setGroups((prev) => prev.map((group, idx) => (idx === i ? g : group)));
  }

  function deleteGroup(i: number) {
    setGroups((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!section || !year || !slot) {
      toast("Missing fields", {
        description: "Please fill in section, year and slot.",
      });
      return;
    }
    if (groups.length === 0) {
      toast("No content", {
        description: "Add at least one question or set.",
      });
      return;
    }

    setSaving(true);
    const { error } = await savePaper({
      section: section as Section,
      year: parseInt(year),
      slot: parseInt(slot),
      groups,
    });
    setSaving(false);

    if (error) {
      toast("Failed to save paper", { description: error });
    } else {
      toast("Paper saved", { description: "The PYQ paper is now live." });
      router.push("/pyqs");
    }
  }

  return (
    <main className="p-8 max-w-3xl flex flex-col gap-6">
      {/* header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-mono">New Paper</h1>
        <p className="text-sm text-muted-foreground font-mono">
          Build the paper by adding sets and standalone questions below.
        </p>
      </div>

      {/* warning */}
      <div className="border border-red-500 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg p-3 text-sm font-mono">
        <p className="font-semibold">⚠ Warning</p>
        <p>
          This paper will be live immediately after saving. Double-check all
          answers and explanations before clicking Save Paper.
        </p>
      </div>

      {/* paper metadata */}
      <div className="flex flex-col gap-4 border border-border rounded-lg p-4 bg-card">
        <Label className="font-mono text-sm font-semibold">Paper Details</Label>
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col gap-1.5 flex-1 min-w-32">
            <Label className="font-mono text-xs">Section</Label>
            <Select
              value={section}
              onValueChange={(v) => setSection(v as Section)}
            >
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VARC" className="font-mono">
                  VARC
                </SelectItem>
                <SelectItem value="DILR" className="font-mono">
                  DILR
                </SelectItem>
                <SelectItem value="QA" className="font-mono">
                  QA
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-24">
            <Label className="font-mono text-xs">Year</Label>
            <Input
              className="font-mono"
              type="number"
              placeholder="2024"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-24">
            <Label className="font-mono text-xs">Slot</Label>
            <Input
              className="font-mono"
              type="number"
              placeholder="1"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* groups */}
      <div className="flex flex-col gap-3">
        {groups.map((group, i) =>
          group.type === "set" ? (
            <SetForm
              key={i}
              groupIndex={i}
              group={group}
              onChange={(g) => updateGroup(i, g)}
              onDelete={() => deleteGroup(i)}
            />
          ) : (
            <StandaloneForm
              key={i}
              groupIndex={i}
              group={group as DraftStandalone}
              onChange={(g) => updateGroup(i, g)}
              onDelete={() => deleteGroup(i)}
            />
          ),
        )}
      </div>

      {/* add buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="font-mono group"
          onClick={addSet}
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          Add Set
        </Button>
        <Button
          type="button"
          variant="outline"
          className="font-mono group"
          onClick={addStandalone}
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          Add Standalone
        </Button>
      </div>

      {/* save + cancel */}
      <div className="flex gap-3 pb-12">
        <Button className="font-mono" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Paper"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="font-mono"
          onClick={() => router.push("/pyqs")}
        >
          Cancel
        </Button>
      </div>
    </main>
  );
}
