import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

interface OnboardingContextType {
  isOnboardingActive: boolean;
  currentStep: number;
  totalSteps: number;
  startOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  getCurrentStepData: () => OnboardingStep | null;
  isFirstTime: boolean;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to TinnitusHelp.me!",
    description:
      "Take control of your tinnitus with our scientifically-backed app, designed to provide immediate relief and long-term management solutions.",
  },
  {
    id: "posts",
    title: "Expert Articles & Guides",
    description:
      "Access in-depth articles, research findings and practical guides. Learn about tinnitus causes, treatments and management strategies.",
  },
  {
    id: "sounds",
    title: "Therapeutic Sounds",
    description:
      "Explore a library of therapeutic sounds designed to help mask tinnitus and promote relaxation. Find the perfect sound to suit your needs.",
  },
  {
    id: "tags",
    title: "Organized Content",
    description:
      "Browse content by tags to quickly find information relevant to your specific needs. Everything is organized for easy navigation.",
  },
];

const ONBOARDING_KEY = "onboarding_completed";

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const totalSteps = ONBOARDING_STEPS.length;

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!completed) {
        setIsFirstTime(true);
        setIsOnboardingActive(true);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      // On error, assume onboarding is not needed
      setIsOnboardingActive(false);
    }
  };

  const startOnboarding = useCallback(() => {
    setIsOnboardingActive(true);
    setCurrentStep(0);
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      setIsOnboardingActive(false);
      setCurrentStep(0);
      setIsFirstTime(false);
    } catch (error) {
      // Silent error handling
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  }, [currentStep, totalSteps, completeOnboarding]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const skipOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      setIsOnboardingActive(false);
      setCurrentStep(0);
      setIsFirstTime(false);
    } catch (error) {
      // Silent error handling
    }
  }, []);

  const getCurrentStepData = useCallback(() => {
    return ONBOARDING_STEPS[currentStep] || null;
  }, [currentStep]);

  const contextValue: OnboardingContextType = {
    isOnboardingActive,
    currentStep,
    totalSteps,
    startOnboarding,
    nextStep,
    previousStep,
    completeOnboarding,
    skipOnboarding,
    getCurrentStepData,
    isFirstTime,
    isLoading,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
