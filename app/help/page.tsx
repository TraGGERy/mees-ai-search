import { LifeBuoy, Mail, MessageCircle, Phone } from 'lucide-react'

export default function Help() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <LifeBuoy className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help Center</h1>
        </div>

        <div className="space-y-8">
          {/* Quick Contact Options */}
          <section className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Live Chat</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Chat with our support team in real-time
              </p>
              <button className="text-blue-600 hover:underline text-sm">
                Start Chat
              </button>
            </div>

            <div className="p-4 border dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Email Support</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Get help via email
              </p>
              <a 
                href="mailto:support@mees-ai.co.zw" 
                className="text-blue-600 hover:underline text-sm"
              >
                support@mees-ai.co.zw
              </a>
            </div>

            <div className="p-4 border dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Phone Support</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Call us directly
              </p>
              <a 
                href="tel:+1234567890" 
                className="text-blue-600 hover:underline text-sm"
              >
                +123 456 7890
              </a>
            </div>
          </section>

          {/* FAQs */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">How do I get started?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Getting started with Mees AI is easy. Simply sign up for an account 
                  and follow our quick setup guide.
                </p>
              </div>

              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">What are the system requirements?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our platform works on any modern web browser. We recommend using 
                  the latest version of Chrome, Firefox, or Safari.
                </p>
              </div>

              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">How can I reset my password?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Click on the &ldquo;Forgot Password&rdquo; link on the login page and follow 
                  the instructions sent to your email.
                </p>
              </div>
            </div>
          </section>

          {/* Support Hours */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Support Hours</h2>
            <div className="border dark:border-gray-700 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-300">
                Monday - Friday: 9:00 AM - 6:00 PM (CAT)<br />
                Saturday: 10:00 AM - 2:00 PM (CAT)<br />
                Sunday: Closed
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 