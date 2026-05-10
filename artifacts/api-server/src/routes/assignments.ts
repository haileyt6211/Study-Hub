import { Router } from "express";
import { db } from "@workspace/db";
import { assignmentsTable } from "@workspace/db";
import { eq, and, lte, gt, gte } from "drizzle-orm";
import {
  ListAssignmentsQueryParams,
  CreateAssignmentBody,
  UpdateAssignmentParams,
  UpdateAssignmentBody,
  DeleteAssignmentParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/assignments/due-soon", async (req, res) => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const assignments = await db
      .select()
      .from(assignmentsTable)
      .where(
        and(
          eq(assignmentsTable.completed, false),
          gte(assignmentsTable.dueDate, now),
          lte(assignmentsTable.dueDate, in24h)
        )
      );
    res.json(
      assignments.map((a) => ({
        ...a,
        dueDate: a.dueDate.toISOString(),
        createdAt: a.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get due-soon assignments");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/assignments/summary", async (req, res) => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const all = await db.select().from(assignmentsTable);
    const total = all.length;
    const completed = all.filter((a) => a.completed).length;
    const pending = all.filter((a) => !a.completed).length;
    const dueSoon = all.filter(
      (a) =>
        !a.completed &&
        a.dueDate >= now &&
        a.dueDate <= in24h
    ).length;
    const overdue = all.filter(
      (a) => !a.completed && a.dueDate < now
    ).length;
    res.json({ total, completed, pending, dueSoon, overdue });
  } catch (err) {
    req.log.error({ err }, "Failed to get assignment summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/assignments", async (req, res) => {
  try {
    const query = ListAssignmentsQueryParams.safeParse(req.query);
    let assignments;
    if (query.success && query.data.completed !== undefined) {
      assignments = await db
        .select()
        .from(assignmentsTable)
        .where(eq(assignmentsTable.completed, query.data.completed));
    } else {
      assignments = await db.select().from(assignmentsTable);
    }
    res.json(
      assignments.map((a) => ({
        ...a,
        dueDate: a.dueDate.toISOString(),
        createdAt: a.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list assignments");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/assignments", async (req, res) => {
  try {
    const body = CreateAssignmentBody.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }
    const { title, subject, description, dueDate, priority } = body.data;
    const [assignment] = await db
      .insert(assignmentsTable)
      .values({
        title,
        subject,
        description: description ?? null,
        dueDate: new Date(dueDate),
        priority,
        completed: false,
      })
      .returning();
    res.status(201).json({
      ...assignment,
      dueDate: assignment.dueDate.toISOString(),
      createdAt: assignment.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create assignment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/assignments/:id", async (req, res) => {
  try {
    const params = UpdateAssignmentParams.safeParse({ id: Number(req.params.id) });
    const body = UpdateAssignmentBody.safeParse(req.body);
    if (!params.success || !body.success) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const updates: Record<string, unknown> = {};
    if (body.data.title !== undefined) updates.title = body.data.title;
    if (body.data.subject !== undefined) updates.subject = body.data.subject;
    if (body.data.description !== undefined) updates.description = body.data.description;
    if (body.data.dueDate !== undefined) updates.dueDate = new Date(body.data.dueDate);
    if (body.data.completed !== undefined) updates.completed = body.data.completed;
    if (body.data.priority !== undefined) updates.priority = body.data.priority;

    const [assignment] = await db
      .update(assignmentsTable)
      .set(updates)
      .where(eq(assignmentsTable.id, params.data.id))
      .returning();
    if (!assignment) return res.status(404).json({ error: "Not found" });
    res.json({
      ...assignment,
      dueDate: assignment.dueDate.toISOString(),
      createdAt: assignment.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update assignment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/assignments/:id", async (req, res) => {
  try {
    const params = DeleteAssignmentParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      return res.status(400).json({ error: "Invalid id" });
    }
    await db.delete(assignmentsTable).where(eq(assignmentsTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete assignment");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
