import Film from "@/components/Film";
import Coda from "@/components/Coda";

export default function Home() {
  return (
    <main>
      {/* The journey: one pinned stage, ten scenes, one continuous shot. */}
      <Film />

      {/* Everything after the film is deliberately quiet — the brief is
          animation-first, so this is just enough to land the nav anchors. */}
      <Coda />
    </main>
  );
}
