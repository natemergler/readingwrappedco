import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "@remix-run/react";

interface SubmitButtonProps {
  data: any; // replace 'any' with the actual type of your data
  onSubmit?: () => void; // function to handle submit, optional
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ data, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex justify-center m-5">
      {isLoading ? (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      ) : data ? (
        <Button asChild>
          <Link to="/wrapped">Go to Wrapped</Link>
        </Button>
      ) : data == false ? (
        <Button>fail</Button>
      ) : (
        <Button type="submit" onClick={onSubmit ? onSubmit : undefined}>
          Submit
        </Button>
      )}
    </div>
  );
};

export default SubmitButton;
