import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/assets/styles/auth.styles";
import { COLORS } from "@/constants/colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Page() {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [pendingVerification, setPendingVerification] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  if (!isLoaded) {
    console.log("⏳ Clerk not yet loaded...");
    return null;
  }

  // Étape 1 : création de l'utilisateur
  const handleSignUp = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      console.log("➡️ Tentative de création de compte...");
      const response = await signUp.create({ emailAddress: email, password });
      console.log("✅ Compte créé (étape 1)", response);

      console.log("➡️ Envoi du code de vérification par email...");
      await signUp.prepareEmailAddressVerification();
      console.log("✅ Code envoyé");

      setPendingVerification(true);
    } catch (err: any) {
      console.error("❌ SIGNUP ERROR:", err);
      setError(err?.errors?.[0]?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : vérification du code
  const handleVerify = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      console.log("➡️ Vérification du code :", code);
      const result = await signUp.attemptEmailAddressVerification({ code });
      console.log("✅ Résultat de la tentative :", result);

      if (signUp.status === "complete") {
        console.log("🎉 Session activée automatiquement");
        router.push("/");
      } else {
        console.warn("⚠️ Vérification non complète, status:", signUp.status);
        setError("La vérification n'a pas pu être complétée");
      }
    } catch (err: any) {
      console.error("❌ VERIFY ERROR:", err);
      setError(err?.errors?.[0]?.message || "Erreur de vérification");
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Vérification du compte</Text>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          style={styles.verificationInput}
          value={code}
          onChangeText={setCode}
          placeholder="Entrez le code reçu par email"
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.5 }]}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "⏳ Vérification..." : "Vérifier"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🔹 UI inscription
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={100}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/revenue-i2.png")}
          style={styles.illustration}
        />
        <Text style={styles.title}>Créer un compte</Text>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Votre email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Votre mot de passe"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.5 }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "⏳ Création..." : "S'inscrire"}
          </Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <Link href="/sign-in">
            <Text style={styles.linkText}>Se connecter</Text>
          </Link>
        </View>

        <View nativeID="clerk-captcha" />
      </View>
    </KeyboardAwareScrollView>
  );
}