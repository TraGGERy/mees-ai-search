"use client"

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

const faqs = [
  {
    question: "What are the key differences between Mees AI Pro and the Free Tier?",
    answer: "Mees AI Pro offers access to advanced AI models, including Anthropic Claude, Haku, Google Gemini, and Sonnet, along with unlimited queries, custom API integrations, and faster response times. The Free Tier provides access to GPT-4o mini with limited daily queries and basic functionality but does not include premium AI models."
  },
  {
    question: "Can Free Tier users access Anthropic Claude or Google Gemini models?",
    answer: "No, models like Anthropic Claude, Haku, Google Gemini, and Sonnet are only available to Mees AI Pro users. Free Tier users are limited to GPT-4o mini."
  },
  {
    question: "What is the daily query limit for Free Tier users compared to Pro users?",
    answer: "Free Tier users are limited to 10 queries per day. Pro Tier allows unlimited queries across all supported AI models."
  },
  {
    question: "Is the response time faster for Mees AI Pro users?",
    answer: "Yes, Pro users enjoy priority access and faster response times across all models, including Google Gemini and Anthropic Claude."
  },
  {
    question: "Are advanced models like Haku or Sonnet available for specialized tasks?",
    answer: "Yes, Mees AI Pro provides full access to Haku for creative tasks and Sonnet for high-precision research, whereas the Free Tier does not support these models."
  },
  {
    question: "What are the benefits of using Google Gemini with Mees AI Pro?",
    answer: "Google Gemini in Pro enables cutting-edge search, multimodal capabilities, and seamless integration with web data for advanced problem-solving and research."
  },
  {
    question: "Do Free Tier users get access to multi-model workflows?",
    answer: "No, multi-model workflows (e.g., combining Gemini's web capabilities with Claude's summarization) are a feature exclusive to Mees AI Pro."
  },
  {
    question: "What file upload limits apply to Free Tier and Pro users?",
    answer: "Free Tier users can upload files up to 5 MB and process them using GPT-4o mini. Pro Tier supports file uploads up to 50 MB, with advanced processing across supported models like Haku and Claude."
  },
  {
    question: "Can Free Tier users access features for creative content generation?",
    answer: "No, creative AI features like story generation, custom poetry (via Sonnet), and articulated long-form articles (via Haku) are exclusive to Mees AI Pro."
  },
  {
    question: "Is Mees AI Pro subscription worth it for multi-model support?",
    answer: "Absolutely. Pro users gain full access to multiple premium models (Gemini, Haku, Sonnet, and Claude), unlocking advanced capabilities and ensuring comprehensive solutions for diverse tasks. Free Tier users miss out on these premium features."
  }
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-purple-200">
      <button
        className="flex justify-between items-center w-full py-5 px-3 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-white-900">{question}</span>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-purple-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-purple-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-3 pb-5">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
};

const HelpFAQPage = () => {
  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-white-800 mb-8">Help & FAQ</h1>
        <div className="bg-black shadow-lg rounded-lg overflow-hidden border border-purple-100">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpFAQPage;

