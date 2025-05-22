// src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Star,
  BarChart3,
  Smartphone,
  Gift,
  ChevronRight,
  Check,
  MessageSquare,
  Repeat,
  LineChart
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">ReviewReturn</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900">Benefits</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Collect data, get reviews, and bring customers back
                </h1>
                <p className="text-lg md:text-xl opacity-90">
                  ReviewReturn helps businesses collect valuable customer feedback, generate more Google reviews, and increase customer retention with targeted promotions.
                </p>
                <div className="pt-4">
                  <Link href="/register">
                    <Button variant="primary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                      Get started for free
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                {/* Placeholder for hero image or mockup */}
                <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                  <div className="text-gray-400 text-center p-8">
                    <Smartphone className="h-16 w-16 mx-auto mb-4" />
                    <span className="text-lg">Customer survey mockup</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Everything you need in one platform</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                ReviewReturn helps you improve your business with customer feedback, reviews, and retention tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Customizable Surveys
                </h3>
                <p className="text-gray-600">
                  Create tailored surveys to collect the exact feedback you need from your customers. Customize questions, rating scales, and appearance.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <Star className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Google Review Generation
                </h3>
                <p className="text-gray-600">
                  Automatically prompt satisfied customers to leave Google reviews, helping you build your online reputation and visibility.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <Gift className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Promotion Management
                </h3>
                <p className="text-gray-600">
                  Create and distribute promotional offers to incentivize customers to return, increasing retention and repeat business.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Actionable Analytics
                </h3>
                <p className="text-gray-600">
                  Gain valuable insights from customer feedback with detailed analytics and reporting tools to improve your business.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <Smartphone className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  QR Code Integration
                </h3>
                <p className="text-gray-600">
                  Generate scannable QR codes for each campaign, making it effortless for customers to provide feedback and reviews.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <Repeat className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Customer Retention
                </h3>
                <p className="text-gray-600">
                  Turn one-time visitors into loyal customers with targeted promotions and exceptional customer service based on feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Benefits for your business</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                See how ReviewReturn can transform customer feedback into business growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-indigo-50 p-8 rounded-lg border border-indigo-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Increase your Google Reviews</h3>
                <ul className="space-y-4">
                  {[
                    'Automatically prompt satisfied customers for reviews',
                    'Filter out negative experiences before they become public',
                    'Improve your Google search ranking with more reviews',
                    'Build trust with potential customers through social proof',
                    'Monitor review conversion rates with detailed analytics'
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-6 w-6 text-green-500 flex-shrink-0 mr-2" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-indigo-50 p-8 rounded-lg border border-indigo-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Improve Customer Retention</h3>
                <ul className="space-y-4">
                  {[
                    'Create targeted promotions to encourage repeat visits',
                    'Collect valuable data on customer preferences',
                    'Address concerns before customers leave for competitors',
                    'Track promotion redemption and effectiveness',
                    'Build a database of engaged customers for future marketing'
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-6 w-6 text-green-500 flex-shrink-0 mr-2" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-16 text-center">
              <div className="bg-white p-8 rounded-lg shadow-sm border max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                  <LineChart className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Our customers see real results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div>
                    <div className="text-4xl font-bold text-indigo-600">+127%</div>
                    <p className="text-gray-600 mt-2">Increase in Google reviews</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-indigo-600">+43%</div>
                    <p className="text-gray-600 mt-2">Improvement in customer retention</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-indigo-600">+61%</div>
                    <p className="text-gray-600 mt-2">Growth in repeat business</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the plan that works for your business needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900">Starter</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">$29</span>
                  <span className="ml-1 text-gray-500">/month</span>
                </div>
                <p className="mt-4 text-gray-500">Perfect for small businesses just getting started.</p>
                <ul className="mt-6 space-y-3">
                  {[
                    '1 Campaign',
                    'Up to 100 responses/month',
                    'Basic survey templates',
                    'Email support'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/register">
                    <Button variant="outline" className="w-full">Get Started</Button>
                  </Link>
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border border-indigo-200 transform scale-105">
                <div className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-2">
                  MOST POPULAR
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Professional</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">$79</span>
                  <span className="ml-1 text-gray-500">/month</span>
                </div>
                <p className="mt-4 text-gray-500">Ideal for growing businesses with multiple locations.</p>
                <ul className="mt-6 space-y-3">
                  {[
                    '5 Campaigns',
                    'Up to 500 responses/month',
                    'Advanced survey customization',
                    'Custom promotions',
                    'Priority email support',
                    'Data export'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/register">
                    <Button variant="primary" className="w-full">Get Started</Button>
                  </Link>
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900">Enterprise</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">$199</span>
                  <span className="ml-1 text-gray-500">/month</span>
                </div>
                <p className="mt-4 text-gray-500">For large businesses with advanced needs.</p>
                <ul className="mt-6 space-y-3">
                  {[
                    'Unlimited Campaigns',
                    'Unlimited responses',
                    'White-label surveys',
                    'Advanced analytics',
                    'API access',
                    '24/7 priority support',
                    'Custom integrations'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/register">
                    <Button variant="outline" className="w-full">Contact Sales</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-indigo-600 text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to grow your business?</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Start collecting valuable feedback, generating more reviews, and bringing customers back today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                  Create your account
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-indigo-700">
                  Learn more
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ReviewReturn</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Testimonials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Guides</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Webinars</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ReviewReturn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}