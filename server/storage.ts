import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { 
  users, 
  researchReports, 
  reportTemplates,
  reportCustomizations,
  type User, 
  type InsertUser, 
  type ResearchReport, 
  type InsertResearchReport,
  type ReportTemplate,
  type ReportCustomization,
  type InsertReportCustomization 
} from "@shared/schema";
import crypto from 'crypto';

const PostgresSessionStore = connectPg(session);

// Default templates that will be created if none exist
const DEFAULT_TEMPLATES = [
  {
    id: 1,
    name: "Academic Report",
    description: "Formal academic style with detailed methodology and citations",
    template: "# {title}\n\n## Introduction\n{introduction}\n\n## Methodology\n{methodology}\n\n## Findings\n{findings}\n\n## Conclusion\n{conclusion}\n\n## References\n{references}",
    structure: "introduction,methodology,findings,conclusion,references"
  },
  {
    id: 2,
    name: "Executive Summary",
    description: "Concise business-focused report with key findings and recommendations",
    template: "# Executive Summary: {title}\n\n## Summary\n{summary}\n\n## Key Findings\n{key_findings}\n\n## Recommendations\n{recommendations}\n\n## Appendix\n{appendix}",
    structure: "summary,key_findings,recommendations,appendix"
  },
  {
    id: 3,
    name: "Technical Documentation",
    description: "Detailed technical report with implementation details and examples",
    template: "# Technical Documentation: {title}\n\n## Overview\n{overview}\n\n## Technical Details\n{technical_details}\n\n## Implementation\n{implementation}\n\n## Examples\n{examples}\n\n## References\n{references}",
    structure: "overview,technical_details,implementation,examples,references"
  }
];

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  private shares: {id:string, userId:string, reportId:string, linkedInPostId:string, sharedAt:Date}[] = [];

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
    this.initializeTemplates();
  }

  private async initializeTemplates() {
    try {
      const existingTemplates = await db.select().from(reportTemplates);
      if (existingTemplates.length === 0) {
        console.log('Creating default templates...');
        for (const template of DEFAULT_TEMPLATES) {
          await db.insert(reportTemplates).values(template);
        }
        console.log('Default report templates created');
      }
    } catch (error) {
      console.error('Error initializing report templates:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async createOrUpdateUser(user: { id: string; email: string; name: string; researchCount: number }): Promise<User> {
    const existingUser = await this.getUser(user.id);
    if (existingUser) {
      const [updatedUser] = await db.update(users)
        .set({ email: user.email, name: user.name })
        .where(eq(users.id, user.id))
        .returning();
      return updatedUser;
    }
    return await this.createUser({
      id: user.id,
      email: user.email,
      name: user.name,
      researchCount: 0
    });
  }

  async incrementResearchCount(userId: string): Promise<void> {
    await db.execute(
      sql`UPDATE ${users} SET research_count = research_count + 1 WHERE id = ${userId}`
    );
  }

  async getUserResearchCount(userId: string): Promise<number> {
    const [user] = await db.select({ count: users.researchCount })
      .from(users)
      .where(eq(users.id, userId));
    return user?.count || 0;
  }

  async createResearchReport(report: InsertResearchReport): Promise<ResearchReport> {
    const [newReport] = await db.insert(researchReports)
      .values(report)
      .returning();
    return newReport;
  }

  async getUserReports(userId: string): Promise<ResearchReport[]> {
    return await db.select()
      .from(researchReports)
      .where(eq(researchReports.userId, userId))
      .orderBy(desc(researchReports.createdAt));
  }

  async trackLinkedInShare(userId: string, reportId: string, linkedInPostId: string): Promise<{id:string, userId:string, reportId:string, linkedInPostId:string, sharedAt:Date}> {
    const share = {
      id: crypto.randomUUID(),
      userId,
      reportId,
      linkedInPostId,
      sharedAt: new Date()
    };
    this.shares.push(share);
    return share;
  }

  async getReportShares(reportId: string): Promise<{id:string, userId:string, reportId:string, linkedInPostId:string, sharedAt:Date}[]> {
    return this.shares.filter(share => share.reportId === reportId);
  }

  async getReportTemplates(): Promise<ReportTemplate[]> {
    return await db.select().from(reportTemplates);
  }

  async getReportCustomization(reportId: number): Promise<ReportCustomization | undefined> {
    const [customization] = await db.select()
      .from(reportCustomizations)
      .where(eq(reportCustomizations.reportId, reportId));
    return customization;
  }

  async createReportCustomization(customization: InsertReportCustomization): Promise<ReportCustomization> {
    const [newCustomization] = await db.insert(reportCustomizations)
      .values(customization)
      .returning();
    return newCustomization;
  }

  async getReport(id: number): Promise<ResearchReport | undefined> {
    const [report] = await db.select()
      .from(researchReports)
      .where(eq(researchReports.id, id));
    return report;
  }
}

export const storage = new DatabaseStorage();