import { useState } from "react";
import { BookOpen, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToolPageHeader } from "@/components/tool-page-header";
import { useLocalStorage } from "@/lib/storage";

type StudyClass = { id: string; name: string; teacher: string; room: string; color: string };
const colors = [
  { name: "Rose", value: "bg-[#f8d5dc]", accent: "bg-[#c65c76]" },
  { name: "Butter", value: "bg-[#f7e5b3]", accent: "bg-[#b98a2c]" },
  { name: "Periwinkle", value: "bg-[#d8d9f4]", accent: "bg-[#7775be]" },
  { name: "Sage", value: "bg-[#d6e7dc]", accent: "bg-[#5c9471]" },
  { name: "Peach", value: "bg-[#f5d4c5]", accent: "bg-[#bf7658]" },
];

const starterClasses: StudyClass[] = [
  { id: "biology", name: "Biology", teacher: "Dr. Rowan", room: "Lab 204", color: colors[0].value },
  { id: "literature", name: "World Literature", teacher: "M. Alvarez", room: "Room 18", color: colors[2].value },
  { id: "history", name: "Modern History", teacher: "J. Ellis", room: "Room 7", color: colors[3].value },
];

function ClassesPage() {
  const [classes, setClasses] = useLocalStorage<StudyClass[]>("study-hub-classes", starterClasses);
  const [editing, setEditing] = useState<string | null>(null);

  const updateClass = (id: string, patch: Partial<StudyClass>) =>
    setClasses((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));

  const addClass = () => {
    const id = `class-${Date.now()}`;
    setClasses((current) => [...current, { id, name: "New class", teacher: "Add teacher", room: "Room", color: colors[current.length % colors.length].value }]);
    setEditing(id);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <ToolPageHeader
        eyebrow="Your little school map"
        title="Classes"
        description="Keep the moving parts of your week in one soft, glanceable place. Every card is yours to shape."
        action={<Button onClick={addClass} data-testid="button-add-class"><Plus /> Add class</Button>}
      />
      {classes.length === 0 ? (
        <Card className="border-dashed border-primary/30 bg-card/50"><CardContent className="grid place-items-center py-20 text-center"><BookOpen className="mb-4 h-8 w-8 text-primary" /><h2 className="text-xl font-semibold">Your map is blank</h2><p className="mt-2 text-sm text-muted-foreground">Add your first class to get started.</p></CardContent></Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((item, index) => {
            const color = colors.find((option) => option.value === item.color) ?? colors[0];
            const isEditing = editing === item.id;
            return (
              <Card key={item.id} className={`group relative overflow-hidden border-transparent ${item.color} shadow-[0_12px_30px_hsl(var(--foreground)/.06)]`} data-testid={`card-class-${item.id}`}>
                <div className={`absolute inset-y-0 left-0 w-1.5 ${color.accent}`} />
                <CardContent className="p-6 pl-7">
                  <div className="mb-8 flex items-start justify-between gap-3">
                    <div className="rounded-full bg-card/60 p-2.5"><BookOpen className="h-4 w-4 text-foreground/70" /></div>
                    <div className="flex gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(isEditing ? null : item.id)} aria-label={`Edit ${item.name}`} data-testid={`button-edit-class-${item.id}`}>{isEditing ? <X /> : <Pencil />}</Button>
                      <Button variant="ghost" size="icon" onClick={() => setClasses((current) => current.filter((entry) => entry.id !== item.id))} aria-label={`Delete ${item.name}`} data-testid={`button-delete-class-${item.id}`}><Trash2 /></Button>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input value={item.name} onChange={(event) => updateClass(item.id, { name: event.target.value })} className="border-foreground/10 bg-card/50 font-semibold" aria-label="Class name" data-testid={`input-class-name-${item.id}`} />
                      <Input value={item.teacher} onChange={(event) => updateClass(item.id, { teacher: event.target.value })} className="border-foreground/10 bg-card/50" aria-label="Teacher name" data-testid={`input-class-teacher-${item.id}`} />
                      <Input value={item.room} onChange={(event) => updateClass(item.id, { room: event.target.value })} className="border-foreground/10 bg-card/50" aria-label="Room" data-testid={`input-class-room-${item.id}`} />
                      <div className="flex gap-2 pt-1">
                        {colors.map((option) => <button key={option.value} onClick={() => updateClass(item.id, { color: option.value })} className={`h-6 w-6 rounded-full ${option.value} border-2 ${item.color === option.value ? "border-foreground ring-2 ring-card" : "border-card/80"}`} aria-label={`Use ${option.name} color`} data-testid={`button-class-color-${item.id}-${option.name.toLowerCase()}`}>{item.color === option.value && <Check className="mx-auto h-3 w-3 text-foreground" />}</button>)}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-semibold tracking-tight">{item.name || "Untitled class"}</h2>
                      <p className="mt-2 text-sm text-foreground/65">{item.teacher || "Teacher to be added"}</p>
                      <div className="mt-7 flex items-center justify-between border-t border-foreground/10 pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
                        <span>{item.room || "Room to be added"}</span><span>#{String(index + 1).padStart(2, "0")}</span>
                      </div>
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

export { ClassesPage as Classes };
export default ClassesPage;