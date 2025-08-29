import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-earth flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-12 animate-mystical-float">
          <div className="mx-auto w-20 h-20 bg-gradient-mystical rounded-full flex items-center justify-center mb-6 animate-tribal-pulse">
            <span className="text-3xl">🔮</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-mystical bg-clip-text text-transparent mb-4">
            Mystical Tribal Realm
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Journey into the ancient world where destiny awaits and tribal spirits call to their chosen ones
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card/90 backdrop-blur-sm border-border shadow-tribal hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-gradient-mystical rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">📜</span>
              </div>
              <CardTitle className="text-xl">Sacred Registration</CardTitle>
              <CardDescription>
                Begin your mystical journey by registering your earthly presence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/registration")}
                variant="tribal"
                className="w-full"
              >
                Start Registration
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-sm border-border shadow-tribal hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-gradient-mystical rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">⚡</span>
              </div>
              <CardTitle className="text-xl">Tribal Discovery</CardTitle>
              <CardDescription>
                Discover which ancient tribe calls to any seeker's spirit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/tribe")}
                variant="tribal"
                className="w-full"
              >
                Discover Tribes
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            "In the realm of spirits, every soul finds their destined tribe"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
