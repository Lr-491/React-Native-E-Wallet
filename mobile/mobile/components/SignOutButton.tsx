// import { ThemedText } from '@/components/themed-text'
import { styles } from '@/assets/styles/home.styles'
import { COLORS } from '@/constants/colors'
import { useClerk } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
  // Use useClerk() to access the signOut() function
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {

    Alert.alert("Logout", "Arre you sure, you want to logout ?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: signOut }
    ])
    // try {
    //   await signOut()
    //   // Redirect to your desired page
    //   router.replace('/')
    // } catch (err) {
    //   // See https://clerk.com/docs/guides/development/custom-flows/error-handling
    //   // for more info on error handling
    //   console.error(JSON.stringify(err, null, 2))
    // }
  }

  return (
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={handleSignOut}
    >
      <Ionicons name='log-out-outline' size={22} color={COLORS.text}/>
    </TouchableOpacity>
  )
}
