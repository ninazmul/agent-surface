This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Calling the Leads & leads APIs

This project includes two secured APIs:

| Endpoint     | Description       |
| ------------ | ----------------- |
| `/api/leads` | Returns all leads |
| `/api/leads` | Returns all leads |

Both APIs require a **secret API key** in the header:

```
x-api-key: YOUR_SECRET_KEY
```

Replace `YOUR_SECRET_KEY` with the key you set in `.env` (`LEADS_API_KEY`).

---

### **1️⃣ Example: Fetching Leads**

You can call the Leads API in any component or page:

```ts
// Example: app/page.tsx or any React component
import { useEffect, useState } from "react";

export default function HomePage() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetch("/api/leads", {
      headers: {
        "x-api-key": process.env.LEADS_API_KEY || "",
      },
    })
      .then((res) => res.json())
      .then((data) => setLeads(data.leads))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>All Leads</h1>
      <pre>{JSON.stringify(leads, null, 2)}</pre>
    </div>
  );
}
```

---

### **2️⃣ Example: Fetching leads**

```ts
import { useEffect, useState } from "react";

export default function leadsPage() {
  const [leads, setleads] = useState([]);

  useEffect(() => {
    fetch("/api/leads", {
      headers: {
        "x-api-key": process.env.REGI_API_KEY || "",
      },
    })
      .then((res) => res.json())
      .then((data) => setleads(data.leads))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>All leads</h1>
      <pre>{JSON.stringify(leads, null, 2)}</pre>
    </div>
  );
}
```

---

### **3️⃣ Environment Variable**

Add the API key to your `.env.local`:

```
LEADS_API_KEY=leadssecret123
```

> **Note:** Prefix with `NEXT_PUBLIC_` if you need to access it in frontend code. Otherwise, keep it private and fetch APIs server-side for better security.

---

### **4️⃣ Testing the API**

You can also test the APIs directly:

```bash
curl -H "x-api-key: supersecret123" http://localhost:3000/api/leads
curl -H "x-api-key: supersecret123" http://localhost:3000/api/leads
```
