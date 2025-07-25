import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthCheckerProps {
  password: string;
  className?: string;
}

interface PasswordCriteria {
  label: string;
  isValid: (password: string) => boolean;
}

const criteria: PasswordCriteria[] = [
  {
    label: "At least 8 characters",
    isValid: (password) => password.length >= 8,
  },
  {
    label: "One uppercase letter",
    isValid: (password) => /[A-Z]/.test(password),
  },
  {
    label: "One lowercase letter", 
    isValid: (password) => /[a-z]/.test(password),
  },
  {
    label: "One number",
    isValid: (password) => /\d/.test(password),
  },
  {
    label: "One special character",
    isValid: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

export default function PasswordStrengthChecker({ password, className = "" }: PasswordStrengthCheckerProps) {
  const { strength, validCriteria, strengthLabel, strengthColor } = useMemo(() => {
    const validCriteria = criteria.map(criterion => criterion.isValid(password));
    const validCount = validCriteria.filter(Boolean).length;
    const strength = (validCount / criteria.length) * 100;
    
    let strengthLabel = "";
    let strengthColor = "";
    
    if (validCount === 0) {
      strengthLabel = "";
      strengthColor = "";
    } else if (validCount <= 2) {
      strengthLabel = "Weak";
      strengthColor = "text-red-500";
    } else if (validCount <= 3) {
      strengthLabel = "Fair";
      strengthColor = "text-orange-500";
    } else if (validCount === 4) {
      strengthLabel = "Good";
      strengthColor = "text-yellow-500";
    } else {
      strengthLabel = "Strong";
      strengthColor = "text-green-500";
    }
    
    return { strength, validCriteria, strengthLabel, strengthColor };
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Password Strength</span>
          {strengthLabel && (
            <span className={`text-sm font-medium ${strengthColor}`}>
              {strengthLabel}
            </span>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              strength < 40
                ? "bg-red-500"
                : strength < 60
                ? "bg-orange-500"
                : strength < 80
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Criteria Checklist */}
      <div className="space-y-2">
        <span className="text-sm text-muted-foreground">Password must contain:</span>
        <div className="space-y-1">
          {criteria.map((criterion, index) => (
            <div key={index} className="flex items-center space-x-2">
              {validCriteria[index] ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm ${
                  validCriteria[index]
                    ? "text-green-500"
                    : "text-muted-foreground"
                }`}
              >
                {criterion.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function isPasswordStrong(password: string): boolean {
  return criteria.every(criterion => criterion.isValid(password));
}
