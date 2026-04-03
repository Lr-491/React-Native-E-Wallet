import { useClerk, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/assets/styles/auth.styles";
import { COLORS } from "@/constants/colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Page() {
  // ✅ Clerk v3 : signUp vient de useSignUp, setActive vient de useAuth
  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const router = useRouter();

  // --- États du formulaire ---
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [code, setCode] = useState<string>("");

  // --- États UI ---
  const [pendingVerification, setPendingVerification] = useState<boolean>(false); // true = affiche l'écran de vérification
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // ─────────────────────────────────────────────
  // ÉTAPE 1 : Création du compte
  // ─────────────────────────────────────────────
  const handleSignUp = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      console.log("Tentative de création de compte...");
      console.log("Email :", email, "| Password :", password);

      // Crée l'utilisateur avec email + mot de passe (API Clerk v3)
      const { error } = await signUp.password({
        emailAddress: email,
        password,
      });

      // Si Clerk retourne une erreur (ex: email déjà utilisé, mot de passe trop faible...)
      if (error) {
        console.error("SIGNUP ERROR (error field):", JSON.stringify(error, null, 2));
        setError(error.message || "Erreur lors de l'inscription");
        return;
      }

      console.log("Compte créé avec succès ✅");
      console.log("Envoi du code de vérification par email...");

      // Demande à Clerk d'envoyer un code OTP par email (API Clerk v3)
      await signUp.verifications.sendEmailCode();

      console.log("Code envoyé ✅ — en attente de vérification");

      // Bascule vers l'écran de saisie du code
      setPendingVerification(true);

    } catch (err: any) {
      console.error("SIGNUP ERROR:", JSON.stringify(err, null, 2));
      setError(err?.errors?.[0]?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // ÉTAPE 2 : Vérification du code email
  // ─────────────────────────────────────────────
  const handleVerify = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      console.log("Vérification du code :", code);

      // Envoie le code saisi à Clerk pour vérification (API Clerk v3)
      const { error } = await signUp.verifications.verifyEmailCode({ code });

      // Si le code est incorrect ou expiré
      if (error) {
        console.error("VERIFY ERROR (error field):", JSON.stringify(error, null, 2));
        setError(error.message || "Code incorrect");
        return;
      }

      // Logs de debug pour suivre l'état de l'inscription
      console.log("Code vérifié ✅ | signUp.status :", signUp.status);
      console.log("signUp.status :", signUp.status);
      console.log("signUp.missingFields :", JSON.stringify(signUp.missingFields));
      console.log("signUp.unverifiedFields :", JSON.stringify(signUp.unverifiedFields));
      console.log("signUp complet :", JSON.stringify(signUp, null, 2));

      if (signUp.status === "complete") {
        console.log("Inscription complète ✅ — activation de la session...");

        // Active la session côté client pour que isSignedIn passe à true
        // Sans cette ligne, le layout ne détecte pas la connexion et redirige vers /sign-in
        await setActive({ session: signUp.createdSessionId });

        console.log("Session activée ✅ — redirection vers /");
        router.replace("/");

      } else {
        // signUp.status === "missing_requirements" → un champ obligatoire manque
        // Vérifie dans le Clerk Dashboard : User & Authentication → désactive les champs non nécessaires
        console.warn("Vérification non complète, status:", signUp.status);
        setError("La vérification n'a pas pu être complétée");
      }

    } catch (err: any) {
      console.error("VERIFY ERROR:", JSON.stringify(err, null, 2));
      setError(err?.errors?.[0]?.message || "Erreur de vérification");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // OPTIONNEL : Renvoyer le code si non reçu
  // ─────────────────────────────────────────────
  const handleResendCode = async (): Promise<void> => {
    try {
      console.log("Renvoi du code de vérification...");
      await signUp.verifications.sendEmailCode();
      console.log("Nouveau code envoyé ✅");
    } catch (err: any) {
      console.error("RESEND ERROR:", JSON.stringify(err, null, 2));
      setError("Impossible de renvoyer le code. Réessaie plus tard.");
    }
  };

  // ─────────────────────────────────────────────
  // ÉCRAN 2 : Vérification du code OTP
  // ─────────────────────────────────────────────
  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Vérification du compte</Text>

        {/* Indique à quel email le code a été envoyé */}
        <Text style={{ textAlign: "center", color: "#666", marginBottom: 16 }}>
          Un code a été envoyé à {email}
        </Text>

        {/* Affichage des erreurs */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Champ de saisie du code OTP */}
        <TextInput
          style={styles.verificationInput}
          value={code}
          onChangeText={setCode}
          placeholder="Entrez le code reçu par email"
          keyboardType="numeric"
          autoFocus // Focus automatique pour plus de fluidité
        />

        {/* Bouton de vérification — désactivé si code vide ou chargement en cours */}
        <TouchableOpacity
          style={[styles.button, (loading || code.length === 0) && { opacity: 0.5 }]}
          onPress={handleVerify}
          disabled={loading || code.length === 0}
        >
          <Text style={styles.buttonText}>
            {loading ? "Vérification..." : "Vérifier"}
          </Text>
        </TouchableOpacity>

        {/* Lien pour renvoyer le code */}
        <TouchableOpacity
          onPress={handleResendCode}
          style={{ marginTop: 16, alignItems: "center" }}
        >
          <Text style={{ color: COLORS.primary || "#0a7ea4", fontWeight: "600" }}>
            Renvoyer le code
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─────────────────────────────────────────────
  // ÉCRAN 1 : Formulaire d'inscription
  // ─────────────────────────────────────────────
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

        {/* Affichage des erreurs */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Champ email */}
        <TextInput
          style={styles.input}
          placeholder="Votre email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Champ mot de passe */}
        <TextInput
          style={styles.input}
          placeholder="Votre mot de passe"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Bouton inscription — désactivé si email/password vides ou chargement en cours */}
        <TouchableOpacity
          style={[styles.button, (!email || !password || loading) && { opacity: 0.5 }]}
          onPress={handleSignUp}
          disabled={!email || !password || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Création..." : "S'inscrire"}
          </Text>
        </TouchableOpacity>

        {/* Lien vers la page de connexion */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <Link href="/sign-in">
            <Text style={styles.linkText}>Se connecter</Text>
          </Link>
        </View>

        {/* Requis par Clerk pour la protection anti-bot */}
        <View nativeID="clerk-captcha" />
      </View>
    </KeyboardAwareScrollView>
  );
}