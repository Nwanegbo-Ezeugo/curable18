import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, MessageSquare, Users, Activity, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Curable
            </h1>
          </div>
          <Link to="/auth">
            <Button variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              The Future of{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Healthcare
              </span>{' '}
              in Africa
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
              Where AI and doctors work together to make healthcare affordable, fast, and accessible 
              for students and young professionals across Africa.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 w-full sm:w-auto touch-target">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
            <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-4">
                <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg">AI Health Assistant</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm sm:text-base text-muted-foreground text-center leading-relaxed">
                  Get instant health insights by describing your symptoms. Our AI provides 
                  probability-based diagnosis with clear explanations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-4">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg">Doctor Verification</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm sm:text-base text-muted-foreground text-center leading-relaxed">
                  Have your AI assessment reviewed by qualified doctors for professional 
                  medical guidance you can trust.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg sm:col-span-2 lg:col-span-1">
              <CardHeader className="text-center pb-4">
                <Activity className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg">Health Tracking</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm sm:text-base text-muted-foreground text-center leading-relaxed">
                  Monitor daily health metrics and receive personalized insights to 
                  maintain optimal wellness over time.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mission Statement */}
          <Card className="border-border/50 bg-gradient-to-br from-card/80 to-secondary/40 backdrop-blur-sm">
            <CardHeader className="text-center px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">Our Mission</CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Building the healthcare community Africa deserves
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                We're creating an incredible platform where artificial intelligence works alongside 
                experienced doctors to provide fast, accurate, and affordable healthcare solutions. 
                Our goal is to make quality medical care accessible to every student and young 
                professional across Africa, breaking down barriers and building healthier communities.
              </p>
              <div className="mt-4 sm:mt-6">
                <Link to="/auth">
                  <Button className="w-full sm:w-auto touch-target">
                    Join Our Community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
