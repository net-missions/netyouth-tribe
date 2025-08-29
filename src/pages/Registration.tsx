import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Registration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    fbName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.fbName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to complete your registration.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            name: formData.name,
            address: formData.address,
            fb_name: formData.fbName
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Store user ID in localStorage for tribe assignment
      localStorage.setItem("currentUserId", data.id);
      
      toast({
        title: "Registration Complete!",
        description: "Welcome! Ready to discover your tribe?",
      });

      // Navigate to tribe page
      setTimeout(() => navigate("/tribe"), 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error saving your information. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card shadow-large border-border animate-fade-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-glow">
              <span className="text-2xl">✨</span>
            </div>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Join Our Community
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your details to discover which tribe matches your spirit
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="transition-smooth focus:shadow-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground font-medium">
                  Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="transition-smooth focus:shadow-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fbName" className="text-foreground font-medium">
                  Facebook Name
                </Label>
                <Input
                  id="fbName"
                  type="text"
                  placeholder="Your Facebook name"
                  value={formData.fbName}
                  onChange={(e) => handleInputChange("fbName", e.target.value)}
                  className="transition-smooth focus:shadow-glow"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full text-lg font-semibold bg-gradient-primary hover:shadow-glow transition-smooth"
              >
                Continue to Tribe Discovery
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/tribe")}
                className="text-muted-foreground hover:text-foreground transition-smooth"
              >
                Skip Registration →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Registration;