export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: March 31, 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using the Nishma Wellness platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. Our platform provides wellness support tools, therapy session scheduling, AI-assisted wellness chat, and educational programs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. Services Description</h2>
          <p className="text-gray-600 leading-relaxed">Nishma Wellness provides:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
            <li>Connection with licensed mental health therapists for video sessions</li>
            <li>AI-powered wellness support (TwinClone) for between-session guidance</li>
            <li>Structured wellness training programs (yoga, meditation, CBT, nutrition, fitness)</li>
            <li>Wellness tracking tools (mood, sleep, assessments, journaling)</li>
            <li>Group therapy sessions and workshops</li>
            <li>Family wellness coordination</li>
            <li>Corporate employee wellness programs</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. Medical Disclaimer</h2>
          <p className="text-gray-600 leading-relaxed font-medium">
            Nishma Wellness is not a substitute for emergency medical services. If you are experiencing a medical emergency, suicidal thoughts, or immediate danger, please call 911 or the 988 Suicide & Crisis Lifeline.
          </p>
          <p className="text-gray-600 leading-relaxed mt-2">
            Our AI TwinClone feature provides wellness support and is not a licensed therapist. AI-generated responses should not be considered medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. User Accounts</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>You must be at least 18 years old to create an account (minors require parental consent via Family plans)</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must provide accurate and current information</li>
            <li>One person per account; account sharing is prohibited</li>
            <li>You must notify us immediately of any unauthorized access</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. Therapist Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            Therapists on our platform are independent licensed professionals. They must maintain valid licensure, carry professional liability insurance, and comply with applicable state and federal regulations. Nishma Wellness verifies credentials but does not employ therapists directly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. Payment & Billing</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>Subscription fees are billed monthly or annually as selected</li>
            <li>Individual session fees are charged at the time of booking</li>
            <li>Cancellations must be made at least 24 hours before the scheduled session for a full refund</li>
            <li>Late cancellations (less than 24 hours) may incur a 50% charge</li>
            <li>No-shows are charged the full session fee</li>
            <li>Corporate plans are billed as per the organization agreement</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7. Cancellation & Refunds</h2>
          <p className="text-gray-600 leading-relaxed">
            You may cancel your subscription at any time. Upon cancellation, you retain access through the end of your current billing period. Refunds for unused sessions within a billing period are available within 30 days of purchase. Program enrollments are non-refundable after 20% of content has been accessed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8. Confidentiality</h2>
          <p className="text-gray-600 leading-relaxed">
            All therapy sessions, messages, and health information are treated as confidential. Exceptions apply as required by law, including mandatory reporting of child abuse, elder abuse, threats of harm to self or others, and court orders.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9. Prohibited Conduct</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>Using the platform for any unlawful purpose</li>
            <li>Harassing, threatening, or abusing other users or therapists</li>
            <li>Sharing login credentials or accessing another user&apos;s account</li>
            <li>Recording therapy sessions without explicit consent</li>
            <li>Attempting to reverse-engineer or exploit platform features</li>
            <li>Submitting false or misleading information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">10. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            Nishma Wellness shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform. Our total liability shall not exceed the amount you paid for services in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">11. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            For questions about these Terms, contact us at:<br />
            Email: legal@nishmawellness.com<br />
            Address: Nishma Wellness, San Francisco, CA
          </p>
        </section>
      </div>
    </div>
  );
}
