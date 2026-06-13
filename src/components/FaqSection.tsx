interface FaqItem {
  question: string
  answer: string
}

interface FaqSectionProps {
  title: string
  items: FaqItem[]
}

function FaqCard({ question, answer }: FaqItem) {
  return (
    <details className="group cursor-pointer rounded-xl border border-white/10 bg-white/5 transition-colors open:bg-white/[0.07]">
      <summary className="flex items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-gray-200 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
        {question}
        <svg
          className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="border-t border-white/5 px-5 py-4 text-sm leading-relaxed text-gray-400">
        {answer}
      </div>
    </details>
  )
}

export default function FaqSection({ title, items }: FaqSectionProps) {
  return (
    <section className="mx-auto mt-16 w-full max-w-2xl px-4 pb-8">
      <h2 className="mb-6 text-center text-xl font-semibold text-white">
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <FaqCard key={i} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  )
}
