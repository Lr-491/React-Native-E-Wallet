import { styles } from '@/assets/styles/auth.styles'
import { COLORS } from '@/constants/colors'
import { useClerk, useSignIn } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default function Page() {
  // ✅ Clerk v3 : signIn vient de useSignIn, setActive vient de useClerk
  const { signIn } = useSignIn()
  const { setActive } = useClerk()
  const router = useRouter()

  // --- États du formulaire ---
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')

  // --- États UI ---
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [pendingMFA, setPendingMFA] = React.useState(false) // true = affiche l'écran MFA (double authentification)

  // ─────────────────────────────────────────────
  // ÉTAPE 1 : Connexion avec email + mot de passe
  // ─────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      console.log('Tentative de connexion...')
      console.log('Email :', emailAddress, '| Password :', password)

      // Connexion avec email + mot de passe (API Clerk v3)
      const { error } = await signIn.password({
        emailAddress,
        password,
      })

      // Si Clerk retourne une erreur (ex: mauvais mot de passe, compte inexistant...)
      if (error) {
        console.error('SIGNIN ERROR (error field):', JSON.stringify(error, null, 2))
        setError(error.message || 'Email ou mot de passe incorrect')
        return
      }

      console.log('Connexion réussie ✅ | signIn.status :', signIn.status)

      if (signIn.status === 'complete') {
        console.log('Session activée ✅ — redirection vers /')

        // Active la session côté client pour que isSignedIn passe à true
        await setActive({ session: signIn.createdSessionId })

        router.replace('/')

      } else if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
        // L'utilisateur doit passer par une double authentification (MFA)
        console.log('MFA requis — envoi du code email...')

        const emailCodeFactor = signIn.supportedSecondFactors?.find(
          (factor) => factor.strategy === 'email_code',
        )

        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode()
          console.log('Code MFA envoyé ✅')
          setPendingMFA(true)
        }

      } else {
        console.error('Connexion non complète, status:', signIn.status)
        setError('La connexion n\'a pas pu être complétée')
      }

    } catch (err: any) {
      console.error('SIGNIN ERROR:', JSON.stringify(err, null, 2))
      setError(err?.errors?.[0]?.message || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // ÉTAPE 2 (optionnelle) : Vérification MFA
  // Affiché uniquement si la double auth est activée
  // ─────────────────────────────────────────────
  const handleVerify = async () => {
    setLoading(true)
    setError('')

    try {
      console.log('Vérification du code MFA :', code)

      await signIn.mfa.verifyEmailCode({ code })

      console.log('Code MFA vérifié ✅ | signIn.status :', signIn.status)

      if (signIn.status === 'complete') {
        console.log('Session activée ✅ — redirection vers /')

        // Active la session après vérification MFA
        await setActive({ session: signIn.createdSessionId })

        router.replace('/')
      } else {
        console.warn('Vérification MFA non complète, status:', signIn.status)
        setError('La vérification n\'a pas pu être complétée')
      }

    } catch (err: any) {
      console.error('VERIFY MFA ERROR:', JSON.stringify(err, null, 2))
      setError(err?.errors?.[0]?.message || 'Erreur de vérification')
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // ÉCRAN 2 (optionnel) : Vérification MFA
  // ─────────────────────────────────────────────
  if (pendingMFA) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Vérification requise</Text>
        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 16 }}>
          Un code a été envoyé à {emailAddress}
        </Text>

        {/* Affichage des erreurs */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Champ de saisie du code MFA */}
        <TextInput
          style={styles.verificationInput}
          value={code}
          placeholder="Entrez le code reçu par email"
          placeholderTextColor="#666666"
          onChangeText={setCode}
          keyboardType="numeric"
          autoFocus
        />

        {/* Bouton de vérification */}
        <TouchableOpacity
          style={[styles.button, (loading || code.length === 0) && { opacity: 0.5 }]}
          onPress={handleVerify}
          disabled={loading || code.length === 0}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Vérification...' : 'Vérifier'}
          </Text>
        </TouchableOpacity>

        {/* Renvoyer le code MFA */}
        <TouchableOpacity
          onPress={() => signIn.mfa.sendEmailCode()}
          style={{ marginTop: 16, alignItems: 'center' }}
        >
          <Text style={{ color: COLORS.primary || '#0a7ea4', fontWeight: '600' }}>
            Renvoyer le code
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ─────────────────────────────────────────────
  // ÉCRAN 1 : Formulaire de connexion
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
          source={require('../../assets/images/revenue-i4.png')}
          style={styles.illustration}
        />
        <Text style={styles.title}>Welcome Back</Text>

        {/* Affichage des erreurs avec bouton de fermeture */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError('')}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Champ email */}
        <TextInput
          style={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Votre email"
          placeholderTextColor="#666666"
          onChangeText={setEmailAddress}
          keyboardType="email-address"
        />

        {/* Champ mot de passe */}
        <TextInput
          style={[styles.input, error && styles.errorInput]}
          value={password}
          placeholder="Votre mot de passe"
          placeholderTextColor="#666666"
          secureTextEntry={true}
          onChangeText={setPassword}
        />

        {/* Bouton connexion — désactivé si email/password vides ou chargement en cours */}
        <TouchableOpacity
          style={[styles.button, (!emailAddress || !password || loading) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!emailAddress || !password || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Text>
        </TouchableOpacity>

        {/* Lien vers la page d'inscription */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Pas encore de compte ? </Text>
          <Link href="/sign-up">
            <Text style={styles.linkText}>S'inscrire</Text>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}