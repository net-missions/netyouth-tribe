import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const TRIBES = [
  {
    name: "Shadow Wolves",
    element: "Darkness",
    symbol: "🐺",
    description: "Masters of stealth and cunning, guardians of the night realm.",
    color: "from-purple-900 to-gray-900"
  },
  {
    name: "Fire Phoenixes",
    element: "Fire",
    symbol: "🔥",
    description: "Passionate warriors who rise from ashes, keepers of eternal flame.",
    color: "from-red-600 to-orange-500"
  },
  {
    name: "Earth Guardians",
    element: "Earth",
    symbol: "🌿",
    description: "Wise protectors of nature, healers of the ancient forest.",
    color: "from-green-700 to-green-500"
  },
  {
    name: "Storm Riders",
    element: "Air",
    symbol: "⚡",
    description: "Swift as lightning, masters of wind and sky.",
    color: "from-blue-600 to-cyan-400"
  },
  {
    name: "Crystal Seers",
    element: "Spirit",
    symbol: "💎",
    description: "Mystic oracles who see beyond the veil of reality.",
    color: "from-indigo-600 to-purple-400"
  },
  {
    name: "Ocean Depths",
    element: "Water",
    symbol: "🌊",
    description: "Flowing like tides, keepers of ancient water wisdom.",
    color: "from-teal-600 to-blue-500"
  }
];

const Tribe = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedName, setSelectedName] = useState("");
  const [assignedTribe, setAssignedTribe] = useState<typeof TRIBES[0] | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleTribeAssignment = () => {
    if (!selectedName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name to discover their tribal destiny.",
        variant: "destructive"
      });
      return;
    }

    setIsRevealing(true);
    
    // Add dramatic pause for the reveal
    setTimeout(() => {
      const randomTribe = TRIBES[Math.floor(Math.random() * TRIBES.length)];
      setAssignedTribe(randomTribe);
      setIsRevealing(false);
      
      toast({
        title: "Destiny Revealed!",
        description: `${selectedName} belongs to the ${randomTribe.name}!`,
      });
    }, 2000);
  };

  const resetAssignment = () => {
    setAssignedTribe(null);
    setSelectedName("");
  };

  return (
    <div className="min-h-screen bg-gradient-earth p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-mystical bg-clip-text text-transparent mb-4 animate-mystical-float">
            Tribal Destiny Revealer
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover which ancient tribe calls to your spirit
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Assignment Panel */}
          <Card className="bg-card/90 backdrop-blur-sm border-border shadow-tribal">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {assignedTribe ? "Destiny Revealed" : "Seek Your Tribe"}
              </CardTitle>
              <CardDescription className="text-center">
                {assignedTribe 
                  ? "The ancient spirits have spoken..." 
                  : "Enter a name and let the mystical forces decide"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!assignedTribe ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-medium">
                      Seeker's Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter the name of the seeker..."
                      value={selectedName}
                      onChange={(e) => setSelectedName(e.target.value)}
                      className="bg-input border-border focus:ring-primary focus:border-primary transition-smooth"
                      disabled={isRevealing}
                    />
                  </div>

                  <Button 
                    onClick={handleTribeAssignment}
                    disabled={isRevealing}
                    variant="tribal"
                    className="w-full text-lg font-semibold"
                  >
                    {isRevealing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Consulting the Spirits...
                      </div>
                    ) : (
                      "Reveal Tribal Destiny"
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-6">
                  <div className={`mx-auto w-24 h-24 bg-gradient-to-br ${assignedTribe.color} rounded-full flex items-center justify-center text-4xl animate-tribal-pulse`}>
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
                    className="w-full"
                  >
                    Seek Another Destiny
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tribes Overview */}
          <Card className="bg-card/90 backdrop-blur-sm border-border shadow-tribal">
            <CardHeader>
              <CardTitle className="text-xl text-center">The Six Sacred Tribes</CardTitle>
              <CardDescription className="text-center">
                Each tribe holds ancient power and wisdom
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {TRIBES.map((tribe, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-smooth ${
                      assignedTribe?.name === tribe.name ? 'ring-2 ring-primary bg-primary/10' : ''
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
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-smooth"
          >
            ← Return to Registration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tribe;