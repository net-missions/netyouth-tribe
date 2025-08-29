import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Registration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    fbName: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.fbName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to complete your registration.",
        variant: "destructive"
      });
      return;
    }

    // Store registration data in localStorage
    localStorage.setItem("registration", JSON.stringify(formData));
    
    toast({
      title: "Registration Complete!",
      description: "Welcome to the tribal realm. Discover your destiny...",
    });

    // Navigate to tribe page
    setTimeout(() => navigate("/tribe"), 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-earth flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/90 backdrop-blur-sm border-border shadow-tribal animate-mystical-float">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-mystical rounded-full flex items-center justify-center animate-tribal-pulse">
              <span className="text-2xl">🔮</span>
            </div>
            <CardTitle className="text-2xl bg-gradient-mystical bg-clip-text text-transparent">
              Join the Mystical Realm
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your sacred details to discover which tribe calls to your spirit
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">
                  Sacred Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your true name..."
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-input border-border focus:ring-primary focus:border-primary transition-smooth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground font-medium">
                  Earthly Dwelling
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Where your body resides..."
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="bg-input border-border focus:ring-primary focus:border-primary transition-smooth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fbName" className="text-foreground font-medium">
                  Facebook Identity
                </Label>
                <Input
                  id="fbName"
                  type="text"
                  placeholder="Your digital persona..."
                  value={formData.fbName}
                  onChange={(e) => handleInputChange("fbName", e.target.value)}
                  className="bg-input border-border focus:ring-primary focus:border-primary transition-smooth"
                />
              </div>

              <Button 
                type="submit" 
                variant="tribal"
                className="w-full text-lg font-semibold"
              >
                Begin Your Journey
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/tribe")}
                className="text-muted-foreground hover:text-foreground transition-smooth"
              >
                Skip to Tribe Discovery →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Registration;