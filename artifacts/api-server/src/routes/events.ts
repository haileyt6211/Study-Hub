import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  ListEventsQueryParams,
  CreateEventBody,
  UpdateEventParams,
  UpdateEventBody,
  DeleteEventParams,
  GetEventParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/events", async (req, res) => {
  try {
    const query = ListEventsQueryParams.safeParse(req.query);
    let events;
    if (query.success && query.data.start && query.data.end) {
      events = await db
        .select()
        .from(eventsTable)
        .where(
          and(
            gte(eventsTable.startTime, new Date(query.data.start)),
            lte(eventsTable.endTime, new Date(query.data.end))
          )
        );
    } else {
      events = await db.select().from(eventsTable);
    }
    res.json(
      events.map((e) => ({
        ...e,
        startTime: e.startTime.toISOString(),
        endTime: e.endTime.toISOString(),
        createdAt: e.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/events", async (req, res) => {
  try {
    const body = CreateEventBody.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }
    const { title, description, startTime, endTime, type, color } = body.data;
    const [event] = await db
      .insert(eventsTable)
      .values({
        title,
        description: description ?? null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type,
        color: color ?? null,
      })
      .returning();
    res.status(201).json({
      ...event,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      createdAt: event.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const params = GetEventParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      return res.status(400).json({ error: "Invalid id" });
    }
    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, params.data.id));
    if (!event) return res.status(404).json({ error: "Not found" });
    res.json({
      ...event,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      createdAt: event.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/events/:id", async (req, res) => {
  try {
    const params = UpdateEventParams.safeParse({ id: Number(req.params.id) });
    const body = UpdateEventBody.safeParse(req.body);
    if (!params.success || !body.success) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const updates: Record<string, unknown> = {};
    if (body.data.title !== undefined) updates.title = body.data.title;
    if (body.data.description !== undefined) updates.description = body.data.description;
    if (body.data.startTime !== undefined) updates.startTime = new Date(body.data.startTime);
    if (body.data.endTime !== undefined) updates.endTime = new Date(body.data.endTime);
    if (body.data.type !== undefined) updates.type = body.data.type;
    if (body.data.color !== undefined) updates.color = body.data.color;

    const [event] = await db
      .update(eventsTable)
      .set(updates)
      .where(eq(eventsTable.id, params.data.id))
      .returning();
    if (!event) return res.status(404).json({ error: "Not found" });
    res.json({
      ...event,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      createdAt: event.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    const params = DeleteEventParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      return res.status(400).json({ error: "Invalid id" });
    }
    await db.delete(eventsTable).where(eq(eventsTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete event");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
