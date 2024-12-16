"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, MessageCircle, Star, Menu, X } from 'lucide-react'
import { Chat } from '@/components/customer'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const monthyFee = process.env.NEXT_MONTHLY_PRICE
  const yearlyFEE = process.env.NEXT_YEARLY_PRICE
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center justify-between w-full">
            <Link className="flex items-center space-x-2" href="/">
              <span className="font-bold">Mees AI</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#services">Services</Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#pricing">Pricing</Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#reviews">Reviews</Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#contact">Contact Us</Link>
            </nav>
            <Button
              className="md:hidden"
              size="sm"
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
            </Button>
            <Button className="hidden md:inline-flex" size="sm">
              <Link href="/">Get Started</Link>
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden">
            <nav className="flex flex-col space-y-4 p-4 bg-background border-t">
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#reviews" onClick={() => setMobileMenuOpen(false)}>Reviews</Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
              <Button size="sm" className="w-full">
                <Link href="/">Get Started</Link>
              </Button>
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1">
        <section id="hero" className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <Image
            src="/hero-background.jpg"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                  Meet Mees AI – Smarter Search
                </h1>
                <p className="mx-auto max-w-[700px] text-white md:text-xl">
                  Powered by ChatGPT, Google Gemini, and Anthropic Claude.
                  Search smarter. Work faster. Achieve more
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-white text-purple-600 hover:bg-gray-100">
                  <Link href="/">Get Started</Link>
                </Button>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section id="services" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Why Choose Mees AI?</h2>
            <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced AI Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Access to Anthropic Claude, Haku, Google Gemini, and more.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>User-Friendly Interface</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Fast and intuitive platform for seamless interaction.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Affordable Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Transparent and flexible plans for every need.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Real-Time Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>24/7 customer support to assist you anytime.</p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-12 text-center">
              <Link href="/pricing" className="text-purple-600 hover:underline">
                Learn More <ArrowRight className="inline-block ml-1" size={16} />
              </Link>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Flexible Plans for Every Need</h2>
            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Free Plan</CardTitle>
                  <CardDescription>For individuals just getting started</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">$0</p>
                  <p className="text-sm text-gray-500">per month</p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center"><Check size={16} className="mr-2 text-green-500" /> Limited features</li>
                    <li className="flex items-center"><Check size={16} className="mr-2 text-green-500" /> Access to basic AI models</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Link href="/pricing">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Pro Monthly</CardTitle>
                  <CardDescription>For professionals and small teams</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">$9.5</p>
                  <p className="text-sm text-gray-500">per month</p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center"><Check size={16} className="mr-2 text-green-500" /> Access to premium AI models</li>
                    <li className="flex items-center"><Check size={16} className="mr-2 text-green-500" /> Enhanced features</li>
                    <li className="flex items-center"><Check size={16} className="mr-2 text-green-500" /> Priority support</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Link href="/pricing">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="border-purple-500">
                <CardHeader>
                  <Badge className="absolute top-4 right-4" variant="secondary">Best Value</Badge>
                  <CardTitle>Pro Yearly</CardTitle>
                  <CardDescription>For businesses and power users</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">$110</p>
                  <p className="text-sm text-gray-500">per year</p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center"><Check size={16} className="mr-2 text-green-500" /> Full access to all features</li>
                    <li className="flex items-center"><Check size={16} className="mr-2 text-green-500" /> Unlimited use of all AI models</li>
                    <li className="flex items-center"><Check size={16} className="mr-2 text-green-500" /> 24/7 premium support</li>
                    <li className="flex items-center"><Check size={16} className="mr-2 text-green-500" /> Custom integrations</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Link href="/pricing">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        <section id="reviews" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">What Our Users Are Saying</h2>
            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <Image
                      src="/placeholder.svg"
                      alt="Sarah L."
                      className="rounded-full"
                      width={40}
                      height={40}
                    />
                    <div className="ml-4">
                      <CardTitle>Sarah L.</CardTitle>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>Mees AI has transformed how I work—an absolute game-changer!</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <Image
                      src="/placeholder.svg"
                      alt="John D."
                      className="rounded-full"
                      width={40}
                      height={40}
                    />
                    <div className="ml-4">
                      <CardTitle>John D.</CardTitle>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>The AI models are incredibly powerful. I am more productive than ever!</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <Image
                      src="/placeholder.svg"
                      alt="Emily R."
                      className="rounded-full"
                      width={40}
                      height={40}
                    />
                    <div className="ml-4">
                      <CardTitle>Emily R.</CardTitle>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>Customer support is top-notch. They are always there when I need help.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-purple-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Start Your Journey with Mees AI</h2>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                Join thousands of professionals and businesses using Mees AI to achieve more every day.
              </p>
              <Button className="bg-white text-purple-600 hover:bg-gray-100" size="lg">
                <Link href="/">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 bg-gray-800 text-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
           
        
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">© 2024 Mees AI. All rights reserved.</p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-4">
              <Link href="/privacy-policy" className="text-sm hover:underline">Privacy Policy</Link>
              <Link href="/terms-of-service" className="text-sm hover:underline">Terms of Service</Link>
              <Link href="" className="text-sm hover:underline">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
      <Chat />
    </div>
  )
}

