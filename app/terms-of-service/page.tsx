import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 top-4">
      <div className="mb-8">
        <Button variant="ghost" className="flex items-center" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <p className="mb-4"><strong>Effective Date:</strong> 04 August 2024</p>
      
      <p className="mb-6">
        Welcome to Mees AI! These Terms of Service Terms govern your access to and use of Mees AI the Service, 
        including our website, applications, and any related services. By accessing or using the Service, you agree to 
        be bound by these Terms. If you do not agree, do not use the Service.
      </p>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Using Mees AI</h2>
      
      <h3 className="text-xl font-semibold mt-4 mb-2">1.1 Eligibility</h3>
      <p className="mb-4">
        You must be at least 13 years old (or the legal age in your jurisdiction) to use the Service. If you are using 
        the Service on behalf of an organization, you agree to these Terms on behalf of that organization.
      </p>
      
      <h3 className="text-xl font-semibold mt-4 mb-2">1.2 Account Registration</h3>
      <p className="mb-4">
        You may be required to create an account to use certain features. You are responsible for maintaining the 
        confidentiality of your account credentials and for all activities under your account.
      </p>
      
      <h3 className="text-xl font-semibold mt-4 mb-2">1.3 Permitted Use</h3>
      <p className="mb-4">
        You agree to use the Service in compliance with applicable laws and these Terms. You may not:
      </p>
      <ul className="list-disc pl-8 mb-4">
        <li>Use the Service for unlawful purposes.</li>
        <li>Interfere with or disrupt the Service or its security features.</li>
        <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">2. Privacy and Data Protection</h2>
      
      <h3 className="text-xl font-semibold mt-4 mb-2">2.1 User Privacy</h3>
      <p className="mb-4">
        Mees AI values your privacy. We do not track your activity across the web or share your data with third parties 
        without your explicit consent. For more details, please refer to our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
      </p>
      
      <h3 className="text-xl font-semibold mt-4 mb-2">2.2 Data Use</h3>
      <p className="mb-4">
        Any data you provide while using the Service is processed solely to improve your experience and provide functionality. 
        Mees AI does not sell, rent, or disclose your data to advertisers or other external entities.
      </p>
      
      {/* Continue with the rest of the sections... */}
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
      <p className="mb-4">
        If you have any questions about these Terms, please contact us at <a href="mailto:support@mees-ai.co.zw" className="text-blue-600 hover:underline">support@meesai.com</a>.
      </p>
    </div>
  )
}

