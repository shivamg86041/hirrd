import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";
import { SignedIn, SignedOut, SignIn, UserButton } from "@clerk/clerk-react";
import { BriefcaseBusiness, Heart, PenBox } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

const Header = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const {user} = useUser();

  useEffect(() => {
    if (search.get("sign-in")) {
      setShowSignIn(true);
    }
  }, [search]);

  const handleoverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowSignIn(false);
      navigate("/");
    }
  };

  return (
    <>
      <nav className="py-4 flex justify-between items-center">
        <Link>
          <img src="/logo.png" alt="Hirrd Logo" className="h-20" />
        </Link>

        <div className="flex items-center gap-8">
          <SignedOut>
            <Button variant="outline" onClick={() => setShowSignIn(true)}>
              Login
            </Button>
          </SignedOut>
          <SignedIn>
            {/* add a condition here */}
            {user?.unsafeMetadata?.role === "recruiter" && (
            <Link to="/post-job">
              <Button variant="destructive" className="rounded-full">
                <PenBox size={20} className="mr-2" /> Post a Job
              </Button>
            </Link>
          )}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label={user?.unsafeMetadata?.role === "Candidate" ? "My Applications" : "My Jobs"}
                  href="/my-jobs"
                  labelIcon={<BriefcaseBusiness size={15} />}
                />
                <UserButton.Link
                  href="/saved-job"
                  label="Saved Jobs"
                  labelIcon={<Heart size={15} />}
                />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
        </div>
      </nav>

      {showSignIn && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleoverlayClick}
        >
          <SignIn
            signUpForceRedirectUrl="/onboarding"
            fallbackRedirectUrl="/onboarding"
          />
        </div>
      )}
    </>
  );
};

export default Header;
