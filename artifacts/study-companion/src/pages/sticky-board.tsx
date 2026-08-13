import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ToolPageHeader } from "@/components/tool-page-header";
import { useLocalStorage } from "@/lib/storage";

type StickyNote = { id: string; text: string; color: string; updatedAt: string };
const noteColors = [
  { name: "Blush", surface: "bg-[#f7d7df]", dot: "bg-[#c8637d]" },
  { name: "Lemon", surface: "bg-[#f8e9af]", dot: "bg-[#ba8a26]" },
  { name: "Lilac", surface: "bg-[#dcd9f2]", dot: "bg-[#7b72b7]" },
  { name: "Mint", surface: "bg-[#d8e9dd]", dot: "bg-[#609172]" },
  { name: "Apricot", surface: "bg-[#f5d6c8]", dot: "bg-[#bd765c]" },
];

const starterNotes: StickyNote[] = [
  { id: "note-1", text: "Bring lab goggles on Thursday", color: noteColors[0].surface, updatedAt: "just now" },
  { id: "note-2", text: "Ask about the history reading", color: noteColors[2].surface, updatedAt: "just now" },
  { id: "note-3", text: "Print the essay outline", color: noteColors[1].surface, updatedAt: "just now" },
];

function StickyBoardPage() {
  const [notes, setNotes] = useLocalStorage<StickyNote[]>("study-hub-sticky-notes", starterNotes);
  const [editing, setEditing] = useState<string | null>(null);

  const addNote = () => {
    const id = `note-${Date.now()}`;
    setNotes((current) => [...current, { id, text: "", color: noteColors[current.length % noteColors.length].surface, updatedAt: "just now" }]);
    setEditing(id);
  };

  const updateNote = (id: string, patch: Partial<StickyNote>) =>
    setNotes((current) => current.map((note) => note.id === id ? { ...note, ...patch, updatedAt: "just now" } : note));

  return (
    <div className="mx-auto max-w-6xl">
      <ToolPageHeader
        eyebrow="Thoughts in the margins"
        title="Sticky board"
        description="A forgiving place for the small reminders that keep your study day moving. Everything saves on this device."
        action={<Button onClick={addNote} data-testid="button-add-note"><Plus /> Add note</Button>}
      />
      {notes.length === 0 ? (
        <Card className="border-dashed border-primary/30 bg-card/50"><CardContent className="py-20 text-center"><p className="font-script text-4xl text-primary">A fresh board</p><p className="mt-2 text-sm text-muted-foreground">Add a note when something wants remembering.</p><Button onClick={addNote} className="mt-6" data-testid="button-add-first-note"><Plus /> Add your first note</Button></CardContent></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note, index) => {
            const palette = noteColors.find((color) => color.surface === note.color) ?? noteColors[0];
            const isEditing = editing === note.id;
            return (
              <Card key={note.id} className={`relative min-h-[215px] ${index % 3 === 0 ? "rotate-[-1deg]" : index % 3 === 1 ? "rotate-[1deg]" : "rotate-0"} overflow-hidden border-transparent ${note.color} shadow-[0_14px_26px_hsl(var(--foreground)/.1)]`} data-testid={`card-note-${note.id}`}>
                <CardContent className="flex min-h-[215px] flex-col p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <span className={`h-2.5 w-2.5 rounded-full ${palette.dot}`} />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(isEditing ? null : note.id)} aria-label={`Edit note ${index + 1}`} data-testid={`button-edit-note-${note.id}`}>{isEditing ? <X /> : <Pencil />}</Button>
                      <Button variant="ghost" size="icon" onClick={() => setNotes((current) => current.filter((entry) => entry.id !== note.id))} aria-label={`Delete note ${index + 1}`} data-testid={`button-delete-note-${note.id}`}><Trash2 /></Button>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="flex flex-1 flex-col">
                      <Textarea autoFocus value={note.text} onChange={(event) => updateNote(note.id, { text: event.target.value })} placeholder="Write a little reminder..." className="min-h-[90px] flex-1 resize-none border-foreground/10 bg-card/40 text-sm" aria-label="Sticky note text" data-testid={`textarea-note-${note.id}`} />
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div className="flex gap-1.5">
                          {noteColors.map((color) => <button key={color.surface} onClick={() => updateNote(note.id, { color: color.surface })} className={`h-5 w-5 rounded-full ${color.surface} border ${note.color === color.surface ? "border-foreground ring-2 ring-card" : "border-card/80"}`} aria-label={`Use ${color.name} note color`} data-testid={`button-note-color-${note.id}-${color.name.toLowerCase()}`}>{note.color === color.surface && <Check className="mx-auto h-3 w-3" />}</button>)}
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => setEditing(null)} data-testid={`button-done-note-${note.id}`}>Done</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="flex-1 whitespace-pre-wrap text-lg font-medium leading-7 text-foreground/80">{note.text || "A blank thought, ready for you."}</p>
                      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">{note.updatedAt}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { StickyBoardPage as StickyBoard };
export default StickyBoardPage;