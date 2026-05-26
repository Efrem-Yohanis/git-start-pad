import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Check, X, Home, BookOpen, Trophy, ClipboardList } from "lucide-react";
import { Header } from "@/components/Header";
import { quizService, type AnswerResult } from "@/services/api";
import { useAuth } from "@/lib/auth";
import { bookSlug, findBook, localizedBookName } from "@/data/bible";
import { useI18n } from "@/lib/i18n";

type Search = { book_id: number; level_id: number; language_code: string };

type CurrentQuestion = {
  id: number;
  text: string;
  options: Record<string, string>;
  verse_reference?: string;
};

type FinalScore = {
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  score_percentage: number;
};

export const Route = createFileRoute("/quiz/$book")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    book_id: Number(s.book_id),
    level_id: Number(s.level_id),
    language_code: String(s.language_code ?? s.language ?? "en"),
  }),
  component: QuizPage,
});

function QuizPage() {
  const { book: slug } = Route.useParams();
  const { book_id, level_id, language_code } = Route.useSearch();
  const { user } = useAuth();
  const { lang } = useI18n();
  const navigate = useNavigate();

  const localBook = findBook(slug);
  const bookName = localBook?.name ?? slug.replace(/-/g, " ");
  const localized = localizedBookName(bookName, lang);

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [question, setQuestion] = useState<CurrentQuestion | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Start quiz on mount
  useEffect(() => {
    if (!user) return;
    if (!book_id || !level_id || !language_code) {
      setError("Missing quiz parameters.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await quizService.start(book_id, level_id, language_code);
        if (cancelled) return;
        setAttemptId(res.attempt_id);
        setProgress({ current: 1, total: res.total_questions });
        setQuestion({
          id: res.first_question.question_id,
          text: res.first_question.text,
          options: res.first_question.options,
          verse_reference: res.first_question.verse_reference,
        });
        setPicked(null);
        setFeedback(null);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book_id, level_id, language_code, user?.email]);

  const loadNext = async (id: number) => {
    setPicked(null);
    setFeedback(null);
    const res = await quizService.next(id);
    if (res.question) {
      setQuestion({
        id: res.question.id,
        text: res.question.text,
        options: res.question.options,
        verse_reference: res.question.verse_reference,
      });
      setProgress({
        current: res.question_number ?? progress.current + 1,
        total: res.total_questions ?? progress.total,
      });
    } else {
      // Completed — finalize.
      const fin = await quizService.finish(id);
      setFinalScore(fin.results);
      setQuestion(null);
    }
  };

  const submit = async () => {
    if (!attemptId || !question || !picked) return;
    try {
      setLoading(true);
      const res = await quizService.answer(attemptId, question.id, picked);
      setFeedback(res);
      setProgress({
        current: res.progress.answered,
        total: res.progress.total,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    if (!attemptId) return;
    try {
      setLoading(true);
      await loadNext(attemptId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const isLastAnswered =
    !!feedback && progress.total > 0 && progress.current >= progress.total;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="mb-4 text-muted-foreground">You must log in to take a quiz.</p>
          <Link
            to="/login"
            className="inline-flex rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Login
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className="font-serif text-lg font-semibold text-foreground">{localized} Quiz</h1>
          <span className="text-xs text-muted-foreground tabular-nums">
            {progress.total > 0 ? `${progress.current} / ${progress.total}` : ""}
          </span>
        </div>
        {progress.total > 0 && (
          <div className="mx-auto max-w-3xl px-4 pb-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.min(100, Math.round((progress.current / progress.total) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && !question && !finalScore ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading quiz…
          </div>
        ) : finalScore ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Trophy className="h-6 w-6" />
            </div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground">Quiz Result</p>
            <div className="mt-3 font-serif text-5xl font-semibold text-foreground">
              {finalScore.correct_answers}
              <span className="text-muted-foreground"> / {finalScore.total_questions}</span>
            </div>
            <p className="mt-2 text-lg text-primary">
              {finalScore.score_percentage.toFixed(0)}%
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {attemptId && (
                <button
                  onClick={async () => {
                    try {
                      await quizService.review(attemptId);
                      // For now just refetch; a dedicated review screen can consume it.
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  <ClipboardList className="h-4 w-4" /> Review
                </button>
              )}
              <button
                onClick={() =>
                  navigate({
                    to: "/quiz/$book",
                    params: { book: bookSlug(bookName) },
                    search: { book_id, level_id, language_code },
                    replace: true,
                  })
                }
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Retake
              </button>
              <Link
                to="/read/$book"
                params={{ book: bookSlug(bookName) }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                <BookOpen className="h-4 w-4" /> Read Book
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                <Home className="h-4 w-4" /> Home
              </Link>
            </div>
          </div>
        ) : question ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 text-xs font-medium text-muted-foreground">
              {question.verse_reference}
            </div>
            <h2 className="mb-6 font-serif text-xl font-semibold text-card-foreground">
              {question.text}
            </h2>
            <div className="space-y-2">
              {Object.entries(question.options).map(([label, text]) => {
                const isPicked = picked === label;
                const correct = feedback?.correct_option === label;
                const wrongPick = !!feedback && isPicked && !feedback.is_correct;
                return (
                  <button
                    key={label}
                    onClick={() => !feedback && setPicked(label)}
                    disabled={!!feedback}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                      feedback && correct
                        ? "border-primary bg-primary/10"
                        : wrongPick
                          ? "border-destructive bg-destructive/10"
                          : isPicked
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-xs font-medium">
                      {label}
                    </span>
                    <span className="flex-1">{text}</span>
                    {feedback && correct && <Check className="h-4 w-4 text-primary" />}
                    {wrongPick && <X className="h-4 w-4 text-destructive" />}
                  </button>
                );
              })}
            </div>

            {feedback && (
              <div className="mt-4 rounded-lg border border-border bg-background p-3 text-sm">
                {feedback.verse_reference && (
                  <p className="font-medium text-foreground">{feedback.verse_reference}</p>
                )}
                {feedback.verse_text && (
                  <p className="mt-1 italic text-muted-foreground">{feedback.verse_text}</p>
                )}
                {feedback.explanation && (
                  <p className="mt-2 text-muted-foreground">{feedback.explanation}</p>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              {feedback ? (
                <button
                  onClick={next}
                  className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
                >
                  {isLastAnswered ? "See Result" : "Next"}
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={!picked || loading}
                  className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}