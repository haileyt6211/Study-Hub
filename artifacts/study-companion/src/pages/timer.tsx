import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToolPageHeader } from "@/components/tool-page-header";
import { readStorage, writeStorage } from "@/lib/storage";

type TimerState = {
  durationSeconds: number;
  endTimestamp: number | null;
  remainingSeconds: number;
  isRunning: boolean;
};

const TIMER_KEY = "study-hub-timer";
const presets = [15, 25, 45, 60];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function TimerPage() {
  const [timer, setTimer] = useState<TimerState>(() =>
    readStorage<TimerState>(TIMER_KEY, {
      durationSeconds: 25 * 60,
      endTimestamp: null,
      remainingSeconds: 25 * 60,
      isRunning: false,
    }),
  );
  const [customMinutes, setCustomMinutes] = useState("25");
  const [now, setNow] = useState(Date.now());

  const remaining = timer.isRunning && timer.endTimestamp
    ? Math.max(0, Math.ceil((timer.endTimestamp - now) / 1000))
    : timer.remainingSeconds;
  const progress = timer.durationSeconds ? remaining / timer.durationSeconds : 0;
  const ringRadius = 116;
  const circumference = 2 * Math.PI * ringRadius;
  const dashOffset = circumference * (1 - progress);

  useEffect(() => {
    writeStorage(TIMER_KEY, { ...timer, remainingSeconds: remaining });
  }, [timer, remaining]);

  useEffect(() => {
    if (!timer.isRunning) return;
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    const onVisibility = () => setNow(Date.now());
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [timer.isRunning]);

  useEffect(() => {
    if (timer.isRunning && remaining <= 0) {
      setTimer((current) => ({ ...current, isRunning: false, endTimestamp: null, remainingSeconds: 0 }));
    }
  }, [remaining, timer.isRunning]);

  const status = useMemo(() => {
    if (remaining === 0) return "Time to take a little victory lap.";
    if (timer.isRunning) return "Focus mode is on. You have got this.";
    return timer.remainingSeconds < timer.durationSeconds ? "Paused — pick up where you left off." : "Choose a pace and begin.";
  }, [remaining, timer.isRunning, timer.remainingSeconds, timer.durationSeconds]);

  const chooseDuration = (minutes: number) => {
    const seconds = Math.max(60, Math.round(minutes) * 60);
    setCustomMinutes(String(Math.round(minutes)));
    setTimer({ durationSeconds: seconds, endTimestamp: null, remainingSeconds: seconds, isRunning: false });
  };

  const toggleTimer = () => {
    if (timer.isRunning) {
      const nextRemaining = remaining;
      setTimer((current) => ({ ...current, endTimestamp: null, remainingSeconds: nextRemaining, isRunning: false }));
    } else if (remaining > 0) {
      setNow(Date.now());
      setTimer((current) => ({
        ...current,
        endTimestamp: Date.now() + remaining * 1000,
        remainingSeconds: remaining,
        isRunning: true,
      }));
    }
  };

  const resetTimer = () =>
    setTimer((current) => ({ ...current, endTimestamp: null, remainingSeconds: current.durationSeconds, isRunning: false }));

  return (
    <div className="mx-auto max-w-5xl">
      <ToolPageHeader
        eyebrow="A quiet pocket of focus"
        title="Study timer"
        description="Set a small promise to yourself. The timer uses an end timestamp, so it stays honest when your tab goes to sleep."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-primary/10 bg-card/80 shadow-[0_18px_45px_hsl(var(--primary)/.08)]">
          <CardContent className="flex min-h-[500px] flex-col items-center justify-center p-6 sm:p-10">
            <div className="relative grid place-items-center">
              <svg className="h-[290px] w-[290px] -rotate-90" viewBox="0 0 280 280" aria-label={`${formatTime(remaining)} remaining`} role="img">
                <circle cx="140" cy="140" r={ringRadius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="12" />
                <circle
                  cx="140" cy="140" r={ringRadius} fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeWidth="12"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset} className="transition-[stroke-dashoffset] duration-300"
                />
              </svg>
              <div className="absolute text-center">
                <p className="font-mono text-6xl font-semibold tracking-tight text-foreground" data-testid="text-timer-remaining">{formatTime(remaining)}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{timer.isRunning ? "in session" : "ready when you are"}</p>
              </div>
            </div>
            <p className="mt-5 text-center text-sm text-muted-foreground" data-testid="status-timer">{status}</p>
            <div className="mt-6 flex items-center gap-3">
              <Button onClick={toggleTimer} size="lg" data-testid="button-toggle-timer">
                {timer.isRunning ? <Pause /> : <Play />}
                {timer.isRunning ? "Pause" : remaining === 0 ? "Complete" : "Start focus"}
              </Button>
              <Button onClick={resetTimer} variant="outline" size="lg" data-testid="button-reset-timer">
                <RotateCcw /> Reset
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/10 bg-secondary/35 shadow-none">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Session length</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Find your rhythm</h2>
              </div>
              <TimerReset className="h-5 w-5 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => chooseDuration(minutes)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-colors ${timer.durationSeconds === minutes * 60 ? "border-primary bg-card shadow-sm" : "border-border/70 bg-card/40 hover:bg-card"}`}
                  data-testid={`button-duration-${minutes}`}
                >
                  <span className="block text-xl font-semibold">{minutes}</span>
                  <span className="text-xs text-muted-foreground">minutes</span>
                </button>
              ))}
            </div>
            <div className="mt-7 space-y-2">
              <Label htmlFor="custom-minutes">Custom minutes</Label>
              <div className="flex gap-2">
                <Input id="custom-minutes" type="number" min="1" max="180" value={customMinutes} onChange={(event) => setCustomMinutes(event.target.value)} data-testid="input-custom-minutes" />
                <Button variant="secondary" onClick={() => chooseDuration(Number(customMinutes) || 25)} data-testid="button-apply-duration">Apply</Button>
              </div>
            </div>
            <div className="mt-8 rounded-2xl bg-card/60 p-4 text-sm leading-6 text-muted-foreground">
              <span className="font-semibold text-foreground">A note for later:</span> one focused block is enough to change the shape of an afternoon.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { TimerPage as StudyTimer };
export default TimerPage;