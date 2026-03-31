export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: March 31, 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            Nishma Wellness (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our wellness platform, including our website, mobile applications, and related services (collectively, the &quot;Platform&quot;).
          </p>
          <p className="text-gray-600 leading-relaxed mt-2">
            We comply with applicable data protection laws including HIPAA (Health Insurance Portability and Accountability Act), GDPR (General Data Protection Regulation), and CCPA (California Consumer Privacy Act).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. Information We Collect</h2>
          <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Personal Information</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>Name, email address, phone number</li>
            <li>Date of birth and demographic information</li>
            <li>Emergency contact information</li>
            <li>Payment and billing information</li>
          </ul>
          <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Health Information</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>Wellness assessment responses (PHQ-9, GAD-7)</li>
            <li>Journal entries and mood tracking data</li>
            <li>Therapy session notes (accessible only to your therapist)</li>
            <li>AI chat conversations</li>
            <li>Program enrollment and progress data</li>
          </ul>
          <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Technical Information</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>Device information and browser type</li>
            <li>IP address and approximate location</li>
            <li>Usage patterns and feature engagement</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>Provide and personalize our wellness services</li>
            <li>Match you with appropriate therapists based on your needs</li>
            <li>Power our AI TwinClone wellness assistant</li>
            <li>Track your wellness progress and generate insights</li>
            <li>Send appointment reminders and notifications</li>
            <li>Process payments and manage subscriptions</li>
            <li>Improve our platform and develop new features</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Data Protection & Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We implement industry-standard security measures including:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
            <li>End-to-end encryption for therapy sessions and messages</li>
            <li>AES-256 encryption for data at rest</li>
            <li>TLS 1.3 for data in transit</li>
            <li>Regular security audits and penetration testing</li>
            <li>Access controls and role-based permissions</li>
            <li>HIPAA-compliant infrastructure</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. Corporate/Organization Data</h2>
          <p className="text-gray-600 leading-relaxed">
            For users enrolled through corporate wellness programs:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
            <li>Your employer <strong>never</strong> has access to individual therapy data, journal entries, chat history, or session notes</li>
            <li>Only anonymized, aggregate wellness metrics are shared with your organization</li>
            <li>Department-level analytics are anonymized and only shown when group size exceeds 5 members</li>
            <li>Your participation status is confidential</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. AI & Automated Processing</h2>
          <p className="text-gray-600 leading-relaxed">
            Our AI TwinClone feature processes your conversation data to provide personalized wellness support. AI-generated insights are used to help therapists prepare for sessions. You can request deletion of AI-processed data at any time. AI responses are not medical diagnoses and should not replace professional therapy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7. Your Rights</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate data</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Portability:</strong> Export your data in a standard format</li>
            <li><strong>Opt-out:</strong> Disable AI processing or marketing communications</li>
            <li><strong>Restrict:</strong> Limit how we process your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8. Data Retention</h2>
          <p className="text-gray-600 leading-relaxed">
            We retain your data for as long as your account is active. Therapy session notes are retained for 7 years as required by healthcare regulations. Upon account deletion, personal data is removed within 30 days, though anonymized aggregate data may be retained.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            For privacy-related inquiries, contact our Data Protection Officer at:
          </p>
          <p className="text-gray-600 mt-2">
            Email: privacy@nishmawellness.com<br />
            Address: Nishma Wellness, San Francisco, CA<br />
            Phone: +1 (555) 123-4567
          </p>
        </section>
      </div>
    </div>
  );
}
