import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { useListEvents, useDeleteEvent } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListEventsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

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

  const days = [];
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

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground mt-1">Plan your study sessions and track classes.</p>
          </div>
          <Link href="/events/new">
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              New Event
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-2xl border shadow-sm p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="min-w-[600px]">
              <div className="grid grid-cols-7 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border">
                {days.map((day, idx) => {
                  const dayEvents = events?.filter(e => isSameDay(parseISO(e.startTime), day)) || [];
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isSelected = isSameDay(day, selectedDate);
                  
                  return (
                    <div 
                      key={day.toString()} 
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[100px] p-2 bg-card cursor-pointer transition-colors hover:bg-secondary/50 ${
                        !isCurrentMonth ? "opacity-50" : ""
                      } ${isSelected ? "ring-2 ring-inset ring-primary bg-primary/5" : ""}`}
                    >
                      <div className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                        isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : ""
                      }`}>
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map(e => (
                          <div key={e.id} className="text-xs truncate px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/50">
                            {format(parseISO(e.startTime), "HH:mm")} {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-2xl border shadow-sm p-6">
              <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No events scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="border rounded-xl p-4 flex flex-col gap-2 relative group hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-medium text-lg leading-tight">{event.title}</h4>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(event.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(event.startTime), "h:mm a")} - {format(parseISO(event.endTime), "h:mm a")}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="secondary" className="capitalize">{event.type.replace("_", " ")}</Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2 bg-secondary/30 p-2 rounded-md">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
