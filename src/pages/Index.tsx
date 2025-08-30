import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-16">
          <h1 className="text-7xl font-bold text-foreground mb-4 tracking-tight">Tribes</h1>
          <p className="text-xl text-muted-foreground">Find your tribe.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
          <Card className="group hover:scale-105 transition-transform duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Register</CardTitle>
              <CardDescription className="text-muted-foreground">Join the community</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/registration")}
                className="w-full text-lg font-semibold"
              >
                Start
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-transform duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Discover</CardTitle>
              <CardDescription className="text-muted-foreground">Find your tribe</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/tribe")}
                variant="secondary"
                className="w-full text-lg font-semibold"
              >
                Explore
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-transform duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Tribe List</CardTitle>
              <CardDescription className="text-muted-foreground">View all members</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/tribe-list")}
                variant="outline"
                className="w-full text-lg font-semibold"
              >
                View
              </Button>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
};

export default Index;
