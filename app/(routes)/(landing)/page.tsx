import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  Clock3,
  Layers3,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    title: "Visual Workflow Builder",
    description:
      "Design automation flows with drag-and-drop nodes, custom logic, and branching conditions.",
    icon: Workflow,
  },
  {
    title: "AI-Native Agents",
    description:
      "Power each step with LLM actions, prompts, and memory-aware execution for smarter outcomes.",
    icon: Bot,
  },
  {
    title: "Live Collaboration",
    description:
      "Coordinate with your team in real time and keep every stakeholder aligned around execution.",
    icon: MessagesSquare,
  },
  {
    title: "Reliable at Scale",
    description:
      "Monitor runs, retry failures, and keep production automations stable with observability built in.",
    icon: ShieldCheck,
  },
];

const steps = [
  {
    title: "Map your process",
    description:
      "Choose triggers, APIs, and business rules in a visual graph that anyone can understand.",
  },
  {
    title: "Attach AI logic",
    description:
      "Use AI nodes for extraction, classification, drafting, and decisions with human review loops.",
  },
  {
    title: "Launch and optimize",
    description:
      "Ship in minutes, monitor every run, and evolve flows with version-safe updates.",
  },
];

const stats = [
  { label: "Workflow runs per month", value: "2.4M+" },
  { label: "Average setup time", value: "12 min" },
  { label: "Team productivity boost", value: "3.1x" },
  { label: "Uptime across executions", value: "99.95%" },
];

const faqs = [
  {
    question: "Can non-technical teams build workflows?",
    answer:
      "Yes. The builder is visual-first, with templates and guided configuration so business teams can ship without writing code.",
  },
  {
    question: "Can I connect existing tools and APIs?",
    answer:
      "Yes. You can connect internal APIs and external services, then enrich each step with AI actions and custom rules.",
  },
  {
    question: "Is this suitable for production automation?",
    answer:
      "Yes. You get run history, retries, status visibility, and controls designed for reliable long-running automations.",
  },
];

const LandingPage = () => {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/18 blur-3xl" />
        <div className="absolute right-[-120px] top-[240px] h-[320px] w-[320px] rounded-full bg-chart-2/18 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[-110px] h-[290px] w-[290px] rounded-full bg-chart-1/22 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link className="transition-colors hover:text-primary" href="#features">
              Features
            </Link>
            <Link className="transition-colors hover:text-primary" href="#how-it-works">
              How it works
            </Link>
            <Link className="transition-colors hover:text-primary" href="#pricing">
              Pricing
            </Link>
            <Link className="transition-colors hover:text-primary" href="#faq">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <LoginLink>
              <Button variant="ghost" className="hidden sm:inline-flex">
                Sign in
              </Button>
            </LoginLink>
            <RegisterLink>
              <Button className="group">
                Get started
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Button>
            </RegisterLink>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:text-sm">
              <Sparkles className="size-4" />
              AI orchestration for modern teams
            </div>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Build production workflows with AI in one visual canvas
              </h1>
              <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
                Flowagent helps teams design, test, and scale agent-driven workflows without glue code. Go from idea to live automation in minutes, not weeks.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <RegisterLink>
                <Button size="lg" className="group w-full sm:w-auto">
                  Start building free
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Button>
              </RegisterLink>
              <LoginLink>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Open dashboard
                </Button>
              </LoginLink>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-card/75 p-4">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <Clock3 className="size-4 text-primary" />
                  Faster launches
                </div>
                <p className="text-sm text-muted-foreground">
                  Replace brittle scripts with reusable visual workflows your entire team can maintain.
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/75 p-4">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <Layers3 className="size-4 text-primary" />
                  Unified execution
                </div>
                <p className="text-sm text-muted-foreground">
                  Orchestrate prompts, APIs, and custom logic in one runtime with full visibility.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/85 p-5 shadow-2xl shadow-primary/12 sm:p-6">
              <div className="mb-5 flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Active workflow</p>
                  <p className="font-semibold">Support Triage Automation</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  Healthy
                </span>
              </div>

              <div className="space-y-3">
                {[
                  "Incoming ticket trigger",
                  "AI classification and tagging",
                  "Priority routing decision",
                  "Knowledge-base response draft",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 py-2.5"
                  >
                    <span className="text-sm font-medium">{item}</span>
                    <Check className="size-4 text-emerald-500" />
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-3.5">
                <p className="text-sm font-semibold">Last run summary</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  1,236 tickets processed this week with 98.7% confidence and human review on critical cases.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-7 -left-6 hidden rounded-xl border border-border/70 bg-card/90 p-3 shadow-lg backdrop-blur sm:block">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <BrainCircuit className="size-4 text-primary" />
                AI assistance enabled on each node
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-3 rounded-2xl border border-border/70 bg-card/70 p-5 sm:grid-cols-2 sm:gap-4 sm:p-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border/60 bg-background/70 p-4">
              <p className="text-2xl font-black sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-6xl px-4 pb-18 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Features</p>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Everything you need to automate high-impact work</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-border/70 bg-card/75 p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex rounded-lg border border-primary/35 bg-primary/12 p-2.5 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 pb-18 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">How it works</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">From concept to live operations in 3 steps</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-border/70 bg-background/70 p-5">
                <p className="mb-3 text-sm font-semibold text-primary">0{index + 1}</p>
                <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-6xl px-4 pb-18 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-border/70 bg-card/75 p-6">
            <p className="mb-1 text-sm font-semibold text-primary">Starter</p>
            <h3 className="text-2xl font-black">$0</h3>
            <p className="mt-1 text-sm text-muted-foreground">For individuals prototyping AI workflows.</p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" />Up to 3 active workflows</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" />Core node library</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" />Community support</li>
            </ul>
            <RegisterLink>
              <Button className="mt-6 w-full">Start free</Button>
            </RegisterLink>
          </article>

          <article className="relative rounded-2xl border border-primary/45 bg-primary/7 p-6 shadow-xl shadow-primary/10">
            <span className="absolute right-4 top-4 rounded-full border border-primary/35 bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary">
              Most popular
            </span>
            <p className="mb-1 text-sm font-semibold text-primary">Scale</p>
            <h3 className="text-2xl font-black">$49</h3>
            <p className="mt-1 text-sm text-muted-foreground">Per seat / month for teams running mission-critical flows.</p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" />Unlimited workflows and runs</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" />Advanced AI controls and guardrails</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" />Priority support and onboarding</li>
            </ul>
            <RegisterLink>
              <Button className="mt-6 w-full">Book a demo</Button>
            </RegisterLink>
          </article>
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">FAQ</p>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Questions teams ask before they launch</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((item) => (
            <article key={item.question} className="rounded-xl border border-border/70 bg-card/70 p-5">
              <h3 className="text-base font-bold sm:text-lg">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/70 bg-background/70 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Built for teams automating work with AI, safely and at scale.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;