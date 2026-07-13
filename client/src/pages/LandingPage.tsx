import { ShieldCheck, Moon, Sun, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { APP_NAME, APP_TAGLINE } from '@/constants/config'

/**
 * Placeholder landing page for Stage 1.
 * Confirms the design system (fonts, tokens, dark mode, shared Button) is wired.
 * The full landing page is built in Stage 2.
 */
export function LandingPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl font-bold text-primary">{APP_NAME}</span>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-sm font-medium text-primary-dark">
          <ShieldCheck className="size-4" />
          Blockchain-verified donations
        </span>

        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Transparent giving,
          <br />
          verified forever.
        </h1>

        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          {APP_TAGLINE} Donate to verified NGO campaigns with familiar Tanzanian payment
          methods — every shilling recorded immutably on-chain.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg">
            Browse campaigns
            <ArrowRight />
          </Button>
          <Button size="lg" variant="secondary">
            How it works
          </Button>
        </div>

        <p className="mt-16 text-sm text-muted-foreground">
          Foundation ready — Stage 1 complete.
        </p>
      </main>
    </div>
  )
}
