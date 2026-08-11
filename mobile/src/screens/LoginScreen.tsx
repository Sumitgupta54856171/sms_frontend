import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Input from "../components/Input";
import Button from "../components/Button";
import RoleSelector, { Role } from "../components/RoleSelector";
import { loginUser } from "../services/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("teacher");
  const [isPending, setIsPending] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Validation", "Email is required");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Validation", "Password is required");
      return;
    }

    setIsPending(true);
    try {
      const data = await loginUser({ email: email.trim(), password });

      const token = data.token ?? data.accessToken ?? "";
      const userRole = data.role ?? data.user?.role ?? role;

      await AsyncStorage.multiSet([
        ["token", token],
        ["useRole", userRole],
        ...(data.name ? [["userName", data.name]] : []),
        ...(data.email ? [["userEmail", data.email]] : []),
      ]);

      Alert.alert("Success", `Logged in as ${userRole}`);
      // Navigation will be handled by your navigation stack
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Login failed. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── Top Branding Area ─── */}
          <View className="bg-[#0d9488] pt-8 pb-16 px-6 rounded-b-[32px]">
            {/* Dotted pattern overlay */}
            <View className="absolute inset-0 rounded-b-[32px] opacity-20 overflow-hidden">
              <View
                className="flex-1"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
            </View>

            <View className="flex-row items-center gap-3 relative z-10">
              <View className="h-14 w-14 rounded-2xl bg-[#6366f1] overflow-hidden">
                <Image
                  source={require("../../assets/icon.png")}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">
                  Rose Convent
                </Text>
                <Text className="text-white/80 text-sm">High School</Text>
              </View>
            </View>

            <View className="mt-6 relative z-10">
              <Text className="text-white/90 text-xl italic font-serif leading-7">
                "The administrative weight of a school should never outweigh the
                teaching inside it."
              </Text>
              <View className="flex-row items-center gap-3 mt-5">
                <View className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700" />
                <View>
                  <Text className="text-white text-sm font-semibold">
                    Mr. Mohan Lal Sen
                  </Text>
                  <Text className="text-white/60 text-xs">
                    Head of School
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ─── Login Form ─── */}
          <View className="flex-1 px-6 -mt-8">
            <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <Text className="text-xl font-bold text-slate-900">
                Welcome back
              </Text>
              <Text className="text-sm text-slate-500 mt-1">
                Sign in to your workspace
              </Text>

              {/* Role Selector */}
              <View className="mt-6">
                <Text className="text-xs font-medium text-slate-600 mb-3">
                  I am a
                </Text>
                <RoleSelector selected={role} onSelect={setRole} />
              </View>

              {/* Form Fields */}
              <View className="mt-6 space-y-4">
                <Input
                  label="Email address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="amara.whitfield@lindenwood.edu"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                />
              </View>

              {/* Submit */}
              <View className="mt-6">
                <Button
                  title={isPending ? "Signing in..." : "Sign in"}
                  onPress={handleLogin}
                  loading={isPending}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
