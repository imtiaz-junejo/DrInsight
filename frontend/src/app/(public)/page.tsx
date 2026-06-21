import Link from "next/link";
import { Button } from "@/components/ui/button";

const specialties = [
  ["❤️", "Cardiology"],
  ["🧠", "Neurology"],
  ["🫁", "Pulmonology"],
  ["🩻", "Orthopedics"],
  ["👁️", "Ophthalmology"],
  ["🦷", "Dermatology"],
  ["🤰", "OB/GYN"],
  ["👶", "Pediatrics"],
  ["🧬", "Oncology"],
  ["🫀", "Endocrinology"],
  ["🦠", "Infectious Disease"],
  ["🧘", "Psychiatry"],
];

const tools = [
  ["⚖️", "BMI Calculator", "Calculate your Body Mass Index and understand your healthy weight range.", "#bmi"],
  ["🔥", "BMR Calculator", "Find your Basal Metabolic Rate to plan your nutrition effectively.", "#bmr"],
  ["🍎", "Calorie Calculator", "Determine your daily caloric needs based on activity level and goals.", "#calories"],
  ["💓", "Heart Rate Zones", "Calculate your target heart rate zones for optimal cardio training.", "#heartrate"],
  ["🤰", "Pregnancy Due Date", "Calculate your estimated due date and track your pregnancy timeline.", "#pregnancy"],
  ["🩸", "Diabetes Risk", "Assess your risk for Type 2 diabetes with our clinical screening tool.", "#diabetes"],
  ["💧", "Water Intake", "Find your optimal daily water intake based on your body and activity.", "#water"],
  ["🔎", "Symptom Checker", "Check your symptoms and get guidance on seeking medical care.", "#symptom"],
];

const blogPosts = [
  {
    emoji: "❤️",
    cat: "CARDIOLOGY",
    author: "Dr. Sarah Mitchell",
    read: "5 min read",
    date: "May 28, 2026",
    title: "10 Warning Signs of Heart Disease You Should Never Ignore",
    excerpt: "Cardiologists reveal the subtle symptoms that often go unnoticed until it's too late...",
  },
  {
    emoji: "🧠",
    cat: "NEUROLOGY",
    author: "Dr. James Okafor",
    read: "7 min read",
    date: "May 25, 2026",
    title: "Understanding Migraine: Triggers, Treatments & Prevention",
    excerpt: "A comprehensive guide to managing chronic migraines from a neurological perspective...",
  },
  {
    emoji: "🩸",
    cat: "ENDOCRINOLOGY",
    author: "Dr. Priya Sharma",
    read: "6 min read",
    date: "May 22, 2026",
    title: "Managing Type 2 Diabetes: A Complete Lifestyle Guide",
    excerpt: "From diet and exercise to medication management — everything you need to know...",
  },
];

const testimonials = [
  {
    initials: "RK",
    name: "Robert K.",
    role: "Cardiology Patient, New York",
    text: "Dr. Mitchell explained my heart condition in terms I could actually understand. The video consultation was seamless and the follow-up was thorough. I finally feel in control of my health.",
  },
  {
    initials: "LP",
    name: "Lisa P.",
    role: "Diabetes Patient, Chicago",
    text: "The BMI and diabetes risk tools helped me realize I needed to make changes. I booked a consultation the same day. Three months later, my A1C is under control. Life-changing platform.",
  },
  {
    initials: "AM",
    name: "Angela M.",
    role: "New Mom, Austin",
    text: "Used the pregnancy calculator and Ask the Doctor feature throughout my pregnancy. Every answer was thoughtful, medically accurate, and easy to understand. Highly recommend DrInsight.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-pattern relative overflow-hidden bg-gradient-to-br from-blue-dark via-blue to-teal px-6 py-20 text-white md:py-[90px]">
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 md:grid-cols-2 md:gap-[60px]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-[.8rem] font-semibold tracking-wide backdrop-blur-sm">
              <span>🏥</span> TRUSTED BY 500,000+ PATIENTS WORLDWIDE
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-tight">
              Your Trusted Partner in <span className="text-[#93c5fd]">Medical Excellence</span> & Health
            </h1>
            <p className="mt-5 max-w-[480px] text-[1.05rem] leading-relaxed opacity-90">
              Evidence-based medical information, AI-powered health tools, and expert doctor
              consultations — all in one trusted platform. Reviewed by licensed physicians.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Button variant="white" asChild>
                <Link href="/book-consultation">📅 Book a Consultation</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/ask-doctor">💬 Ask a Doctor</Link>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-6">
              {["Board-certified doctors", "Medically reviewed content", "HIPAA compliant", "24/7 support"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2 text-[.85rem] opacity-85">
                    ✅ <span>{item}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="hidden flex-col gap-4 md:flex">
            <div className="grid grid-cols-2 gap-3.5">
              {[
                ["🩺", "Expert Doctors", "200+ specialists across all major fields"],
                ["🔬", "Health Tools", "15+ free medical calculators"],
                ["💊", "Medical Blog", "1,000+ reviewed articles"],
                ["🛡️", "Privacy First", "HIPAA & GDPR compliant"],
              ].map(([icon, title, desc]) => (
                <div
                  key={title as string}
                  className="rounded-[20px] border border-white/20 bg-white/12 p-5 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/18"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-2xl">
                    {icon}
                  </div>
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="text-[.82rem] opacity-80">{desc}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["500K+", "Patients Served"],
                ["200+", "Specialist Doctors"],
                ["4.9★", "Avg. Rating"],
              ].map(([num, label]) => (
                <div
                  key={label as string}
                  className="rounded-xl border border-white/15 bg-white/10 p-3.5 text-center"
                >
                  <strong className="font-display block text-2xl font-bold">{num}</strong>
                  <span className="text-[.75rem] opacity-80">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <div className="bg-white px-6">
        <div className="relative z-10 mx-auto -mt-10 flex max-w-[1240px] flex-wrap items-center gap-3.5 rounded-xl border-[1.5px] border-[#fecaca] bg-[#fef2f2] p-4 md:p-5">
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <strong className="text-red">Medical Emergency? Call 911 immediately.</strong>
            <p className="text-[.85rem] text-gray-600">
              For non-emergency medical queries, use our Ask the Doctor feature. Available 24/7.
            </p>
          </div>
          <Button asChild className="w-auto whitespace-nowrap">
            <Link href="/ask-doctor">Get Help Now →</Link>
          </Button>
        </div>
      </div>

      {/* Specialties */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-13 text-center">
            <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-blue">Our Specialties</div>
            <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] leading-tight text-gray-900">
              Expert Care Across All Medical Fields
            </h2>
            <p className="mx-auto mt-3.5 max-w-[600px] text-[.98rem] text-gray-600">
              Browse our comprehensive range of medical specialties, each led by board-certified
              specialists with decades of experience.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4">
            {specialties.map(([icon, name]) => (
              <Link
                key={name}
                href="/doctors"
                className="group cursor-pointer rounded-xl border-[1.5px] border-gray-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-blue hover:shadow-[var(--shadow-lg)]"
              >
                <div className="mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-blue-light text-2xl transition group-hover:bg-blue group-hover:text-white">
                  {icon}
                </div>
                <h3 className="text-[.88rem] font-semibold text-gray-800">{name}</h3>
              </Link>
            ))}
          </div>
          <div className="mt-7 text-center">
            <Button asChild className="inline-flex w-auto">
              <Link href="/blog">View All Specialties →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Health Tools */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-13 text-center">
            <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-blue">Free Health Tools</div>
            <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] leading-tight text-gray-900">
              Calculate Your Health Metrics Instantly
            </h2>
            <p className="mx-auto mt-3.5 max-w-[600px] text-[.98rem] text-gray-600">
              Use our evidence-based health calculators to monitor and understand your health. All
              tools are medically reviewed.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {tools.map(([icon, title, desc, hash]) => (
              <Link
                key={title as string}
                href={`/health-tools${hash}`}
                className="flex items-start gap-3.5 rounded-xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-mid hover:shadow-[var(--shadow-lg)]"
              >
                <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-light to-[#dbeafe] text-xl">
                  {icon}
                </div>
                <div>
                  <h3 className="text-[.9rem] font-semibold">{title}</h3>
                  <p className="text-[.78rem] leading-snug text-gray-600">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-9 text-center">
            <Button asChild className="inline-flex w-auto">
              <Link href="/health-tools">Explore All 15+ Health Tools →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-13 text-center">
            <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-blue">Medical Blog</div>
            <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] leading-tight text-gray-900">
              Latest Health Insights from Our Doctors
            </h2>
            <p className="mx-auto mt-3.5 max-w-[600px] text-[.98rem] text-gray-600">
              Evidence-based articles written and reviewed by board-certified physicians. Stay
              informed, stay healthy.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-7">
            {blogPosts.map((post) => (
              <Link
                key={post.title}
                href="/blog"
                className="overflow-hidden rounded-[20px] border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
              >
                <div className="relative flex h-[180px] items-center justify-center bg-gradient-to-br from-blue-light to-[#dbeafe] text-5xl">
                  {post.emoji}
                  <div className="absolute bottom-3 left-3 rounded-full bg-blue px-3 py-1 text-[.72rem] font-bold tracking-wide text-white">
                    {post.cat}
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-2.5 flex items-center gap-3 text-[.78rem] text-gray-400">
                    <span>{post.author}</span>·<span>{post.read}</span>·<span>{post.date}</span>
                  </div>
                  <h3 className="font-display mb-2 text-[1.05rem] font-semibold leading-snug text-gray-900">
                    {post.title}
                  </h3>
                  <p className="text-[.83rem] leading-relaxed text-gray-600">{post.excerpt}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[.82rem] font-semibold text-blue">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild className="inline-flex w-auto">
              <Link href="/blog">View All Articles →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Ask the Doctor */}
      <section className="bg-gradient-to-br from-[#f0f7ff] to-[#e8f4fd] px-6 py-20">
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 md:grid-cols-2 md:gap-[60px]">
          <div>
            <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-blue">Ask the Doctor</div>
            <h2 className="font-display text-[clamp(1.7rem,3vw,2.3rem)] leading-tight text-gray-900">
              Get Expert Medical Answers to Your Questions
            </h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              Have a health concern? Submit your question to our panel of board-certified
              specialists and receive a medically reviewed, personalized answer — free of charge.
            </p>
            <div className="my-7 flex flex-col gap-3.5">
              {[
                ["👨‍⚕️", "Answers from board-certified specialists"],
                ["🔒", "Anonymous submissions available"],
                ["⚡", "Typical response within 24–48 hours"],
                ["📚", "Browse 5,000+ previously answered questions"],
              ].map(([icon, text]) => (
                <div key={text as string} className="flex items-center gap-3 text-[.9rem] text-gray-700">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-light text-sm">
                    {icon}
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <Button asChild className="inline-flex w-auto">
              <Link href="/ask-doctor">Browse All Questions →</Link>
            </Button>
          </div>
          <div className="rounded-[20px] border border-gray-200 bg-white p-8 shadow-[var(--shadow-lg)]">
            <h3 className="font-display text-[1.3rem]">Ask Your Question</h3>
            <p className="mb-5 text-[.85rem] text-gray-600">
              Get a free answer from one of our 200+ specialist doctors
            </p>
            <form action="/ask-doctor" className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">
                  Your Name (optional)
                </label>
                <input
                  className="w-full rounded-lg border-[1.5px] border-gray-200 px-3.5 py-2.5 text-[.88rem] focus:border-blue focus:outline-none focus:ring-[3px] focus:ring-blue/10"
                  placeholder="Leave blank to submit anonymously"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Medical Category</label>
                <select className="w-full rounded-lg border-[1.5px] border-gray-200 px-3.5 py-2.5 text-[.88rem] focus:border-blue focus:outline-none">
                  <option>Select a category...</option>
                  <option>General Medicine</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Dermatology</option>
                  <option>Mental Health</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Your Question</label>
                <textarea
                  className="min-h-[90px] w-full resize-y rounded-lg border-[1.5px] border-gray-200 px-3.5 py-2.5 text-[.88rem] focus:border-blue focus:outline-none"
                  placeholder="Describe your symptoms or health concern in detail..."
                />
              </div>
              <Button type="submit" size="full">
                Submit Question ✉️
              </Button>
              <div className="rounded border-l-4 border-amber bg-[#fffbeb] p-3 text-[.78rem] leading-relaxed text-[#92400e]">
                ⚠️ This service is for informational purposes only and does not replace professional
                medical advice, diagnosis, or treatment.
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Book CTA */}
      <section className="bg-gradient-to-br from-blue-dark to-blue px-6 py-20 text-center text-white">
        <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-[#93c5fd]">
          Virtual & In-Person Consultations
        </div>
        <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)]">Talk to a Doctor Today</h2>
        <p className="mx-auto mb-8 mt-4 max-w-[540px] text-base opacity-88">
          Book a video, phone, or chat consultation with a specialist from the comfort of your home.
          Same-day appointments available.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="white" asChild>
            <Link href="/book-consultation">Book a Consultation →</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">📞 Call Us</Link>
          </Button>
        </div>
        <div className="mt-9 flex flex-wrap justify-center gap-8">
          {["📹 Video Consultation", "📞 Phone Consultation", "💬 Chat Consultation"].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-[.88rem] opacity-85">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-13 text-center">
            <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-blue">Patient Stories</div>
            <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] leading-tight text-gray-900">
              Trusted by Hundreds of Thousands
            </h2>
            <p className="mx-auto mt-3.5 max-w-[600px] text-[.98rem] text-gray-600">
              Real experiences from patients who found clarity, care, and confidence through DrInsight.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-[20px] border-[1.5px] border-gray-200 bg-white p-7 transition hover:shadow-[var(--shadow-lg)]"
              >
                <div className="mb-3.5 text-base text-amber">★★★★★</div>
                <p className="mb-4 text-[.88rem] italic leading-relaxed text-gray-600">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-gradient-to-br from-blue to-teal text-base font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <strong className="block text-[.88rem] font-semibold">{t.name}</strong>
                    <span className="text-[.78rem] text-gray-400">{t.role}</span>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[.72rem] font-semibold text-green">
                      ✓ Verified Patient
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-gray-200 bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-[600px] text-center">
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)]">Stay Informed, Stay Healthy</h2>
          <p className="my-3 text-gray-600">
            Subscribe to our newsletter for weekly health tips from board-certified physicians.
          </p>
          <form className="mx-auto flex max-w-[440px] flex-col gap-2.5 sm:flex-row">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 rounded-[10px] border-[1.5px] border-gray-200 px-4 py-3 text-[.9rem] focus:border-blue focus:outline-none"
            />
            <Button type="submit" className="whitespace-nowrap">
              Subscribe
            </Button>
          </form>
          <p className="mt-3 text-[.76rem] text-gray-400">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Quick Links */}
      <div className="bg-blue-dark px-6 py-10 text-white">
        <div className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {[
            ["/health-tools#bmi", "⚖️", "BMI Calculator"],
            ["/ask-doctor", "💬", "Ask a Doctor"],
            ["/book-consultation", "📅", "Book Appointment"],
            ["/health-tools#pregnancy", "🤰", "Pregnancy Calculator"],
            ["/health-tools#diabetes", "🩸", "Diabetes Risk"],
            ["/blog", "📰", "Medical Blog"],
            ["/contact", "📞", "Contact Us"],
          ].map(([href, icon, label]) => (
            <Link
              key={label as string}
              href={href as string}
              className="cursor-pointer rounded-[10px] border border-white/12 bg-white/8 p-4 text-center transition hover:-translate-y-0.5 hover:bg-white/16"
            >
              <div className="mb-1.5 text-2xl">{icon}</div>
              <span className="text-[.8rem] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
