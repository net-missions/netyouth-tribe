import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getSupabase } from "@/integrations/supabase/client";

interface TribeMember {
  id: string;
  member_name: string;
  joined_at: string;
  status: string;
}

interface TribeData {
  id: string;
  name: string;
  color: string;
  description: string;
  member_count: number;
  members: TribeMember[];
}

const TribeList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tribes, setTribes] = useState<TribeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTribesWithMembers();
  }, []);

  const fetchTribesWithMembers = async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.error("Supabase env vars missing");
        setLoading(false);
        return;
      }

      // Get all tribes
      const { data: tribesData, error: tribesError } = await supabase
        .from("tribes")
        .select("*")
        .order("name");

      if (tribesError) throw tribesError;

      // Get all tribe members
      const { data: membersData, error: membersError } = await supabase
        .from("tribe_members")
        .select("*")
        .eq("status", "active")
        .order("member_name");

      if (membersError) throw membersError;

      // Combine data
      const tribesWithMembers = (tribesData || []).map(tribe => {
        const tribeMembers = (membersData || []).filter(member => member.tribe_id === tribe.id);
        return {
          ...tribe,
          member_count: tribeMembers.length,
          members: tribeMembers
        };
      });

      setTribes(tribesWithMembers);
    } catch (error) {
      console.error("Error fetching tribes:", error);
      toast({
        title: "Error",
        description: "Failed to load tribe data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTribeStyles = (tribeName: string) => {
    switch(tribeName.toUpperCase()) {
      case 'REUBEN':
        return 'bg-reuben text-white border-reuben';
      case 'SIMEON':
        return 'bg-simeon text-white border-simeon';
      case 'LEVI':
        return 'bg-levi text-white border-levi';
      case 'JUDAH':
        return 'bg-judah text-white border-judah';
      default:
        return 'bg-primary text-white border-primary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tribes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      <div className="flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground">Tribe Members</h1>
            <p className="text-muted-foreground">View all members organized by tribe</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
          {tribes.map((tribe) => (
            <Card key={tribe.id} className="bg-card border w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`px-4 py-2 rounded-lg ${getTribeStyles(tribe.name)}`}>
                    <CardTitle className="text-xl">{tribe.name}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="text-2xl font-bold text-primary">{tribe.member_count}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {tribe.members.length > 0 ? (
                  <div className="space-y-2">
                    {tribe.members.map((member) => (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <span className="font-medium">{member.member_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(member.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No members assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back to Registration
        </Button>
      </div>
    </div>
  );
};

export default TribeList;