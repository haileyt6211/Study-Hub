import { AppLayout } from "@/components/layout";
import { useCreateEvent } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListEventsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["study_session", "class", "exam", "reminder", "other"]),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

type FormValues = z.infer<typeof schema>;

export function NewEvent() {
  const [, setLocation] = useLocation();
  const createEvent = useCreateEvent();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      type: "study_session",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "10:00",
    },
  });

  const onSubmit = (data: FormValues) => {
    const startIso = new Date(`${data.date}T${data.startTime}`).toISOString();
    const endIso = new Date(`${data.date}T${data.endTime}`).toISOString();

    createEvent.mutate({
      data: {
        title: data.title,
        type: data.type,
        description: data.description || "",
        startTime: startIso,
        endTime: endIso,
        color: data.type === "exam" ? "#ef4444" : data.type === "study_session" ? "#c96b85" : undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        setLocation("/calendar");
      }
    });
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/calendar" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-1" data-testid="link-back">
          <ArrowLeft className="w-4 h-4" />
          Back to Calendar
        </Link>

        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-8">
          <h1 className="font-script text-4xl text-foreground mb-6">New Event</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground/80">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Group Study for Calculus" className="rounded-xl bg-background border-border" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground/80">Date</FormLabel>
                      <FormControl>
                        <Input type="date" className="rounded-xl bg-background border-border" {...field} data-testid="input-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground/80">Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl bg-background border-border" data-testid="select-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="study_session">Study Session</SelectItem>
                          <SelectItem value="class">Class</SelectItem>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground/80">Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" className="rounded-xl bg-background border-border" {...field} data-testid="input-start-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground/80">End Time</FormLabel>
                      <FormControl>
                        <Input type="time" className="rounded-xl bg-background border-border" {...field} data-testid="input-end-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground/80">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Zoom link, room number, notes..." className="rounded-xl bg-background border-border resize-none h-28" {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={createEvent.isPending}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8"
                  data-testid="button-submit"
                >
                  {createEvent.isPending ? "Saving..." : "Create Event"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
