import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center p-0">
      <div className="w-full h-full flex flex-col items-center justify-center text-center">
        <div className="mb-20">
          <h1 className="text-9xl font-bold text-foreground mb-6 tracking-tight">Tribes</h1>
          <p className="text-3xl text-muted-foreground">Find your tribe.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
          <Button 
            onClick={() => navigate("/registration")}
            className="text-xl py-6 px-12 font-semibold min-w-48 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm"
          >
            Register
          </Button>

          <Button 
            onClick={() => navigate("/tribe")}
            className="text-xl py-6 px-12 font-semibold min-w-48 bg-orange-500 hover:bg-orange-600 text-white border-0"
          >
            Tribes
          </Button>

          <Button 
            onClick={() => navigate("/tribe-list")}
            className="text-xl py-6 px-12 font-semibold min-w-48 bg-orange-500 hover:bg-orange-600 text-white border-0"
          >
            List
          </Button>
        </div>
        
      </div>
    </div>
  );
};

export default Index;
