import { SignOutButton } from '@/components/SignOutButton'
// import { Text } from '@/components/themed-text'
// import { View } from '@/components/themed-view'
import { Show, useSession, useUser } from '@clerk/expo'
import { Link } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

export default function Page() {
  const { user } = useUser()

  // If your user isn't appearing as signed in,
  // it's possible they have session tasks to complete.
  // Learn more: https://clerk.com/docs/guides/configure/session-tasks
  const { session } = useSession()
  console.log(session?.currentTask)

  return (
    <View style={styles.container}>
      <Text>Welcome!</Text>
      <Show when="signed-out">
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
        <Link href="/(auth)/sign-up">
          <Text>Sign up</Text>
        </Link>
      </Show>
      <Show when="signed-in">
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />
      </Show>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
})