import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";

export default function HomePage() {
  return (
    <div className="p-6">
      <h1 className="font-heading text-text-primary mb-6 text-3xl font-bold">
        Shell Preview
      </h1>

      <section className="mb-8">
        <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
          Metric Cards
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Total Views"
            value="12,847"
            trend={{ direction: "up", percentage: 12 }}
          />
          <MetricCard
            label="Active Users"
            value="3,291"
            trend={{ direction: "up", percentage: 8 }}
          />
          <MetricCard
            label="Bounce Rate"
            value="24.5%"
            trend={{ direction: "down", percentage: 3 }}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
          Card Component
        </h2>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Contemplative Design</CardTitle>
            <CardDescription>
              A design system built on restraint and intentionality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary text-sm">
              Every element earns its place through purpose, not decoration. The
              shell provides a stable, zero-CLS foundation for content.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
          Button Variants
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
          Scroll Test
        </h2>
        <p className="text-text-secondary mb-4 text-sm">
          Scroll down to verify the sidebar and status bar remain fixed.
        </p>
        <div className="bg-surface border-elevated rounded-md border p-4">
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} className="text-text-tertiary py-2 text-sm">
              Content row {i + 1} — The main content area scrolls while shell
              components stay fixed.
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
