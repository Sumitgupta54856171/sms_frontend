import { View, Text, TouchableOpacity } from "react-native";

export type Role = "parent" | "student" | "teacher";

interface RoleSelectorProps {
  selected: Role;
  onSelect: (role: Role) => void;
}

const roles: { key: Role; label: string; icon: string }[] = [
  { key: "parent", label: "Parent", icon: "👪" },
  { key: "student", label: "Student", icon: "🎓" },
  { key: "teacher", label: "Teacher", icon: "👨‍🏫" },
];

export default function RoleSelector({ selected, onSelect }: RoleSelectorProps) {
  return (
    <View className="flex-row gap-3">
      {roles.map((role) => {
        const isActive = selected === role.key;
        return (
          <TouchableOpacity
            key={role.key}
            onPress={() => onSelect(role.key)}
            activeOpacity={0.7}
            className={`flex-1 items-center py-3 rounded-xl border-2 ${
              isActive
                ? "border-[#0d9488] bg-teal-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <Text className="text-xl mb-1">{role.icon}</Text>
            <Text
              className={`text-xs font-semibold ${
                isActive ? "text-[#0d9488]" : "text-slate-500"
              }`}
            >
              {role.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
