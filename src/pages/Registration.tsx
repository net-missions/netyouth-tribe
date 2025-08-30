import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getSupabase } from "@/integrations/supabase/client";

interface Inviter {
  id: string;
  name: string;
  created_at: string;
}

const ILIGAN_BARANGAYS = [
  "Ubaldo D. Laya", "Saray", "Tibanga",
  "Abuno", "Acmac", "Bagong Silang", "Bonbonon", "Bunawan", "Buru-un", 
  "Dalipuga", "Del Carmen", "Digkilaan", "Ditucalan", "Dulag", "Hinaplanon",
  "Hindang", "Kabacsanan", "Kalilangan", "Kiwalan", "Lanipao", "Luinab",
  "Mahayahay", "Mainit", "Mandulog", "Maria Cristina", "Pala-o", "Panoroganan",
  "Poblacion", "Puga-an", "Rogongon", "San Miguel", "San Roque", "Santa Elena",
  "Santa Filomena", "Santiago", "Santo Rosario", "Suarez",
  "Tambacan", "Tipanoy", "Tomas L. Cabili", "Tubod", 
  "Upper Hinaplanon", "Upper Tominobo", "Villaverde"
];

const Registration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    fbName: "",
    invitedBy: "",
    status: ""
  });
  const [inviters, setInviters] = useState<Inviter[]>([]);
  const [isLoadingInviters, setIsLoadingInviters] = useState(true);
  const [showNewFields, setShowNewFields] = useState(false);

  useEffect(() => {
    fetchInviters();
  }, []);

  const fetchInviters = async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.error("Supabase env vars missing");
        setIsLoadingInviters(false);
        return;
      }

      const { data, error } = await supabase
        .from("inviters")
        .select("*")
        .order('name', { ascending: true });

      if (error) throw error;
      setInviters(data || []);
    } catch (error) {
      console.error("Error fetching inviters:", error);
      toast({
        title: "Error",
        description: "Failed to load inviter list.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingInviters(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.fbName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to complete your registration.",
        variant: "destructive"
      });
      return;
    }

    // Check if Facebook name is similar to full name
    const nameParts = formData.name.toLowerCase().split(' ').filter(part => part.length > 2);
    const fbNameLower = formData.fbName.toLowerCase();
    const hasMatchingPart = nameParts.some(part => fbNameLower.includes(part) || part.includes(fbNameLower));
    
    if (!hasMatchingPart) {
      toast({
        title: "Name Mismatch",
        description: "Facebook name should be similar to your full name for verification.",
        variant: "destructive"
      });
      return;
    }

    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.error("Supabase env vars missing");
        toast({
          title: "Configuration Error",
          description: "Backend is not configured. Please set Supabase env vars.",
          variant: "destructive",
        });
        return;
      }

      // Save user to Supabase
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            name: formData.name,
            address: formData.address,
            fb_name: formData.fbName,
            invited_by: formData.invitedBy || null,
            status: formData.status || 'reserve'
          }
        ])
        .select()
        .single();

      if (error) throw error;


      toast({
        title: "Registration Complete!",
        description: formData.invitedBy
          ? `Welcome to NetYouth Tribe! You were invited by ${formData.invitedBy}.`
          : "Welcome to NetYouth Tribe!",
      });

      // Reset form
      setFormData({ name: "", address: "", fbName: "", invitedBy: "", status: "" });
      setShowNewFields(false);
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
    if (field === "name" && value.trim()) {
      // Auto-fill Facebook name with full name if it matches the current name or is empty
      setFormData(prev => {
        const shouldAutoFill = !prev.fbName || prev.fbName === prev.name;
        return {
          ...prev,
          name: value,
          fbName: shouldAutoFill ? value : prev.fbName
        };
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleInviterSelect = (value: string) => {
    setFormData(prev => ({ ...prev, invitedBy: value }));
  };



  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">Registration</h1>
            <p className="text-lg text-muted-foreground">Join NetYouth Tribe</p>
          </div>

        {/* Registration Form */}
        <Card className="w-full">
            <CardHeader className="text-center space-y-4 pb-8">
              <CardDescription className="text-lg text-muted-foreground">Complete the form below</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium">New here?</Label>
                  <button
                    type="button"
                    onClick={() => setShowNewFields(!showNewFields)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      showNewFields ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showNewFields ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {showNewFields && (
                  <div className="text-sm text-muted-foreground">
                    Please provide additional information for new members.
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-foreground font-medium text-base">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="text-base"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="address" className="text-foreground font-medium text-base">
                    Barangay
                  </Label>
                  <Select value={formData.address} onValueChange={(value) => setFormData(prev => ({ ...prev, address: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your barangay in Iligan City" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {ILIGAN_BARANGAYS.map((barangay) => (
                        <SelectItem key={barangay} value={barangay}>
                          {barangay}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="fbName" className="text-foreground font-medium text-base">
                    Facebook Name
                  </Label>
                  <Input
                    id="fbName"
                    type="text"
                    placeholder="Your Facebook name"
                    value={formData.fbName}
                    onChange={(e) => handleInputChange("fbName", e.target.value)}
                    className="text-base"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                </div>

                {showNewFields && (
                  <>
                    <div className="space-y-3">
                      <Label htmlFor="invitedBy" className="text-foreground font-medium text-base">
                        Invited By
                      </Label>
                      <Select value={formData.invitedBy} onValueChange={handleInviterSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select who invited you (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {inviters.map((inviter) => (
                            <SelectItem key={inviter.id} value={inviter.name}>
                              {inviter.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="status" className="text-foreground font-medium text-base">
                        Status
                      </Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reserve">Reserve</SelectItem>
                          <SelectItem value="outgoing">Outgoing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  className="w-full text-lg font-semibold"
                >
                  Continue
                </Button>
              </form>
            </CardContent>
        </Card>
        </div>
      </div>

      <div className="text-center mt-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back to Home
        </Button>
      </div>
    </div>
  );
};

export default Registration;