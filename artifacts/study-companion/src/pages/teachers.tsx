import { useState } from "react";
import { Building2, Mail, Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToolPageHeader } from "@/components/tool-page-header";
import { useLocalStorage } from "@/lib/storage";

type Teacher = { id: string; name: string; className: string; room: string; email: string };
const initialTeachers: Teacher[] = [
  { id: "teacher-1", name: "Dr. Rowan", className: "Biology", room: "Lab 204", email: "rowan@school.edu" },
  { id: "teacher-2", name: "M. Alvarez", className: "World Literature", room: "Room 18", email: "alvarez@school.edu" },
];

function TeachersPage() {
  const [teachers, setTeachers] = useLocalStorage<Teacher[]>("study-hub-teachers", initialTeachers);
  const [editing, setEditing] = useState<string | null>(null);

  const updateTeacher = (id: string, patch: Partial<Teacher>) => setTeachers((current) => current.map((teacher) => teacher.id === id ? { ...teacher, ...patch } : teacher));
  const addTeacher = () => {
    const id = `teacher-${Date.now()}`;
    setTeachers((current) => [...current, { id, name: "New contact", className: "Class name", room: "Room", email: "email@school.edu" }]);
    setEditing(id);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <ToolPageHeader
        eyebrow="People who make the room brighter"
        title="Teacher contacts"
        description="Save the details you reach for most. Edit a card any time, and use the email link to start a message."
        action={<Button onClick={addTeacher} data-testid="button-add-teacher"><Plus /> Add contact</Button>}
      />
      {teachers.length === 0 ? (
        <Card className="border-dashed border-primary/30 bg-card/50"><CardContent className="py-20 text-center"><UserRound className="mx-auto mb-4 h-8 w-8 text-primary" /><h2 className="text-xl font-semibold">No contacts yet</h2><p className="mt-2 text-sm text-muted-foreground">Keep a teacher's details close when you need a quick question answered.</p></CardContent></Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {teachers.map((teacher, index) => {
            const isEditing = editing === teacher.id;
            return (
              <Card key={teacher.id} className="overflow-hidden border-primary/10 bg-card shadow-[0_12px_34px_hsl(var(--primary)/.06)]" data-testid={`card-teacher-${teacher.id}`}>
                <div className={`h-2 ${index % 2 === 0 ? "bg-primary" : "bg-[#8b86c5]"}`} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary font-script text-2xl text-primary">{teacher.name.slice(0, 1).toUpperCase()}</div>
                      {isEditing ? <Input value={teacher.name} onChange={(event) => updateTeacher(teacher.id, { name: event.target.value })} className="max-w-[180px] font-semibold" aria-label="Teacher name" data-testid={`input-teacher-name-${teacher.id}`} /> : <div><h2 className="text-xl font-semibold">{teacher.name}</h2><p className="mt-1 text-sm text-muted-foreground">{teacher.className}</p></div>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(isEditing ? null : teacher.id)} aria-label={`Edit ${teacher.name}`} data-testid={`button-edit-teacher-${teacher.id}`}>{isEditing ? <X /> : <Pencil />}</Button>
                      <Button variant="ghost" size="icon" onClick={() => setTeachers((current) => current.filter((item) => item.id !== teacher.id))} aria-label={`Delete ${teacher.name}`} data-testid={`button-delete-teacher-${teacher.id}`}><Trash2 /></Button>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="mt-6 space-y-3">
                      <Input value={teacher.className} onChange={(event) => updateTeacher(teacher.id, { className: event.target.value })} placeholder="Class" aria-label="Teacher class" data-testid={`input-teacher-class-${teacher.id}`} />
                      <Input value={teacher.room} onChange={(event) => updateTeacher(teacher.id, { room: event.target.value })} placeholder="Room" aria-label="Teacher room" data-testid={`input-teacher-room-${teacher.id}`} />
                      <Input type="email" value={teacher.email} onChange={(event) => updateTeacher(teacher.id, { email: event.target.value })} placeholder="Email" aria-label="Teacher email" data-testid={`input-teacher-email-${teacher.id}`} />
                      <Button variant="secondary" size="sm" onClick={() => setEditing(null)} data-testid={`button-done-teacher-${teacher.id}`}>Done editing</Button>
                    </div>
                  ) : (
                    <div className="mt-7 space-y-3 border-t border-border/60 pt-5 text-sm">
                      <p className="flex items-center gap-3 text-muted-foreground"><Building2 className="h-4 w-4 text-primary" /><span>{teacher.room}</span></p>
                      <a href={`mailto:${teacher.email}`} className="flex items-center gap-3 text-primary hover:underline" data-testid={`link-email-teacher-${teacher.id}`}><Mail className="h-4 w-4" /><span>{teacher.email}</span></a>
                    </div>
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

export { TeachersPage as Teachers };
export default TeachersPage;