import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getSupabase } from "@/integrations/supabase/client";

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
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [filteredNames, setFilteredNames] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchTribes();
    fetchExistingNames();
  }, []);

  const fetchTribes = async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.error("Supabase env vars missing");
        setTribes([]);
        return;
      }
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

  const fetchExistingNames = async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.error("Supabase env vars missing");
        return;
      }
      
      // Get all registered users
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("name")
        .order("name");
      
      if (usersError) throw usersError;
      
      // Get users who already have tribe assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from("tribe_assignments")
        .select("assigned_name")
        .not("assigned_name", "is", null);
      
      if (assignmentsError) throw assignmentsError;
      
      // Create set of assigned names for faster lookup
      const assignedNames = new Set(
        (assignments || []).map(item => item.assigned_name).filter(Boolean)
      );
      
      // Filter out users who already have assignments
      const availableNames = (users || [])
        .map(user => user.name)
        .filter(name => name && !assignedNames.has(name))
        .sort();
      
      setExistingNames(availableNames);
    } catch (error) {
      console.error("Error fetching existing names:", error);
    }
  };

  const handleWeightedTribeAssignment = async () => {
    if (!selectedName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name to assign to a tribe.",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);

    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.error("Supabase env vars missing");
        setIsAssigning(false);
        return;
      }

      let assignedTribeId = null;

      // Check if user exists and get their inviter info
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, invited_by")
        .eq("name", selectedName.trim())
        .single();

      if (userError) {
        toast({
          title: "User Not Found",
          description: "This person is not registered. Only registered users can be assigned to tribes.",
          variant: "destructive"
        });
        setIsAssigning(false);
        return;
      }

      // Check if user already has a tribe assignment
      const { data: existingAssignment, error: assignmentError } = await supabase
        .from("tribe_assignments")
        .select("id")
        .eq("assigned_name", selectedName.trim())
        .single();

      if (!assignmentError && existingAssignment) {
        toast({
          title: "Already Assigned",
          description: "This person already has a tribe assignment.",
          variant: "destructive"
        });
        setIsAssigning(false);
        return;
      }

      if (!userError && userData?.invited_by) {
        // Query inviter's tribe
        const { data: inviterData, error: inviterError } = await supabase
          .from("inviters")
          .select("tribe")
          .eq("name", userData.invited_by)
          .single();

        if (!inviterError && inviterData) {
          // Find the tribe ID for the inviter's tribe
          const inviterTribe = tribes.find(t => t.name.toUpperCase() === inviterData.tribe.toUpperCase());
          if (inviterTribe) {
            assignedTribeId = inviterTribe.id;
          }
        }
      }

      // If no inviter or inviter not found, use weighted random selection
      if (!assignedTribeId) {
        // Get current tribe counts from inviters table
        const { data: tribeCounts, error: countError } = await supabase
          .from("inviters")
          .select("tribe")
          .not("tribe", "is", null);

        if (countError) {
          console.error("Error getting tribe counts:", countError);
        } else {
          // Count members per tribe
          const counts: { [key: string]: number } = {};
          tribeCounts.forEach(item => {
            const tribeKey = item.tribe.toUpperCase();
            counts[tribeKey] = (counts[tribeKey] || 0) + 1;
          });

          // Calculate weights (smaller tribes get higher weights)
          const maxCount = Math.max(...Object.values(counts));
          const weights: { [key: string]: number } = {};
          let totalWeight = 0;

          tribes.forEach(tribe => {
            const tribeKey = tribe.name.toUpperCase();
            const count = counts[tribeKey] || 0;
            // Inverse weight: smaller tribes get higher chance
            weights[tribeKey] = maxCount - count + 1;
            totalWeight += weights[tribeKey];
          });

          // Weighted random selection
          const random = Math.random() * totalWeight;
          let currentWeight = 0;

          for (const tribe of tribes) {
            const tribeKey = tribe.name.toUpperCase();
            currentWeight += weights[tribeKey];
            if (random <= currentWeight) {
              assignedTribeId = tribe.id;
              break;
            }
          }
        }
      }

      // Fallback to random if something went wrong
      if (!assignedTribeId && tribes.length > 0) {
        const randomTribe = tribes[Math.floor(Math.random() * tribes.length)];
        assignedTribeId = randomTribe.id;
      }

      if (assignedTribeId) {
        const selectedTribe = tribes.find(t => t.id === assignedTribeId);
        
        // Save assignment to database
        const { error: saveError } = await supabase
          .from("tribe_assignments")
          .insert([
            {
              user_id: userData.id,
              tribe_id: assignedTribeId,
              assigned_name: selectedName
            }
          ]);

        // The tribe_members table will be automatically updated by the trigger

        if (saveError) {
          console.error("Error saving tribe assignment:", saveError);
        }

        setAssignedTribe(selectedTribe);
        
        // Refresh available names list (remove this user from future suggestions)
        fetchExistingNames();
        
        // Show success message with tribe name
        toast({
          title: "Tribe Revealed!",
          description: `${selectedName} belongs to the ${selectedTribe.name}!`,
        });
      }
    } catch (error) {
      console.error("Assignment error:", error);
      toast({
        title: "Assignment Failed",
        description: "There was an error processing the assignment.",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };


  const resetAssignment = () => {
    setAssignedTribe(null);
    setSelectedName("");
    setShowDropdown(false);
    setFilteredNames([]);
    setIsAssigning(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Find your tribe</h1>
          <p className="text-muted-foreground">Discover your destiny.</p>
        </div>

                 <div className="flex flex-col items-center space-y-6">
          {/* Assignment Panel */}
          <Card className="bg-card border w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {assignedTribe ? "" : "Find your tribe"}
              </CardTitle>
              <CardDescription className="text-center"></CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!assignedTribe ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-medium">
                      Name to Find Tribe
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter a name"
                        value={selectedName}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedName(value);
                          
                          if (value.length > 0) {
                            // Filter existing names that start with the input
                            const filtered = existingNames.filter(name => 
                              name.toLowerCase().startsWith(value.toLowerCase())
                            );
                            setFilteredNames(filtered);
                            setShowDropdown(filtered.length > 0);
                          } else {
                            setShowDropdown(false);
                            setFilteredNames([]);
                          }
                        }}
                        onFocus={() => {
                          if (selectedName.length > 0 && filteredNames.length > 0) {
                            setShowDropdown(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay hiding dropdown to allow clicks
                          setTimeout(() => setShowDropdown(false), 200);
                        }}
                        className=""
                        disabled={isAssigning}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        data-form-type="other"
                        data-lpignore="true"
                      />
                      
                      {/* Autocomplete Dropdown */}
                      {showDropdown && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                          {filteredNames.map((name, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedName(name);
                                setShowDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>


                  {selectedName.trim() && !assignedTribe && (
                    <Button 
                      onClick={handleWeightedTribeAssignment}
                      disabled={isAssigning || tribes.length === 0}
                      className="w-full text-lg font-semibold"
                    >
                      {isAssigning ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                          Assigning to Tribe...
                        </div>
                      ) : (
                        "Choose a Tribe"
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center space-y-6 sm:space-y-8 py-6 sm:py-8 px-4">
                  <div className="space-y-6 sm:space-y-8">
                    {/* Greeting */}
                    <div className="space-y-2">
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-muted-foreground leading-tight tracking-tight">
                        Hi,{" "}
                        <span className="text-orange-400 break-words">
                          {selectedName}
                        </span>
                      </h1>
                    </div>
                    
                    {/* Welcome Message */}
                    <div className="space-y-3 sm:space-y-4">
                      <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-muted-foreground leading-relaxed">
                        Welcome to the tribe of
                      </p>
                      
                      {/* Tribe Name - Most Important */}
                      <h2 
                        className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-none tracking-tight transition-colors duration-300 ${
                          (() => {
                            switch(assignedTribe.name.toUpperCase()) {
                              case 'REUBEN':
                                return 'text-reuben';
                              case 'SIMEON':
                                return 'text-simeon';
                              case 'LEVI':
                                return 'text-levi';
                              case 'JUDAH':
                                return 'text-judah';
                              default:
                                return 'text-primary';
                            }
                          })()
                        }`}
                        aria-label={`Tribe ${assignedTribe.name}`}
                      >
                        {assignedTribe.name.toUpperCase()}
                      </h2>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Find Another Button - Only show when tribe is assigned */}
          {assignedTribe && (
            <Button 
              onClick={resetAssignment}
              variant="secondary"
              className="text-lg py-3 px-8"
            >
              Find Another
            </Button>
          )}

          {/* Tribes Overview */}

        </div>
      </div>

      <div className="fixed bottom-8 left-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground transition-smooth"
        >
          ← Back to Registration
        </Button>
      </div>
    </div>
  );
};

export default TribePage;