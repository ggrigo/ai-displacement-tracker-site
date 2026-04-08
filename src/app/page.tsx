import data from "../../public/data/cases.json";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      {/* Crisis banner — always visible */}
      <div className="border-b border-[#222228] bg-[#0f0f12]">
        <div className="mx-auto max-w-4xl px-6 py-3 text-center text-sm text-[#7a7a85]">
          If you or someone you know is in crisis:{" "}
          <a
            href="https://988lifeline.org"
            className="text-[#c9a0dc] hover:underline"
          >
            988 Lifeline
          </a>{" "}
          (US) &middot;{" "}
          <a
            href="https://findahelpline.com"
            className="text-[#c9a0dc] hover:underline"
          >
            Find a Helpline
          </a>{" "}
          (international) &middot;{" "}
          <a
            href="https://www.befrienders.org"
            className="text-[#c9a0dc] hover:underline"
          >
            Befrienders Worldwide
          </a>
        </div>
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-4xl px-6 pt-20 pb-16">
        <h1 className="text-4xl font-bold tracking-tight text-[#e8e8ec] sm:text-5xl">
          AI Displacement Tracker
        </h1>
        <div className="mt-8 max-w-2xl space-y-4 text-lg leading-relaxed text-[#9a9aa5]">
          <p>
            What would the signal be? Layoffs? Imaginary friends?{" "}
            <span className="text-[#7a7a85]">___?</span>
          </p>
          <p>
            Tracking suicides as if it&apos;s the unemployment rate. As if
            it&apos;s inflation. As if it&apos;s the death toll of floods &amp;
            earthquakes.
          </p>
          <p>Tracking suicides triggered by AI displacement. Morbid.</p>
          <p className="text-[#c9a0dc]">
            This tracker hopes to stay empty &amp; unvisited. An inverted
            Portrait of Dorian Gray. A chart meant as a charm.
          </p>
        </div>
      </header>

      {/* Dashboard */}
      <main className="mx-auto max-w-4xl px-6 pb-24">
        <Dashboard data={data} />
      </main>

      {/* Methodology */}
      <section className="border-t border-[#222228] bg-[#0f0f12]">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#7a7a85]">
            Methodology &amp; Ethics
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-[#7a7a85]">
            <p>
              This tracker records reported cases where AI-driven economic
              displacement (layoffs, role automation, gig collapse) was cited as
              a contributing factor in a person&apos;s death. Each case is
              assigned a confidence level:{" "}
              <span className="text-[#e85650]">confirmed</span> (coroner, legal,
              or family statement),{" "}
              <span className="text-[#d4993a]">alleged</span> (news report), or{" "}
              <span className="text-[#7a7a85]">contextual</span> (death during
              an AI layoff wave, no direct causal link).
            </p>
            <p>
              Names are stored internally for deduplication only and are never
              published. No method details are recorded. This project follows{" "}
              <a
                href="https://reportingonsuicide.org"
                className="text-[#c9a0dc] hover:underline"
              >
                reportingonsuicide.org
              </a>{" "}
              guidelines.
            </p>
            <p>
              Data collected via automated multilingual news scans (English,
              Hindi, Spanish, German, French, Japanese, Korean, Portuguese) and
              manual research. Cases submitted to the{" "}
              <a
                href="https://incidentdatabase.ai/"
                className="text-[#c9a0dc] hover:underline"
              >
                AI Incident Database
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#222228]">
        <div className="mx-auto max-w-4xl px-6 py-6 text-center text-xs text-[#3a3a42]">
          No names in any output &middot; reportingonsuicide.org guidelines
          &middot; Last updated: {data.exported_at}
          <br />A{" "}
          <a
            href="https://baresquare.com"
            className="text-[#4a4a55] hover:text-[#7a7a85]"
          >
            Baresquare
          </a>{" "}
          research project
        </div>
      </footer>
    </div>
  );
}
