import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Tribe {
  id: string;
  name: string;
  element: string;
  symbol: string;
  description: string;
  color: string;
}

const TribePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedName, setSelectedName] = useState("");
  const [assignedTribe, setAssignedTribe] = useState<Tribe | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [tribes, setTribes] = useState<Tribe[]>([]);

  useEffect(() => {
    fetchTribes();
  }, []);

  const fetchTribes = async () => {
    try {
      const { data, error } = await supabase
        .from("tribes")
        .select("*");
      
      if (error) throw error;
      setTribes(data || []);
    } catch (error) {
      console.error("Error fetching tribes:", error);
      toast({
        title: "Error",
        description: "Failed to load tribes. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const handleTribeAssignment = async () => {
    if (!selectedName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name to discover their tribal destiny.",
        variant: "destructive"
      });
      return;
    }

    if (tribes.length === 0) {
      toast({
        title: "No Tribes Available",
        description: "Please wait for tribes to load.",
        variant: "destructive"
      });
      return;
    }

    setIsRevealing(true);
    
    // Add dramatic pause for the reveal
    setTimeout(async () => {
      try {
        const randomTribe = tribes[Math.floor(Math.random() * tribes.length)];
        setAssignedTribe(randomTribe);
        
        // Get current user ID from localStorage (if they registered)
        const currentUserId = localStorage.getItem("currentUserId");
        
        // Save the assignment to Supabase
        const { error } = await supabase
          .from("tribe_assignments")
          .insert([
            {
              user_id: currentUserId,
              tribe_id: randomTribe.id,
              assigned_name: selectedName
            }
          ]);

        if (error) {
          console.error("Error saving tribe assignment:", error);
        }

        setIsRevealing(false);
        
        toast({
          title: "Tribe Revealed!",
          description: `${selectedName} belongs to the ${randomTribe.name}!`,
        });
      } catch (error) {
        console.error("Assignment error:", error);
        setIsRevealing(false);
        toast({
          title: "Assignment Failed",
          description: "There was an error processing the assignment.",
          variant: "destructive"
        });
      }
    }, 2000);
  };

  const resetAssignment = () => {
    setAssignedTribe(null);
    setSelectedName("");
  };

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 animate-float">
            Tribe Discovery
          </h1>
          <p className="text-muted-foreground text-lg">
            Find out which tribe matches your unique spirit
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Assignment Panel */}
          <Card className="bg-card shadow-large border-border">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {assignedTribe ? "Tribe Revealed!" : "Discover Your Tribe"}
              </CardTitle>
              <CardDescription className="text-center">
                {assignedTribe 
                  ? "Your tribal destiny has been revealed" 
                  : "Enter a name to discover which tribe they belong to"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!assignedTribe ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-medium">
                      Name to Discover
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter someone's name..."
                      value={selectedName}
                      onChange={(e) => setSelectedName(e.target.value)}
                      className="transition-smooth focus:shadow-glow"
                      disabled={isRevealing}
                    />
                  </div>

                  <Button 
                    onClick={handleTribeAssignment}
                    disabled={isRevealing || tribes.length === 0}
                    className="w-full text-lg font-semibold bg-gradient-primary hover:shadow-glow transition-smooth"
                  >
                    {isRevealing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Revealing Tribe...
                      </div>
                    ) : (
                      "Discover Tribe"
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="mx-auto w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-4xl animate-pulse-glow shadow-glow">
                    {assignedTribe.symbol}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-primary mb-2">
                      {selectedName}
                    </h3>
                    <h4 className="text-xl font-semibold text-foreground mb-2">
                      Belongs to the {assignedTribe.name}
                    </h4>
                    <p className="text-muted-foreground mb-1">
                      Element: {assignedTribe.element}
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      {assignedTribe.description}
                    </p>
                  </div>

                  <Button 
                    onClick={resetAssignment}
                    variant="secondary"
                    className="w-full transition-smooth hover:shadow-medium"
                  >
                    Discover Another
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tribes Overview */}
          <Card className="bg-card shadow-large border-border">
            <CardHeader>
              <CardTitle className="text-xl text-center">Available Tribes</CardTitle>
              <CardDescription className="text-center">
                Six unique tribes, each with their own special traits
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {tribes.map((tribe) => (
                  <div 
                    key={tribe.id}
                    className={`p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-smooth hover:shadow-medium ${
                      assignedTribe?.name === tribe.name ? 'ring-2 ring-primary bg-primary/10 shadow-glow' : ''
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{tribe.symbol}</div>
                      <h4 className="font-semibold text-sm text-foreground">
                        {tribe.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {tribe.element}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {tribes.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  Loading tribes...
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-smooth"
          >
            ← Back to Registration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TribePage;