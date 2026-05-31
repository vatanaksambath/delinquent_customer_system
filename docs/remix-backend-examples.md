# MDCS Enterprise Features - Remix & Prisma Backend Specifications

As requested, here is the full-stack database schema and Remix backend logic required to power the four core enterprise collection features.

## 1. Database Schema (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Customer {
  id              String            @id @default(uuid())
  cid             String            @unique
  name            String
  phone_number    String?
  loans           Loan[]
  ptp_logs        PromiseToPay[]
  interactions    InteractionLog[]
  createdAt       DateTime          @default(now())
}

model Loan {
  id                 String     @id @default(uuid())
  account_number     String     @unique
  customerId         String
  balance            Float
  days_past_due      Int        @default(0)
  delinquency_stage  String     // Managed by bucketing logic (e.g. Grace Period)
  customer           Customer   @relation(fields: [customerId], references: [id])
  ptp_logs           PromiseToPay[]
}

model PromiseToPay {
  id              String    @id @default(uuid())
  customerId      String
  loanId          String
  promise_amount  Float
  promise_date    DateTime
  status          String    @default("Pending") // Pending, Kept, Broken
  createdAt       DateTime  @default(now())
  
  customer        Customer  @relation(fields: [customerId], references: [id])
  loan            Loan      @relation(fields: [loanId], references: [id])
}

model InteractionLog {
  id              String   @id @default(uuid())
  customerId      String
  type            String   // SMS, Email, Call
  content         String?
  outcome         String?  // Right Party Contact, Wrong Number, Left Voicemail
  agentId         String? 
  createdAt       DateTime @default(now())

  customer        Customer @relation(fields: [customerId], references: [id])
}
```

## 2. Dynamic Delinquency Bucketing & Smart Worklists
**Remix Loader Function (`app/routes/queue.tsx`)**

```typescript
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";

function calculateDelinquencyStage(dpd: number) {
  if (dpd <= 14) return "Grace Period";
  if (dpd <= 30) return "Early-Stage";
  if (dpd <= 90) return "Mid-Stage";
  return "Late-Stage";
}

export async function loader() {
  // Query all overdue loans
  let loans = await prisma.loan.findMany({
    where: { days_past_due: { gt: 0 } },
    include: { customer: true }
  });

  // Calculate priority score and bucketing dynamically
  const smartQueue = loans.map(loan => {
    const priority_score = loan.balance * loan.days_past_due;
    const current_stage = calculateDelinquencyStage(loan.days_past_due);
    
    return {
      ...loan,
      priority_score,
      current_stage
    };
  });

  // Sort by highest priority score
  smartQueue.sort((a, b) => b.priority_score - a.priority_score);

  return json({ queue: smartQueue });
}
```

## 3. Promise to Pay (PTP) Tracking Workflow
**Remix Action Function (`app/routes/api/ptp.tsx`)**

```typescript
import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  
  const customerId = formData.get("customerId") as String;
  const loanId = formData.get("loanId") as String;
  const amount = parseFloat(formData.get("promise_amount") as String);
  const date = new Date(formData.get("promise_date") as String);

  await prisma.promiseToPay.create({
    data: {
      customerId,
      loanId,
      promise_amount: amount,
      promise_date: date,
      status: "Pending" // Initial state
    }
  });

  return json({ success: true, message: "PTP Logged Successfully" });
}
```

## 4. Unified Omnichannel Communication Log
**Remix Action Function (`app/routes/api/interactions.tsx`)**

```typescript
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  
  const customerId = formData.get("customerId") as String;
  const type = formData.get("type") as String; // e.g. "Call"
  const outcome = formData.get("outcome") as String; 

  await prisma.interactionLog.create({
    data: {
      customerId,
      type,
      outcome,
    }
  });

  return json({ success: true, message: "Interaction Logged" });
}
```

## 5. Collection Key Performance Indicators (KPI) Dashboard
**Remix Aggregation Loader (`app/routes/dashboard.tsx`)**

```typescript
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";

export async function loader() {
  // Total PAR
  const parLoans = await prisma.loan.findMany({ where: { days_past_due: { gt: 0 } } });
  const totalPar = parLoans.reduce((sum, loan) => sum + loan.balance, 0);

  // PTP Kept Rate
  const ptps = await prisma.promiseToPay.findMany();
  const keptPtps = ptps.filter(ptp => ptp.status === "Kept").length;
  const totalCompletedPtps = ptps.filter(ptp => ptp.status !== "Pending").length;
  const ptpKeptRate = totalCompletedPtps > 0 ? (keptPtps / totalCompletedPtps) * 100 : 0;

  // Aggregate stats (Simplified DSO as example)
  const dso = 45; // Placeholder DSO calculation metric based on business logic.

  return json({ 
    kpi: {
      totalPar,
      ptpKeptRate: ptpKeptRate.toFixed(2) + "%",
      dso,
    }
  });
}
```
