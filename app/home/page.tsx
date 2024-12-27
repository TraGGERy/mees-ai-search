"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, MessageCircle, Star, Menu, X, Sparkles } from 'lucide-react'
import { Chat } from '@/components/customer'
import { IconBrain } from '@tabler/icons-react'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-[#0B0B1E] to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <div className="flex items-center justify-between w-full">
            <Link className="flex items-center space-x-2" href="/">
              <IconBrain className="h-8 w-8 text-purple-600" />
              <span className="font-bold text-xl bg-gradient-to-r from-white to-purple-500 bg-clip-text text-transparent">Mees AI</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link className="text-white/70 hover:text-white transition-colors" href="#services">Services</Link>
              <Link className="text-white/70 hover:text-white transition-colors" href="#pricing">Pricing</Link>
              <Link className="text-white/70 hover:text-white transition-colors" href="#reviews">Reviews</Link>
              <Link className="text-white/70 hover:text-white transition-colors" href="#contact">Contact</Link>
            </nav>
            <Button
              className="md:hidden"
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <Button className="hidden md:inline-flex bg-purple-600 hover:bg-purple-700">
              Get Started
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur-lg"
          >
            <nav className="flex flex-col space-y-4 p-4">
              <Link className="text-white/70 hover:text-white transition-colors" href="#services">Services</Link>
              <Link className="text-white/70 hover:text-white transition-colors" href="#pricing">Pricing</Link>
              <Link className="text-white/70 hover:text-white transition-colors" href="#reviews">Reviews</Link>
              <Link className="text-white/70 hover:text-white transition-colors" href="#contact">Contact</Link>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <a href="/">Get Started</a>
              </Button>
            </nav>
          </motion.div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 lg:py-48">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_70%)]"
          />
          <div className="container relative">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={stagger}
              className="flex flex-col items-center text-center space-y-8"
            >
              <motion.div variants={fadeIn} className="space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-purple-400 to-blue-500 bg-clip-text text-transparent">
                  Next Generation AI Search Engine
                </h1>
                <p className="mx-auto max-w-[700px] text-white/70 text-lg md:text-xl">
                  Powered by ChatGPT, Google Gemini, and Anthropic Claude.
                  Experience the future of AI-powered productivity.
                </p>
              </motion.div>
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" className="border-purple-600 text-purple-400 hover:bg-purple-600/10">
                  Watch Demo
                </Button>
              </motion.div>
              <motion.div 
                variants={fadeIn}
                className="relative w-full max-w-5xl mt-12"
              >
                <div className="relative z-10">
                  <Image
                    src="/home/desktop-preview.png"
                    alt="AI Dashboard Preview"
                    width={1920}
                    height={1080}
                    className="rounded-xl border border-white/10 shadow-2xl w-full h-auto"
                  />
                  <div className="absolute -right-[5%] sm:-right-[10%] bottom-0 w-[30%] sm:w-[25%] translate-y-[20%]">
                    <Image
                      src="/home/mobile-preview.JPG"
                      alt="Mobile App Preview"
                      width={280}
                      height={560}
                      className="rounded-2xl border border-white/10 shadow-2xl w-full h-auto"
                    />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-3xl -z-10" />
              </motion.div>
            </motion.div>
          </div>
        </section>


        {/* Features Section */}
        <section id="services" className="py-20 md:py-32">
          <div className="container">
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-16"
            >
              <motion.div variants={fadeIn} className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">
                  Supercharge Your Workflow
                </h2>
                <p className="text-white/70 max-w-2xl mx-auto">
                  Experience the power of multiple AI models working together to enhance your productivity.
                </p>
              </motion.div>

              <motion.div 
                variants={stagger}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {[
                  {
                    title: "Smart Insights Powered by Top AI Models",
                    description: "Mees AI blends ChatGPT, Anthropic, and Gemini for accurate, tailored results.",
                    icon: "🤖",
                    gradient: "from-purple-500 to-blue-500"
                  },
                  {
                    title: "Boost Your Productivity",
                    description: "Streamline tasks with Mees AI’s multi-model efficiency.",
                    icon: "🧠",
                    gradient: "from-blue-500 to-cyan-500"
                  },
                  {
                    title: "Personalized & Secure",
                    description: "Mees AI adapts to you while safeguarding your privacy.",
                    icon: "👥",
                    gradient: "from-cyan-500 to-purple-500"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={fadeIn}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card className="relative bg-black/50 border-white/10 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                      <CardHeader>
                        <div className="text-3xl mb-2">{feature.icon}</div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/70">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
         {/* Pricing Section */}
         <section id="pricing" className="py-20 md:py-32 bg-black">
  <div className="container">
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={stagger}
      className="space-y-16"
    >
      <motion.div variants={fadeIn} className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold text-white">Simple, Transparent Pricing</h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Choose the perfect plan for your needs. No hidden fees.
        </p>
      </motion.div>

      <motion.div 
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
      >
        {[
          {
            title: "Free",
            price: "0",
            description: "Great for exploring Mees AI",
            features: [
              "Access to basic AI models",
              "Two AI models",
              "Community support",
              "Five free requests daily"
            ],
            cta: "Start for Free",
            popular: false
          },
          {
            title: "Pro",
            price: "9.5",
            description: "Perfect for individuals and small teams",
            features: [
              "Access to advanced AI models",
              "Unlimited requests",
              "Priority support",
              "Custom integrations",
              "Detailed analytics"
            ],
            cta: "Upgrade to Pro",
            popular: true
          },
          {
            title: "Yearly",
            price: "110",
            description: "Best value for power users",
            features: [
              "Everything in Pro",
              "Exclusive custom AI models",
              "Dedicated support",
              "Service-level agreement (SLA)",
              "Early access to new features"
            ],
            cta: "Upgrade to Yearly",
            popular: false
          }
        ].map((plan, index) => (
          <motion.div
            key={index}
            variants={fadeIn}
            className="relative group"
          >
            <Card className={cn(
              "relative overflow-hidden bg-black border-2",
              plan.popular ? "border-purple-500" : "border-white/20"
            )}>
              {plan.popular && (
                <div className="absolute -top-5 -right-5">
                  <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg transform rotate-45 translate-x-4 translate-y-4">
                    POPULAR
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">{plan.title}</CardTitle>
                <CardDescription className="text-white/60">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-white">
                  ${plan.price}
                  <span className="text-lg font-normal text-white/70">/mo</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-purple-500" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <a href='/pricing'>
                  <Button className={cn(
                    "w-full text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300",
                    plan.popular
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-white/10 hover:bg-white/20"
                  )}>
                    {plan.cta}
                  </Button> 
                </a>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </div>
</section>


        {/* Testimonials Section */}
        <section id="reviews" className="py-20 md:py-32">
          <div className="container">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-16"
            >
              <motion.div variants={fadeIn} className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">Loved by Users</h2>
                <p className="text-white/70 max-w-2xl mx-auto">
                  See what our users have to say about their experience with Mees AI.
                </p>
              </motion.div>

              <motion.div 
                variants={stagger}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {[
                  {
                    name: "Sarah L.",
                    role: "Product Manager",
                    content: "Mees AI has transformed how I work. The multi-model approach is genius!",
                    image: "/home/face1.png"
                  },
                  {
                    name: "John D.",
                    role: "Software Engineer",
                    content: "The AI models are incredibly powerful. I am more productive than ever!",
                    image: "/home/face2.png"
                  },
                  {
                    name: "Emily R.",
                    role: "Content Creator",
                    content: "Customer support is top-notch. They are always there when I need help.",
                    image: "/home/face3.png"
                  }
                ].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    variants={fadeIn}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="bg-black/50 border-white/10">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                          <div>
                            <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                            <CardDescription className="text-white/50">{testimonial.role}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/70">{testimonial.content}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-r from-purple-600 to-blue-600">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="container text-center space-y-8"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-5xl font-bold"
            >
              Ready to Transform Your Workflow?
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-white/90 max-w-2xl mx-auto text-lg"
            >
              Join thousands of professionals using Mees AI to achieve more every day.
            </motion.p>
            <motion.div variants={fadeIn}>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                Get Started Free
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-black/50 border-t border-white/10 py-12">
        <div className="container">
          
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <IconBrain className="h-6 w-6 text-purple-600" />
              <span className="font-bold">Mees AI</span>
            </div>
            <p className="text-white/50 text-sm">
              © 2024 Mees AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      <Chat />
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

