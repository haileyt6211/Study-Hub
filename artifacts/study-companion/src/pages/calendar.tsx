import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { useListEvents, useDeleteEvent } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListEventsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO,
} from "date-fns";

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: events } = useListEvents();
  const deleteEvent = useDeleteEvent();
  const queryClient = useQueryClient();

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const selectedDateEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(e => isSameDay(parseISO(e.startTime), selectedDate));
  }, [events, selectedDate]);

  const handleDelete = (id: number) => {
    deleteEvent.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
      }
    });
  };

  const typeColor: Record<string, string> = {
    study_session: "bg-primary/20 text-primary",
    class: "bg-blue-100 text-blue-600",
    exam: "bg-red-100 text-red-500",
    reminder: "bg-yellow-100 text-yellow-600",
    other: "bg-secondary text-muted-foreground",
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-script text-5xl text-foreground">Calendar</h1>
          <Link href="/events/new">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-sm" data-testid="button-new-event">
              <Plus className="w-4 h-4" />
              New Event
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors" data-testid="button-prev-month">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="font-script text-2xl text-foreground">{format(currentDate, "MMMM yyyy")}</h2>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors" data-testid="button-next-month">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2 tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 border border-border/40 rounded-2xl overflow-hidden">
              {days.map((d) => {
                const dayEvents = events?.filter(e => isSameDay(parseISO(e.startTime), d)) || [];
                const isCurrentMonth = isSameMonth(d, monthStart);
                const isSelected = isSameDay(d, selectedDate);
                const isToday = isSameDay(d, new Date());

                return (
                  <div
                    key={d.toString()}
                    onClick={() => setSelectedDate(d)}
                    data-testid={`calendar-day-${format(d, "yyyy-MM-dd")}`}
                    className={`min-h-[80px] p-2 border-b border-r border-border/30 cursor-pointer transition-colors last:border-r-0 ${
                      !isCurrentMonth ? "bg-background/50" : "bg-white"
                    } ${isSelected ? "bg-primary/5 ring-2 ring-inset ring-primary/30" : "hover:bg-secondary/40"}`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-sm mb-1 font-medium ${
                      isToday ? "bg-primary text-white" :
                      !isCurrentMonth ? "text-muted-foreground/50" : "text-foreground"
                    }`}>
                      {format(d, "d")}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map(e => (
                        <div key={e.id} className="text-[10px] truncate px-1 py-0.5 rounded bg-primary/15 text-primary font-medium">
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <h3 className="font-script text-2xl text-foreground mb-4">
              {format(selectedDate, "MMMM d, yyyy")}
            </h3>
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                <p>No events scheduled.</p>
                <Link href="/events/new">
                  <span className="text-primary hover:underline cursor-pointer mt-2 block text-sm">Add one</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="rounded-2xl border border-border/50 p-4 group hover:border-primary/30 transition-colors bg-background" data-testid={`event-card-${event.id}`}>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <p className="font-semibold text-foreground leading-tight">{event.title}</p>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                        data-testid={`button-delete-event-${event.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(parseISO(event.startTime), "h:mm a")} — {format(parseISO(event.endTime), "h:mm a")}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${typeColor[event.type] || typeColor.other}`}>
                      {event.type.replace("_", " ")}
                    </span>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
