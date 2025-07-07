
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock implementation
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in (from localStorage in this mock)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Mock implementation
      const mockUser = {
        id: "user-123",
        email,
        displayName: email.split("@")[0],
        photoURL: null,
        emailVerified: true,
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      toast({
        title: "Login successful",
        description: "Welcome back to SA Financial Insight",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      // Mock implementation
      const mockUser = {
        id: "user-123",
        email,
        displayName,
        photoURL: null,
        emailVerified: false,
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      toast({
        title: "Registration successful",
        description: "Please verify your email to continue",
      });
      navigate("/verify-email");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Could not create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      // Mock implementation
      const mockUser = {
        id: "google-user-123",
        email: "user@gmail.com",
        displayName: "Google User",
        photoURL: "https://placekitten.com/100/100",
        emailVerified: true,
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      toast({
        title: "Google login successful",
        description: "Welcome to SA Financial Insight",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Google login failed",
        description: "Could not login with Google",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithFacebook = async () => {
    try {
      setLoading(true);
      // Mock implementation
      const mockUser = {
        id: "facebook-user-123",
        email: "user@facebook.com",
        displayName: "Facebook User",
        photoURL: "https://placekitten.com/100/100",
        emailVerified: true,
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      toast({
        title: "Facebook login successful",
        description: "Welcome to SA Financial Insight",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Facebook login failed",
        description: "Could not login with Facebook",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Mock implementation
      setUser(null);
      localStorage.removeItem("user");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Could not log out",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      // Mock implementation
      toast({
        title: "Verification email sent",
        description: "Please check your inbox",
      });
      
      // For demo purposes, let's simulate email verification
      setTimeout(() => {
        if (user) {
          const verifiedUser = { ...user, emailVerified: true };
          setUser(verifiedUser);
          localStorage.setItem("user", JSON.stringify(verifiedUser));
        }
      }, 5000);
    } catch (error) {
      toast({
        title: "Could not send verification email",
        description: "Please try again later",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        loginWithFacebook,
        logout,
        sendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
