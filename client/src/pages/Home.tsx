import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { FileSpreadsheet, FileText, Search, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* 始终显示已登录状态的UI */}
            <>
              <span className="text-sm text-gray-600">Welcome, {user?.name || "测试用户"}</span>
              <Link href="/prices">
                <Button variant="outline">Price Management</Button>
              </Link>
              <Link href="/quotations">
                <Button variant="default">My Quotations</Button>
              </Link>
            </>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Streamline Your International Sales Quotations
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Intelligent product search, automated price calculations, and professional quotation exports in Excel and PDF formats.
          </p>
          <Link href="/quotations/new">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Create New Quotation
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Smart Product Search</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Fuzzy matching technology finds products even with abbreviations or incomplete names.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Automated Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatic price calculations with customizable markup, exchange rates, and tax rates.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Excel Export</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate professional Excel quotations with detailed product information and pricing.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>PDF Export</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create polished PDF quotations ready to send to your international clients.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg mb-8 opacity-90">
              Sign in now and create your first quotation in minutes.
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Sign In to Continue
              </Button>
            </a>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

