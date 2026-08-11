import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline";
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  icon,
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={`h-11 rounded-lg flex-row items-center justify-center gap-2 ${
        isPrimary
          ? "bg-[#0d9488]"
          : "bg-transparent border border-slate-300"
      } ${disabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#ffffff" : "#0f172a"} />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          <Text
            className={`text-sm font-medium ${
              isPrimary ? "text-white" : "text-slate-900"
            }`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
