import Layout from './Layout'
import FaqSection from './FaqSection'

const faqItems = [
  {
    question: "How does the connection work? Do you store my data?",
    answer:
      "Your browser connects directly to the sharer's browser. Nothing goes through our servers. We don't store, record, or save any video or data.",
  },
  {
    question: "Is my screen share encrypted?",
    answer:
      "Yes. The video is scrambled while it travels so nobody else can watch it.",
  },
  {
    question: "Does the sharer see my webcam or hear me?",
    answer:
      "No. As a viewer you only receive the sharer's screen. Your camera and microphone are never sent.",
  },
]

export default function FaqPage() {
  return (
    <Layout statusText="Frequently Asked Questions">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center p-4">
        <FaqSection title="Privacy & Trust" items={faqItems} />
      </div>
    </Layout>
  )
}
