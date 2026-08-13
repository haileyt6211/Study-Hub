import { ArrowUpRight, BookOpen, Cloud, FileText, FolderOpen, GraduationCap, Mail, Music2, Presentation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ToolPageHeader } from "@/components/tool-page-header";

const resources = [
  { name: "YouTube Music", detail: "A background soundtrack for your next study block", href: "https://music.youtube.com", icon: Music2, tint: "bg-[#f6d7df]", iconColor: "text-[#bd5d77]" },
  { name: "OneDrive", detail: "Your cloud files, notes, and shared folders", href: "https://onedrive.live.com", icon: Cloud, tint: "bg-[#d9e5f5]", iconColor: "text-[#587daf]" },
  { name: "Word", detail: "Open a document and get the thoughts down", href: "https://www.office.com/launch/word", icon: FileText, tint: "bg-[#d7e6f1]", iconColor: "text-[#4b77a0]" },
  { name: "PowerPoint", detail: "Build slides for the next presentation", href: "https://www.office.com/launch/powerpoint", icon: Presentation, tint: "bg-[#f2dfc9]", iconColor: "text-[#ad7045]" },
  { name: "Canvas", detail: "Assignments, modules, grades, and course updates", href: "https://canvas.instructure.com", icon: GraduationCap, tint: "bg-[#f4decf]", iconColor: "text-[#b86c50]" },
  { name: "Outlook", detail: "Check messages and send a thoughtful reply", href: "https://outlook.office.com", icon: Mail, tint: "bg-[#dce2f3]", iconColor: "text-[#6476aa]" },
];

function ResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <ToolPageHeader
        eyebrow="Everything within a click"
        title="Resources"
        description="A small launchpad for the places your school day already lives. Links open in a new tab so your Study Hub stays put."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <a
              key={resource.name}
              href={resource.href}
              target="_blank"
              rel="noreferrer"
              className="group block"
              data-testid={`link-resource-${resource.name.toLowerCase().replaceAll(" ", "-")}`}
            >
              <Card className="h-full border-primary/10 bg-card transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_14px_34px_hsl(var(--primary)/.1)]">
                <CardContent className="flex h-full min-h-[190px] flex-col p-6">
                  <div className="flex items-start justify-between">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl ${resource.tint}`}><Icon className={`h-5 w-5 ${resource.iconColor}`} /></div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-auto pt-8">
                    <h2 className="flex items-center gap-2 text-xl font-semibold">{resource.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{resource.detail}</p>
                  </div>
                </CardContent>
              </Card>
            </a>
          );
        })}
      </div>
      <Card className="mt-7 border-primary/10 bg-secondary/30 shadow-none">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-center gap-4"><div className="grid h-10 w-10 place-items-center rounded-full bg-card text-primary"><FolderOpen className="h-4 w-4" /></div><div><p className="font-semibold">Your own favorite</p><p className="text-sm text-muted-foreground">Need another link? Save it as a sticky note on your board.</p></div></div>
          <BookOpen className="hidden h-5 w-5 text-primary/70 sm:block" />
        </CardContent>
      </Card>
    </div>
  );
}

export { ResourcesPage as Resources };
export default ResourcesPage;