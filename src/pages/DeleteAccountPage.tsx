import { LegalLayout, GoldDivider } from '../components/layout/LegalLayout';
import { motion } from 'framer-motion';

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: number * 0.1 }}
      className="flex gap-4 md:gap-6"
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
          <span className="font-cinzel text-gold text-lg md:text-xl">{number}</span>
        </div>
      </div>
      <div className="flex-1 pt-1">
        <h3 className="font-cinzel text-lg md:text-xl text-gold mb-2">{title}</h3>
        <div className="font-garamond text-text-primary leading-relaxed">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 bg-surface/50 rounded-xl border border-white/10 hover:border-gold/30 transition-colors">
      <div className="text-2xl mb-3">{icon}</div>
      <h4 className="font-cinzel text-gold mb-2">{title}</h4>
      <p className="font-garamond text-text-secondary text-sm leading-relaxed">
        {children}
      </p>
    </div>
  );
}

export function DeleteAccountPage() {
  const supportEmail = "support@codextarot.app";

  return (
    <LegalLayout 
      title="Delete Your Account" 
      subtitle="We're sorry to see you go"
    >
      {/* Introduction */}
      <div className="text-center mb-10">
        <p className="font-garamond text-lg text-text-primary leading-relaxed">
          We understand that you may wish to delete your Codex Tarot account and all 
          associated data. This page explains how to request account deletion and what 
          happens to your information.
        </p>
      </div>

      <GoldDivider />

      {/* Steps to Delete */}
      <section className="mb-12">
        <h2 className="font-cinzel text-2xl text-gold mb-8 text-center">
          How to Delete Your Account
        </h2>
        
        <div className="space-y-8">
          <Step number={1} title="Open the App">
            <p>
              Launch Codex Tarot on your device and ensure you're logged into the 
              account you wish to delete.
            </p>
          </Step>

          <Step number={2} title="Go to Settings">
            <p>
              Tap the menu icon and navigate to <span className="text-gold">Settings</span> → 
              <span className="text-gold"> Account</span>.
            </p>
          </Step>

          <Step number={3} title="Select Delete Account">
            <p>
              Scroll to the bottom and tap <span className="text-gold">"Delete Account"</span>. 
              You'll be asked to confirm this action.
            </p>
          </Step>

          <Step number={4} title="Confirm Deletion">
            <p>
              Follow the confirmation prompts. You may need to re-enter your password 
              for security verification.
            </p>
          </Step>
        </div>
      </section>

      <GoldDivider />

      {/* Alternative Method */}
      <section className="mb-12">
        <h2 className="font-cinzel text-2xl text-gold mb-6 text-center">
          Request Deletion via Email
        </h2>
        <p className="font-garamond text-text-primary text-center mb-6 leading-relaxed">
          If you cannot access the app or prefer to request deletion directly, you can 
          email us. Please include the email address associated with your account.
        </p>
        
        <div className="p-8 bg-gradient-to-br from-surface/80 to-surface/40 rounded-2xl border border-gold/30 text-center">
          <p className="font-cinzel text-gold text-lg mb-3">Email your deletion request to:</p>
          <a 
            href={`mailto:${supportEmail}?subject=Account%20Deletion%20Request&body=I%20would%20like%20to%20request%20the%20deletion%20of%20my%20Codex%20Tarot%20account.%0A%0AAccount%20email%3A%20%5BYour%20email%20here%5D%0A%0AThank%20you.`}
            className="inline-block px-8 py-4 bg-gold/20 hover:bg-gold/30 border border-gold/50 hover:border-gold rounded-xl transition-all duration-300 group"
          >
            <span className="font-cinzel text-gold-bright group-hover:text-gold text-xl">
              {supportEmail}
            </span>
          </a>
          <p className="font-garamond text-text-secondary text-sm mt-4">
            We will process your request within 48 hours
          </p>
        </div>
      </section>

      <GoldDivider />

      {/* What Gets Deleted */}
      <section className="mb-12">
        <h2 className="font-cinzel text-2xl text-gold mb-6 text-center">
          What Happens to Your Data
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard icon="🗑️" title="Permanently Deleted">
            Your account credentials, reading history, saved spreads, journal entries, 
            and personal preferences will be permanently removed from our servers.
          </InfoCard>
          
          <InfoCard icon="⏱️" title="Processing Time">
            Account deletion is completed within 30 days. Some data may be retained 
            briefly in encrypted backups before full removal.
          </InfoCard>
          
          <InfoCard icon="🔄" title="Subscriptions">
            Active subscriptions will be cancelled. You may need to also cancel through 
            the App Store or Google Play to stop future charges.
          </InfoCard>
          
          <InfoCard icon="📊" title="Anonymous Data">
            Aggregated, anonymized analytics that cannot identify you may be retained 
            for service improvement purposes.
          </InfoCard>
        </div>
      </section>

      <GoldDivider />

      {/* Important Notes */}
      <section className="mb-12">
        <h2 className="font-cinzel text-2xl text-gold mb-6 text-center">
          Important Information
        </h2>
        
        <div className="space-y-4 font-garamond text-text-primary">
          <div className="flex items-start gap-3 p-4 bg-surface/30 rounded-xl border border-white/5">
            <span className="text-gold text-lg">⚠️</span>
            <p>
              <strong className="text-gold">Irreversible Action:</strong> Account deletion 
              is permanent and cannot be undone. All your readings, journal entries, and 
              saved data will be lost forever.
            </p>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-surface/30 rounded-xl border border-white/5">
            <span className="text-gold text-lg">💾</span>
            <p>
              <strong className="text-gold">Export Your Data First:</strong> Before deleting, 
              you can export your reading history and journal entries from the app settings 
              if you wish to keep a personal copy.
            </p>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-surface/30 rounded-xl border border-white/5">
            <span className="text-gold text-lg">🔐</span>
            <p>
              <strong className="text-gold">Subscription Cancellation:</strong> Deleting your 
              account does not automatically cancel App Store or Google Play subscriptions. 
              Please manage these separately through your device's subscription settings.
            </p>
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* Contact Section */}
      <section className="text-center">
        <h2 className="font-cinzel text-2xl text-gold mb-4">
          Need Help?
        </h2>
        <p className="font-garamond text-text-secondary mb-6 leading-relaxed">
          If you have questions about account deletion or need assistance, our support 
          team is here to help.
        </p>
        <a 
          href={`mailto:${supportEmail}`}
          className="inline-flex items-center gap-2 font-garamond text-gold hover:text-gold-bright transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {supportEmail}
        </a>
      </section>
    </LegalLayout>
  );
}

