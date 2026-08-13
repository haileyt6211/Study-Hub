import { useEffect, useState } from "react";
import { Check, FilePenLine, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToolPageHeader } from "@/components/tool-page-header";
import { readStorage, writeStorage } from "@/lib/storage";

type WritingState = { title: string; body: string; criteria: { id: string; label: string; checked: boolean }[] };
const WRITE_KEY = "study-hub-writing";
const defaultWriting: WritingState = {
  title: "A thought worth developing",
  body: "",
  criteria: [
    { id: "thesis", label: "My main idea is clear", checked: false },
    { id: "evidence", label: "I included specific evidence", checked: false },
    { id: "structure", label: "Each paragraph has a purpose", checked: false },
    { id: "finish", label: "I read it once out loud", checked: false },
  ],
};

function WritePage() {
  const [draft, setDraft] = useState<WritingState>(() => readStorage(WRITE_KEY, defaultWriting));
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    setSaved(false);
    const save = window.setTimeout(() => {
      writeStorage(WRITE_KEY, draft);
      setSaved(true);
    }, 450);
    return () => window.clearTimeout(save);
  }, [draft]);

  const updateCriterion = (id: string, checked: boolean) =>
    setDraft((current) => ({ ...current, criteria: current.criteria.map((item) => item.id === id ? { ...item, checked } : item) }));
  const completed = draft.criteria.filter((item) => item.checked).length;

  return (
    <div className="mx-auto max-w-6xl">
      <ToolPageHeader
        eyebrow="Make room for the first sentence"
        title="Write mode"
        description="A calm canvas for rough drafts. Keep the criteria nearby, let the words be imperfect, and trust that the page saves itself."
        action={<Badge variant="outline" className="w-fit gap-2 border-primary/25 bg-card/50 px-3 py-2 text-muted-foreground" data-testid="status-writing-save">{saved ? <Check className="h-3.5 w-3.5 text-primary" /> : <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />}{saved ? "Saved on this device" : "Saving..."}</Badge>}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="border-primary/10 bg-secondary/35 shadow-none lg:sticky lg:top-6">
          <CardHeader className="pb-4"><div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-primary"><ListChecks className="h-5 w-5" /></div><CardTitle className="text-xl">Criteria</CardTitle><p className="text-sm leading-6 text-muted-foreground">A quick check-in, not a judgment.</p></CardHeader>
          <CardContent>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-card/80"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${(completed / draft.criteria.length) * 100}%` }} /></div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground" data-testid="text-criteria-progress">{completed} of {draft.criteria.length} checked</p>
            <div className="space-y-4">
              {draft.criteria.map((item) => <label key={item.id} className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-foreground/75" data-testid={`label-criterion-${item.id}`}><Checkbox checked={item.checked} onCheckedChange={(checked) => updateCriterion(item.id, checked === true)} data-testid={`checkbox-criterion-${item.id}`} /><span className={item.checked ? "text-muted-foreground line-through" : ""}>{item.label}</span></label>)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/10 bg-card/90 shadow-[0_18px_45px_hsl(var(--primary)/.07)]">
          <CardContent className="p-6 sm:p-10">
            <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"><FilePenLine className="h-4 w-4 text-primary" /> Working draft</div>
            <Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="h-auto border-0 border-b border-border/60 rounded-none bg-transparent px-0 py-3 text-3xl font-semibold shadow-none focus-visible:ring-0 sm:text-4xl" aria-label="Writing title" data-testid="input-writing-title" />
            <Textarea value={draft.body} onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))} placeholder="Begin with the sentence that keeps returning..." className="mt-8 min-h-[520px] resize-none border-0 bg-transparent px-0 text-base leading-8 shadow-none focus-visible:ring-0 sm:text-lg" aria-label="Writing area" data-testid="textarea-writing-body" />
            <div className="mt-4 border-t border-border/60 pt-4 text-xs text-muted-foreground"><span data-testid="text-writing-words">{draft.body.trim() ? draft.body.trim().split(/\s+/).length : 0} words</span><span className="mx-2">·</span>Changes save automatically</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { WritePage as WritingMode };
export default WritePage;