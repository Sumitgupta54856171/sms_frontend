import { View, TextInput, Text, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <View className="space-y-2">
      <Text className="text-xs font-medium text-slate-600">{label}</Text>
      <TextInput
        className={`h-11 bg-white border border-slate-200 rounded-lg px-4 text-base text-slate-900 ${
          error ? "border-red-500" : ""
        } ${className}`}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error && <Text className="text-xs text-red-500">{error}</Text>}
    </View>
  );
}
