import { LegalLayout, GoldDivider } from '../components/layout/LegalLayout';

// Section component for consistent styling
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-cinzel text-xl md:text-2xl text-gold mb-4">{title}</h2>
      <div className="font-garamond text-text-primary leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-gold mt-1.5 text-xs">✦</span>
      <span>{children}</span>
    </li>
  );
}

export function PrivacyPage() {
  const lastUpdated = "January 7, 2026";
  const contactEmail = "privacy@codextarot.app";

  return (
    <LegalLayout 
      title="Privacy Policy" 
      subtitle="Your trust guides our path"
    >
      {/* Last Updated */}
      <p className="text-text-secondary text-sm font-garamond mb-8 text-center">
        Last Updated: {lastUpdated}
      </p>

      {/* Introduction */}
      <Section title="Introduction">
        <p>
          Welcome to Codex Tarot. We believe that your personal journey with the cards 
          should remain sacred and private. This Privacy Policy explains how we collect, 
          use, and protect your information when you use our mobile application.
        </p>
        <p>
          By using Codex Tarot, you agree to the collection and use of information in 
          accordance with this policy. We are committed to being transparent about our 
          data practices and giving you control over your personal information.
        </p>
      </Section>

      <GoldDivider />

      {/* Information We Collect */}
      <Section title="Information We Collect">
        <p className="mb-4">
          We collect minimal information necessary to provide you with the best tarot 
          reading experience:
        </p>
        
        <h3 className="font-cinzel text-lg text-gold/80 mt-6 mb-3">Information You Provide</h3>
        <ul className="space-y-2">
          <ListItem>
            <strong>Account Information:</strong> If you create an account, we collect your 
            email address and any profile information you choose to provide.
          </ListItem>
          <ListItem>
            <strong>Reading History:</strong> Your tarot readings and journal entries, 
            stored securely to help you track your spiritual journey.
          </ListItem>
          <ListItem>
            <strong>Preferences:</strong> Your app settings, deck preferences, and 
            customization choices.
          </ListItem>
        </ul>

        <h3 className="font-cinzel text-lg text-gold/80 mt-6 mb-3">Automatically Collected Information</h3>
        <ul className="space-y-2">
          <ListItem>
            <strong>Device Information:</strong> Basic device type and operating system 
            version for app compatibility and optimization.
          </ListItem>
          <ListItem>
            <strong>Analytics Data:</strong> Anonymous usage statistics to improve app 
            performance and features (you can opt out in settings).
          </ListItem>
          <ListItem>
            <strong>Crash Reports:</strong> Technical data when errors occur, helping us 
            fix bugs and improve stability.
          </ListItem>
        </ul>
      </Section>

      <GoldDivider />

      {/* How We Use Your Information */}
      <Section title="How We Use Your Information">
        <p className="mb-4">Your information is used solely to enhance your experience:</p>
        <ul className="space-y-2">
          <ListItem>Provide and maintain the Codex Tarot service</ListItem>
          <ListItem>Sync your readings and preferences across devices</ListItem>
          <ListItem>Send important service updates (with your consent)</ListItem>
          <ListItem>Improve app features based on anonymous usage patterns</ListItem>
          <ListItem>Respond to your support requests and inquiries</ListItem>
          <ListItem>Ensure the security and integrity of our service</ListItem>
        </ul>
        <p className="mt-4 text-gold/80 italic">
          We never sell your personal information to third parties.
        </p>
      </Section>

      <GoldDivider />

      {/* Third-Party Services */}
      <Section title="Third-Party Services">
        <p className="mb-4">
          We use trusted third-party services to help operate our app:
        </p>
        <ul className="space-y-2">
          <ListItem>
            <strong>Firebase (Google):</strong> For secure authentication, data storage, 
            and analytics. <a href="https://firebase.google.com/support/privacy" className="text-gold hover:text-gold-bright underline transition-colors" target="_blank" rel="noopener noreferrer">View Firebase Privacy Policy</a>
          </ListItem>
          <ListItem>
            <strong>RevenueCat:</strong> For subscription management. <a href="https://www.revenuecat.com/privacy" className="text-gold hover:text-gold-bright underline transition-colors" target="_blank" rel="noopener noreferrer">View RevenueCat Privacy Policy</a>
          </ListItem>
        </ul>
        <p className="mt-4">
          These services have their own privacy policies and data practices. We encourage 
          you to review them.
        </p>
      </Section>

      <GoldDivider />

      {/* Data Security */}
      <Section title="Data Security">
        <p>
          We implement industry-standard security measures to protect your information:
        </p>
        <ul className="space-y-2 mt-4">
          <ListItem>Encryption of data in transit and at rest</ListItem>
          <ListItem>Secure authentication protocols</ListItem>
          <ListItem>Regular security audits and updates</ListItem>
          <ListItem>Limited access to personal data by our team</ListItem>
        </ul>
        <p className="mt-4">
          While we strive to protect your information, no method of electronic storage 
          is 100% secure. We continuously work to improve our security practices.
        </p>
      </Section>

      <GoldDivider />

      {/* Data Retention */}
      <Section title="Data Retention">
        <p>
          We retain your personal information only as long as necessary to provide our 
          services and fulfill the purposes outlined in this policy:
        </p>
        <ul className="space-y-2 mt-4">
          <ListItem>
            <strong>Active Accounts:</strong> Data is retained while your account remains 
            active.
          </ListItem>
          <ListItem>
            <strong>Deleted Accounts:</strong> Personal data is deleted within 30 days of 
            account deletion request.
          </ListItem>
          <ListItem>
            <strong>Anonymous Analytics:</strong> Aggregated, anonymized data may be 
            retained indefinitely for service improvement.
          </ListItem>
        </ul>
      </Section>

      <GoldDivider />

      {/* Your Rights */}
      <Section title="Your Rights & Choices">
        <p className="mb-4">You have control over your personal information:</p>
        <ul className="space-y-2">
          <ListItem>
            <strong>Access:</strong> Request a copy of your personal data at any time.
          </ListItem>
          <ListItem>
            <strong>Correction:</strong> Update or correct your account information 
            within the app.
          </ListItem>
          <ListItem>
            <strong>Deletion:</strong> Request deletion of your account and associated 
            data. Visit our <a href="/delete-account" className="text-gold hover:text-gold-bright underline transition-colors">Account Deletion</a> page for instructions.
          </ListItem>
          <ListItem>
            <strong>Opt-Out:</strong> Disable analytics collection in app settings.
          </ListItem>
          <ListItem>
            <strong>Data Portability:</strong> Export your reading history and journal 
            entries.
          </ListItem>
        </ul>
      </Section>

      <GoldDivider />

      {/* Children's Privacy */}
      <Section title="Children's Privacy">
        <p>
          Codex Tarot is not intended for children under 13 years of age. We do not 
          knowingly collect personal information from children. If you believe we have 
          collected information from a child, please contact us immediately at{' '}
          <a href={`mailto:${contactEmail}`} className="text-gold hover:text-gold-bright underline transition-colors">
            {contactEmail}
          </a>.
        </p>
      </Section>

      <GoldDivider />

      {/* International Users */}
      <Section title="International Users">
        <p>
          If you are accessing Codex Tarot from outside the United States, please be 
          aware that your information may be transferred to, stored, and processed in 
          the United States or other countries where our servers are located. By using 
          our service, you consent to this transfer.
        </p>
      </Section>

      <GoldDivider />

      {/* Changes to This Policy */}
      <Section title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of 
          any significant changes by posting the new policy in the app and updating the 
          "Last Updated" date. We encourage you to review this policy periodically.
        </p>
      </Section>

      <GoldDivider />

      {/* Contact Us */}
      <Section title="Contact Us">
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy 
          or our data practices, please contact us:
        </p>
        <div className="mt-6 p-6 bg-surface/50 rounded-xl border border-gold/20 text-center">
          <p className="font-cinzel text-gold text-lg mb-2">Codex Tarot Privacy Team</p>
          <a 
            href={`mailto:${contactEmail}`}
            className="font-garamond text-gold-bright hover:text-gold text-lg transition-colors"
          >
            {contactEmail}
          </a>
        </div>
      </Section>
    </LegalLayout>
  );
}

