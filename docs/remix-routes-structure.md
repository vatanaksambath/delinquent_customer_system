# Enterprise Loan Collection: Remix Route Structure

As requested, here is the boilerplate folder/route structure for your Remix application based on the updated Sidebar navigation tree. 

In your Remix `app/` directory, map these to the `Sidebar`'s links using standard nested routing file conventions (e.g., Remix v2 flat file routing).

```text
app/
├── routes/
│   ├── _layout.tsx                     // Contains the <Sidebar> and <Header> wrapper
│   │
│   ├── _layout._index.tsx              // DASHBOARD
│   │
│   // 2. DELINQUENT
│   ├── _layout.delinquent.queue.tsx    // Smart Queue (Existing)
│   ├── _layout.delinquent.accounts.tsx // Accounts (Existing)
│   ├── _layout.delinquent.ptp.tsx      // PTP Tracker (NEW)
│   ├── _layout.delinquent.monitoring.tsx// Monitoring (Existing)
│   │
│   // 3. ENGAGEMENT & CAMPAIGNS
│   ├── _layout.engagement.interactions.tsx // Interaction Logs
│   ├── _layout.engagement.templates.tsx    // Templates & Dunning
│   │
│   // 4. REPORT
│   ├── _layout.report.kpis.tsx             // Performance KPIs
│   ├── _layout.report.audit.tsx            // Audit & Compliance Logs
│   │
│   // 5. SETTING
│   ├── _layout.settings.rules.tsx          // Workflow & Bucket Rules
│   ├── _layout.settings.governance.tsx     // Contact Governance
```

## Integrating With the Backend

In each of these `.tsx` files, you will use standard Remix data loading inside the route module:

```tsx
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { prisma } from "~/db.server";

// 1. Backend Hook: Fetch Data
export async function loader({ request }: LoaderFunctionArgs) {
  const data = await prisma.promiseToPay.findMany({
    include: { customer: true }
  });
  return json({ data });
}

// 2. Backend Hook: Mutate Data
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // e.g., Update workflow bucket rules or add a PTP
  return json({ success: true });
}

// 3. Frontend React Component
export default function PromiseToPayRoute() {
  const { data } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <div className="p-8">
      {/* 
        Render your UI here using Tailwind CSS. 
        Pass "data" down to your presentation components. 
       */}
    </div>
  );
}
```
