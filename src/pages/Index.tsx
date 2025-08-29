import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6 animate-float">
            Tribe Discovery
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Welcome to the modern tribe discovery platform. Join our community and find out which of our six unique tribes matches your personality and spirit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-card shadow-large border-border hover:shadow-glow transition-smooth group">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 group-hover:animate-pulse-glow">
                <span className="text-2xl">📝</span>
              </div>
              <CardTitle className="text-2xl text-foreground">Join Our Community</CardTitle>
              <CardDescription className="text-muted-foreground">
                Register with your details to become part of our growing community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/registration")}
                className="w-full text-lg font-semibold bg-gradient-primary hover:shadow-glow transition-smooth"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-large border-border hover:shadow-glow transition-smooth group">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 group-hover:animate-pulse-glow">
                <span className="text-2xl">✨</span>
              </div>
              <CardTitle className="text-2xl text-foreground">Discover Tribes</CardTitle>
              <CardDescription className="text-muted-foreground">
                Jump straight to discovering which tribe someone belongs to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/tribe")}
                variant="secondary"
                className="w-full text-lg font-semibold transition-smooth hover:shadow-medium"
              >
                Explore Tribes
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center opacity-75">
          <p className="text-sm text-muted-foreground italic">
            "Every person belongs to a tribe. Discover yours today."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
