import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getSupabase } from "@/integrations/supabase/client";

interface TribeAssignment {
  id: string;
  assigned_name: string;
  created_at: string;
  user_id: string;
  tribe_id: string;
}

interface TribeData {
  id: string;
  name: string;
  color: string;
  description: string;
  assigned_count: number;
  total_registrations: number;
  unassigned_count: number;
  assignments: TribeAssignment[];
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

      // Get all tribe assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("tribe_assignments")
        .select("*")
        .order("assigned_name");

      if (assignmentsError) throw assignmentsError;

      // Get total registered users count
      const { count: totalUsers, error: usersCountError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      if (usersCountError) throw usersCountError;

      // Calculate unassigned count
      const assignedCount = assignmentsData?.length || 0;
      const unassignedCount = (totalUsers || 0) - assignedCount;

      // Combine data
      const tribesWithMembers = (tribesData || []).map(tribe => {
        const tribeAssignments = (assignmentsData || []).filter(assignment => assignment.tribe_id === tribe.id);
        return {
          ...tribe,
          assigned_count: tribeAssignments.length,
          total_registrations: totalUsers || 0,
          unassigned_count: unassignedCount,
          assignments: tribeAssignments
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
            {tribes.length > 0 && (
              <div className="mt-4 flex justify-center gap-8 text-sm">
                <div className="text-center">
                  <p className="text-lg font-semibold text-primary">{tribes[0]?.total_registrations || 0}</p>
                  <p className="text-muted-foreground">Total Registered</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-orange-600">{tribes[0]?.unassigned_count || 0}</p>
                  <p className="text-muted-foreground">Unassigned</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-600">{tribes.reduce((sum, tribe) => sum + tribe.assigned_count, 0)}</p>
                  <p className="text-muted-foreground">Assigned to Tribes</p>
                </div>
              </div>
            )}
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
                    <p className="text-sm text-muted-foreground">Assigned</p>
                    <p className="text-2xl font-bold text-primary">{tribe.assigned_count}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {tribe.assignments.length > 0 ? (
                  <div className="space-y-2">
                    {tribe.assignments.map((assignment) => (
                      <div 
                        key={assignment.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <span className="font-medium">{assignment.assigned_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(assignment.created_at).toLocaleDateString()}
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