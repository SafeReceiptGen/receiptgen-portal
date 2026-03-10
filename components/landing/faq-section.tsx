import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqSection() {
  const faqs = [
    {
      question: "Do I need an account to create a receipt?",
      answer:
        "No. You can generate and share receipts instantly without creating an account.",
    },
    {
      question: "Can I include return terms?",
      answer:
        "Yes. Each receipt shows agreed return windows and refund/exchange conditions.",
    },
    {
      question: " How does my customer receive the receipt?",
      answer:
        "You can share the receipt link via WhatsApp, SMS, or export as a PDF.",
    },
    {
      question: "Are the receipts stored online?",
      answer:
        "Yes. Each receipt gets a secure public link that can be viewed anytime.",
    },
    {
      question: "Is this valid for my business in Ghana?",
      answer:
        "Yes. SafeReceipts is built for Ghanaian merchants and works on mobile phones.",
    },
    {
      question: "What happens if I lose the receipt link?",
      answer:
        "For now, links stay active. Optional accounts for receipt history will be added later.",
    },
    {
      question: "Does my customer need an app?",
      answer: "No. Customers only need a web browser.",
    },
    {
      question: " Is SafeReceipts free to use?",
      answer:
        "Yes. During early access, you can generate unlimited receipts for free.",
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about our receipt generator
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white border border-slate-200 rounded-xl px-6 data-[state=open]:bg-slate-50"
              >
                <AccordionTrigger className="text-slate-900 hover:text-slate-900 hover:no-underline py-5 font-semibold text-lg text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-5 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
