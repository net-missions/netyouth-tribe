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

interface ConfettiPiece {
  id: string;
  left: string;
  durationMs: number;
  delayMs: number;
  rotationDeg: number;
  color: string;
}

interface BalloonItem {
  id: string;
  left: string;
  durationMs: number;
  delayMs: number;
  emoji: string;
}

// Removed English novelty words per request; focusing on questions, hype, Tagalog, and Cebuano

// Tagalog phrases/questions
const ANIMATION_TAGALOG_POOL: string[] = [
  "Handa na?",
  "Game?",
  "Sino'ng tribe mo?",
  "Anong vibe mo?",
  "Tara!",
  "Halika!",
  "Malapit na…",
  "Astig!",
  "Grabe!",
  "Sige!",
  "Kaya mo 'yan!",
  "Gora na!",
  "Andito na…",
  "Sabay-sabay!"
];

// Cebuano/Bisaya phrases/questions
const ANIMATION_CEBUANO_POOL: string[] = [
  "Andam na?",
  "Game na ba?",
  "Kinsa imong tribo?",
  "Unsay vibe nimo?",
  "Tara na!",
  "Duol na…",
  "Nindot!",
  "Sige na!",
  "Padayon!",
  "Dali na!",
  "Larga na!",
  "Kaya ra na!",
  "Bibo!",
  "Hala!"
];

// Suspenseful, youth-church-themed prompts and questions
const ANIMATION_QUESTIONS_POOL: string[] = [
  "Ready?",
  "Are you ready?",
  "Which tribe?",
  "Where do you belong?",
  "Purpose?",
  "Calling?",
  "Faith check?",
  "Heart ready?",
  "What’s your vibe?",
  "Tribe vibes?",
  "Lean in…",
  "Listen up…",
  "One step closer…",
  "Big moment…",
  "Almost there…",
  "Stay with it…",
  "Don’t blink…",
  "Eyes up…",
  "Here it comes…"
];

// Hype/exciting fillers to build momentum
const ANIMATION_HYPE_POOL: string[] = [
  "Drumroll…",
  "Let’s go!",
  "Turn it up!",
  "Make some noise!",
  "Energy up!",
  "Big faith!",
  "You got this!",
  "We out here!",
  "Keep watching…",
  "Wait for it…",
  "Boom!",
  "Fire!",
  "So close…"
];

function shuffleArray<T>(items: T[]): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function sampleArray<T>(items: T[], count: number): T[] {
  return shuffleArray(items).slice(0, Math.min(count, items.length));
}

// Variable delay that slows down over time for suspense
function getAnimationDelayMs(stepIndex: number): number {
  const base = 120; // start fast
  const increment = 70; // slow down as we advance
  const maxExtra = 600; // cap the extra delay
  const extra = Math.min(stepIndex * increment, maxExtra);
  // add a tiny random jitter for excitement
  const jitter = Math.floor(Math.random() * 40);
  return base + extra + jitter;
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
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [animationWords, setAnimationWords] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  
  // Pre-shuffled witty words are assigned when the animation begins

  useEffect(() => {
    fetchTribes();
    fetchExistingNames();
  }, []);

  // Animation effect for cycling through randomized words (variable speed)
  useEffect(() => {
    if (!(showAnimation && animationWords.length > 0)) return;
    const delay = getAnimationDelayMs(currentQuoteIndex);
    const timer = setTimeout(() => {
      setCurrentQuoteIndex((prevIndex) => 
        (prevIndex + 1) % animationWords.length
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [showAnimation, animationWords.length, currentQuoteIndex]);

  function generateConfettiPieces(pieceCount: number, colors: string[]): ConfettiPiece[] {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < pieceCount; i++) {
      pieces.push({
        id: `c-${i}-${Math.random().toString(36).slice(2)}`,
        left: `${Math.floor(Math.random() * 100)}%`,
        durationMs: 2600 + Math.floor(Math.random() * 1600),
        delayMs: Math.floor(Math.random() * 400),
        rotationDeg: Math.floor(Math.random() * 360),
        color: colors[i % colors.length]
      });
    }
    return pieces;
  }

  function generateBalloons(balloonCount: number, emojis: string[]): BalloonItem[] {
    const items: BalloonItem[] = [];
    for (let i = 0; i < balloonCount; i++) {
      items.push({
        id: `b-${i}-${Math.random().toString(36).slice(2)}`,
        left: `${Math.floor(Math.random() * 100)}%`,
        durationMs: 3800 + Math.floor(Math.random() * 1800),
        delayMs: Math.floor(Math.random() * 600),
        emoji: emojis[i % emojis.length]
      });
    }
    return items;
  }

  function getTribeTheme(tribeName?: string): { colors: string[]; emojis: string[] } {
    switch ((tribeName || '').toUpperCase()) {
      case 'JUDAH':
        return {
          colors: ['hsl(var(--judah))', 'hsl(var(--primary))', 'hsl(var(--primary-light))'],
          emojis: ['🦁', '👑', '🎉']
        };
      case 'LEVI':
        return {
          colors: ['hsl(var(--levi))', 'hsl(var(--accent-purple))', 'hsl(var(--primary))'],
          emojis: ['✨', '🙏', '🎉']
        };
      case 'REUBEN':
        return {
          colors: ['hsl(var(--reuben))', 'hsl(var(--accent-blue))', 'hsl(var(--primary))'],
          emojis: ['🌊', '💧', '🎉']
        };
      case 'SIMEON':
        return {
          colors: ['hsl(var(--simeon))', 'hsl(var(--success))', 'hsl(var(--primary))'],
          emojis: ['🛡️', '🌿', '🎉']
        };
      default:
        return {
          colors: ['hsl(var(--primary))', 'hsl(var(--primary-light))', 'hsl(var(--accent-purple))'],
          emojis: ['🎈', '🎉', '✨']
        };
    }
  }

  useEffect(() => {
    if (!showCelebration) return;
    const theme = getTribeTheme(assignedTribe?.name);
    setConfettiPieces(generateConfettiPieces(120, theme.colors));
    setBalloons(generateBalloons(12, theme.emojis));
    const hideTimer = setTimeout(() => setShowCelebration(false), 5000);
    return () => clearTimeout(hideTimer);
  }, [showCelebration]);

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

    // Check if the selected name is in our existing names list (dropdown)
    // If it's in the dropdown, it means they're registered and not assigned
    const isInDropdown = existingNames.includes(selectedName.trim());
    
    if (!isInDropdown) {
      toast({
        title: "Invalid Selection",
        description: "Please select a name from the dropdown list. Only unassigned registered users can be assigned to tribes.",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    setShowAnimation(true);
    setCurrentQuoteIndex(0);
    // Generate a fresh randomized sequence for this animation run
    const mixed = [
      ...sampleArray(ANIMATION_QUESTIONS_POOL, 6),
      ...sampleArray(ANIMATION_HYPE_POOL, 5),
      ...sampleArray(ANIMATION_TAGALOG_POOL, 6),
      ...sampleArray(ANIMATION_CEBUANO_POOL, 6)
    ];
    const combined = shuffleArray(mixed);
    const countdown = ["3…", "2…", "1…"];
    setAnimationWords([...combined, ...countdown]);

    // Start the animation and then proceed with assignment after 4 seconds
    setTimeout(async () => {
      await performTribeAssignment();
      setShowAnimation(false);
      setIsAssigning(false);
    }, 4000);
  };

  const performTribeAssignment = async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.error("Supabase env vars missing");
        return;
      }

      let assignedTribeId = null;

      // Get user data (we know they exist since they're in the dropdown)
      const { data: allUsersWithName, error: userError } = await supabase
        .from("users")
        .select("id, invited_by, created_at")
        .eq("name", selectedName.trim())
        .order("created_at", { ascending: true });

      if (userError) {
        console.error("Database error when fetching user:", userError);
        toast({
          title: "Database Error",
          description: "There was an error fetching user data. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!allUsersWithName || allUsersWithName.length === 0) {
        toast({
          title: "User Not Found",
          description: "This person is not registered.",
          variant: "destructive"
        });
        return;
      }

      // If multiple users have the same name, use the first one (earliest registration)
      const userData = allUsersWithName[0];
      
      if (allUsersWithName.length > 1) {
        console.warn(`Multiple users found with name "${selectedName}". Using earliest registration.`);
      }

      if (userData?.invited_by) {
        // Query inviter's tribe
        const { data: inviterData, error: inviterError } = await supabase
          .from("inviters")
          .select("tribe")
          .eq("name", userData.invited_by)
          .maybeSingle();

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
        // Get current tribe assignments to count actual members per tribe
        const { data: tribeAssignments, error: countError } = await supabase
          .from("tribe_assignments")
          .select("tribe_id")
          .not("tribe_id", "is", null);

        if (countError) {
          console.error("Error getting tribe assignment counts:", countError);
        } else {
          // Count actual assignments per tribe
          const counts: { [key: string]: number } = {};
          
          // Initialize all tribes with 0 count
          tribes.forEach(tribe => {
            counts[tribe.id] = 0;
          });
          
          // Count actual assignments
          tribeAssignments.forEach(assignment => {
            if (assignment.tribe_id) {
              counts[assignment.tribe_id] = (counts[assignment.tribe_id] || 0) + 1;
            }
          });

          // Find the minimum count to determine how to weight
          const countValues = Object.values(counts);
          const minCount = countValues.length > 0 ? Math.min(...countValues) : 0;
          const maxCount = countValues.length > 0 ? Math.max(...countValues) : 0;

          // For equal distribution, prioritize tribes with fewer members
          // If all tribes have equal count, randomly select
          if (minCount === maxCount) {
            // All tribes have equal members, random selection
            const randomTribe = tribes[Math.floor(Math.random() * tribes.length)];
            assignedTribeId = randomTribe.id;
          } else {
            // Find tribes with the minimum count
            const tribesWithMinCount = tribes.filter(tribe => counts[tribe.id] === minCount);
            
            if (tribesWithMinCount.length === 1) {
              // Only one tribe has minimum count, assign to it
              assignedTribeId = tribesWithMinCount[0].id;
            } else {
              // Multiple tribes have minimum count, randomly select among them
              const randomTribe = tribesWithMinCount[Math.floor(Math.random() * tribesWithMinCount.length)];
              assignedTribeId = randomTribe.id;
            }
          }
          
          // Debug logging for verification
          console.log("Tribe assignment counts:", tribes.map(t => ({ 
            name: t.name, 
            count: counts[t.id],
            isMinCount: counts[t.id] === minCount
          })));
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
        setShowCelebration(true);
        
        // Refresh available names list (remove this user from future suggestions)
        fetchExistingNames();
        
        // Success message removed - no popup needed
      }
    } catch (error) {
      console.error("Assignment error:", error);
      toast({
        title: "Assignment Failed",
        description: "There was an error processing the assignment.",
        variant: "destructive"
      });
    }
  };


  const resetAssignment = () => {
    setAssignedTribe(null);
    setSelectedName("");
    setShowDropdown(false);
    setFilteredNames([]);
    setIsAssigning(false);
    setShowAnimation(false);
    setCurrentQuoteIndex(0);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center space-y-8">
          {/* Assignment Panel */}
          {!showAnimation && !assignedTribe && (
            <div className="h-screen w-screen flex items-center justify-center p-0">
              <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-12">
                <div>
                  <h1 className="text-9xl font-bold text-foreground mb-4">Find your <span className="text-orange-500">TRIBE</span></h1>
                </div>
                
                <div className="space-y-6 w-full max-w-4xl">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-medium text-2xl block">
                    </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter a name"
                      value={selectedName}
                      className="text-5xl py-8 px-12 w-full max-w-3xl mx-auto text-center border-2 border-orange-300 focus:border-orange-500 rounded-3xl placeholder:text-gray-400"
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

                  {selectedName.trim() && !assignedTribe && (
                    <div className="space-y-3 mt-6">
                      <Button 
                        onClick={handleWeightedTribeAssignment}
                        disabled={isAssigning || tribes.length === 0 || !existingNames.includes(selectedName.trim())}
                        className="text-4xl font-semibold py-10 px-20 w-full max-w-2xl mx-auto bg-orange-500 hover:bg-orange-600 text-white rounded-3xl shadow-lg"
                      >
                        {isAssigning ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                            Assigning to Tribe...
                          </div>
                        ) : (
                          "Choose a Tribe"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          )}

          {/* Full Screen Flash Animation */}
          {showAnimation && (
            <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl md:text-7xl lg:text-8xl font-bold text-orange-500 animate-pulse transition-all duration-300">
                  {animationWords[currentQuoteIndex]}
                </div>
              </div>
            </div>
          )}

          {/* Full Screen Tribe Result */}
          {assignedTribe && !showAnimation && (
            <div className="flex items-center justify-center min-h-[80vh]">
              <div className="text-center space-y-8 sm:space-y-12 py-8 sm:py-12 px-4">
                <div className="space-y-8 sm:space-y-12">
                  {/* Greeting */}
                  <div className="space-y-4">
                    <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-muted-foreground leading-tight tracking-tight">
                      Hi,{" "}
                      <span className="text-black break-words">
                        {selectedName}
                      </span>
                    </h1>
                  </div>
                  
                  {/* Welcome Message */}
                  <div className="space-y-6 sm:space-y-8">
                    <p className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-muted-foreground leading-relaxed">
                      Welcome to the tribe of
                    </p>
                    
                    {/* Tribe Name - Most Important */}
                    <h2 
                      className={`text-7xl sm:text-8xl lg:text-9xl xl:text-[12rem] font-extrabold leading-none tracking-tight transition-colors duration-300 ${
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
            </div>
          )}

          {/* Celebration Overlay */}
          {assignedTribe && !showAnimation && showCelebration && (
            <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
              {confettiPieces.map(piece => (
                <div
                  key={piece.id}
                  className="confetti-piece"
                  style={{
                    left: piece.left,
                    backgroundColor: piece.color,
                    animationDuration: `${piece.durationMs}ms`,
                    animationDelay: `${piece.delayMs}ms`,
                    transform: `rotate(${piece.rotationDeg}deg)`
                  }}
                />
              ))}
              {balloons.map(item => (
                <div
                  key={item.id}
                  className="balloon"
                  style={{
                    left: item.left,
                    animationDuration: `${item.durationMs}ms`,
                    animationDelay: `${item.delayMs}ms`
                  }}
                >
                  {item.emoji}
                </div>
              ))}
            </div>
          )}


        </div>
      </div>

      {/* Find Another Button - Lower right when tribe is assigned */}
      {assignedTribe && !showAnimation && (
        <div className="fixed bottom-8 right-8">
          <Button 
            onClick={resetAssignment}
            variant="secondary"
            className="text-xl py-4 px-8 font-semibold"
          >
            Find Another
          </Button>
        </div>
      )}

      <div className="fixed bottom-8 left-8">
                  <Button 
            onClick={() => navigate("/")}
            className="bg-white text-white hover:bg-white border-white shadow-none"
          >
            ← Back to Registration
        </Button>
      </div>
    </div>
  );
};

export default TribePage;