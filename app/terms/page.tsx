import { FileText } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Mees AI services, you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Use License</h2>
            <p className="mb-4">
              Permission is granted to temporarily access and use our services for personal, 
              non-commercial purposes. This is the grant of a license, not a transfer of title.
            </p>
            <p className="mb-4">Under this license, you may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy our materials</li>
              <li>Use materials for commercial purposes</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the materials to another person</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information</li>
              <li>Maintain the security of your account</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not engage in any unauthorized activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Service Modifications</h2>
            <p className="mb-4">
              We reserve the right to modify or discontinue our service at any time without notice. 
              We shall not be liable to you or any third party for any modification, suspension, 
              or discontinuance of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Contact Information</h2>
            <p>
              Questions about the Terms of Service should be sent to us at:{' '}
              <a href="mailto:contact@mees-ai.app" className="text-blue-600 dark:text-blue-400 hover:underline">
                support@mees-ai.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}