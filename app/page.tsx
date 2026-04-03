import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="w-screen h-screen flex flex-col gap-6 items-center justify-center font-sans px-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center">
        Welcome to the IIMpact Dashboard
      </h1>

      <p className="text-muted-foreground text-center text-lg">
        Manage blogs and PYQs for IIMpact from this dashboard.
      </p>

      {/* Instructions */}
      <div className="w-full border border-border rounded-lg p-4 flex flex-col gap-2 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Getting Started</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Use the <span className="font-medium text-foreground">sidebar</span>{" "}
            on the left to navigate between sections.
          </li>
          <li>
            Follow the{" "}
            <span className="font-medium text-foreground">form structure</span>{" "}
            provided in each section — do not skip required fields.
          </li>
          <li>
            Refer to the{" "}
            <span className="font-medium text-foreground">documentation</span>{" "}
            if you are unsure about any field or process.
          </li>
          <li>
            All published content is{" "}
            <span className="font-medium text-foreground">
              immediately live
            </span>{" "}
            — review before submitting.
          </li>
        </ul>
      </div>
      {/* Warning */}
      <div className="w-full border border-red-500 font-mono  text-red-600 dark:text-red-400 rounded-lg p-4 text-sm">
        <p className="font-semibold mb-1 text-yellow-400">⚠ Warning</p>
        <p>
          Do not add anything that is not needed on the main website. Any
          changes made here will directly reflect on the live website. There is
          no drafting system present. Changes are instantaneous. If anything is
          added accidentally, delete them using the manage page.
        </p>
      </div>
    </main>
  );
}
