import { AppLayout } from "@/components/layout";
import { useCreateAssignment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListAssignmentsQueryKey,
  getGetAssignmentSummaryQueryKey,
  getGetAssignmentsDueSoonQueryKey,
} from "@workspace/api-client-react";
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
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["low", "medium", "high"]),
});

type FormValues = z.infer<typeof schema>;

export function NewAssignment() {
  const [, setLocation] = useLocation();
  const createAssignment = useCreateAssignment();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      subject: "",
      description: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      priority: "medium",
    },
  });

  const onSubmit = (data: FormValues) => {
    createAssignment.mutate({
      data: {
        title: data.title,
        subject: data.subject,
        description: data.description || "",
        dueDate: new Date(data.dueDate).toISOString(),
        priority: data.priority,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAssignmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAssignmentSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAssignmentsDueSoonQueryKey() });
        setLocation("/assignments");
      }
    });
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/assignments" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-1" data-testid="link-back">
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </Link>

        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-8">
          <h1 className="font-script text-4xl text-foreground mb-6">New Assignment</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground/80">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Read Chapter 4" className="rounded-xl bg-background border-border" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground/80">Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Biology" className="rounded-xl bg-background border-border" {...field} data-testid="input-subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground/80">Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl bg-background border-border" data-testid="select-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground/80">Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-xl bg-background border-border" {...field} data-testid="input-due-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground/80">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any extra details..." className="rounded-xl bg-background border-border resize-none h-28" {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={createAssignment.isPending}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8"
                  data-testid="button-submit"
                >
                  {createAssignment.isPending ? "Saving..." : "Add Assignment"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
